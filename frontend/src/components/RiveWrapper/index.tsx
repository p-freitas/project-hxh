import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";
import "./styles.css";

// Wrapper component to isolate useRive logic that
// renders the <RiveComponent />
const RiveWrapper: React.FC<any> = () => {
  const { RiveComponent } = useRive({
    src: "/assets/rive/background.riv",
    artboard: "pack",
    autoplay: true,
    layout: new Layout({
      fit: Fit.Cover,
      alignment: Alignment.TopCenter,
    }),
  });

  return (
    <div className="rive-wrapper-container">
      <RiveComponent />
    </div>
  );
};

export default RiveWrapper;
