import React from 'react';
import './RegistrationProgress.css';

interface RegistrationProgressProps {
  currentStep: number;
  totalSteps: number;
  stepNames: string[];
  status: 'idle' | 'processing' | 'success' | 'error';
  error?: string;
}

const RegistrationProgress: React.FC<RegistrationProgressProps> = ({
  currentStep,
  totalSteps,
  stepNames,
  status,
  error
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="registration-progress">
      <div className="progress-header">
        <h3>註冊進度</h3>
        <span className="progress-percentage">{Math.round(progress)}%</span>
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="progress-steps">
        {stepNames.map((stepName, index) => (
          <div 
            key={index}
            className={`progress-step ${getStepClass(index, currentStep, status)}`}
          >
            <div className="step-number">
              {getStepIcon(index, currentStep, status)}
            </div>
            <span className="step-name">{stepName}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="progress-error">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{error}</span>
        </div>
      )}
    </div>
  );
};

function getStepClass(index, currentStep, status) {
  if (index < currentStep) return 'completed';
  if (index === currentStep) {
    if (status === 'processing') return 'active processing';
    if (status === 'error') return 'active error';
    return 'active';
  }
  return 'pending';
}

function getStepIcon(index, currentStep, status) {
  if (index < currentStep) return '✅';
  if (index === currentStep) {
    if (status === 'processing') return '⏳';
    if (status === 'error') return '❌';
    return '🔄';
  }
  return index + 1;
}

export default RegistrationProgress;
