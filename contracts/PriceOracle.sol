// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title PriceOracle
 * @dev Oracle contract for commodity price feeds integrated with Hedera Consensus Service
 */
contract PriceOracle is Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    struct PriceData {
        uint256 price; // Price in USD with 8 decimals (e.g., $100.50 = 10050000000)
        uint256 timestamp;
        uint256 confidence; // Confidence level (0-10000, where 10000 = 100%)
        address oracle;
        bool isActive;
    }

    struct CommodityInfo {
        string name;
        string unit; // kg, tons, bushels, etc.
        uint256 minPrice;
        uint256 maxPrice;
        uint256 lastUpdated;
        bool isSupported;
    }

    // State variables
    mapping(string => PriceData) public latestPrices; // commodity => latest price
    mapping(string => PriceData[]) public priceHistory; // commodity => price history
    mapping(address => bool) public authorizedOracles;
    mapping(string => CommodityInfo) public commodities;

    string[] public supportedCommodities;
    uint256 public priceValidityPeriod; // How long prices remain valid (in seconds)
    uint256 public minimumConfidence; // Minimum confidence required for price updates
    string public hcsTopicId; // Hedera Consensus Service topic for price feeds

    // Events
    event PriceUpdated(
        string indexed commodity,
        uint256 price,
        uint256 timestamp,
        address indexed oracle,
        uint256 confidence
    );

    event CommodityAdded(string indexed commodity, string name, string unit);
    event CommodityRemoved(string indexed commodity);
    event OracleAuthorized(address indexed oracle, bool authorized);
    event PriceValidityPeriodUpdated(uint256 newPeriod);

    modifier onlyAuthorizedOracle() {
        require(authorizedOracles[msg.sender], "Only authorized oracles can update prices");
        _;
    }

    modifier commodityExists(string memory _commodity) {
        require(commodities[_commodity].isSupported, "Commodity not supported");
        _;
    }

    constructor(uint256 _priceValidityPeriod, string memory _hcsTopicId) {
        priceValidityPeriod = _priceValidityPeriod;
        hcsTopicId = _hcsTopicId;
        minimumConfidence = 7000; // 70% minimum confidence

        // Add initial commodities
        _addCommodity("maize", "Maize/Corn", "kg", 50e8, 500e8);
        _addCommodity("rice", "Rice", "kg", 200e8, 800e8);
        _addCommodity("wheat", "Wheat", "kg", 100e8, 600e8);
        _addCommodity("coffee", "Coffee Beans", "kg", 800e8, 2000e8);
        _addCommodity("cocoa", "Cocoa Beans", "kg", 1500e8, 4000e8);
    }

    /**
     * @dev Update price for a commodity
     * @param _commodity Commodity identifier (e.g., "maize", "coffee")
     * @param _price Price in USD with 8 decimals
     * @param _confidence Confidence level (0-10000)
     */
    function updatePrice(
        string memory _commodity,
        uint256 _price,
        uint256 _confidence
    ) external onlyAuthorizedOracle commodityExists(_commodity) nonReentrant {
        require(_price > 0, "Price must be greater than 0");
        require(_confidence >= minimumConfidence, "Confidence too low");
        require(_confidence <= 10000, "Confidence cannot exceed 100%");

        CommodityInfo storage commodity = commodities[_commodity];
        require(_price >= commodity.minPrice && _price <= commodity.maxPrice, "Price outside acceptable range");

        PriceData memory newPrice = PriceData({
            price: _price,
            timestamp: block.timestamp,
            confidence: _confidence,
            oracle: msg.sender,
            isActive: true
        });

        // Update latest price
        latestPrices[_commodity] = newPrice;

        // Add to price history
        priceHistory[_commodity].push(newPrice);

        // Update commodity info
        commodity.lastUpdated = block.timestamp;

        emit PriceUpdated(_commodity, _price, block.timestamp, msg.sender, _confidence);
    }

    /**
     * @dev Get latest price for a commodity
     * @param _commodity Commodity identifier
     * @return price Latest price
     * @return timestamp When price was updated
     * @return isValid Whether price is still valid
     */
    function getLatestPrice(string memory _commodity)
        external
        view
        commodityExists(_commodity)
        returns (uint256 price, uint256 timestamp, bool isValid)
    {
        PriceData memory priceData = latestPrices[_commodity];
        bool valid = (block.timestamp - priceData.timestamp) <= priceValidityPeriod;

        return (priceData.price, priceData.timestamp, valid && priceData.isActive);
    }

    /**
     * @dev Get price history for a commodity
     * @param _commodity Commodity identifier
     * @param _limit Maximum number of historical prices to return
     * @return prices Array of historical prices
     */
    function getPriceHistory(string memory _commodity, uint256 _limit)
        external
        view
        commodityExists(_commodity)
        returns (PriceData[] memory prices)
    {
        PriceData[] memory history = priceHistory[_commodity];
        uint256 length = history.length;
        uint256 returnLength = _limit > length ? length : _limit;

        prices = new PriceData[](returnLength);

        for (uint256 i = 0; i < returnLength; i++) {
            prices[i] = history[length - returnLength + i];
        }

        return prices;
    }

    /**
     * @dev Calculate average price over a period
     * @param _commodity Commodity identifier
     * @param _periodInSeconds Time period in seconds
     * @return averagePrice Weighted average price
     * @return dataPoints Number of data points used
     */
    function getAveragePrice(string memory _commodity, uint256 _periodInSeconds)
        external
        view
        commodityExists(_commodity)
        returns (uint256 averagePrice, uint256 dataPoints)
    {
        PriceData[] memory history = priceHistory[_commodity];
        uint256 cutoffTime = block.timestamp - _periodInSeconds;
        uint256 totalWeightedPrice = 0;
        uint256 totalConfidence = 0;
        uint256 count = 0;

        for (uint256 i = history.length; i > 0; i--) {
            PriceData memory priceData = history[i - 1];
            if (priceData.timestamp >= cutoffTime) {
                totalWeightedPrice = totalWeightedPrice.add(priceData.price.mul(priceData.confidence));
                totalConfidence = totalConfidence.add(priceData.confidence);
                count++;
            } else {
                break; // Assuming history is sorted by timestamp
            }
        }

        if (totalConfidence > 0) {
            averagePrice = totalWeightedPrice.div(totalConfidence);
        }

        return (averagePrice, count);
    }

    /**
     * @dev Add a new supported commodity
     * @param _commodity Commodity identifier
     * @param _name Human-readable name
     * @param _unit Unit of measurement
     * @param _minPrice Minimum acceptable price
     * @param _maxPrice Maximum acceptable price
     */
    function addCommodity(
        string memory _commodity,
        string memory _name,
        string memory _unit,
        uint256 _minPrice,
        uint256 _maxPrice
    ) external onlyOwner {
        _addCommodity(_commodity, _name, _unit, _minPrice, _maxPrice);
    }

    function _addCommodity(
        string memory _commodity,
        string memory _name,
        string memory _unit,
        uint256 _minPrice,
        uint256 _maxPrice
    ) internal {
        require(bytes(_commodity).length > 0, "Commodity identifier cannot be empty");
        require(!commodities[_commodity].isSupported, "Commodity already supported");
        require(_maxPrice > _minPrice, "Max price must be greater than min price");

        commodities[_commodity] = CommodityInfo({
            name: _name,
            unit: _unit,
            minPrice: _minPrice,
            maxPrice: _maxPrice,
            lastUpdated: 0,
            isSupported: true
        });

        supportedCommodities.push(_commodity);

        emit CommodityAdded(_commodity, _name, _unit);
    }

    /**
     * @dev Remove a commodity from supported list
     * @param _commodity Commodity identifier
     */
    function removeCommodity(string memory _commodity) external onlyOwner commodityExists(_commodity) {
        commodities[_commodity].isSupported = false;

        // Remove from supportedCommodities array
        for (uint256 i = 0; i < supportedCommodities.length; i++) {
            if (keccak256(bytes(supportedCommodities[i])) == keccak256(bytes(_commodity))) {
                supportedCommodities[i] = supportedCommodities[supportedCommodities.length - 1];
                supportedCommodities.pop();
                break;
            }
        }

        emit CommodityRemoved(_commodity);
    }

    /**
     * @dev Authorize or deauthorize an oracle
     * @param _oracle Oracle address
     * @param _authorized Whether to authorize or deauthorize
     */
    function setOracleAuthorization(address _oracle, bool _authorized) external onlyOwner {
        require(_oracle != address(0), "Invalid oracle address");
        authorizedOracles[_oracle] = _authorized;
        emit OracleAuthorized(_oracle, _authorized);
    }

    /**
     * @dev Update price validity period
     * @param _newPeriod New validity period in seconds
     */
    function setPriceValidityPeriod(uint256 _newPeriod) external onlyOwner {
        require(_newPeriod > 0, "Validity period must be greater than 0");
        priceValidityPeriod = _newPeriod;
        emit PriceValidityPeriodUpdated(_newPeriod);
    }

    /**
     * @dev Update minimum confidence requirement
     * @param _minConfidence Minimum confidence (0-10000)
     */
    function setMinimumConfidence(uint256 _minConfidence) external onlyOwner {
        require(_minConfidence <= 10000, "Confidence cannot exceed 100%");
        minimumConfidence = _minConfidence;
    }

    /**
     * @dev Update HCS topic ID
     * @param _hcsTopicId New Hedera Consensus Service topic ID
     */
    function setHcsTopicId(string memory _hcsTopicId) external onlyOwner {
        hcsTopicId = _hcsTopicId;
    }

    /**
     * @dev Get all supported commodities
     * @return Array of commodity identifiers
     */
    function getSupportedCommodities() external view returns (string[] memory) {
        return supportedCommodities;
    }

    /**
     * @dev Get commodity information
     * @param _commodity Commodity identifier
     * @return CommodityInfo struct
     */
    function getCommodityInfo(string memory _commodity)
        external
        view
        commodityExists(_commodity)
        returns (CommodityInfo memory)
    {
        return commodities[_commodity];
    }

    /**
     * @dev Check if a price is valid (within acceptable range and time)
     * @param _commodity Commodity identifier
     * @return isValid Whether the latest price is valid
     */
    function isPriceValid(string memory _commodity)
        external
        view
        commodityExists(_commodity)
        returns (bool isValid)
    {
        PriceData memory priceData = latestPrices[_commodity];
        return (block.timestamp - priceData.timestamp) <= priceValidityPeriod && priceData.isActive;
    }

    /**
     * @dev Emergency function to deactivate a price (in case of manipulation)
     * @param _commodity Commodity identifier
     */
    function deactivatePrice(string memory _commodity) external onlyOwner commodityExists(_commodity) {
        latestPrices[_commodity].isActive = false;
    }

    /**
     * @dev Batch update prices (for gas efficiency)
     * @param _commodities Array of commodity identifiers
     * @param _prices Array of prices
     * @param _confidences Array of confidence levels
     */
    function batchUpdatePrices(
        string[] memory _commodities,
        uint256[] memory _prices,
        uint256[] memory _confidences
    ) external onlyAuthorizedOracle nonReentrant {
        require(_commodities.length == _prices.length && _prices.length == _confidences.length,
                "Arrays must have same length");

        for (uint256 i = 0; i < _commodities.length; i++) {
            if (commodities[_commodities[i]].isSupported) {
                // Perform the same validations as updatePrice
                if (_prices[i] > 0 &&
                    _confidences[i] >= minimumConfidence &&
                    _confidences[i] <= 10000) {

                    CommodityInfo storage commodity = commodities[_commodities[i]];
                    if (_prices[i] >= commodity.minPrice && _prices[i] <= commodity.maxPrice) {
                        PriceData memory newPrice = PriceData({
                            price: _prices[i],
                            timestamp: block.timestamp,
                            confidence: _confidences[i],
                            oracle: msg.sender,
                            isActive: true
                        });

                        latestPrices[_commodities[i]] = newPrice;
                        priceHistory[_commodities[i]].push(newPrice);
                        commodity.lastUpdated = block.timestamp;

                        emit PriceUpdated(_commodities[i], _prices[i], block.timestamp, msg.sender, _confidences[i]);
                    }
                }
            }
        }
    }
}
