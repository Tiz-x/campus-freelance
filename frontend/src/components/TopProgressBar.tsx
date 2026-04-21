import { useEffect, useState } from "react";
import { useLoading } from "../context/LoadingContext";
import "../styles/progress-bar.css";

const TopProgressBar = () => {
  const { isLoading } = useLoading();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isLoading) {
      setVisible(true);
      setProgress(15);
      
      // Slow, gradual progress
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return 90;
          return prev + Math.random() * 3;
        });
      }, 500);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else if (visible) {
      setProgress(100);
      const hideTimer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 600);
      
      return () => clearTimeout(hideTimer);
    }
  }, [isLoading, visible]);

  if (!visible) return null;

  return (
    <div className="top-progress-bar">
      <div 
        className="progress-fill" 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default TopProgressBar;