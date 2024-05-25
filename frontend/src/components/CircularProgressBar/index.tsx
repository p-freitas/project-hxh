import React from "react";
import styled from "styled-components";

interface CircularProgressBarProps {
  seconds: number;
}

const ProgressContainer = styled.div<CircularProgressBarProps>`
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: conic-gradient(
    ${({ progress }: any) => `red ${progress}%, #ddd ${progress}%`}
  );
`;

const InnerCircle = styled.div`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background-color: #7500eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: white;
`;

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  seconds,
}) => {
  const progress = ((seconds * 2) / 60) * 100;

  return (
    //@ts-ignore
    <ProgressContainer progress={progress}>
      <InnerCircle>{seconds}</InnerCircle>
    </ProgressContainer>
  );
};

export default CircularProgressBar;
