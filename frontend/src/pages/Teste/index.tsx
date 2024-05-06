import React, { useState } from "react";

const Teste: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleButtonClick = () => {
    setIsOpen(!isOpen);
  };

  return <></>;
};

export default Teste;
