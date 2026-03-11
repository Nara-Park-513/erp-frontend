import axios from "axios";
import { Container, Row, Col, Table, Button, Modal, Form } from "react-bootstrap";
import Top from "../include/Top";
import Header from "../include/Header";
// import SideBar from "../include/SideBar";
import { Left, Right, Flex, TopWrap, RoundRect } from "../stylesjs/Content.styles";
import { useState, useEffect } from "react";
import { W70, W30 } from "../stylesjs/Util.styles";
import { TableTitle } from "../stylesjs/Text.styles";
import { InputGroup, Search, Radio, Label, MidLabel } from "../stylesjs/Input.styles";
import { BtnRight } from "../stylesjs/Button.styles";
// import Lnb from "../include/Lnb";

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
  const [keyword, setKeyword] = useState("");

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

  const filteredCustomerList = customerList.filter((c) => {
    const q = keyword.trim().toLowerCase();
    if (!q) return true;

    return (
      c.customerCode.toLowerCase().includes(q) ||
      c.customerName.toLowerCase().includes(q) ||
      c.ceoName.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q) ||
      c.remark.toLowerCase().includes(q)
    );
  });

  const handleClose = () => {
    setShow(false);
    setSelectedId(null);
    setCustomer(emptyCustomer());
  };

  const saveCustomer = async () => {
    try {
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

  // const stockMenu = [{ key: "status", label: "거래처리스트", path: "/custom" }];

  return (
    <>
      <div className="fixed-top">
        <Header />
        <Top />
      </div>

      {/* <SideBar /> */}

      <div
        style={{
          backgroundColor: "#ffffff",
          minHeight: "100vh",
          paddingTop: "120px",
        }}
      >
        <Container fluid>
          <Row>
            <Col>
              <Flex>
                <Left>
                  {/* <Lnb menuList={stockMenu} title="거래처리스트" /> */}
                </Left>

                <Right style={{ marginTop: "-20px" }}>
                  <TopWrap />

                  <div
                    style={{
                      marginBottom: "14px",
                      display: "flex",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ lineHeight: 1.2 }}>
                      <TableTitle
                        style={{
                          margin: 0,
                          padding: 0,
                          color: "#1f2937",
                          fontWeight: 700,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        거래처 기초등록
                      </TableTitle>

                      <div
                        style={{
                          marginTop: "6px",
                          fontSize: "14px",
                          color: "#6b7280",
                          fontWeight: 500,
                        }}
                      >
                        목록
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e8ecf4",
                      borderRadius: "16px",
                      padding: "16px",
                      boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
                      marginBottom: "14px",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <InputGroup
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                          flexWrap: "wrap",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          type="button"
                          style={{
                            backgroundColor: "#ffffff",
                            color: "#475569",
                            border: "1px solid #dbe2ea",
                            borderRadius: "10px",
                            padding: "10px 14px",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          사용중단포함
                        </button>

                        <Search
                          type="search"
                          placeholder="거래처 검색"
                          value={keyword}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setKeyword(e.target.value)
                          }
                          style={{
                            width: "260px",
                            borderRadius: "10px",
                            border: "1px solid #dbe2ea",
                            padding: "10px 12px",
                          }}
                        />

                        <button
                          type="button"
                          style={{
                            backgroundColor: "#6b7280",
                            color: "#ffffff",
                            border: "1px solid #6b7280",
                            borderRadius: "10px",
                            padding: "10px 14px",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Search(F3)
                        </button>
                      </InputGroup>
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e8ecf4",
                      borderRadius: "16px",
                      overflow: "hidden",
                      boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
                    }}
                  >
                    <Table responsive className="mb-0 align-middle">
                      <thead>
                        <tr
                          style={{
                            background: "linear-gradient(180deg, #fbfcfe 0%, #f4f7fb 100%)",
                          }}
                        >
                          {columns.map((c) => (
                            <th
                              key={c.key}
                              style={{
                                padding: "15px 18px",
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "#475467",
                                borderBottom: "1px solid #e8ecf4",
                              }}
                            >
                              {c.label}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {filteredCustomerList.length === 0 ? (
                          <tr>
                            <td
                              colSpan={columns.length}
                              style={{
                                textAlign: "center",
                                padding: "44px 16px",
                                color: "#98a2b3",
                                fontSize: "14px",
                              }}
                            >
                              등록된 거래처가 없습니다
                            </td>
                          </tr>
                        ) : (
                          filteredCustomerList.map((c, idx) => (
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
                              style={{
                                cursor: "pointer",
                                backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fcfdff",
                                transition: "all 0.15s ease",
                              }}
                            >
                              {columns.map((col) => (
                                <td
                                  key={col.key}
                                  style={{
                                    padding: "14px 18px",
                                    verticalAlign: "middle",
                                    color: "#374151",
                                    borderBottom: "1px solid #eef2f7",
                                  }}
                                >
                                  {(c as any)[col.key] ?? "-"}
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>

                  <BtnRight style={{ marginTop: "14px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(null);
                        setCustomer(emptyCustomer());
                        setShow(true);
                      }}
                      style={{
                        backgroundColor: "#6b7280",
                        color: "#ffffff",
                        border: "1px solid #6b7280",
                        borderRadius: "10px",
                        padding: "10px 18px",
                        fontSize: "14px",
                        fontWeight: 600,
                        boxShadow: "0 4px 10px rgba(107, 114, 128, 0.16)",
                        cursor: "pointer",
                      }}
                    >
                      신규(F2)
                    </button>
                  </BtnRight>
                </Right>
              </Flex>
            </Col>
          </Row>
        </Container>
      </div>

      <Modal
  show={show}
  onHide={handleClose}
  size="lg"
  centered
  contentClassName="border-0 shadow-lg"
>
  <Modal.Header
    closeButton
    style={{
      padding: "20px 24px",
      borderBottom: "1px solid #eef2f7",
      background: "linear-gradient(180deg, #fbfcfe 0%, #f8fafc 100%)",
    }}
  >
    <Modal.Title
      style={{
        fontWeight: 800,
        color: "#1f2937",
        fontSize: "28px",
        letterSpacing: "-0.02em",
      }}
    >
      거래처 등록
    </Modal.Title>
  </Modal.Header>

  <Modal.Body
    style={{
      backgroundColor: "#f8fafc",
      padding: "24px",
    }}
  >
    <RoundRect
      style={{
        width: "100%",
        backgroundColor: "#ffffff",
        border: "1px solid #e8ecf4",
        borderRadius: "20px",
        padding: "24px",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div
        style={{
          display: "grid",
          gap: "16px",
        }}
      >
        <InputGroup style={{ alignItems: "center", margin: 0 }}>
          <W30>
            <MidLabel style={{ color: "#475467", fontWeight: 700 }}>
              거래처 코드
            </MidLabel>
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
              style={{
                height: "44px",
                borderRadius: "12px",
                borderColor: "#dbe2ea",
                boxShadow: "none",
                width: "540px",
              }}
            />
          </W70>
        </InputGroup>

        <InputGroup style={{ alignItems: "center", margin: 0 }}>
          <W30>
            <MidLabel style={{ color: "#475467", fontWeight: 700 }}>
              거래처명
            </MidLabel>
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
              style={{
                height: "44px",
                borderRadius: "12px",
                borderColor: "#dbe2ea",
                boxShadow: "none",
                width: "540px",
              }}
            />
          </W70>
        </InputGroup>

        <InputGroup style={{ alignItems: "center", margin: 0 }}>
          <W30>
            <MidLabel style={{ color: "#475467", fontWeight: 700 }}>
              대표자명
            </MidLabel>
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
              style={{
                height: "44px",
                borderRadius: "12px",
                borderColor: "#dbe2ea",
                boxShadow: "none",
                width: "540px",
              }}
            />
          </W70>
        </InputGroup>

        <InputGroup style={{ alignItems: "center", margin: 0 }}>
          <W30>
            <MidLabel style={{ color: "#475467", fontWeight: 700 }}>
              전화번호
            </MidLabel>
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
              style={{
                height: "44px",
                borderRadius: "12px",
                borderColor: "#dbe2ea",
                boxShadow: "none",
                width: "540px",
              }}
            />
          </W70>
        </InputGroup>

        <InputGroup style={{ alignItems: "center", margin: 0 }}>
          <W30>
            <MidLabel style={{ color: "#475467", fontWeight: 700 }}>
              Email
            </MidLabel>
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
              style={{
                height: "44px",
                borderRadius: "12px",
                borderColor: "#dbe2ea",
                boxShadow: "none",
                width: "540px",
              }}
            />
          </W70>
        </InputGroup>

        <InputGroup style={{ alignItems: "center", margin: 0 }}>
          <W30>
            <MidLabel style={{ color: "#475467", fontWeight: 700 }}>
              주소
            </MidLabel>
          </W30>
          <W70>
            <Form.Control
              value={customer.address}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  address: e.target.value,
                })
              }
              style={{
                height: "44px",
                borderRadius: "12px",
                borderColor: "#dbe2ea",
                boxShadow: "none",
                width: "540px",
              }}
            />
          </W70>
        </InputGroup>

        <InputGroup style={{ alignItems: "center", margin: 0 }}>
          <W30>
            <MidLabel style={{ color: "#475467", fontWeight: 700 }}>
              상세주소
            </MidLabel>
          </W30>
          <W70>
            <Form.Control
              value={customer.detailAddress}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  detailAddress: e.target.value,
                })
              }
              style={{
                height: "44px",
                borderRadius: "12px",
                borderColor: "#dbe2ea",
                boxShadow: "none",
                width: "540px",
              }}
            />
          </W70>
        </InputGroup>

        <InputGroup style={{ alignItems: "flex-start", margin: 0 }}>
          <W30>
            <MidLabel style={{ color: "#475467", fontWeight: 700 }}>
              적요
            </MidLabel>
          </W30>
          <W70>
            <Form.Control
              as="textarea"
              rows={3}
              value={customer.remark}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  remark: e.target.value,
                })
              }
              style={{
                borderRadius: "12px",
                borderColor: "#dbe2ea",
                boxShadow: "none",
                resize: "none",
                width: "540px",
              }}
            />
          </W70>
        </InputGroup>

        <Flex
          style={{
            alignItems: "center",
            marginTop: "4px",
          }}
        >
          <W30>
            <MidLabel style={{ color: "#475467", fontWeight: 700 }}>
              상/구분
            </MidLabel>
          </W30>
          <W70>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "18px",
                flexWrap: "wrap",
              }}
            >
              {[
                ["SALES", "매출처"],
                ["PURCHASE", "매입처"],
                ["BOTH", "매입·매출"],
              ].map(([v, l]) => (
                <span
                  key={v}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Radio
                    checked={customer.customerType === v}
                    onChange={() =>
                      setCustomer({
                        ...customer,
                        customerType: v as CustomerType,
                      })
                    }
                  />
                  <Label
                    className="mx-2"
                    style={{ marginBottom: 0, color: "#374151", fontWeight: 500 }}
                  >
                    {l}
                  </Label>
                </span>
              ))}
            </div>
          </W70>
        </Flex>
      </div>
    </RoundRect>
  </Modal.Body>

  <Modal.Footer
    style={{
      padding: "18px 24px",
      borderTop: "1px solid #eef2f7",
      backgroundColor: "#ffffff",
      gap: "10px",
    }}
  >
    <Button
      onClick={handleClose}
      style={{
        backgroundColor: "#ffffff",
        color: "#475569",
        border: "1px solid #dbe2ea",
        borderRadius: "10px",
        padding: "10px 16px",
        fontWeight: 700,
      }}
    >
      닫기
    </Button>

    {selectedId && (
      <Button
        onClick={deleteCustomer}
        style={{
          backgroundColor: "#ef4444",
          borderColor: "#ef4444",
          borderRadius: "10px",
          padding: "10px 16px",
          fontWeight: 700,
        }}
      >
        삭제
      </Button>
    )}

    <Button
      onClick={saveCustomer}
      style={{
        backgroundColor: "#6b7280",
        borderColor: "#6b7280",
        borderRadius: "10px",
        padding: "10px 18px",
        fontWeight: 700,
      }}
    >
      {selectedId ? "수정" : "저장"}
    </Button>
  </Modal.Footer>
</Modal>
    </>
  );
};

export default Customer;