import { useNavigate } from 'react-router-dom';
import { FiWifiOff, FiAlertTriangle, FiHome, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';

interface ErrorPageProps {
  error?: Error;
  title?: string;
  message?: string;
}

const ErrorPage = ({ error, title, message }: ErrorPageProps) => {
  const navigate = useNavigate();
  
  let errorMessage = message || "Something went wrong";
  let errorTitle = title || "Oops!";
  let errorIcon = <FiAlertTriangle size={48} />;
  
  // Check if it's a network error
  if (error?.message === "Failed to fetch" || error?.message?.includes("network")) {
    errorTitle = "Network Error";
    errorMessage = "Please check your internet connection and try again.";
    errorIcon = <FiWifiOff size={48} />;
  }

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f7fb',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        background: 'white',
        borderRadius: '24px',
        padding: '2rem',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: '#fee2e2',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          color: '#dc2626'
        }}>
          {errorIcon}
        </div>
        
        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: '800',
          color: '#0f172a',
          marginBottom: '0.5rem'
        }}>{errorTitle}</h1>
        
        <p style={{
          fontSize: '0.9rem',
          color: '#64748b',
          marginBottom: '2rem',
          lineHeight: '1.5'
        }}>{errorMessage}</p>
        
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleGoBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.2rem',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              color: '#475569',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e2e8f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
            }}
          >
            <FiArrowLeft /> Go Back
          </button>
          
          <button
            onClick={handleRefresh}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.2rem',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              color: '#475569',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e2e8f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
            }}
          >
            <FiRefreshCw /> Try Again
          </button>
          
          <button
            onClick={handleGoHome}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.2rem',
              background: '#1a9c6e',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#158f5e';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1a9c6e';
            }}
          >
            <FiHome /> Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;