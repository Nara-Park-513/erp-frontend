import styled from "styled-components";

const TOP_OFFSET = "150px";

export const Fixed = styled.div`
  position: fixed;
  left: 0;
  top: ${TOP_OFFSET};
  width: 100vw;
  height: calc(100vh - ${TOP_OFFSET});
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  padding: 20px 24px 24px;
  box-sizing: border-box;
  overflow: hidden;
`;

export const Modal = styled.div`
  width: min(680px, calc(100vw - 48px));
  height: min(820px, calc(100vh - ${TOP_OFFSET} - 40px));
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.18);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 768px) {
    width: min(92vw, 640px);
    height: min(88vh, calc(100vh - ${TOP_OFFSET} - 24px));
    border-radius: 18px;
  }

  @media (max-width: 480px) {
    width: calc(100vw - 24px);
    height: calc(100vh - ${TOP_OFFSET} - 16px);
    border-radius: 16px;
  }
`;

export const ModalTitle = styled.h1`
  font-size: 18px;
  font-weight: 800;
  margin: 0;
  color: #111827;
`;

export const ModalDate = styled.h5`
  font-size: 14px;
  font-weight: 400;
  color: #9ca3af;
  margin: 0;
`;