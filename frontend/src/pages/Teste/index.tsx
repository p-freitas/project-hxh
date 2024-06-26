/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
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
  const [isHidden, setIsHidden] = useState(false);
  const onClick = () => {
    setIsHidden(!isHidden);
  };

  const { rive, RiveComponent } = useRive({
    src: "/assets/rive/background.riv",
    artboard: "card-flip",
    autoplay: true,
    stateMachines: "card",
    onLoad: () => {
      //@ts-ignore
      // eslint-disable-next-line react-hooks/rules-of-hooks
      console.log("input::", input);
    },
    // assetLoader: (asset, bytes) => {
    //   if (asset.isImage) {
    //     randomImageAsset(asset, "01");
    //     return true;
    //   } else {
    //     return false;
    //   }
    // },
  });
  const input = useStateMachineInput(rive, "card");

  // const randomImageAsset = async (asset: any, cardCode: string) => {
  //   console.log("asset::", asset);

  //   //@ts-ignore
  //   const imageUrl = imageMap[asset.name];

  //   if (asset.name === "face") {
  //     const res = await fetch(
  //       require(`../../assets/images/teste/${cardCode}.png`)
  //     );
  //     const image = await decodeImage(new Uint8Array(await res.arrayBuffer()));
  //     asset.setRenderImage(image);
  //     // image.unref();
  //   }
  //   if (asset.name === "fundo") {
  //     const res = await fetch(require(`../../assets/images/teste/fundo.png`));
  //     const image = await decodeImage(new Uint8Array(await res.arrayBuffer()));
  //     asset.setRenderImage(image);
  //     // image.unref();
  //   }
  // };

  // useStateMachineInput(rive, "card");

  console.log("useStateMachineInput::", input);

  return (
    <>
      <button className="skin-btn" onClick={onClick}>
        {isHidden ? "Show" : "Hide"}
      </button>
      <div className="container">
        {/* <div className="rive-wrapper-container"> */}
        {!isHidden && <RiveComponent />}
        {/* {!isHidden && <RiveCards cardCode="01" />} */}
        {/* {!isHidden && <RiveAnimation cardCode="02" />} */}
        {/* {!isHidden && <RiveComponent key={1}/>} */}
        {/* </div> */}
      </div>
    </>
  );
};
export default App;
