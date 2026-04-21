import "../styles/loading.css";

interface LoadingSpinnerProps {
  size?: "small" | "medium";
}

const LoadingSpinner = ({ size = "small" }: LoadingSpinnerProps) => {
  return (
    <div className={`loading-spinner-btn ${size}`}>
      <div className="spinner-dot"></div>
      <div className="spinner-dot"></div>
      <div className="spinner-dot"></div>
    </div>
  );
};

export default LoadingSpinner;