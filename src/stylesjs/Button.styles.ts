import styled from "styled-components";

export const BtnGroup = styled.div`
padding:10px 20px;
border:none !important;
color:none !important;
display:flex;
justfify-content:flex-end;
background:none !important;
`;
export const MainBtn = styled.button`
background-color:hotpink;
color:white;
width:100%;
display:flex; justify-content:center; align-items:center;
border:none;
height:36px;
border-radius:5px;
`;

export const GrayBtn = styled.button`
background-color:Gray;
color:white;
width:100%;
display:flex; justify-content:center; align-items:center;
border:none;
height:36px;
border-radius:5px;
font-size:14px;
letter-spacing:-2%;
`;

export const DelBtn = styled.button`
background-color:red;
color:white;
width:100%;
max-width:100%;
display:flex;
justify-content:center;
align-items:center;
font-size:14px;
letter-spacing:-2%;
border:none;
border-radius:3px;
opacity:.8;
transition:all 1s;
    &hover{
    opacity:1;
    }
`;
export const MainSubmitBtn = styled.button`
background-color:blue;
color:white;
display:flex;
justify-content:center;
align-items:center;
font-size:14px;
letter-spacing:-2%;
border:none;
border-radius:8px;
padding:12px 24px;;
`;

export const WhiteBtn = styled.button`
background-color:white;
color:#999;
width:200px;
max-width:100%;
display:flex;
justify-content:center;
align-items:center;
font-size:14px;
letter-spacing:-2%;
border:none;
border-radius:3px;
opacity:.8;
transition:all 1s;
    &hover{
    opacity:1;
    }
`;

export const SmallBadge = styled.div`
background-color:coral;
display:inline-flex;
justify-content:center;
align-items:center;
font-size:12px;
color:white;
padding:5px 10px;
border-radius:16px;
`;

export const BtnRight = styled.div`
width:100%;
display:flex;
justify-content:flex-end;
align-items:center;
padding:20px 0px;
`;