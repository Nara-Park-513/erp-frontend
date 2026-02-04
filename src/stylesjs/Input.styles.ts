import styled from "styled-components";

export const InputGroup = styled.div`
max-width:80%;
display:flex;
align-items:center;
justify-content:space-between;
`;

export const InsertTitle = styled.input`
border:1px solid #ccc;
border-radius:5px;
width:100%;
padding:10px 16px;
margin:5px 0px 10px;
`;

export const InsertMemo = styled.textarea`
border:1px solid #ccc;
border-radius:5px;
width:100%;
padding:10px 16px;
margin:5px 0px 10px;
resize:none;
height:auto;
`;

export const TimeInput = styled.input`
border:1px solid #ccc;
border-radius:5px;
width:100%;
padding:10px 16px;
margin:5px 0px 10px;
`;

//select를 스타일드 컴포넌트로 만들때는 무조건 select
export const Select = styled.select`
border:1px solid #ccc;
border-radius:5px;
max-width:35%;
padding:10px 16px;
margin:5px 0px 10px;
font-size:16px;
`;

//
export const Search = styled.input`
outline:none;
border:1px solid #ccc;
border-radius:5px;
max-width:100%;
padding:10px 16px;
margin:5px 0px 10px;
  /* search 타입에서 브라우저 기본 UI 제거 (특히 Safari/Chrome) */
  -webkit-appearance: none;
  appearance: none;

  &:focus,
  &:focus-visible {
    outline: none !important;
    border-color: 1px solid #ccc !important;
    box-shadow: none !important;
  }
`;

export const Radio = styled.input`

`;
export const Label = styled.label`
font-size:12px !important; color:#333 !important;
width:70px;
max-width:100%;
`;
export const MidLabel = styled.label`
font-size:14px !important; color:#333 !important;
width:100px;
max-width:100%;
`;

export const CheckGroup = styled.div`
display:inline-flex;
align-items:center;
`;
export const Check = styled.input``;

