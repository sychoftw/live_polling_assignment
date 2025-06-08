import React, { useEffect, useState } from "react";

interface CountdownTimerProps {
  duration: number;
  onEnd: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ duration, onEnd }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration); // reset when new duration is passed
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [duration]);

  return (
    <div className="mb-4 text-center text-lg font-semibold text-red-600">
      Time left: {timeLeft} seconds
    </div>
  );
};

export default CountdownTimer;
