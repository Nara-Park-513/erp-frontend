import styled from "styled-components";
import {Link} from "react-router-dom";

export const HeaderWrapper = styled.header`
width:100%; 
background-color:hotpink; 
padding:0.5rem 1rem; 
display:flex;
color:white;
flex-direction:column;

@media (min-width:768px) {
flex-direction: row; 
align-items:center; 
justify-content:space-between;
background-color:#f8f9fa;

}

`;
//Navbar 영역(브랜드 + 햄버거)
export const NavBar = styled.nav`
display:flex; align-items:center;
justify-content:space-between; 
`;
export const Brand = styled(Link)`
font-size:1.4rem; font-weight:bold; color:#222; text:none;
transition:all ease-in 0.5s;
&:hover{color:#0d62fd; cursor:pointer;}
`;
//햄버거 버튼
export const HamburgerButton = styled.button`
background-color:hotpink;
border:none; cursor:pointer; 
z-index:9999999999;
position:fixed;
top:5px; right:5px;
font-size:1.5rem; color:white;

@media (min-width:768px) {display:none;}
`;

//메뉴 (offcanvas 포함)
export const Menu = styled.ul<{isOpen: boolean}>`
list-style:none;
padding:0; margin:0;
display:${({isOpen }) => (isOpen ?"flex":"none")}; 
flex-direction:column;
gap:1rem;

@media (max-width:576px){
display:flex;
flex-direction:row;
}
`;
export const MenuItem = styled.li``;

export const MenuLink = styled(Link)`
text-decoration:none; 
color:#333; 
font-weight:500;
&:hover{
color:#0d6efd;
}
`;

export const SearchForm = styled.form`
display:flex; 
gap:0.5rem; 
margin-top:0.5rem;
margin-right:5.625rem;
@media (max-width:576px){
margin-top:0;
}
`;
export const SearchInput = styled.input`
padding:0.35rem 0.5rem; 
border:1px solid #ccc; 
border-radius:4px;
`;
export const SearchButton = styled.button`
padding:0.35rem 0.75rem; 
border:1px solid hotpink; 
background:transparent;
color:hotpink; 
border-radius:4px; 
cursor:pointer;
&:hover{
color:#fff;
}

@media (max-width:768px){
border:1px solid white;
color:white;
&:hover{
border:1px solid white;
color:white;
}
}
`;