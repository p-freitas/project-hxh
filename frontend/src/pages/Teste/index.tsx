/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import "animate.css";
// import "./styles.css";

const App: any = () => {
  const [Show, setShow] = useState<boolean>(false);

  const handleClick = () => {
    setShow(!Show);
    setTimeout(() => {
      const myComponent = document.getElementById("pack");
      myComponent?.classList.add("animate__tada");
    }, 1000);
    setTimeout(() => {
      const myComponent = document.getElementById("pack");

      myComponent?.classList.add("animate__backOutDown");
    }, 2200);
    setTimeout(() => {
      setShow(false);
    }, 2700);
  };

  return (
    <>
      <button onClick={handleClick}>mostrar</button>

      {Show && (
        <div
          style={{
            height: "100vh",
            alignContent: "center",
          }}
          id="pack"
        >
          <img
            src={require(`../../assets/images/01.svg`)}
            alt="carta"
            className="animate__animated animate__backInDown"
          />
        </div>
      )}
    </>
  );
};
export default App;
