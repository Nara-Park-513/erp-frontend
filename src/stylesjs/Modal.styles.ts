import styled from "styled-components";


export const Fixed = styled.div`
position:fixed;
background:rgba(0,0,0,.8);
width:100vw; height:100vh; 
display:flex; align-items:flex-end;
left:0; top:0; z-index:999999;
justify-content:center;

overflow:hidden;
`;

export const Modal =styled.div`
width: 440px;
height:90%;
background:#fff;
border-top-left-radius: 12px;
border-top-right-radius: 12px;
padding:16px;
`;


export const ModalTitle = styled.h1`
font-size:18px; font-weight:800; 
`;
export const ModalDate = styled.h5`
font-size:14px; font-weight:400;  color:#ccc;
`;