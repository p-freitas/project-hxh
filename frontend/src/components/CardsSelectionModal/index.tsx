import React, { useEffect, useState } from "react";
import "animate.css";
import "./styles.css";
import CardContainer from "./styles";

type CardSelectedType = {
  cardCode: string;
  quantity: number;
  index: number;
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  setIsClosing: any;
  isClosing: boolean;
  playerCards: CardSelectedType[] | undefined;
  setPlayerCard: any;
  setSelectedCardsArray: any;
  selectedCardsArray: CardSelectedType[] | undefined;
  handleNewGame: () => void;
  watingPlayersMessagem: boolean;
  cancelMatchMaking: () => void;
}

const CardsSelectionModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  isClosing,
  setIsClosing,
  playerCards,
  setPlayerCard,
  selectedCardsArray,
  setSelectedCardsArray,
  handleNewGame,
  watingPlayersMessagem,
  cancelMatchMaking,
}) => {
  const [selectedCard1, setSelectedCard1] = useState<CardSelectedType>();
  const [selectedCard2, setSelectedCard2] = useState<CardSelectedType>();
  const [selectedCard3, setSelectedCard3] = useState<CardSelectedType>();
  const [selectedCard4, setSelectedCard4] = useState<CardSelectedType>();
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 500);
  };

  useEffect(() => {
    const handleOutsideClick = (event: any) => {
      if (
        isOpen &&
        event.target.getAttribute("data-testid") === "modal-testid"
      ) {
        setIsClosing(true);
        setTimeout(() => {
          onClose();
          setIsClosing(false);
        }, 500);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen, onClose, setIsClosing]);

  const [heldBox, setHeldBox] = useState<string | null>(null);

  let holdTimeout: NodeJS.Timeout;

  const handleTouchStart = (e: TouchEvent) => {
    const boxId = (e.target as HTMLElement).id;
    holdTimeout = setTimeout(() => {
      if (!heldBox) {
        setHeldBox(boxId);
      }
    }, 500);
  };

  // useEffect(() => {
  //   const boxes = document.querySelectorAll(".box");

  //   return () => {
  //     boxes.forEach((box) => {
  //       box.removeEventListener(
  //         "touchstart",
  //         handleTouchStart as EventListener
  //       );
  //       // box.removeEventListener("touchend", handleTouchEnd as EventListener);
  //     });
  //   };
  // }, []);

  const handleTouchEnd = () => {
    if (!heldBox) {
      clearTimeout(holdTimeout);
      setHeldBox(null);
    }
  };

  const handleCardClick = (card: CardSelectedType, index: number) => {
    if (heldBox) {
      setHeldBox(null);
    } else {
      handleSelectCard(card, index);
    }
    return;
  };

  useEffect(() => {
    setSelectedCardsArray([
      selectedCard1,
      selectedCard2,
      selectedCard3,
      selectedCard4,
    ]);
  }, [
    selectedCard1,
    selectedCard2,
    selectedCard3,
    selectedCard4,
    setSelectedCardsArray,
  ]);

  const firstUndefinedOrNullIndex = selectedCardsArray?.findIndex(
    (item) => item === undefined || item === null
  );

  const handleSelectCard = (card: CardSelectedType, index: number) => {
    const decreaseQuantity = () => {
      setPlayerCard((prevItems: any) => {
        const newItems = [...prevItems];
        if (newItems[index] !== null && newItems[index] !== undefined) {
          newItems[index] = {
            ...newItems[index],
            quantity: newItems[index].quantity - 1,
          };
        }
        return newItems;
      });
    };

    switch (firstUndefinedOrNullIndex) {
      case 0:
        setSelectedCard1(card);
        decreaseQuantity();
        break;

      case 1:
        setSelectedCard2(card);
        decreaseQuantity();
        break;

      case 2:
        setSelectedCard3(card);
        decreaseQuantity();
        break;

      case 3:
        setSelectedCard4(card);
        decreaseQuantity();
        break;

      default:
        break;
    }
  };

  const handleSelectedCardClick = (index: number, cardCode: string) => {
    const newIndex = playerCards?.findIndex(
      (item) => item && item.cardCode === cardCode
    );

    const increaseQuantity = () => {
      if (newIndex !== undefined) {
        setPlayerCard((prevItems: any) => {
          const newItems = [...prevItems];
          if (newItems[newIndex] !== null && newItems[newIndex] !== undefined) {
            newItems[newIndex] = {
              ...newItems[newIndex],
              quantity: newItems[newIndex].quantity + 1,
            };
          }
          return newItems;
        });
      }
    };

    switch (index) {
      case 1:
        var element1 = document.getElementById("slot-image-1");
        element1?.classList.add("animate__bounceOut");

        setTimeout(() => {
          setSelectedCard1(undefined);
          increaseQuantity();
        }, 300);

        break;

      case 2:
        var element2 = document.getElementById("slot-image-2");
        element2?.classList.add("animate__bounceOut");

        setTimeout(() => {
          setSelectedCard2(undefined);
          increaseQuantity();
        }, 300);
        break;

      case 3:
        var element3 = document.getElementById("slot-image-3");
        element3?.classList.add("animate__bounceOut");

        setTimeout(() => {
          setSelectedCard3(undefined);
          increaseQuantity();
        }, 300);
        break;

      case 4:
        var element4 = document.getElementById("slot-image-4");
        element4?.classList.add("animate__bounceOut");

        setTimeout(() => {
          setSelectedCard4(undefined);
          increaseQuantity();
        }, 300);
        break;

      default:
        break;
    }
  };

  const handlePlayButton = () => {
    handleNewGame();
  };

  return (
    <div
      className={`modal animate__animated animate__bounceInUp  ${
        isOpen ? "open" : ""
      } ${isClosing ? "animate__animated animate__bounceOutDown" : ""}`}
      data-testid="modal-testid"
    >
      <div className="modal-content">
        <div className="card-selection-modal-container">
          <div className="card-selection-modal-slots-container">
            <div className="card-selection-modal-slot slot-1">
              {selectedCard1 && (
                <img
                  id={`slot-image-1`}
                  src={require(`../../assets/images/${selectedCard1.cardCode}.svg`)}
                  alt="carta"
                  className="card-selection-modal-card animate__bounceIn"
                  onClick={() =>
                    handleSelectedCardClick(1, selectedCard1.cardCode)
                  }
                />
              )}
            </div>
            <div className="card-selection-modal-slot slot-2">
              {selectedCard2 && (
                <img
                  id={`slot-image-2`}
                  src={require(`../../assets/images/${selectedCard2.cardCode}.svg`)}
                  alt="carta"
                  className="card-selection-modal-card animate__bounceIn"
                  onClick={() =>
                    handleSelectedCardClick(2, selectedCard2.cardCode)
                  }
                />
              )}
            </div>
            <div className="card-selection-modal-slot slot-3">
              {selectedCard3 && (
                <img
                  id={`slot-image-3`}
                  src={require(`../../assets/images/${selectedCard3.cardCode}.svg`)}
                  alt="carta"
                  className="card-selection-modal-card animate__bounceIn"
                  onClick={() =>
                    handleSelectedCardClick(3, selectedCard3.cardCode)
                  }
                />
              )}
            </div>
            <div className="card-selection-modal-slot slot-4">
              {selectedCard4 && (
                <img
                  id={`slot-image-4`}
                  src={require(`../../assets/images/${selectedCard4.cardCode}.svg`)}
                  alt="carta"
                  className="card-selection-modal-card animate__bounceIn"
                  onClick={() =>
                    handleSelectedCardClick(4, selectedCard4.cardCode)
                  }
                />
              )}
            </div>
          </div>
          <div className="card-selection-modal-cards-container">
            {playerCards?.map((card, index) => (
              <CardContainer content={`${card.quantity}`} key={index}>
                <div
                  key={index}
                  className={`card-container box ${
                    heldBox === `box-${index}` ? "held" : ""
                  }`}
                  //@ts-ignore
                  onTouchStart={(e) => handleTouchStart(e)}
                  //@ts-ignore
                  onTouchEnd={handleTouchEnd}
                >
                  <img
                    id={`box-${index}`}
                    src={require(`../../assets/images/${card.cardCode}.svg`)}
                    alt="carta"
                    className="card-selection-modal-card"
                    draggable={false}
                    onClick={() => handleCardClick(card, index)}
                  />
                </div>
              </CardContainer>
            ))}
          </div>
        </div>
        <div className="card-selection-modal-button-container">
          {watingPlayersMessagem && (
            <>
              <p>Aguardando jogadores...</p>
            </>
          )}
          <button
            onClick={
              watingPlayersMessagem
                ? () => cancelMatchMaking()
                : () => handlePlayButton()
            }
          >
            {watingPlayersMessagem ? "Cancelar" : "Jogar"}
          </button>
        </div>
        <span className="close" onClick={handleClose}>
          &times;
        </span>
      </div>
    </div>
  );
};

export default CardsSelectionModal;
