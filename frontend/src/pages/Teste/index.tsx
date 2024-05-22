/* eslint-disable jsx-a11y/anchor-is-valid */
// import React, { useEffect, useRef, useCallback } from "react";
// import $ from "jquery";
// import "./styles.css";

const App: any = () => {
  return console.log("sdasasd");

  // const packWrapperRef = useRef<HTMLDivElement>(null);
  // // const audioRef = useRef<HTMLAudioElement>(null);
  // // const rumbleAudioRef = useRef<HTMLAudioElement>(null);
  // const bodyRef = useRef<HTMLBodyElement>(null);
  // const randomRegular = useCallback((min: number, max: number) => {
  //   var numRand = Math.floor(Math.random() * max + min);
  //   var numRand2 = Math.floor(Math.random() * max + min);
  //   $("#card1")
  //     .find("img:last-child")
  //     .attr(
  //       "src",
  //       require(`../../assets/images/${
  //         numRand < 9 ? "0" + numRand : numRand
  //       }.png`)
  //     );
  //   $("#card2")
  //     .find("img:last-child")
  //     .attr(
  //       "src",
  //       require(`../../assets/images/${
  //         numRand2 < 9 ? "0" + numRand2 : numRand2
  //       }.png`)
  //     );
  // }, []);
  // const handlePackClick = useCallback(() => {
  //   randomRegular(1, 2);
  //   $("#pack-standard").fadeOut(1500);
  //   $(".pack-wrapper")
  //     .delay(500)
  //     .fadeIn(500)
  //     .addClass("pack-wrapper-container");
  //   return false;
  // }, [randomRegular]);
  // const handleBodyClick = useCallback(() => {
  //   const $body = $(bodyRef.current!);
  //   const $btn = $(".btn");
  //   $btn.on("click", () => {
  //     $body.removeClass().addClass("restart");
  //     loader();
  //   });
  //   function loader() {
  //     $body.addClass("loading");
  //     $body.addClass("loaded");
  //   }
  // }, []);
  // useEffect(() => {
  //   handleBodyClick();
  // }, [handleBodyClick]);
  // return (
  //   // @ts-ignore
  //   <div ref={bodyRef} className="container">
  //     <svg className="loader" viewBox="0 0 100 100" overflow="visible">
  //       <g className="core">
  //         <circle className="path" cx="50" cy="50" r="1" fill="none" />
  //       </g>
  //       <g className="layer-1">
  //         <circle className="path" cx="50" cy="50" r="70" fill="none" />
  //       </g>
  //       <g className="layer-2">
  //         <circle className="path" cx="50" cy="50" r="120" fill="none" />
  //       </g>
  //       <g className="layer-3">
  //         <circle className="path" cx="50" cy="50" r="180" fill="none" />
  //       </g>
  //       <g className="layer-4">
  //         <circle className="path" cx="50" cy="50" r="240" fill="none" />
  //       </g>
  //       <g className="layer-5">
  //         <circle className="path" cx="50" cy="50" r="300" fill="none" />
  //       </g>
  //       <g className="layer-6">
  //         <circle className="path" cx="50" cy="50" r="380" fill="none" />
  //       </g>
  //       <g className="layer-7">
  //         <circle className="path" cx="50" cy="50" r="450" fill="none" />
  //       </g>
  //       <g className="layer-8">
  //         <circle className="path" cx="50" cy="50" r="540" fill="none" />
  //       </g>
  //     </svg>
  //     <a href="#" id="pack-standard" className="btn" onClick={handlePackClick}>
  //       <img src={require(`../../assets/images/pack.png`)} alt="" />
  //     </a>
  //     {/* <audio id="tear-pack-sound" ref={audioRef}>
  //       <source src="http://delive.se/files/pack.mp3"></source>
  //       Audio not supported.
  //     </audio> */}
  //     <div
  //       className="pack-wrapper"
  //       ref={packWrapperRef}
  //       style={{ display: "none" }}
  //     >
  //       {/* <audio id="rumble-sound" ref={rumbleAudioRef}>
  //         <source src="http://delive.se/files/item.mp3"></source>
  //         Audio not supported.
  //       </audio> */}
  //       <div
  //         className="item hidden flip-card"
  //         id="card1"
  //         onClick={() => {
  //           var element = document.getElementById("card1");
  //           element?.classList.add("shaker");
  //           setTimeout(() => {
  //             element?.classList.add("active");
  //             element?.classList.add("show");
  //           }, 700);
  //         }}
  //       >
  //         <img
  //           className="placeholder"
  //           src={require(`../../assets/images/fundo.png`)}
  //           alt=""
  //         />
  //         <img className="card" alt="" />
  //       </div>
  //       <div
  //         className="item hidden"
  //         id="card2"
  //         onClick={() => {
  //           var element = document.getElementById("card2");
  //           element?.classList.add("shaker");
  //           setTimeout(() => {
  //             element?.classList.add("active");
  //             element?.classList.add("show");
  //           }, 700);
  //         }}
  //       >
  //         <img
  //           className="placeholder"
  //           src={require(`../../assets/images/fundo.png`)}
  //           alt=""
  //         />
  //         <img className="card" alt="" />
  //       </div>
  //     </div>
  //   </div>
  // );
};

export default App;
