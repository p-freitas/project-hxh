import styled from "styled-components";

interface CardContainerProps {
  content: string | undefined;
}

const CardContainer = styled.div<CardContainerProps>`
  .card-container {
    &:after {
      content: "${(props) => props.content}";
      display: flex;
      width: 25px;
      height: 25px;
      background-color: red;
      position: relative;
      top: -275px;
      left: 160px;
      border-radius: 50%;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      z-index: 999;
    }
  }
`;

export default CardContainer;
