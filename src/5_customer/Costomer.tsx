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

type CustomerType = "SALES" | "PURCHASE" | "BOTH";

type CustomerForm = {
  id?: number;
  customerCode: string;
  customerName: string;
  ceoName: string;
  phone: string;
  email: string;
  address: string;
  detailAddress: string;
  customerType: CustomerType;
  remark: string;
};

const emptyCustomer = (): CustomerForm => ({
  customerCode: "",
  customerName: "",
  ceoName: "",
  phone: "",
  email: "",
  address: "",
  detailAddress: "",
  customerType: "SALES",
  remark: "",
});

const Customer = () => {
  const [show, setShow] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const columns: ColumnDef[] = [
    { key: "customerCode", label: "거래처코드" },
    { key: "customerName", label: "거래처명" },
    { key: "ceoName", label: "대표자명" },
    { key: "phone", label: "전화번호" },
    { key: "email", label: "이메일" },
    { key: "address", label: "주소" },
    { key: "customerType", label: "상/구분" },
    { key: "remark", label: "적요" },
  ];

  const [customer, setCustomer] = useState<CustomerForm>(emptyCustomer());
  const [customerList, setCustomerList] = useState<CustomerForm[]>([]);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("http://localhost:8888/api/acc/customers");

      const rows = Array.isArray(res.data) ? res.data : res.data?.content ?? [];

      const normalized: CustomerForm[] = rows.map((c: any) => ({
        id: c.id,
        customerCode: c.customerCode ?? "",
        customerName: c.customerName ?? "",
        ceoName: c.ceoName ?? "",
        phone: c.phone ?? "",
        email: c.email ?? "",
        address: c.address ?? "",
        detailAddress: c.detailAddress ?? "",
        customerType: (c.customerType ?? "SALES") as CustomerType,
        remark: c.remark ?? "",
      }));

      setCustomerList(normalized);
    } catch (e) {
      console.error("거래처 조회 실패", e);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleClose = () => {
    setShow(false);
    setSelectedId(null);
    setCustomer(emptyCustomer());
  };

  const saveCustomer = async () => {
    try {
      console.log("저장 payload =", customer);

      if (selectedId) {
        await axios.put(
          `http://localhost:8888/api/acc/customers/${selectedId}`,
          customer
        );
      } else {
        await axios.post("http://localhost:8888/api/acc/customers", customer);
      }

      await fetchCustomers();
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
      await fetchCustomers();
      handleClose();
    } catch (e) {
      console.error("거래처 삭제 실패", e);
    }
  };

  const stockMenu = [{ key: "status", label: "거래처리스트", path: "/custom" }];

  return (
    <>
      <div className="fixed-top">
        <Top />
        <Header />
      </div>

      <SideBar />

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
                    <MainSubmitBtn className="mx-2">Search(F3)</MainSubmitBtn>
                  </InputGroup>
                </JustifyContent>

                <Table responsive>
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
                        key={c.id ?? idx}
                        onClick={() => {
                          setCustomer({
                            id: c.id,
                            customerCode: c.customerCode ?? "",
                            customerName: c.customerName ?? "",
                            ceoName: c.ceoName ?? "",
                            phone: c.phone ?? "",
                            email: c.email ?? "",
                            address: c.address ?? "",
                            detailAddress: c.detailAddress ?? "",
                            customerType: c.customerType ?? "SALES",
                            remark: c.remark ?? "",
                          });
                          setSelectedId(c.id ?? null);
                          setShow(true);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        {columns.map((col) => (
                          <td key={col.key}>{(c as any)[col.key] ?? "-"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <BtnRight>
                  <MainSubmitBtn
                    onClick={() => {
                      setSelectedId(null);
                      setCustomer(emptyCustomer());
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

      <Modal show={show} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>거래처 등록</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <RoundRect>
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

            <InputGroup className="my-3">
              <W30>
                <MidLabel>거래처명</MidLabel>
              </W30>
              <Form.Control
                value={customer.customerName}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    customerName: e.target.value,
                  })
                }
              />
            </InputGroup>

            <InputGroup className="my-3">
              <W30>
                <MidLabel>대표자명</MidLabel>
              </W30>
              <Form.Control
                value={customer.ceoName}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    ceoName: e.target.value,
                  })
                }
              />
            </InputGroup>

            <InputGroup className="my-3">
              <W30>
                <MidLabel>전화번호</MidLabel>
              </W30>
              <Form.Control
                value={customer.phone}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    phone: e.target.value,
                  })
                }
              />
            </InputGroup>

            <InputGroup className="my-3">
              <W30>
                <MidLabel>Email</MidLabel>
              </W30>
              <Form.Control
                value={customer.email}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    email: e.target.value,
                  })
                }
              />
            </InputGroup>

            <InputGroup className="my-3">
              <W30>
                <MidLabel>주소</MidLabel>
              </W30>
              <Form.Control
                value={customer.address}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    address: e.target.value,
                  })
                }
              />
            </InputGroup>

            <InputGroup className="my-3">
              <W30>
                <MidLabel>상세주소</MidLabel>
              </W30>
              <Form.Control
                value={customer.detailAddress}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    detailAddress: e.target.value,
                  })
                }
              />
            </InputGroup>

            <InputGroup className="my-3">
              <W30>
                <MidLabel>적요</MidLabel>
              </W30>
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
            </InputGroup>

            <Flex className="my-3">
              <W30>
                <MidLabel>상/구분</MidLabel>
              </W30>
              <W70>
                {[
                  ["SALES", "매출처"],
                  ["PURCHASE", "매입처"],
                  ["BOTH", "매입·매출"],
                ].map(([v, l]) => (
                  <span key={v}>
                    <Radio
                      checked={customer.customerType === v}
                      onChange={() =>
                        setCustomer({
                          ...customer,
                          customerType: v as CustomerType,
                        })
                      }
                    />
                    <Label className="mx-2">{l}</Label>
                  </span>
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