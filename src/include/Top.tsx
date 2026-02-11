import styled from "styled-components";
import { Container, Row, Col } from "react-bootstrap";
import { NavLink as RouterNavLink } from "react-router-dom";

const HeaderWrap = styled.div`
  background-color: white;
  padding: 1rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(RouterNavLink)`
  margin-right: 1rem;
  text-decoration: none;
  color: black;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;

  &:hover {
    border-bottom-color: hotpink;
    color: hotpink;
    cursor: pointer;
  }
`;

const Top = () => {
    return(
        <>
<HeaderWrap>
<Container fluid>
    <Row>
        <Col md={12}>
<NavLink to="/fund">자금 현황표</NavLink>
<NavLink to="/pay">지급어음조회</NavLink>
<NavLink to="/est">견적서입력</NavLink>
<NavLink to="/inventory">구매조회</NavLink>
<NavLink to="/profit">손익계산서</NavLink>
<NavLink to="/sale">판매입력</NavLink>
<NavLink to="/sale2">판매입력2</NavLink>
<NavLink to="/stock">재고현황</NavLink>
<NavLink to="/stockmove">재고변동표</NavLink>
<NavLink to="/general">일반전표</NavLink>
<NavLink to="/trade">판매조회</NavLink>
<NavLink to="/custom">거래처리스트</NavLink>
<NavLink to="/mydocs">전자결재</NavLink>
<NavLink to="/notice">공지사항</NavLink>
<NavLink to="/order">오더관리</NavLink>
        </Col>
    </Row>
</Container>
</HeaderWrap>
        </>
    )
}
export default Top;