import {
  useRive,
  Layout,
  Fit,
  Alignment,
  decodeImage,
} from "@rive-app/react-canvas";
import "./styles.css";

// Wrapper component to isolate useRive logic that
// renders the <RiveComponent />

interface RiveWrapperProps {
  artboard: string;
  imageName?: string;
}

const RiveWrapper: React.FC<RiveWrapperProps> = ({ artboard, imageName }) => {
  const { RiveComponent } = useRive({
    src: "/assets/rive/background.riv",
    artboard: artboard,
    autoplay: true,
    layout: new Layout({
      fit: Fit.Cover,
      alignment: Alignment.TopCenter,
    }),
    //@ts-ignore
    assetLoader: async (asset, bytes) => {
      if (imageName) {
        if (asset.isImage) {
          await loadImageAsset(asset, imageName);
          return true;
        } else {
          return false;
        }
      }
      return undefined;
    },
  });

  const loadImageAsset = async (asset: any, imageName: string) => {
    if (asset.name === "image") {
      const res = await fetch(
        require(`../../assets/images/png/${imageName}.png`)
      );
      const image = await decodeImage(new Uint8Array(await res.arrayBuffer()));
      asset.setRenderImage(image);
      image.unref();
    }
    // if (asset.name === "fundo") {
    //   const res = await fetch(require(`../../assets/images/png/fundo.png`));
    //   const image = await decodeImage(new Uint8Array(await res.arrayBuffer()));
    //   asset.setRenderImage(image);
    //   image.unref();
    // }
  };

  return (
    <div className="rive-wrapper-container">
      <RiveComponent />
    </div>
  );
};

export default RiveWrapper;
