import {useState} from "react";

import {
  HeaderWrapper, 
  NavBar, 
  Brand, 
  HamburgerButton,
  Menu, 
  MenuItem, 
  MenuLink,
  SearchForm, 
  SearchInput, 
  SearchButton,
} from "../stylesjs/Header.styles";

  //[false, 'sm', 'md', 'lg', 'xl', 'xxl']
const Header:React.FC = () => { //jsx
  const [menuOpen, setMenuOpen] =useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
    return(
        <>
        <HeaderWrapper>

<NavBar>
  <Brand to="/">samERP</Brand>  
  <HamburgerButton onClick={toggleMenu}>
  ☰
  </HamburgerButton>
</NavBar>  

<Menu>
  <MenuItem>
    <MenuLink to="/mypage">MyPage</MenuLink>
  </MenuItem>
  <MenuItem>
          <MenuLink to="/admin">Admin</MenuLink>
        </MenuItem>
        <MenuItem>
          <MenuLink to="/inventory">재고1</MenuLink>
        </MenuItem>
        <MenuItem>
          <MenuLink to="/ea2">재고2</MenuLink>
        </MenuItem>
        <MenuItem>
          <MenuLink to="/ac1">회계1</MenuLink>
        </MenuItem>
        <MenuItem>
          <MenuLink to="/ac2">회계2</MenuLink>
        </MenuItem>  
</Menu>   

<SearchForm>
  <SearchInput type="search" placeholder="Search"/>
  <SearchButton type="submit">Search</SearchButton>  
</SearchForm>     
        </HeaderWrapper>
        </>
    )
}
/*
  <nav>
    <Link to="/">Home</Link>|{" "}
    <Link to="/about">about</Link>|{" "}
    <Link to="/contact">contact</Link>
  </nav>
*/
export default Header;
/*Bootstrap에 반응형구간(breakpoint)를 의미합니다 배열에 각요소에 대해 콜백함수를 실행하여 새로운 JSX요소 목록을 만듭니다*/