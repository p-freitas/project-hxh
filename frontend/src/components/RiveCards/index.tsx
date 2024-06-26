/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import {
  useRive,
  Layout,
  Fit,
  decodeImage,
  useStateMachineInput,
} from "@rive-app/react-canvas";

interface RiveCardsProps {
  cardCode: string;
}

const RiveCards: React.FC<RiveCardsProps> = ({ cardCode }) => {
  const { rive, RiveComponent } = useRive({
    src: `${process.env.PUBLIC_URL}/assets/rive/background.riv`,
    artboard: "card-flip",
    autoplay: true,
    stateMachines: "card",
    layout: new Layout({
      fit: Fit.FitWidth,
    }),
    //@ts-ignore
    assetLoader: async (asset, bytes) => {
      if (asset.isImage) {
        await loadImageAsset(asset, cardCode);
        return true;
      } else {
        return false;
      }
    },
  });

  const bumpInput = useStateMachineInput(rive, "card", "isFliped");

  const handleCardClick = () => {
    if (bumpInput) {
      bumpInput.value = true;
    }
  };

  const loadImageAsset = async (asset: any, cardCode: string) => {
    if (asset.name === "face") {
      const res = await fetch(
        require(`../../assets/images/png/${cardCode}.png`)
      );
      const image = await decodeImage(new Uint8Array(await res.arrayBuffer()));
      asset.setRenderImage(image);
      image.unref();
    }
    if (asset.name === "fundo") {
      const res = await fetch(require(`../../assets/images/png/fundo.png`));
      const image = await decodeImage(new Uint8Array(await res.arrayBuffer()));
      asset.setRenderImage(image);
      image.unref();
    }
  };

  return <RiveComponent onClick={handleCardClick} />;
};

export default RiveCards;
