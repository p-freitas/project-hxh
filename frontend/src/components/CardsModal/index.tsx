import React, { useState, useEffect } from "react";
import "animate.css";
import "./styles.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: any;
}

const CardsModal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 1000);
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
        }, 1000);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen, onClose]);

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
