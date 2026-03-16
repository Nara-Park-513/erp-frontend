import axios from "axios";
import { useEffect, useState } from "react";
import { Container, Row, Col, Table, Button, Modal } from "react-bootstrap";
import Top from "../include/Top";
import Header from "../include/Header";
// import SideBar from "../include/SideBar";
import { Left, Right, Flex, TopWrap } from "../stylesjs/Content.styles";
import { TableTitle } from "../stylesjs/Text.styles";
import { BtnRight } from "../stylesjs/Button.styles";
// import Lnb from "../include/Lnb";

import OrderProgressModal from "../component/orders/OrderProgressModal";
import "../Auth.css";

/** axios */
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

type OrderProgressRow = {
  id: number;
  orderNo: string;
  orderName: string;
  progressText: string;
};

export default function OrderProgress() {
  const [rows, setRows] = useState<OrderProgressRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

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

      const normalized: OrderProgressRow[] = list.map((r: any) => ({
        id: Number(r.id ?? r.orderId ?? 0),
        orderNo: String(r.orderNo ?? r.orderCode ?? r.no ?? ""),
        orderName: String(r.orderName ?? r.name ?? ""),
        progressText: String(
          r.progressText ??
            r.progress ??
            r.stepName ??
            r.statusText ??
            r.status ??
            ""
        ),
      }));

      setRows(normalized);
    } catch (e: any) {
      console.error("오더 진행단계 조회 실패", e);
      openAlertModal("error", "조회 실패", "오더 진행단계 조회에 실패했습니다. 콘솔을 확인해 주세요.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openModalForEdit = (id: number) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const openModalForNew = () => {
    setSelectedId(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedId(null);
  };

  // const menuList = [{ key: "orders", label: "오더진행단계", path: "/orders/progress" }];

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
                  {/* <Lnb menuList={menuList} title="오더진행단계" /> */}
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
                        오더관리진행단계
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
                    <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                      <Table responsive className="mb-0 align-middle">
                        <thead>
                          <tr
                            style={{
                              background: "linear-gradient(180deg, #fbfcfe 0%, #f4f7fb 100%)",
                            }}
                          >
                            <th
                              style={{
                                width: "12%",
                                padding: "15px 18px",
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "#475467",
                                borderBottom: "1px solid #e8ecf4",
                              }}
                            >
                              오더관리번호
                            </th>
                            <th
                              style={{
                                width: "18%",
                                padding: "15px 18px",
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "#475467",
                                borderBottom: "1px solid #e8ecf4",
                              }}
                            >
                              오더관리명
                            </th>
                            <th
                              style={{
                                width: "60%",
                                padding: "15px 18px",
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "#475467",
                                borderBottom: "1px solid #e8ecf4",
                              }}
                            >
                              진행단계
                            </th>
                            <th
                              style={{
                                width: "10%",
                                padding: "15px 18px",
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "#475467",
                                borderBottom: "1px solid #e8ecf4",
                                textAlign: "center",
                              }}
                            >
                              상세
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {rows.length === 0 ? (
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
                                {loading ? "불러오는 중..." : "데이터가 없습니다"}
                              </td>
                            </tr>
                          ) : (
                            rows.map((r, idx) => (
                              <tr
                                key={r.id}
                                style={{
                                  backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fcfdff",
                                }}
                              >
                                <td
                                  style={{
                                    padding: "14px 18px",
                                    color: "#111827",
                                    fontWeight: 600,
                                    borderBottom: "1px solid #eef2f7",
                                  }}
                                >
                                  {r.orderNo}
                                </td>
                                <td
                                  style={{
                                    padding: "14px 18px",
                                    color: "#374151",
                                    borderBottom: "1px solid #eef2f7",
                                  }}
                                >
                                  {r.orderName}
                                </td>
                                <td
                                  style={{
                                    padding: "14px 18px",
                                    color: "#374151",
                                    borderBottom: "1px solid #eef2f7",
                                    whiteSpace: "pre-line",
                                  }}
                                >
                                  {r.progressText || "-"}
                                </td>
                                <td
                                  style={{
                                    textAlign: "center",
                                    padding: "14px 18px",
                                    borderBottom: "1px solid #eef2f7",
                                  }}
                                >
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
                                    보기
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </div>

                  <BtnRight style={{ marginTop: "12px", gap: "10px" }}>
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

                    <button
                      type="button"
                      onClick={openModalForNew}
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
                      신규
                    </button>
                  </BtnRight>
                </Right>
              </Flex>
            </Col>
          </Row>
        </Container>
      </div>

      <OrderProgressModal
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