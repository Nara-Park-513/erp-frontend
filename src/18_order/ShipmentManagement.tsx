import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Table, Button, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Top from "../include/Top";
import Header from "../include/Header";
import { Left, Right, Flex, TopWrap } from "../stylesjs/Content.styles";
import { TableTitle } from "../stylesjs/Text.styles";
import { BtnRight } from "../stylesjs/Button.styles";

import ShipmentProcessModal from "../component/orders/ShipmentProcessModal";
import "../Auth.css";

const api = axios.create({
  baseURL: "http://localhost:8888",
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("jwt");

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.log("❌ API ERROR", err?.response?.status, err?.response?.data);
    return Promise.reject(err);
  }
);

const API_LIST = "/api/orders/progress";

type ShipmentRow = {
  id: number;
  orderNo: string;
  orderName: string;
  progressText: string;
};

type OrderMenuKey = "order-list" | "shipment" | "delivery";

const ORDER_MENU: { key: OrderMenuKey; label: string }[] = [
  { key: "order-list", label: "주문조회" },
  { key: "shipment", label: "출고관리" },
  { key: "delivery", label: "배송조회" },
];

const SHIPMENT_STATUSES = ["출고대기", "출고완료", "배송중", "완료"];

const getStatusStyle = (status: string) => {
  const normalized = (status || "").trim();

  switch (normalized) {
    case "출고대기":
      return { bg: "#fff7e8", color: "#b76e00", border: "#f4dfb3" };
    case "출고완료":
      return { bg: "#ecfdf3", color: "#027a48", border: "#ccebd7" };
    case "배송중":
      return { bg: "#eff8ff", color: "#175cd3", border: "#cfe3ff" };
    case "완료":
      return { bg: "#f2f4f7", color: "#344054", border: "#d0d5dd" };
    default:
      return { bg: "#f8fafc", color: "#475467", border: "#e4e7ec" };
  }
};

export default function ShipmentManagement() {
  const navigate = useNavigate();

  const [rows, setRows] = useState<ShipmentRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [activeMenu, setActiveMenu] = useState<OrderMenuKey>("shipment");

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error" | "warning">("error");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const openAlertModal = (
    type: "success" | "error" | "warning",
    title: string,
    message: string
  ) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlertModal(true);
  };

  const closeAlertModal = () => {
    setShowAlertModal(false);
  };

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_LIST);
      const data = res.data;

      const list: any[] =
        (Array.isArray(data) ? data : null) ??
        (Array.isArray(data?.content) ? data.content : null) ??
        (Array.isArray(data?.items) ? data.items : null) ??
        (Array.isArray(data?.data) ? data.data : null) ??
        [];

      const normalized: ShipmentRow[] = list.map((r: any) => ({
        id: Number(r.id ?? r.orderId ?? 0),
        orderNo: String(r.orderNo ?? r.orderCode ?? r.no ?? ""),
        orderName: String(r.orderName ?? r.name ?? ""),
        progressText: String(
          r.progressText ?? r.progress ?? r.stepName ?? r.statusText ?? r.status ?? ""
        ),
      }));

      setRows(normalized);
    } catch (e: any) {
      console.error("출고관리 조회 실패", e);
      openAlertModal("error", "조회 실패", "출고관리 목록 조회에 실패했습니다. 콘솔을 확인해 주세요.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const shipmentRows = useMemo(() => {
    return rows.filter((row) => SHIPMENT_STATUSES.includes((row.progressText || "").trim()));
  }, [rows]);

  const openModalForEdit = (id: number) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedId(null);
  };

  const handleCategoryClick = (key: OrderMenuKey) => {
    setActiveMenu(key);

    if (key === "shipment") {
      fetchList();
      return;
    }

    if (key === "order-list") {
      navigate("/order");
      return;
    }

    if (key === "delivery") {
  navigate("/delivery-tracking");
  return;
}
  };

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
        <Container fluid>
          <Row>
            <Col>
              <Flex>
                <Left>
                  <TopWrap />

                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        minWidth: "110px",
                      }}
                    >
                      <div
                        style={{
                          marginBottom: "14px",
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "#1f2937",
                          lineHeight: 1.2,
                        }}
                      >
                        오더관리
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: "8px",
                        }}
                      >
                        {ORDER_MENU.map((item) => {
                          const isActive = activeMenu === item.key;

                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => handleCategoryClick(item.key)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                border: "none",
                                backgroundColor: isActive ? "#f1f3f5" : "transparent",
                                color: isActive ? "#111827" : "#667085",
                                fontWeight: isActive ? 700 : 500,
                                borderRadius: "10px",
                                padding: "9px 12px",
                                fontSize: "14px",
                                lineHeight: 1.2,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
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
                        출고관리
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
                    <div style={{ maxHeight: "420px", overflowY: "auto" }}>
                      <Table responsive className="mb-0 align-middle">
                        <thead>
                          <tr
                            style={{
                              background:
                                "linear-gradient(180deg, #fbfcfe 0%, #f4f7fb 100%)",
                            }}
                          >
                            <th style={{ width: "18%", padding: "15px 18px", fontSize: "14px", fontWeight: 700, color: "#475467", borderBottom: "1px solid #e8ecf4" }}>
                              오더번호
                            </th>
                            <th style={{ width: "42%", padding: "15px 18px", fontSize: "14px", fontWeight: 700, color: "#475467", borderBottom: "1px solid #e8ecf4" }}>
                              오더명
                            </th>
                            <th style={{ width: "20%", padding: "15px 18px", fontSize: "14px", fontWeight: 700, color: "#475467", borderBottom: "1px solid #e8ecf4" }}>
                              진행상태
                            </th>
                            <th style={{ width: "20%", padding: "15px 18px", fontSize: "14px", fontWeight: 700, color: "#475467", borderBottom: "1px solid #e8ecf4", textAlign: "center" }}>
                              출고처리
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {shipmentRows.length === 0 ? (
                            <tr>
                              <td colSpan={4} style={{ textAlign: "center", padding: "44px 16px", color: "#98a2b3", fontSize: "14px" }}>
                                {loading ? "불러오는 중..." : "출고 대상 데이터가 없습니다"}
                              </td>
                            </tr>
                          ) : (
                            shipmentRows.map((r, index) => {
                              const statusStyle = getStatusStyle(r.progressText);

                              return (
                                <tr
                                  key={r.id}
                                  style={{
                                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#fcfdff",
                                  }}
                                >
                                  <td style={{ padding: "14px 18px", verticalAlign: "middle", color: "#111827", fontWeight: 600, borderBottom: "1px solid #eef2f7" }}>
                                    {r.orderNo || "-"}
                                  </td>
                                  <td style={{ padding: "14px 18px", verticalAlign: "middle", color: "#374151", borderBottom: "1px solid #eef2f7" }}>
                                    {r.orderName || "-"}
                                  </td>
                                  <td style={{ padding: "14px 18px", verticalAlign: "middle", borderBottom: "1px solid #eef2f7" }}>
                                    <span
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        minWidth: "76px",
                                        height: "30px",
                                        borderRadius: "999px",
                                        fontSize: "12px",
                                        fontWeight: 700,
                                        padding: "0 12px",
                                        backgroundColor: statusStyle.bg,
                                        color: statusStyle.color,
                                        border: `1px solid ${statusStyle.border}`,
                                      }}
                                    >
                                      {r.progressText || "미등록"}
                                    </span>
                                  </td>
                                  <td style={{ textAlign: "center", padding: "14px 18px", borderBottom: "1px solid #eef2f7" }}>
                                    <Button
                                      size="sm"
                                      onClick={() => openModalForEdit(r.id)}
                                      style={{
                                        backgroundColor: "#ffffff",
                                        color: "#475569",
                                        border: "1px solid #dbe2ea",
                                        borderRadius: "8px",
                                        padding: "4px 10px",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                      }}
                                    >
                                      처리
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </div>

                  <BtnRight style={{ marginTop: "14px" }}>
                    <button
                      type="button"
                      onClick={fetchList}
                      style={{
                        backgroundColor: "#ffffff",
                        color: "#475569",
                        border: "1px solid #dbe2ea",
                        borderRadius: "10px",
                        padding: "10px 14px",
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      새로고침
                    </button>
                  </BtnRight>
                </Right>
              </Flex>
            </Col>
          </Row>
        </Container>
      </div>

      <ShipmentProcessModal
        show={showModal}
        id={selectedId}
        onHide={closeModal}
        onChanged={fetchList}
      />

      <Modal
        show={showAlertModal}
        onHide={() => {}}
        centered={false}
        backdrop={true}
        keyboard={false}
        dialogClassName="top-alert-modal"
        contentClassName="top-alert-content"
      >
        <Modal.Body className={`top-alert-body ${alertType}`}>
          <div className="top-alert-left">
            <div className={`top-alert-icon ${alertType}`}>
              {alertType === "success" ? "✓" : alertType === "error" ? "✕" : "!"}
            </div>
          </div>

          <div className="top-alert-center">
            <h3 className="top-alert-title">{alertTitle}</h3>
            <p className="top-alert-text">{alertMessage}</p>
          </div>

          <div className="top-alert-right">
            <button
              type="button"
              onClick={closeAlertModal}
              className={`top-alert-button ${alertType}`}
            >
              확인
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}