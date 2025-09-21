import React, { useState } from 'react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'farmer' | 'lender';
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  cropType?: string;
  farmSize?: string;
  investmentAmount?: string;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  userType
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    cropType: '',
    farmSize: '',
    investmentAmount: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const totalSteps = userType === 'farmer' ? 4 : 3;

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2 id="modal-title">
            {userType === 'farmer' ? 'Get Your Farm Loan' : 'Start Investing'}
          </h2>
          <button 
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="progress-indicator">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
          <span className="progress-text">Step {step} of {totalSteps}</span>
        </div>

        <div className="modal-body">
          {step === 1 && (
            <div className="form-step">
              <h3>Personal Information</h3>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <h3>Location</h3>
              <select
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                required
              >
                <option value="">Select your country</option>
                <option value="kenya">Kenya</option>
                <option value="uganda">Uganda</option>
                <option value="tanzania">Tanzania</option>
                <option value="ghana">Ghana</option>
                <option value="nigeria">Nigeria</option>
              </select>
            </div>
          )}

          {step === 3 && userType === 'farmer' && (
            <div className="form-step">
              <h3>Farm Details</h3>
              <select
                value={formData.cropType}
                onChange={(e) => handleInputChange('cropType', e.target.value)}
                required
              >
                <option value="">What do you grow?</option>
                <option value="coffee">Coffee</option>
                <option value="maize">Maize</option>
                <option value="rice">Rice</option>
                <option value="cocoa">Cocoa</option>
                <option value="wheat">Wheat</option>
              </select>
              <select
                value={formData.farmSize}
                onChange={(e) => handleInputChange('farmSize', e.target.value)}
                required
              >
                <option value="">Farm size</option>
                <option value="small">Small (< 2 hectares)</option>
                <option value="medium">Medium (2-10 hectares)</option>
                <option value="large">Large (> 10 hectares)</option>
              </select>
            </div>
          )}

          {step === 3 && userType === 'lender' && (
            <div className="form-step">
              <h3>Investment Preferences</h3>
              <select
                value={formData.investmentAmount}
                onChange={(e) => handleInputChange('investmentAmount', e.target.value)}
                required
              >
                <option value="">Investment amount</option>
                <option value="1000">$1,000 - $5,000</option>
                <option value="5000">$5,000 - $25,000</option>
                <option value="25000">$25,000+</option>
              </select>
            </div>
          )}

          {step === 4 && userType === 'farmer' && (
            <div className="form-step">
              <h3>Loan Requirements</h3>
              <div className="loan-calculator">
                <div className="calculator-item">
                  <label>Loan Amount Needed</label>
                  <input type="number" placeholder="$5,000" />
                </div>
                <div className="calculator-item">
                  <label>Repayment Period</label>
                  <select>
                    <option>3 months</option>
                    <option>6 months</option>
                    <option>12 months</option>
                  </select>
                </div>
                <div className="estimated-rate">
                  <span>Estimated APR: <strong>8.5%</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {step > 1 && (
            <button 
              className="btn btn-secondary"
              onClick={() => setStep(step - 1)}
            >
              Back
            </button>
          )}
          <button 
            className="btn btn-primary"
            onClick={handleNext}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Processing...
              </>
            ) : step === totalSteps ? (
              'Submit Application'
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};