import { FiZap } from "react-icons/fi";
import "../styles/loading.css";

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-container">
        <div className="loading-logo">
          <FiZap className="loading-logo-icon" />
          <span>CampusFreelance</span>
        </div>
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p className="loading-text">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;