import styled from "styled-components";
import { Link } from "react-router-dom";

export const HeaderWrapper = styled.header`
  width: 100%;
  background: linear-gradient(90deg, #f8fafc 0%, #eef2f7 100%);
  padding: 0.75rem 1.25rem;
  display: flex;
  flex-direction: column;
  color: #1f2937;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
  position: relative;
  z-index: 1000;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0.875rem 1.5rem;
  }
`;

// Navbar 영역(브랜드 + 햄버거)
export const NavBar = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

export const Brand = styled(Link)`
  font-size: 1.45rem;
  font-weight: 800;
  color: #1e293b;
  text-decoration: none;
  letter-spacing: -0.02em;
  transition: color 0.2s ease;

  &:hover {
    color: #475569;
    cursor: pointer;
  }
`;

// 햄버거 버튼
export const HamburgerButton = styled.button`
  background-color: #64748b;
  border: none;
  cursor: pointer;
  z-index: 9999;
  position: fixed;
  top: 12px;
  right: 14px;
  font-size: 1.2rem;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(100, 116, 139, 0.25);
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #475569;
  }

  @media (min-width: 768px) {
    display: none;
  }
`;

// 메뉴
export const Menu = styled.ul<{ $isOpen: boolean }>`
  list-style: none;
  padding: 0;
  margin: 0;
  display: ${({ $isOpen }) => ($isOpen ? "flex" : "none")};
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.9rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;

  @media (min-width: 768px) {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.35rem;
    margin-top: 0;
    padding-top: 0;
    border-top: none;
    margin-left: 1.5rem;
    flex: 1;
  }
`;

export const MenuItem = styled.li``;

export const MenuLink = styled(Link)`
  text-decoration: none;
  color: #475569;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.55rem 0.9rem;
  border-radius: 10px;
  display: inline-block;
  transition: all 0.2s ease;

  &:hover {
    color: #334155;
    background-color: #e8eef6;
  }
`;

export const SearchForm = styled.form`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.9rem;

  @media (min-width: 768px) {
    margin-top: 0;
    margin-right: 0;
    margin-left: 1rem;
    align-items: center;
  }
`;

export const SearchInput = styled.input`
  padding: 0.5rem 0.8rem;
  border: 1px solid #d1d9e6;
  border-radius: 10px;
  background-color: #ffffff;
  color: #334155;
  outline: none;
  min-width: 180px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::placeholder {
    color: #94a3b8;
  }

  &:focus {
    border-color: #94a3b8;
    box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.15);
  }
`;

export const SearchButton = styled.button`
  padding: 0.5rem 0.9rem;
  border: 1px solid #64748b;
  background: #64748b;
  color: #ffffff;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: #475569;
    border-color: #475569;
    color: #ffffff;
  }

  @media (max-width: 768px) {
    border: 1px solid #64748b;
    color: #ffffff;
    background: #64748b;

    &:hover {
      border: 1px solid #475569;
      color: #ffffff;
      background: #475569;
    }
  }
`;