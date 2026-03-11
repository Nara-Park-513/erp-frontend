import axios from "axios";
import { useEffect, useMemo, useState } from "react";
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
// import SideBar from "../include/SideBar";
import {
  Left,
  Right,
  Flex,
  TopWrap,
  RoundRect,
} from "../stylesjs/Content.styles";
import { W70, W30 } from "../stylesjs/Util.styles";
import { TableTitle } from "../stylesjs/Text.styles";
import { InputGroup, MidLabel } from "../stylesjs/Input.styles";
import { BtnRight } from "../stylesjs/Button.styles";
// import Lnb from "../include/Lnb";

/* =========================
   타입
========================= */

type EstimateLine = {
  itemName: string;
  qty: number;
  price: number;
  amount: number;
  remark?: string;
};

type Estimate = {
  id?: number;
  estimateNo: string;
  estimateDate: string;
  customerName: string;
  remark?: string;
  lines: EstimateLine[];
};

/* =========================
   설정
========================= */

const API_BASE = "http://localhost:8888/api/sales/estimates";

const emptyEstimate = (): Estimate => ({
  estimateNo: "",
  estimateDate: new Date().toISOString().slice(0, 10),
  customerName: "",
  remark: "",
  lines: [{ itemName: "", qty: 1, price: 0, amount: 0 }],
});

/* =========================
   컴포넌트
========================= */

const EstimateInput = () => {
  const [show, setShow] = useState(false);
  const [estimateList, setEstimateList] = useState<Estimate[]>([]);
  const [estimate, setEstimate] = useState<Estimate>(emptyEstimate());
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const totalAmount = useMemo(
    () => estimate.lines.reduce((s, l) => s + l.amount, 0),
    [estimate.lines]
  );

  const fetchEstimates = async () => {
    try {
      const res = await axios.get<Estimate[]>(API_BASE);
      const data = res.data.map((e) => ({
        ...e,
        estimateDate: e.estimateDate.slice(0, 10),
        lines: e.lines.map((l) => ({
          ...l,
          amount: Number(l.amount),
        })),
      }));
      setEstimateList(data);
    } catch (e) {
      console.error("견적서 조회 실패", e);
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, []);

  const updateLine = (idx: number, patch: Partial<EstimateLine>) => {
    setEstimate((prev) => {
      const lines = prev.lines.map((l, i) => {
        if (i !== idx) return l;
        const updated = { ...l, ...patch };
        updated.amount = updated.qty * updated.price;
        return updated;
      });
      return { ...prev, lines };
    });
  };

  const addLine = () => {
    setEstimate((p) => ({
      ...p,
      lines: [...p.lines, { itemName: "", qty: 1, price: 0, amount: 0 }],
    }));
  };

  const removeLine = (idx: number) => {
    setEstimate((p) => ({
      ...p,
      lines: p.lines.filter((_, i) => i !== idx),
    }));
  };

  const openNew = () => {
    setSelectedId(null);
    setEstimate(emptyEstimate());
    setShow(true);
  };

  const openDetail = async (id: number) => {
    try {
      const res = await axios.get(`${API_BASE}/${id}`);
      const data = res.data;

      setSelectedId(id);
      setEstimate({
        ...data,
        estimateDate: String(data.estimateDate ?? "").slice(0, 10),
        lines: (data.lines ?? []).map((l: EstimateLine) => ({
          ...l,
          qty: Number(l.qty),
          price: Number(l.price),
          amount: Number(l.amount),
        })),
      });
      setShow(true);
    } catch (e) {
      console.error("상세 조회 실패", e);
    }
  };

  const saveEstimate = async () => {
    if (!estimate.customerName.trim()) {
      alert("거래처를 입력하세요");
      return;
    }

    if (estimate.lines.length === 0) {
      alert("라인을 입력하세요");
      return;
    }

    try {
      if (selectedId) {
        await axios.put(`${API_BASE}/${selectedId}`, estimate);
      } else {
        await axios.post(API_BASE, estimate);
      }
      await fetchEstimates();
      setShow(false);
    } catch (e) {
      console.error("저장 실패", e);
    }
  };

  const deleteEstimate = async () => {
    if (!selectedId) return;
    if (!window.confirm("삭제하시겠습니까?")) return;

    try {
      await axios.delete(`${API_BASE}/${selectedId}`);
      await fetchEstimates();
      setShow(false);
    } catch (e) {
      console.error("삭제 실패", e);
    }
  };

  // const stockMenu = [{ key: "status", label: "견적서 입력", path: "/est" }];

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
                  {/* <Lnb menuList={stockMenu} title="견적서입력" /> */}
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
                        견적서 입력
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
                          <th
                            style={{
                              padding: "15px 18px",
                              fontSize: "14px",
                              fontWeight: 700,
                              color: "#475467",
                              borderBottom: "1px solid #e8ecf4",
                            }}
                          >
                            견적번호
                          </th>
                          <th
                            style={{
                              padding: "15px 18px",
                              fontSize: "14px",
                              fontWeight: 700,
                              color: "#475467",
                              borderBottom: "1px solid #e8ecf4",
                            }}
                          >
                            견적일자
                          </th>
                          <th
                            style={{
                              padding: "15px 18px",
                              fontSize: "14px",
                              fontWeight: 700,
                              color: "#475467",
                              borderBottom: "1px solid #e8ecf4",
                            }}
                          >
                            거래처
                          </th>
                          <th
                            style={{
                              padding: "15px 18px",
                              fontSize: "14px",
                              fontWeight: 700,
                              color: "#475467",
                              borderBottom: "1px solid #e8ecf4",
                              textAlign: "right",
                            }}
                          >
                            합계금액
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {estimateList.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              style={{
                                textAlign: "center",
                                padding: "44px 16px",
                                color: "#98a2b3",
                                fontSize: "14px",
                              }}
                            >
                              견적서 내역이 없습니다.
                            </td>
                          </tr>
                        ) : (
                          estimateList.map((e, index) => (
                            <tr
                              key={e.id}
                              style={{
                                cursor: "pointer",
                                backgroundColor: index % 2 === 0 ? "#ffffff" : "#fcfdff",
                                transition: "all 0.15s ease",
                              }}
                              onClick={() => openDetail(e.id!)}
                            >
                              <td
                                style={{
                                  padding: "14px 18px",
                                  verticalAlign: "middle",
                                  color: "#111827",
                                  fontWeight: 600,
                                  borderBottom: "1px solid #eef2f7",
                                }}
                              >
                                {e.estimateNo}
                              </td>
                              <td
                                style={{
                                  padding: "14px 18px",
                                  verticalAlign: "middle",
                                  color: "#374151",
                                  borderBottom: "1px solid #eef2f7",
                                }}
                              >
                                {e.estimateDate}
                              </td>
                              <td
                                style={{
                                  padding: "14px 18px",
                                  verticalAlign: "middle",
                                  color: "#374151",
                                  borderBottom: "1px solid #eef2f7",
                                }}
                              >
                                {e.customerName}
                              </td>
                              <td
                                style={{
                                  padding: "14px 18px",
                                  verticalAlign: "middle",
                                  textAlign: "right",
                                  color: "#111827",
                                  fontWeight: 700,
                                  borderBottom: "1px solid #eef2f7",
                                }}
                              >
                                {e.lines
                                  .reduce((s, l) => s + Number(l.amount), 0)
                                  .toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>

                  <BtnRight style={{ marginTop: "14px" }}>
                    <button
                      type="button"
                      onClick={openNew}
                      style={{
                        backgroundColor: "#6b7280",
                        color: "#ffffff",
                        border: "1px solid #6b7280",
                        borderRadius: "10px",
                        padding: "10px 18px",
                        fontSize: "14px",
                        fontWeight: 600,
                        boxShadow: "0 4px 10px rgba(107, 114, 128, 0.16)",
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#5b6472";
                        e.currentTarget.style.borderColor = "#5b6472";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#6b7280";
                        e.currentTarget.style.borderColor = "#6b7280";
                      }}
                    >
                      신규
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
  onHide={() => setShow(false)}
  size="xl"
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
      견적서 {selectedId ? "수정" : "등록"}
    </Modal.Title>
  </Modal.Header>

  <Modal.Body
    style={{
      backgroundColor: "#f8fafc",
      padding: "24px",
    }}
  >
    <div
      style={{
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
          marginBottom: "20px",
        }}
      >
        <InputGroup style={{ alignItems: "center", margin: 0 }}>
          <W30>
            <MidLabel style={{ color: "#475467", fontWeight: 700 }}>견적번호</MidLabel>
          </W30>
          <W70>
            <Form.Control
              value={estimate.estimateNo}
              onChange={(e) =>
                setEstimate((p) => ({ ...p, estimateNo: e.target.value }))
              }
              style={{
                height: "46px",
                borderRadius: "12px",
                borderColor: "#dbe2ea",
                boxShadow: "none",
                width: "795px",
              }}
            />
          </W70>
        </InputGroup>

        <InputGroup style={{ alignItems: "center", margin: 0 }}>
          <W30>
            <MidLabel style={{ color: "#475467", fontWeight: 700 }}>견적일자</MidLabel>
          </W30>
          <W70>
            <Form.Control
              type="date"
              value={estimate.estimateDate}
              onChange={(e) =>
                setEstimate((p) => ({ ...p, estimateDate: e.target.value }))
              }
              style={{
                height: "46px",
                borderRadius: "12px",
                borderColor: "#dbe2ea",
                boxShadow: "none",
                width: "795px",
              }}
            />
          </W70>
        </InputGroup>

        <InputGroup style={{ alignItems: "center", margin: 0 }}>
          <W30>
            <MidLabel style={{ color: "#475467", fontWeight: 700 }}>거래처</MidLabel>
          </W30>
          <W70>
            <Form.Control
              value={estimate.customerName}
              onChange={(e) =>
                setEstimate((p) => ({
                  ...p,
                  customerName: e.target.value,
                }))
              }
              style={{
                height: "46px",
                borderRadius: "12px",
                borderColor: "#dbe2ea",
                boxShadow: "none",
                width: "795px",
              }}
            />
          </W70>
        </InputGroup>
      </div>

      <div
        style={{
          marginBottom: "14px",
          paddingTop: "18px",
          borderTop: "1px solid #eef2f7",
          fontSize: "15px",
          fontWeight: 700,
          color: "#374151",
        }}
      >
        품목 정보
      </div>

      <div
        style={{
          border: "1px solid #e8ecf4",
          borderRadius: "16px",
          overflow: "hidden",
          backgroundColor: "#ffffff",
        }}
      >
        <Table
          bordered
          responsive
          className="mb-0 align-middle"
          style={{
            marginBottom: 0,
            borderColor: "#e8ecf4",
          }}
        >
          <thead
            style={{
              background: "linear-gradient(180deg, #fbfcfe 0%, #f4f7fb 100%)",
            }}
          >
            <tr>
              <th style={{ padding: "14px 16px", fontWeight: 700, color: "#475467" }}>품목</th>
              <th style={{ width: 120, padding: "14px 16px", fontWeight: 700, color: "#475467" }}>
                수량
              </th>
              <th style={{ width: 150, padding: "14px 16px", fontWeight: 700, color: "#475467" }}>
                단가
              </th>
              <th style={{ width: 150, padding: "14px 16px", fontWeight: 700, color: "#475467" }}>
                금액
              </th>
              <th style={{ width: 100, padding: "14px 16px" }}></th>
            </tr>
          </thead>

          <tbody>
            {estimate.lines.map((l, idx) => (
              <tr key={idx}>
                <td style={{ padding: "10px" }}>
                  <Form.Control
                    value={l.itemName}
                    onChange={(e) =>
                      updateLine(idx, { itemName: e.target.value })
                    }
                    style={{
                      height: "42px",
                      borderRadius: "10px",
                      borderColor: "#dbe2ea",
                      boxShadow: "none",
                    }}
                  />
                </td>

                <td style={{ padding: "10px" }}>
                  <Form.Control
                    type="number"
                    value={l.qty}
                    onChange={(e) =>
                      updateLine(idx, { qty: Number(e.target.value) })
                    }
                    style={{
                      height: "42px",
                      borderRadius: "10px",
                      borderColor: "#dbe2ea",
                      boxShadow: "none",
                    }}
                  />
                </td>

                <td style={{ padding: "10px" }}>
                  <Form.Control
                    type="number"
                    value={l.price}
                    onChange={(e) =>
                      updateLine(idx, { price: Number(e.target.value) })
                    }
                    style={{
                      height: "42px",
                      borderRadius: "10px",
                      borderColor: "#dbe2ea",
                      boxShadow: "none",
                    }}
                  />
                </td>

                <td
                  className="text-end"
                  style={{
                    verticalAlign: "middle",
                    fontWeight: 700,
                    color: "#111827",
                    padding: "10px 16px",
                  }}
                >
                  {l.amount.toLocaleString()}
                </td>

                <td
                  className="text-end"
                  style={{
                    verticalAlign: "middle",
                    padding: "10px",
                  }}
                >
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => removeLine(idx)}
                    style={{
                      borderRadius: "10px",
                      padding: "8px 12px",
                      fontWeight: 600,
                    }}
                  >
                    삭제
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "16px",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <Button
          size="sm"
          onClick={addLine}
          style={{
            backgroundColor: "#eef2f7",
            border: "1px solid #dbe2ea",
            color: "#475569",
            borderRadius: "10px",
            padding: "9px 14px",
            fontWeight: 700,
          }}
        >
          라인 추가
        </Button>

        <div
          style={{
            textAlign: "right",
            fontWeight: 800,
            color: "#111827",
            fontSize: "18px",
            letterSpacing: "-0.02em",
          }}
        >
          합계금액 : {totalAmount.toLocaleString()}
        </div>
      </div>
    </div>
  </Modal.Body>

  <Modal.Footer
    style={{
      padding: "18px 24px",
      borderTop: "1px solid #eef2f7",
      backgroundColor: "#ffffff",
      gap: "10px",
    }}
  >
    {selectedId && (
      <Button
        variant="danger"
        onClick={deleteEstimate}
        style={{
          borderRadius: "10px",
          padding: "10px 16px",
          fontWeight: 700,
        }}
      >
        삭제
      </Button>
    )}

    <Button
      onClick={saveEstimate}
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

export default EstimateInput;