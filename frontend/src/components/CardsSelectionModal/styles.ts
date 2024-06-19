import styled from "styled-components";

interface CardContainerProps {
  content: string | undefined;
}

const CardContainer = styled.div<CardContainerProps>`
  width: fit-content;
  .card-container {
    &:after {
      content: "${(props) => props.content}";
      display: flex;
      width: 15px;
      height: 15px;
      background-color: red;
      position: relative;
      top: -126px;
      left: 66px;
      border-radius: 50%;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 9px;
    }
  }
`;

export default CardContainer;
