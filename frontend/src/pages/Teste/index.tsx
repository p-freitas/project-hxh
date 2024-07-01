/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import { AnimatedCounter } from "react-animated-counter";
// import "animate.css";
import "./styles.css";

// //@ts-ignore
// const RiveAnimation = ({ cardCode }: any) => {
//   console.log("cardCode::", cardCode);

//   const { RiveComponent } = useRive({
//     src: "/assets/rive/background.riv",
//     artboard: "card-flip",
//     autoplay: true,
//     stateMachines: "State Machine 1",
//     //@ts-ignore
//     assetLoader: async (asset, bytes) => {
//       if (asset.isImage) {
//         await loadImageAsset(asset, cardCode);
//         return true;
//       } else {
//         return false;
//       }
//     },
//   });

//   const loadImageAsset = async (asset: any, cardCode: string) => {
//     if (asset.name === "face") {
//       const res = await fetch(
//         require(`../../assets/images/teste/${cardCode}.png`)
//       );
//       const image = await decodeImage(new Uint8Array(await res.arrayBuffer()));
//       asset.setRenderImage(image);
//       image.unref();
//     }
//     if (asset.name === "fundo") {
//       const res = await fetch(require(`../../assets/images/teste/fundo.png`));
//       const image = await decodeImage(new Uint8Array(await res.arrayBuffer()));
//       asset.setRenderImage(image);
//       image.unref();
//     }
//   };

//   return <RiveComponent />;
// };

const App: any = () => {
  // Integer state
  const [counterValue, setCounterValue] = useState(50);

  // Handle random increment/decrement
  const handleCounterUpdate = (increment: any) => {
    const delta = (Math.floor(Math.random() * 100) + 1) * 0.99;
    setCounterValue(increment ? counterValue + delta : counterValue - delta);
  };

  return (
    <div className="App">
      <h1>react-aniamted-counter demo</h1>
      <div className="counter-container">
        <AnimatedCounter
          value={counterValue}
          color="white"
          fontSize="40px"
          includeDecimals={false}
        />
        <div className="button-container">
          <button onClick={() => setCounterValue(35)}>Decrement</button>
          <button onClick={() => setCounterValue(60)}>Increment</button>
        </div>
      </div>
    </div>
  );
};
export default App;
