import React from "react";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";

interface BackgroundAnimationProps {
  children: any;
  artboard: string;
}

const BackgroundAnimation: React.FC<BackgroundAnimationProps> = ({
  children,
  artboard,
}) => {
  const { RiveComponent } = useRive({
    src: `/assets/rive/background.riv`, // Replace with the path to your .riv file
    autoplay: true,
    artboard: artboard,
    layout: new Layout({
      fit: Fit.Cover,
      alignment: Alignment.TopCenter,
    }),
  });

  return (
    <div>
      <RiveComponent
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
};

export default BackgroundAnimation;
