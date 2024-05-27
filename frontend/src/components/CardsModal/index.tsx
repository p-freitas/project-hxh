import React, { useEffect } from "react";
import "animate.css";
import "./styles.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: any;
  setIsClosing: any;
  isClosing: boolean;
}

const CardsModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  isClosing,
  setIsClosing,
}) => {
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

  return (
    <div
      className={`modal animate__animated animate__bounceInUp  ${
        isOpen ? "open" : ""
      } ${isClosing ? "animate__animated animate__bounceOutDown" : ""}`}
      data-testid="modal-testid"
    >
      <div className="modal-content">
        {children}
        <span className="close" onClick={handleClose}>
          &times;
        </span>
      </div>
    </div>
  );
};

export default CardsModal;
