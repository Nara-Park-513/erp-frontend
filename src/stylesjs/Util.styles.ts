import styled from "styled-components";

export const Dflex = styled.div`
display:flex;
`;

export const JustifyContent = styled.div`
width:100%;
display:flex; justify-content:space-between;
align-items:center;
`;

export const W49 = styled.div`
width:49%;
`;

export const W20 = styled.div`
width:20% !important;
`;
export const W80 = styled.div`
width:80% !important;
`;
export const W30 = styled.div`
width:30% !important;
`;
export const W70 = styled.div`
width:70% !important;
`;

export const Toolbar = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between; /* 좌(토글/버튼) + 우(검색/버튼) */
  gap: 12px;
  flex-wrap: wrap; /* 작은 화면에서 줄바꿈 */
`;

export const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 0 0 auto;
`;

export const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1 1 auto;
  justify-content: flex-end;
  min-width: 320px;
`;

export const ToggleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  /* 토글 클릭 영역 통일 */
  > label {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    user-select: none;
  }
`;

/* Search input 폭 통일용 */
export const SearchWide = styled.div`
  flex: 1 1 520px; /* 넓을 땐 넓게, 좁으면 줄어듦 */
  min-width: 260px;

  input {
    width: 100%;
  }
`;