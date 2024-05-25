/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useRef, useCallback, useState } from "react";
import $ from "jquery";
import "animate.css";
import "./styles.css";

interface PackOpeningProps {
  userPacks: any;
  setShowPackOpening: any;
  handleOpenPacks: any;
  showPackOpening: boolean;
  getUserPacks: any;
}

const PackOpening: React.FC<PackOpeningProps> = ({
  userPacks,
  setShowPackOpening,
  handleOpenPacks,
  showPackOpening,
  getUserPacks,
}) => {
  const packWrapperRef = useRef<HTMLDivElement>(null);
  // const audioRef = useRef<HTMLAudioElement>(null);
  // const rumbleAudioRef = useRef<HTMLAudioElement>(null);
  const bodyRef = useRef<HTMLBodyElement>(null);

  const [openAllPacks, setOpenAllPacks] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  const randomRegular = (
    min: number,
    max: number,
    openAll: boolean,
    packType: string
  ) => {
    let numRand;
    let cards: string[] = [];
    Array.from({ length: openAll ? userPacks.total * 2 : 2 }, (_, index) => {
      numRand = Math.floor(Math.random() * max + min);
      const cardElement = document.querySelector<HTMLDivElement>(
        `#card${index}`
      );

      if (cardElement) {
        const imgElements = cardElement.getElementsByTagName("img");
        const lastImgElement = imgElements[imgElements.length - 1];
        lastImgElement.setAttribute(
          "src",
          require(`../../assets/images/${
            numRand < 9 ? "0" + numRand : numRand
          }.svg`)
        );
      }
      cards.push(`${numRand < 9 ? "0" + numRand : numRand}`);
      return false;
    });

    handleOpenPacks(cards, openAll, packType);
  };

  const handlePackClick = (openAll: boolean, packType: string) => {
    randomRegular(1, 4, openAll, packType);
    $(".pack-standard-container").fadeOut(1000);
    $("#pack-standard").fadeOut(1500);
    $(".pack-wrapper")
      .delay(500)
      .fadeIn(500)
      .addClass("pack-wrapper-container");

    return false;
  };

  const handleBodyClick = useCallback(() => {
    const $body = $(bodyRef.current!);
    const $btn = $(".btn");

    $btn.on("click", () => {
      $body.removeClass().addClass("restart");
      loader();
    });

    function loader() {
      $body.addClass("loading");
      $body.addClass("loaded");
    }
  }, []);

  useEffect(() => {
    handleBodyClick();
  }, [handleBodyClick]);

  const handleOpenAllPacksButton = async () => {
    setOpenAllPacks(true);
    return true;
  };

  const handleClose = () => {
    setIsClosing(true);
    getUserPacks();
    setTimeout(() => {
      setShowPackOpening(false);
      setIsClosing(false);
    }, 500);
  };

  const handleFlipAllCard = () => {
    const elements = document.querySelectorAll(".pack-wrapper-container .item");

    elements.forEach((element) => {
      //@ts-ignore
      element.click();
    });
  };

  return (
    <div
      // @ts-ignore
      ref={bodyRef}
      className={`pack-opening-container animate__animated animate__bounceIn  ${
        showPackOpening ? "open" : ""
      } ${isClosing ? "animate__animated animate__bounceOut" : ""}`}
    >
      <svg className="loader" viewBox="0 0 100 100" overflow="visible">
        <g className="core">
          <circle className="path" cx="50" cy="50" r="1" fill="none" />
        </g>
        <g className="layer-1">
          <circle className="path" cx="50" cy="50" r="70" fill="none" />
        </g>
        <g className="layer-2">
          <circle className="path" cx="50" cy="50" r="120" fill="none" />
        </g>
        <g className="layer-3">
          <circle className="path" cx="50" cy="50" r="180" fill="none" />
        </g>
        <g className="layer-4">
          <circle className="path" cx="50" cy="50" r="240" fill="none" />
        </g>
        <g className="layer-5">
          <circle className="path" cx="50" cy="50" r="300" fill="none" />
        </g>
        <g className="layer-6">
          <circle className="path" cx="50" cy="50" r="380" fill="none" />
        </g>
        <g className="layer-7">
          <circle className="path" cx="50" cy="50" r="450" fill="none" />
        </g>
        <g className="layer-8">
          <circle className="path" cx="50" cy="50" r="540" fill="none" />
        </g>
      </svg>
      <div className="pack-standard-container">
        <div id="pack-standard" className="">
          {userPacks &&
            userPacks.packs.map((pack: any) =>
              [...Array(pack.quantity)].map((_, index) => (
                <a
                  key={`${pack.packType}-${index}`}
                  className="btn"
                  onClick={() => handlePackClick(false, pack.packType)}
                >
                  <img
                    className="btn"
                    src={require(`../../assets/images/${pack.packType}-pack.png`)}
                    alt=""
                  />
                </a>
              ))
            )}
        </div>
        <div className="open-all-button-container">
          <button
            className="btn"
            onClick={async () => {
              const result = await handleOpenAllPacksButton();

              if (result) {
                handlePackClick(true, "");
              }
            }}
          >
            Abrir todos
          </button>
          <button onClick={handleClose}>Fechar</button>
        </div>
      </div>

      {/* <audio id="tear-pack-sound" ref={audioRef}>
        <source src="http://delive.se/files/pack.mp3"></source>
        Audio not supported.
      </audio> */}
      <div
        className="pack-wrapper"
        ref={packWrapperRef}
        style={{ display: "none" }}
      >
        {/* <audio id="rumble-sound" ref={rumbleAudioRef}>
          <source src="http://delive.se/files/item.mp3"></source>
          Audio not supported.
        </audio> */}
        <div>
          {Array.from(
            { length: openAllPacks ? userPacks.total * 2 : 2 },
            (_, index) => (
              <div
                className="item hidden pulsate"
                id={`card${index}`}
                key={index}
                onClick={() => {
                  let element = document.getElementById(`card${index}`);
                  element?.classList.add("shaker");
                  element?.classList.remove("pulsate");

                  setTimeout(() => {
                    element?.classList.add("active");
                    element?.classList.add("show");
                  }, 700);
                }}
              >
                <img
                  className="placeholder"
                  src={require("../../assets/images/fundo.svg").default}
                  alt=""
                />
                <img className="card" alt="" src="" />
              </div>
            )
          )}
        </div>
        <div className="close-packs-button-container">
          <button onClick={handleFlipAllCard}>Virar todas as cartas</button>
          <button onClick={handleClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
};

export default PackOpening;
