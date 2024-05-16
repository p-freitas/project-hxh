import React from "react";
import "./styles.css";

interface ModalProps {
  roundNumber: number;
  pointsColor: (string | undefined)[];
}

const PointsCounter: React.FC<ModalProps> = ({ roundNumber, pointsColor }) => {
  return (
    <div className="points-counter-container">
      <span
        className={`points-counter 1 ${pointsColor[0]} ${
          roundNumber === 1 ? "current" : ""
        }`}
      />
      <span
        className={`points-counter 2 ${pointsColor[1]} ${
          roundNumber === 2 ? "current" : ""
        }`}
      />
      <span
        className={`points-counter 3 ${pointsColor[2]} ${
          roundNumber === 3 ? "current" : ""
        }`}
      />
      <span
        className={`points-counter 4 ${pointsColor[3]} ${
          roundNumber === 4 ? "current" : ""
        }`}
      />
      <span
        className={`points-counter 5 ${pointsColor[4]} ${
          roundNumber === 5 ? "current" : ""
        }`}
      />
    </div>
  );
};

export default PointsCounter;
