import { useState } from "react";
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

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <HeaderWrapper>
      <NavBar>
        <Brand to="/">DAON ERP</Brand>
        <HamburgerButton onClick={toggleMenu}>☰</HamburgerButton>
      </NavBar>

      <Menu $isOpen={menuOpen}>
        {/*<MenuItem>
          <MenuLink to="/mypage">MyPage</MenuLink>
        </MenuItem>*/}
        <MenuItem>
          <MenuLink to="/admin">Admin</MenuLink>
        </MenuItem>
        {/*<MenuItem>
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
        </MenuItem>*/}
      </Menu>

      <SearchForm>
        <SearchInput type="search" placeholder="Search" />
        <SearchButton type="submit">Search</SearchButton>
      </SearchForm>
    </HeaderWrapper>
  );
};

export default Header;