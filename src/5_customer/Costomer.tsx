import axios from "axios";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import Top from "../include/Top";
import Header from "../include/Header";
import SideBar from "../include/SideBar";
import {
  Left,
  Right,
  Flex,
  TopWrap,
  RoundRect,
} from "../stylesjs/Content.styles";
import { useState, useEffect } from "react";
import { JustifyContent, W70, W30 } from "../stylesjs/Util.styles";
import { TableTitle } from "../stylesjs/Text.styles";
import {
  InputGroup,
  Search,
  Radio,
  Label,
  MidLabel,
} from "../stylesjs/Input.styles";
import { WhiteBtn, MainSubmitBtn, BtnRight } from "../stylesjs/Button.styles";
import Lnb from "../include/Lnb";

type ColumnDef = {
  key: string;
  label: string;
};

// 🔽 [추가] 다음 주소 API 사용을 위한 타입 선언
declare global {
  interface Window {
    daum: any;
  }
}

const Customer = () => {
  const [show, setShow] = useState(false);

  // 선택된 거래처 iD
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 테이블 컬럼
  const columns: ColumnDef[] = [
    { key: "customerCode", label: "거래처코드" },
    { key: "customerName", label: "거래처명" },
    { key: "ceoName", label: "대표자명" },
    { key: "phone", label: "전화번호" },
    { key: "email", label: "이메일" },
    { key: "address", label: "주소" },
    { key: "detailAddress", label: "상세주소" },
    { key: "customerType", label: "상/구분" },
    { key: "remark", label: "적요" },
  ];

  // 거래처 상태
  const [customer, setCustomer] = useState({
    customerCode: "",
    customerName: "",
    ceoName: "",
    phone: "",
    email: "",
    address: "",
    detailAddress: "", // 🔽 [추가]
    customerType: "SALES",
    remark: "",
  });

  // 거래처 리스트
  const [customerList, setCustomerList] = useState<any[]>([]);

  // 비동기 함수로 거래처 리스트 가져오기
  const fetchCustomers = async () => {
    try {
      // 정상실행 코드
      const res = await axios.get(
        "http://localhost:8888/api/acc/customers",
        { params: { page: 0, size: 20 } }
      );
      
      // 받아온 데이터를 customerList 상태에 설정
      setCustomerList(res.data);
    } catch (e) {
      console.error("거래처 조회 실패", e);
    }
  };

  useEffect(() => {
    // 컴포넌트가 마운트되었을 때 fetchCustomers를 호출하여 데이터 가져오기
    fetchCustomers();
  }, []);

  const handleClose = () => {
    setShow(false);
    setSelectedId(null);
    setCustomer({
      customerCode: "",
      customerName: "",
      ceoName: "",
      phone: "",
      email: "",
      address: "",
      detailAddress: "", // 🔽 [추가]
      customerType: "SALES",
      remark: "",
    });
  };

  // 신규/수정 분기
  const saveCustomer = async () => {
    try {
      if (selectedId) {
        // 수정
        await axios.put(
          `http://localhost:8888/api/acc/customers/${selectedId}`,
          customer
        );
      } else {
        // 신규
        await axios.post(
          "http://localhost:8888/api/acc/customers",
          customer
        );
      }
      fetchCustomers(); // 데이터 새로고침
      handleClose();
    } catch (e) {
      console.error("저장 실패", e);
    }
  };

  const deleteCustomer = async () => {
    if (!selectedId) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`http://localhost:8888/api/acc/customers/${selectedId}`);
      fetchCustomers(); // 삭제 후 데이터 새로고침
      handleClose();
    } catch (e) {
      console.error("거래처 삭제 실패", e);
    }
  };

  const stockMenu = [
    { key: "status", label: "거래처리스트", path: "/custom" },
  ];

  // 🔽 [추가] 다음 주소 검색 함수
  const handleAddressSearch = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!window.daum || !window.daum.Postcode) {
      console.error("다음 주소 API가 로드되지 않았습니다.");
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data: any) => {
        setCustomer({
          ...customer,
          address: data.address, // 선택한 주소 세팅
        });
      },
    }).open();
  };

const IndividualHoverStyle = () => (
  <style>{`
    /* 1. 테이블 전체 행에 마우스 커서는 손가락 모양으로 고정 */
    .custom-hover-table tbody tr td {
      cursor: pointer;
    }

    /* 2. 마우스를 올린 '그 칸(td)'에만 밑줄과 색상 변화 적용 */
    .custom-hover-table tbody tr td:hover {
      text-decoration: underline !important;
      color: #007bff !important; /* 강조색 (원치 않으면 삭제 가능) */
    }
  `}</style>
);

  return (
    <>
    <IndividualHoverStyle />
      <div className="fixed-top">
        <Top />
        <Header />
      </div>
      <SideBar />
      <script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        async
      ></script>
      <Container fluid>
        <Row>
          <Col>
            <Flex>
              <Left>
                <Lnb menuList={stockMenu} title="거래처리스트" />
              </Left>
              <Right>
                <TopWrap />
                <JustifyContent>
                  <TableTitle>거래처 기초등록</TableTitle>
                  <InputGroup>
                    <WhiteBtn className="mx-2">사용중단포함</WhiteBtn>
                    <Search type="search" placeholder="거래처 검색" />
                    <MainSubmitBtn className="mx-2">
                      Search(F3)
                    </MainSubmitBtn>
                  </InputGroup>
                </JustifyContent>

                <Table responsive className="custom-hover-table">
                  <thead>
                    <tr>
                      {columns.map((c) => (
                        <th key={c.key}>{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {customerList.length === 0 && (
                      <tr>
                        <td colSpan={columns.length} className="text-center">
                          등록된 거래처가 없습니다
                        </td>
                      </tr>
                    )}
                    {customerList.map((c, idx) => (
                      <tr
                        key={idx}
                        onClick={() => {
                          setCustomer(c);
                          setSelectedId(c.id);
                          setShow(true);
                        }}
                      >
                        {columns.map((col) => (
                          <td key={col.key}>{c[col.key] ?? "-"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <BtnRight>
                  <MainSubmitBtn
                    onClick={() => {
                      setSelectedId(null);
                      setCustomer({
                        customerCode: "",
                        customerName: "",
                        ceoName: "",
                        phone: "",
                        email: "",
                        address: "",
                        detailAddress: "", // 🔽 [추가]
                        customerType: "SALES",
                        remark: "",
                      });
                      setShow(true);
                    }}
                  >
                    신규(F2)
                  </MainSubmitBtn>
                </BtnRight>
              </Right>
            </Flex>
          </Col>
        </Row>
      </Container>

      {/* 등록 모달 */}
      <Modal show={show} onHide={() => setShow(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>거래처 등록</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <RoundRect>
            {/* 거래처 코드 */}
            <InputGroup>
              <W30>
                <MidLabel>거래처 코드</MidLabel>
              </W30>
              <W70>
                <Form.Control
                  value={customer.customerCode}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      customerCode: e.target.value,
                    })
                  }
                />
              </W70>
            </InputGroup>

            {/* 거래처명 */}
            <InputGroup className="my-3">
              <W30>
                <MidLabel>거래처명</MidLabel>
              </W30>
              <W70>
                <Form.Control
                  value={customer.customerName}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      customerName: e.target.value,
                    })
                  }
                />
              </W70>
            </InputGroup>

            {/* 대표자명 */}
            <InputGroup className="my-3">
              <W30>
                <MidLabel>대표자명</MidLabel>
              </W30>
              <W70>
                <Form.Control
                  value={customer.ceoName}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      ceoName: e.target.value,
                    })
                  }
                />
              </W70>
            </InputGroup>

            {/* 전화번호 */}
            <InputGroup className="my-3">
              <W30>
                <MidLabel>전화번호</MidLabel>
              </W30>
              <W70>
                <Form.Control
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      phone: e.target.value,
                    })
                  }
                />
              </W70>
            </InputGroup>

            {/* Email */}
            <InputGroup className="my-3">
              <W30>
                <MidLabel>Email</MidLabel>
              </W30>
              <W70>
                <Form.Control
                  value={customer.email}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      email: e.target.value,
                    })
                  }
                />
              </W70>
            </InputGroup>

            {/* 주소 + 주소검색 버튼 */}
            <InputGroup className="my-3">
              <W30>
                <MidLabel>주소</MidLabel>
              </W30>
              <W70 className="d-flex">
                <Form.Control value={customer.address} readOnly />
                <Button
                  variant="secondary"
                  className="ms-2"
                  onClick={handleAddressSearch}
                  style={{ whiteSpace: "nowrap" }}
                >
                  주소검색
                </Button>
              </W70>
            </InputGroup>

            {/* 상세주소 */}
            <InputGroup className="my-3">
              <W30>
                <MidLabel>상세주소</MidLabel>
              </W30>
              <W70>
                <Form.Control
                  value={customer.detailAddress}
                  placeholder="상세주소를 입력하세요"
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      detailAddress: e.target.value,
                    })
                  }
                />
              </W70>
            </InputGroup>

            {/* 적요 */}
            <InputGroup className="my-3">
              <W30>
                <MidLabel>적요</MidLabel>
              </W30>
              <W70>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={customer.remark}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      remark: e.target.value,
                    })
                  }
                />
              </W70>
            </InputGroup>

            {/* 상/구분 */}
            <Flex className="my-3 align-items-center">
              <W30>
                <MidLabel>상호 / 구분</MidLabel>
              </W30>
              <W70>
                {[
                  ["SALES", "매출처"],
                  ["PURCHASE", "매입처"],
                  ["BOTH", "매입·매출"],
                ].map(([v, l]) => (
                  <Form.Check
                    key={v}
                    inline
                    type="radio"
                    id={`customerType-${v}`}
                    label={l}
                    name="customerType"
                    checked={customer.customerType === v}
                    onChange={() =>
                      setCustomer({
                        ...customer,
                        customerType: v,
                      })
                    }
                  />
                ))}
              </W70>
            </Flex>
          </RoundRect>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            close
          </Button>

          {selectedId && (
            <Button variant="danger" onClick={deleteCustomer}>
              Delete
            </Button>
          )}

          <Button variant="primary" onClick={saveCustomer}>
            {selectedId ? "Update" : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Customer;