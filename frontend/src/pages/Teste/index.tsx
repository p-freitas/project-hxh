/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import { useRive } from "@rive-app/react-canvas";
import RiveWrapper from "../../components/RiveWrapper";
// import "animate.css";
// import "./styles.css";

const App: any = () => {
  const [isHidden, setIsHidden] = useState(false);
  const onClick = () => {
    setIsHidden(!isHidden);
  };

  return (
    <>
      <button className="skin-btn" onClick={onClick}>
        {isHidden ? "Show" : "Hide"}
      </button>
      <div className="container">{!isHidden && <RiveWrapper />}</div>
    </>
  );
};
export default App;
