import Top from "../include/Top";
import Header from "../include/Header";
import SideBar from "../include/SideBar";
import {Container, Row, Col} from "react-bootstrap";
import {Left, Right, Flex} from "../stylesjs/Content.styles";
import Calendar from "../3_common/Calendar";
import Calendar2 from "../3_common/Calendar2";
import SmallCalendar from "../3_common/SmallCalendar";

const MyPage = () => {
    return(
        <>
<div className="fixed-top">
  <Top/>
  <Header/>
</div>
<SideBar/>
<Container fluid>
    <Row>
        <Col>
        <Flex>
            <Left>
<SmallCalendar/>
            </Left>
            <Right>
<Calendar2/>             
            </Right>
        </Flex>
        </Col>
    </Row>
</Container>
        </>
    )
}

export default MyPage;
/*
401오류가 뜨는 이유
프론트에서 Authorization 헤더가 안 붙음
Axios인터셉터가 있어도
토큰키가 다르거나 token이 아니라 accessToken등
요청이 api가 아닌 기본 axios로 나가거나
lcalStorage에 토큰이 비어 있거나
Bearer가 빠져 잇거나

*/