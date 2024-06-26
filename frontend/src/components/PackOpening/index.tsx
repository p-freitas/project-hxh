/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useRef, useState } from "react";
import "animate.css";
import "./styles.css";
import RiveWrapper from "../RiveWrapper";
import RiveCards from "../RiveCards";

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
  const bodyRef = useRef<HTMLBodyElement>(null);

  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [showPackStandard, setShowPackStandard] = useState<boolean>(true);
  const [showPackWrapper, setShowPackWrapper] = useState<boolean>(false);
  const [cardsArray, setCardsArray] = useState<string[]>();

  const maxCardsNumber = 4;

  let cards: string[] = [];
  const randomRegular = (max: number, openAll: boolean, packType: string) => {
    let numRand;
    let min = 1;
    Array.from({ length: openAll ? userPacks.total * 2 : 2 }, (_, index) => {
      numRand = Math.floor(Math.random() * max + min);
      cards.push(`${numRand < 9 ? "0" + numRand : numRand}`);
      setCardsArray(cards);
      return false;
    });

    handleOpenPacks(cards, openAll, packType);
  };

  const [isHidden, setIsHidden] = useState(true);

  const handlePackClick = (openAll: boolean, packType: string) => {
    setIsHidden(false);
    setShowPackStandard(false);
    randomRegular(maxCardsNumber, openAll, packType);
    setTimeout(() => {
      setIsHidden(true);
      setShowPackWrapper(true);
    }, 3000);
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
    const elements = document.querySelectorAll(".rive-card-container div");

    elements.forEach((element) => {
      //@ts-ignore
      element.children[0].click();
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
      <div className="container">{!isHidden && <RiveWrapper />}</div>
      {showPackStandard && (
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
                      src={require(`../../assets/images/${pack.packType}-pack.svg`)}
                      alt=""
                    />
                  </a>
                ))
              )}
          </div>
          <div className="open-all-button-container">
            <button className="btn" onClick={() => handlePackClick(true, "")}>
              {`Abrir todos (${userPacks.total})`}
            </button>
            <button onClick={handleClose}>Fechar</button>
          </div>
        </div>
      )}

      {showPackWrapper && (
        <div className="pack-wrapper" ref={packWrapperRef}>
          <div className="pack-opened-container">
            {cardsArray?.map((card, index) => {
              console.log("card::", card);

              return (
                <div className="rive-card-container" key={index}>
                  <RiveCards cardCode={card} />
                </div>
              );
            })}
          </div>
          <div className="close-packs-button-container">
            <button onClick={handleFlipAllCard}>Virar todas as cartas</button>
            <button onClick={handleClose}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackOpening;
