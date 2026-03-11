import styled from "styled-components";
import { Container } from "react-bootstrap";
import { NavLink as RouterNavLink } from "react-router-dom";

const HeaderWrap = styled.div`
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e9eef5;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
  padding: 0.75rem 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavBar = styled.nav`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.45rem 0.6rem;
`;

const NavItem = styled(RouterNavLink)`
  text-decoration: none;
  color: #475569;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  border: 1px solid transparent;
  transition: all 0.2s ease;

  &:hover {
    background: #eef4fb;
    color: #334155;
    border-color: #dbe6f2;
    cursor: pointer;
  }

  &.active {
    background: #e8f0fb;
    color: #2f5d9f;
    border-color: #cfe0f5;
    box-shadow: inset 0 0 0 1px rgba(47, 93, 159, 0.04);
  }
`;

const Top = () => {
  return (
    <HeaderWrap>
      <Container fluid>
        <NavBar>
          <NavItem to="/fund">자금 현황표</NavItem>
          <NavItem to="/pay">지급어음조회</NavItem>
          <NavItem to="/est">견적서입력</NavItem>
          <NavItem to="/inventory">구매조회</NavItem>
          <NavItem to="/profit">손익계산서</NavItem>
          <NavItem to="/sale">판매관리</NavItem>
          <NavItem to="/material">자재관리</NavItem>
          <NavItem to="/stock">재고현황</NavItem>
          <NavItem to="/general">일반전표</NavItem>
          <NavItem to="/custom">거래처리스트</NavItem>
          <NavItem to="/mydocs">전자결재</NavItem>
          <NavItem to="/notice">공지사항</NavItem>
          <NavItem to="/order">오더관리</NavItem>
          <NavItem to="/mypage">마이페이지</NavItem>
        </NavBar>
      </Container>
    </HeaderWrap>
  );
};

export default Top;