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

const Admin = () => {
  return (
    <>
      <div className="fixed-top">
        <Header />
        <Top />
      </div>

      <div
        style={{
          backgroundColor: "#ffffff",
          minHeight: "100vh",
          paddingTop: "120px",
        }}
      >
        <Container
          fluid
          style={{
            paddingBottom: "64px",
          }}
        >
          <Row>
            <Col md={1}></Col>
            <Col md={5}>
              <div>
                <Callendar2 />
              </div>
            </Col>

            <Col md={5}>
              <div>
                <Pay />
                <Notice />
              </div>
            </Col>
            <Col md={1}></Col>
          </Row>

          <Row style={{ marginBottom: "40px" }}>
            <Col md={1}></Col>
            <Col md={10}>
              <OrderState />
            </Col>
            <Col md={1}></Col>
          </Row>

          <div style={{ height: "64px" }} />
        </Container>
      </div>
    </>
  );
};

export default Admin;