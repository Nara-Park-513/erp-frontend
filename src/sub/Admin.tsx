//간단하게 리액트 만으로 처리하지만 but 다시함
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {Container, Row, Col, Button, Card,Table} from "react-bootstrap"
import Callendar2 from "../3_common/Calendar2";
import Pay from "../component/Pay";
import Notice from "../component/Notice";
import OrderState from "../component/OrderState";
import Top from "../include/Top";
import Header from "../include/Header";
import SideBar from "../include/SideBar";

const Admin= () => {

    /*const navigate = useNavigate();

    useEffect(() =>{
const token = localStorage.getItem("token");
if(!token){
    alert("로그인이 필요합니다");
    navigate("/login");
}      
    },[navigate]);*/

    return(
        <>
<div className="fixed-top">
  <Top/>
  <Header/>
</div>
<SideBar/>
<Container fluid>
    <Row>
        <Col md={1}></Col>
        <Col md={5}>
        <div className="">
            <Callendar2/>
        </div>
        </Col>
        
        <Col md={5}>
        <div className="">
            <Pay/>
            <Notice/>
        </div>
        </Col>
        <Col md={1}></Col>
    </Row>

    <Row>
        <Col md={1}></Col>
        <Col md={10}>
            <OrderState/>
        </Col>
        <Col md={1}></Col>
    </Row>
</Container>
        </>
    )
}
export default Admin;