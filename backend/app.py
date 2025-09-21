# Hedera AgriFund Backend - Flask API
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import hashlib
import json
import os
import requests
from decimal import Decimal
import logging

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://localhost/hedera_agrifund')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database Models
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    hedera_account_id = db.Column(db.String(20), unique=True, nullable=False)
    user_type = db.Column(db.String(10), nullable=False)  # 'farmer' or 'lender'
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    location = db.Column(db.String(200))
    kyc_status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    credit_score = db.Column(db.Integer, default=700)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    farmer_profile = db.relationship('FarmerProfile', backref='user', uselist=False)
    lender_profile = db.relationship('LenderProfile', backref='user', uselist=False)
    loans_as_borrower = db.relationship('Loan', foreign_keys='Loan.borrower_id', backref='borrower')
    loans_as_lender = db.relationship('Loan', foreign_keys='Loan.lender_id', backref='lender')

class FarmerProfile(db.Model):
    __tablename__ = 'farmer_profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    farm_size = db.Column(db.Float)  # in hectares
    primary_crops = db.Column(db.JSON)
    cooperative = db.Column(db.String(200))
    certifications = db.Column(db.JSON)
    total_collateral_value = db.Column(db.Numeric(15, 2), default=0)

class LenderProfile(db.Model):
    __tablename__ = 'lender_profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    investment_capacity = db.Column(db.Numeric(15, 2))
    risk_tolerance = db.Column(db.String(10))  # low, medium, high
    preferred_sectors = db.Column(db.JSON)
    portfolio_value = db.Column(db.Numeric(15, 2), default=0)

class RWAToken(db.Model):
    __tablename__ = 'rwa_tokens'

    id = db.Column(db.Integer, primary_key=True)
    token_id = db.Column(db.String(20), unique=True, nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    crop_type = db.Column(db.String(50), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    quality_grade = db.Column(db.String(5))
    warehouse_location = db.Column(db.String(200))
    harvest_date = db.Column(db.Date)
    current_price = db.Column(db.Numeric(10, 2))
    metadata = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_pledged = db.Column(db.Boolean, default=False)

    # Relationships
    owner = db.relationship('User', backref='owned_tokens')

class Loan(db.Model):
    __tablename__ = 'loans'

    id = db.Column(db.Integer, primary_key=True)
    contract_id = db.Column(db.String(20), unique=True, nullable=False)
    borrower_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    lender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    amount = db.Column(db.Numeric(15, 2), nullable=False)
    interest_rate = db.Column(db.Numeric(5, 2), nullable=False)
    duration_months = db.Column(db.Integer, nullable=False)
    purpose = db.Column(db.String(200))
    status = db.Column(db.String(20), default='pending')  # pending, funded, repaid, defaulted, liquidated
    collateral_token_id = db.Column(db.String(20), db.ForeignKey('rwa_tokens.token_id'))
    ltv_ratio = db.Column(db.Numeric(5, 2))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    funded_at = db.Column(db.DateTime)
    due_date = db.Column(db.DateTime)

    # Relationships
    collateral = db.relationship('RWAToken', backref='loans')

class PriceOracle(db.Model):
    __tablename__ = 'price_oracles'

    id = db.Column(db.Integer, primary_key=True)
    commodity = db.Column(db.String(50), nullable=False)
    price_usd = db.Column(db.Numeric(10, 2), nullable=False)
    source = db.Column(db.String(100))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    hcs_topic_id = db.Column(db.String(20))

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True)
    event_type = db.Column(db.String(50), nullable=False)
    entity_id = db.Column(db.String(50))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    data = db.Column(db.JSON)
    hedera_tx_id = db.Column(db.String(100))
    hcs_timestamp = db.Column(db.BigInteger)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# API Routes

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})

# User Management
@app.route('/api/users/register', methods=['POST'])
def register_user():
    """Register a new user"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['hedera_account_id', 'user_type', 'name', 'email']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Check if user already exists
        existing_user = User.query.filter_by(hedera_account_id=data['hedera_account_id']).first()
        if existing_user:
            return jsonify({'error': 'User already exists'}), 409

        # Create user
        user = User(
            hedera_account_id=data['hedera_account_id'],
            user_type=data['user_type'],
            name=data['name'],
            email=data['email'],
            phone=data.get('phone'),
            location=data.get('location')
        )

        db.session.add(user)
        db.session.flush()  # Get user ID

        # Create profile based on user type
        if data['user_type'] == 'farmer':
            profile = FarmerProfile(
                user_id=user.id,
                farm_size=data.get('farm_size'),
                primary_crops=data.get('primary_crops', []),
                cooperative=data.get('cooperative'),
                certifications=data.get('certifications', [])
            )
            db.session.add(profile)
        elif data['user_type'] == 'lender':
            profile = LenderProfile(
                user_id=user.id,
                investment_capacity=data.get('investment_capacity'),
                risk_tolerance=data.get('risk_tolerance', 'medium'),
                preferred_sectors=data.get('preferred_sectors', [])
            )
            db.session.add(profile)

        db.session.commit()

        # Log registration
        log_audit_event('USER_REGISTERED', str(user.id), user.id, {
            'user_type': user.user_type,
            'hedera_account_id': user.hedera_account_id
        })

        return jsonify({
            'message': 'User registered successfully',
            'user_id': user.id,
            'hedera_account_id': user.hedera_account_id
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"User registration failed: {str(e)}")
        return jsonify({'error': 'Registration failed'}), 500

@app.route('/api/users/<hedera_account_id>', methods=['GET'])
def get_user_profile(hedera_account_id):
    """Get user profile by Hedera account ID"""
    try:
        user = User.query.filter_by(hedera_account_id=hedera_account_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        profile_data = {
            'id': user.id,
            'hedera_account_id': user.hedera_account_id,
            'user_type': user.user_type,
            'name': user.name,
            'email': user.email,
            'phone': user.phone,
            'location': user.location,
            'kyc_status': user.kyc_status,
            'credit_score': user.credit_score,
            'created_at': user.created_at.isoformat()
        }

        if user.user_type == 'farmer' and user.farmer_profile:
            profile_data['farmer_profile'] = {
                'farm_size': float(user.farmer_profile.farm_size) if user.farmer_profile.farm_size else None,
                'primary_crops': user.farmer_profile.primary_crops,
                'cooperative': user.farmer_profile.cooperative,
                'certifications': user.farmer_profile.certifications,
                'total_collateral_value': float(user.farmer_profile.total_collateral_value)
            }
        elif user.user_type == 'lender' and user.lender_profile:
            profile_data['lender_profile'] = {
                'investment_capacity': float(user.lender_profile.investment_capacity) if user.lender_profile.investment_capacity else None,
                'risk_tolerance': user.lender_profile.risk_tolerance,
                'preferred_sectors': user.lender_profile.preferred_sectors,
                'portfolio_value': float(user.lender_profile.portfolio_value)
            }

        return jsonify(profile_data)

    except Exception as e:
        logger.error(f"Failed to get user profile: {str(e)}")
        return jsonify({'error': 'Failed to retrieve profile'}), 500

# Token Management
@app.route('/api/tokens/mint', methods=['POST'])
def mint_rwa_token():
    """Mint a new RWA token for crop collateral"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['owner_hedera_id', 'crop_type', 'quantity', 'warehouse_location']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Get owner
        owner = User.query.filter_by(hedera_account_id=data['owner_hedera_id']).first()
        if not owner:
            return jsonify({'error': 'Owner not found'}), 404

        # Generate token ID (in real implementation, this comes from Hedera)
        token_id = f"0.0.{hash(f'{data["crop_type"]}{data["quantity"]}{datetime.utcnow()}') % 1000000}"

        # Get current price from oracle
        price_data = get_commodity_price(data['crop_type'])

        # Create token
        token = RWAToken(
            token_id=token_id,
            owner_id=owner.id,
            crop_type=data['crop_type'],
            quantity=data['quantity'],
            quality_grade=data.get('quality_grade', 'B'),
            warehouse_location=data['warehouse_location'],
            harvest_date=datetime.strptime(data.get('harvest_date', datetime.now().strftime('%Y-%m-%d')), '%Y-%m-%d').date(),
            current_price=price_data['price'] if price_data else 100.0,
            metadata=data.get('metadata', {})
        )

        db.session.add(token)
        db.session.commit()

        # Update farmer's collateral value
        if owner.farmer_profile:
            total_value = db.session.query(db.func.sum(RWAToken.quantity * RWAToken.current_price)).filter_by(owner_id=owner.id).scalar() or 0
            owner.farmer_profile.total_collateral_value = total_value
            db.session.commit()

        # Log minting event
        log_audit_event('TOKEN_MINTED', token_id, owner.id, {
            'crop_type': token.crop_type,
            'quantity': token.quantity,
            'warehouse': token.warehouse_location
        })

        return jsonify({
            'message': 'Token minted successfully',
            'token_id': token_id,
            'quantity': token.quantity,
            'current_value': float(token.current_price * token.quantity)
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Token minting failed: {str(e)}")
        return jsonify({'error': 'Token minting failed'}), 500

@app.route('/api/tokens/user/<hedera_account_id>', methods=['GET'])
def get_user_tokens(hedera_account_id):
    """Get all tokens owned by a user"""
    try:
        user = User.query.filter_by(hedera_account_id=hedera_account_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        tokens = RWAToken.query.filter_by(owner_id=user.id).all()

        token_list = []
        for token in tokens:
            token_list.append({
                'token_id': token.token_id,
                'crop_type': token.crop_type,
                'quantity': token.quantity,
                'quality_grade': token.quality_grade,
                'warehouse_location': token.warehouse_location,
                'harvest_date': token.harvest_date.isoformat() if token.harvest_date else None,
                'current_price': float(token.current_price),
                'total_value': float(token.current_price * token.quantity),
                'is_pledged': token.is_pledged,
                'created_at': token.created_at.isoformat()
            })

        return jsonify({'tokens': token_list})

    except Exception as e:
        logger.error(f"Failed to get user tokens: {str(e)}")
        return jsonify({'error': 'Failed to retrieve tokens'}), 500

# Loan Management
@app.route('/api/loans/create', methods=['POST'])
def create_loan():
    """Create a new loan request"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['borrower_hedera_id', 'amount', 'interest_rate', 'duration_months', 'collateral_token_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Get borrower
        borrower = User.query.filter_by(hedera_account_id=data['borrower_hedera_id']).first()
        if not borrower:
            return jsonify({'error': 'Borrower not found'}), 404

        # Validate collateral token
        collateral_token = RWAToken.query.filter_by(
            token_id=data['collateral_token_id'],
            owner_id=borrower.id
        ).first()
        if not collateral_token:
            return jsonify({'error': 'Invalid collateral token'}), 400

        if collateral_token.is_pledged:
            return jsonify({'error': 'Token already pledged as collateral'}), 400

        # Calculate LTV
        collateral_value = float(collateral_token.current_price * collateral_token.quantity)
        ltv_ratio = (float(data['amount']) / collateral_value) * 100

        if ltv_ratio > 85:  # Maximum LTV threshold
            return jsonify({'error': 'LTV ratio too high. Maximum allowed is 85%'}), 400

        # Generate contract ID (in real implementation, this comes from Hedera smart contract)
        contract_id = f"0.0.{hash(f'{borrower.id}{data["amount"]}{datetime.utcnow()}') % 1000000}"

        # Create loan
        loan = Loan(
            contract_id=contract_id,
            borrower_id=borrower.id,
            amount=Decimal(str(data['amount'])),
            interest_rate=Decimal(str(data['interest_rate'])),
            duration_months=data['duration_months'],
            purpose=data.get('purpose'),
            collateral_token_id=data['collateral_token_id'],
            ltv_ratio=Decimal(str(ltv_ratio))
        )

        # Mark token as pledged
        collateral_token.is_pledged = True

        db.session.add(loan)
        db.session.commit()

        # Log loan creation
        log_audit_event('LOAN_CREATED', contract_id, borrower.id, {
            'amount': float(loan.amount),
            'collateral_token': collateral_token.token_id,
            'ltv_ratio': float(ltv_ratio)
        })

        return jsonify({
            'message': 'Loan created successfully',
            'contract_id': contract_id,
            'ltv_ratio': float(ltv_ratio),
            'collateral_value': collateral_value
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Loan creation failed: {str(e)}")
        return jsonify({'error': 'Loan creation failed'}), 500

@app.route('/api/loans/fund', methods=['POST'])
def fund_loan():
    """Fund a loan"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['contract_id', 'lender_hedera_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Get loan
        loan = Loan.query.filter_by(contract_id=data['contract_id']).first()
        if not loan:
            return jsonify({'error': 'Loan not found'}), 404

        if loan.status != 'pending':
            return jsonify({'error': 'Loan is not available for funding'}), 400

        # Get lender
        lender = User.query.filter_by(hedera_account_id=data['lender_hedera_id']).first()
        if not lender:
            return jsonify({'error': 'Lender not found'}), 404

        # Update loan
        loan.lender_id = lender.id
        loan.status = 'funded'
        loan.funded_at = datetime.utcnow()
        loan.due_date = datetime.utcnow() + timedelta(days=loan.duration_months * 30)

        db.session.commit()

        # Log funding event
        log_audit_event('LOAN_FUNDED', loan.contract_id, lender.id, {
            'amount': float(loan.amount),
            'borrower': loan.borrower.hedera_account_id
        })

        return jsonify({
            'message': 'Loan funded successfully',
            'due_date': loan.due_date.isoformat()
        })

    except Exception as e:
        db.session.rollback()
        logger.error(f"Loan funding failed: {str(e)}")
        return jsonify({'error': 'Loan funding failed'}), 500

@app.route('/api/loans/opportunities', methods=['GET'])
def get_loan_opportunities():
    """Get available loan opportunities for lenders"""
    try:
        # Query parameters for filtering
        crop_type = request.args.get('crop_type')
        max_ltv = request.args.get('max_ltv', 85)
        min_interest = request.args.get('min_interest', 0)

        query = db.session.query(Loan).filter_by(status='pending')

        if crop_type:
            query = query.join(RWAToken).filter(RWAToken.crop_type == crop_type)

        query = query.filter(
            Loan.ltv_ratio <= float(max_ltv),
            Loan.interest_rate >= float(min_interest)
        )

        loans = query.all()

        opportunities = []
        for loan in loans:
            collateral_value = float(loan.collateral.current_price * loan.collateral.quantity) if loan.collateral else 0

            opportunities.append({
                'contract_id': loan.contract_id,
                'borrower_name': loan.borrower.name,
                'borrower_credit_score': loan.borrower.credit_score,
                'amount': float(loan.amount),
                'interest_rate': float(loan.interest_rate),
                'duration_months': loan.duration_months,
                'purpose': loan.purpose,
                'ltv_ratio': float(loan.ltv_ratio),
                'collateral': {
                    'crop_type': loan.collateral.crop_type,
                    'quantity': loan.collateral.quantity,
                    'quality_grade': loan.collateral.quality_grade,
                    'value': collateral_value
                } if loan.collateral else None,
                'created_at': loan.created_at.isoformat()
            })

        return jsonify({'opportunities': opportunities})

    except Exception as e:
        logger.error(f"Failed to get loan opportunities: {str(e)}")
        return jsonify({'error': 'Failed to retrieve opportunities'}), 500

# Price Oracle
@app.route('/api/prices/<commodity>', methods=['GET'])
def get_commodity_price_api(commodity):
    """Get current price for a commodity"""
    try:
        price_data = get_commodity_price(commodity)
        if price_data:
            return jsonify(price_data)
        else:
            return jsonify({'error': 'Price data not available'}), 404

    except Exception as e:
        logger.error(f"Failed to get commodity price: {str(e)}")
        return jsonify({'error': 'Failed to retrieve price'}), 500

def get_commodity_price(commodity):
    """Get commodity price from oracle or external API"""
    try:
        # Check recent price from database
        recent_price = PriceOracle.query.filter_by(commodity=commodity).order_by(PriceOracle.timestamp.desc()).first()

        if recent_price and (datetime.utcnow() - recent_price.timestamp).seconds < 3600:  # 1 hour cache
            return {
                'commodity': commodity,
                'price': float(recent_price.price_usd),
                'currency': 'USD',
                'timestamp': recent_price.timestamp.isoformat(),
                'source': recent_price.source
            }

        # Mock prices for demo (in production, integrate with real price APIs)
        mock_prices = {
            'maize': 250.00,
            'rice': 420.00,
            'wheat': 300.00,
            'coffee': 1250.00,
            'cocoa': 2800.00,
            'sorghum': 280.00,
            'millet': 320.00
        }

        price = mock_prices.get(commodity.lower(), 100.00)

        # Save to database
        price_record = PriceOracle(
            commodity=commodity,
            price_usd=Decimal(str(price)),
            source='mock_oracle',
            hcs_topic_id='0.0.555555'
        )
        db.session.add(price_record)
        db.session.commit()

        return {
            'commodity': commodity,
            'price': price,
            'currency': 'USD',
            'timestamp': datetime.utcnow().isoformat(),
            'source': 'mock_oracle'
        }

    except Exception as e:
        logger.error(f"Failed to get commodity price: {str(e)}")
        return None

# Audit and Analytics
@app.route('/api/audit/trail', methods=['GET'])
def get_audit_trail():
    """Get audit trail for transparency"""
    try:
        # Query parameters
        event_type = request.args.get('event_type')
        entity_id = request.args.get('entity_id')
        user_id = request.args.get('user_id')
        limit = int(request.args.get('limit', 50))

        query = AuditLog.query

        if event_type:
            query = query.filter_by(event_type=event_type)
        if entity_id:
            query = query.filter_by(entity_id=entity_id)
        if user_id:
            query = query.filter_by(user_id=user_id)

        logs = query.order_by(AuditLog.created_at.desc()).limit(limit).all()

        audit_trail = []
        for log in logs:
            audit_trail.append({
                'id': log.id,
                'event_type': log.event_type,
                'entity_id': log.entity_id,
                'user_id': log.user_id,
                'data': log.data,
                'hedera_tx_id': log.hedera_tx_id,
                'hcs_timestamp': log.hcs_timestamp,
                'created_at': log.created_at.isoformat()
            })

        return jsonify({'audit_trail': audit_trail})

    except Exception as e:
        logger.error(f"Failed to get audit trail: {str(e)}")
        return jsonify({'error': 'Failed to retrieve audit trail'}), 500

def log_audit_event(event_type, entity_id, user_id, data, hedera_tx_id=None):
    """Log an event to audit trail"""
    try:
        log = AuditLog(
            event_type=event_type,
            entity_id=entity_id,
            user_id=user_id,
            data=data,
            hedera_tx_id=hedera_tx_id,
            hcs_timestamp=int(datetime.utcnow().timestamp() * 1000000000)  # nanoseconds
        )
        db.session.add(log)
        db.session.commit()

    except Exception as e:
        logger.error(f"Failed to log audit event: {str(e)}")

# Analytics Dashboard
@app.route('/api/analytics/summary', methods=['GET'])
def get_analytics_summary():
    """Get platform analytics summary"""
    try:
        total_loans = Loan.query.count()
        funded_loans = Loan.query.filter_by(status='funded').count()
        total_funded_amount = db.session.query(db.func.sum(Loan.amount)).filter_by(status='funded').scalar() or 0
        total_collateral_value = db.session.query(db.func.sum(RWAToken.quantity * RWAToken.current_price)).scalar() or 0

        avg_interest_rate = db.session.query(db.func.avg(Loan.interest_rate)).filter_by(status='funded').scalar() or 0
        default_rate = (Loan.query.filter_by(status='defaulted').count() / max(funded_loans, 1)) * 100

        return jsonify({
            'total_loans': total_loans,
            'funded_loans': funded_loans,
            'total_funded_amount': float(total_funded_amount),
            'total_collateral_value': float(total_collateral_value),
            'average_interest_rate': float(avg_interest_rate),
            'default_rate': float(default_rate),
            'active_farmers': User.query.filter_by(user_type='farmer').count(),
            'active_lenders': User.query.filter_by(user_type='lender').count()
        })

    except Exception as e:
        logger.error(f"Failed to get analytics: {str(e)}")
        return jsonify({'error': 'Failed to retrieve analytics'}), 500

# Error Handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

# Initialize database
@app.before_first_request
def create_tables():
    db.create_all()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
