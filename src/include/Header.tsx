import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
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

const Header = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  // 검색 입력 (e 타입 에러 해결)
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // 검색 실행 (e 타입 에러 해결)
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <HeaderWrapper>
      <NavBar>
        <Brand to="/">DAON ERP</Brand>
        <HamburgerButton onClick={toggleMenu}>☰</HamburgerButton>
      </NavBar>

      <Menu $isOpen={menuOpen}>
        <MenuItem>
          <MenuLink to="/admin">Admin</MenuLink>
        </MenuItem>
      </Menu>

      <SearchForm onSubmit={handleSearch}>
        <SearchInput
          type="search"
          placeholder="Search"
          value={searchTerm}
          onChange={handleInputChange}
        />
        <SearchButton type="submit">Search</SearchButton>
      </SearchForm>
    </HeaderWrapper>
  );
};

export default Header;