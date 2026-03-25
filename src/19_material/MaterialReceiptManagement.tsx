import axios from "axios";
import { useEffect, useState } from "react";
import { Container, Row, Col, Table, Button, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Top from "../include/Top";
import Header from "../include/Header";
import { Left, Right, Flex, TopWrap } from "../stylesjs/Content.styles";
import { TableTitle } from "../stylesjs/Text.styles";
import { BtnRight } from "../stylesjs/Button.styles";
import MaterialReceiptModal from "../component/material/MaterialReceiptModal";
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

const API_LIST = "/api/material-receipts";

export type MaterialReceiptRow = {
  id?: number;
  receiptNo: string;
  receiptDate: string;
  orderNo: string;
  itemName: string;
  qty: number;
  status: string;
  supplierId: number | null;
  supplierName: string;
  warehouse: string;
  remark: string;
};

export type Supplier = {
  id: number;
  customerName: string;
};

type MaterialMenuKey = "material-order" | "receipt" | "vendor";

const MATERIAL_MENU: { key: MaterialMenuKey; label: string }[] = [
  { key: "material-order", label: "자재발주등록" },
  { key: "receipt", label: "입고관리" },
];

const emptyReceipt = (): MaterialReceiptRow => ({
  receiptNo: "",
  receiptDate: new Date().toISOString().slice(0, 10),
  orderNo: "",
  itemName: "",
  qty: 0,
  status: "입고대기",
  supplierId: null,
  supplierName: "",
  warehouse: "",
  remark: "",
});

const getStatusStyle = (status?: string) => {
  const normalized = (status || "").trim();

  switch (normalized) {
    case "입고완료":
      return { bg: "#ecfdf3", color: "#027a48", border: "#ccebd7" };
    case "입고대기":
      return { bg: "#fff7e8", color: "#b76e00", border: "#f4dfb3" };
    case "검수중":
      return { bg: "#eef4ff", color: "#3456d1", border: "#d6e2ff" };
    case "부분입고":
      return { bg: "#f5f3ff", color: "#6941c6", border: "#ddd6fe" };
    case "입고취소":
      return { bg: "#fef3f2", color: "#b42318", border: "#fecdca" };
    default:
      return { bg: "#f8fafc", color: "#475467", border: "#e4e7ec" };
  }
};

export default function MaterialReceiptManagement() {
  const navigate = useNavigate();

  const [rows, setRows] = useState<MaterialReceiptRow[]>([]);
  const [supplierList, setSupplierList] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [receiptForm, setReceiptForm] = useState<MaterialReceiptRow>(emptyReceipt());

  const [activeMenu, setActiveMenu] = useState<MaterialMenuKey>("receipt");

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error" | "warning">("error");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isConfirmModal, setIsConfirmModal] = useState(false);

  const openAlertModal = (
    type: "success" | "error" | "warning",
    title: string,
    message: string
  ) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setIsConfirmModal(false);
    setShowAlertModal(true);
  };

  const openConfirmModal = (
    type: "success" | "error" | "warning",
    title: string,
    message: string
  ) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setIsConfirmModal(true);
    setShowAlertModal(true);
  };

  const closeAlertModal = () => {
    setShowAlertModal(false);
    setIsConfirmModal(false);
  };

  const fetchSuppliers = async () => {
    try {
      const res = await api.get("/api/acc/customers");
      const data = Array.isArray(res.data) ? res.data : res.data?.content ?? [];
      const normalized: Supplier[] = data
        .map((c: any) => ({
          id: Number(c.id ?? c.customerId ?? 0),
          customerName: String(c.customerName ?? c.name ?? ""),
        }))
        .filter((c: Supplier) => c.id && c.customerName);

      setSupplierList(normalized);
      return normalized;
    } catch (e) {
      console.error("공급업체 목록 조회 실패", e);
      return [];
    }
  };

  const fetchList = async (suppliers: Supplier[] = supplierList) => {
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

      const normalized: MaterialReceiptRow[] = list.map((r: any) => {
        const supplierId = r.supplierId ?? r.customerId ?? null;
        const supplierName =
          (r.supplierName ?? r.customerName ?? "").trim() ||
          suppliers.find((s) => s.id === Number(supplierId))?.customerName ||
          "";

        return {
          id: Number(r.id ?? r.receiptId ?? 0),
          receiptNo: String(r.receiptNo ?? r.receiptCode ?? r.no ?? ""),
          receiptDate: String(r.receiptDate ?? r.date ?? "").slice(0, 10),
          orderNo: String(r.orderNo ?? r.materialOrderNo ?? ""),
          itemName: String(r.itemName ?? r.materialName ?? r.name ?? ""),
          qty: Number(r.qty ?? r.quantity ?? 0),
          status: String(r.status ?? r.receiptStatus ?? "입고대기"),
          supplierId: supplierId ? Number(supplierId) : null,
          supplierName,
          warehouse: String(r.warehouse ?? r.location ?? ""),
          remark: String(r.remark ?? ""),
        };
      });

      setRows(normalized);
    } catch (e) {
      console.error("입고 목록 조회 실패", e);
      openAlertModal("error", "조회 실패", "입고 목록 조회에 실패했습니다.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const suppliers = await fetchSuppliers();
      await fetchList(suppliers);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openModalForNew = () => {
    setSelectedId(null);
    setReceiptForm(emptyReceipt());
    setShowModal(true);
  };

  const openModalForEdit = async (id: number) => {
    try {
      const res = await api.get(`${API_LIST}/${id}`);
      const r = res.data;

      const supplierId = r.supplierId ?? r.customerId ?? null;
      const supplierName =
        (r.supplierName ?? r.customerName ?? "").trim() ||
        supplierList.find((s) => s.id === Number(supplierId))?.customerName ||
        "";

      setSelectedId(id);
      setReceiptForm({
        id: Number(r.id ?? r.receiptId ?? id),
        receiptNo: String(r.receiptNo ?? r.receiptCode ?? r.no ?? ""),
        receiptDate: String(r.receiptDate ?? r.date ?? "").slice(0, 10),
        orderNo: String(r.orderNo ?? r.materialOrderNo ?? ""),
        itemName: String(r.itemName ?? r.materialName ?? r.name ?? ""),
        qty: Number(r.qty ?? r.quantity ?? 0),
        status: String(r.status ?? r.receiptStatus ?? "입고대기"),
        supplierId: supplierId ? Number(supplierId) : null,
        supplierName,
        warehouse: String(r.warehouse ?? r.location ?? ""),
        remark: String(r.remark ?? ""),
      });

      setShowModal(true);
    } catch (e) {
      console.error("입고 상세 조회 실패", e);
      openAlertModal("error", "상세 조회 실패", "입고 상세 조회에 실패했습니다.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedId(null);
    setReceiptForm(emptyReceipt());
  };

  const saveReceipt = async () => {
    try {
      if (!receiptForm.receiptDate) {
        openAlertModal("warning", "입력 확인", "입고일자를 입력해 주세요.");
        return;
      }

      if (!receiptForm.itemName.trim()) {
        openAlertModal("warning", "입력 확인", "자재명을 입력해 주세요.");
        return;
      }

      if (!Number(receiptForm.qty || 0)) {
        openAlertModal("warning", "입력 확인", "입고수량을 입력해 주세요.");
        return;
      }

      if (!receiptForm.supplierId) {
        openAlertModal("warning", "입력 확인", "공급업체를 선택해 주세요.");
        return;
      }

      const receiptNo =
        receiptForm.receiptNo.trim() ||
        `MR-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Date.now()}`;

      const payload = {
        receiptNo,
        receiptDate: receiptForm.receiptDate,
        orderNo: receiptForm.orderNo,
        itemName: receiptForm.itemName,
        qty: Number(receiptForm.qty || 0),
        status: receiptForm.status || "입고대기",
        supplierId: receiptForm.supplierId,
        supplierName: receiptForm.supplierName,
        warehouse: receiptForm.warehouse,
        remark: receiptForm.remark,
      };

      if (selectedId) {
        await api.put(`${API_LIST}/${selectedId}`, payload);
        openAlertModal("success", "저장 완료", "입고 정보가 저장되었습니다.");
      } else {
        await api.post(API_LIST, payload);
        openAlertModal("success", "등록 완료", "입고 정보가 등록되었습니다.");
      }

      await fetchList();
      closeModal();
    } catch (e) {
      console.error("입고 저장 실패", e);
      openAlertModal("error", "저장 실패", "입고 저장에 실패했습니다. 콘솔을 확인해 주세요.");
    }
  };

  const deleteReceipt = async () => {
    if (!selectedId) return;
    openConfirmModal("warning", "삭제 확인", "정말 삭제하시겠습니까?");
  };

  const confirmDeleteReceipt = async () => {
    if (!selectedId) return;

    try {
      await api.delete(`${API_LIST}/${selectedId}`);
      await fetchList();
      closeModal();
      closeAlertModal();
    } catch (e) {
      console.error("입고 삭제 실패", e);
      closeAlertModal();
      openAlertModal("error", "삭제 실패", "입고 삭제에 실패했습니다.");
    }
  };

  const handleCategoryClick = (key: MaterialMenuKey) => {
    setActiveMenu(key);

    if (key === "material-order") {
      navigate("/material");
      return;
    }

    if (key === "receipt") {
      fetchList();
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
                        자재관리
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: "8px",
                        }}
                      >
                        {MATERIAL_MENU.map((item) => {
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
                        입고관리
                      </TableTitle>

                      <div
                        style={{
                          marginTop: "6px",
                          fontSize: "14px",
                          color: "#6b7280",
                          fontWeight: 500,
                        }}
                      >
                        입고현황
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
                    <Table hover responsive className="mb-0 align-middle">
                      <thead>
                        <tr
                          style={{
                            background: "linear-gradient(180deg, #fbfcfe 0%, #f4f7fb 100%)",
                          }}
                        >
                          <th style={thStyle}>입고번호</th>
                          <th style={thStyle}>발주번호</th>
                          <th style={thStyle}>자재명</th>
                          <th style={thStyle}>입고수량</th>
                          <th style={thStyle}>입고상태</th>
                          <th style={thStyle}>입고일자</th>
                          <th style={thStyle}>공급업체</th>
                          <th style={thStyle}>창고</th>
                          <th style={thStyle}>관리</th>
                        </tr>
                      </thead>

                      <tbody>
                        {rows.length > 0 ? (
                          rows.map((r, index) => {
                            const badge = getStatusStyle(r.status);

                            return (
                              <tr
                                key={r.id ?? `${r.receiptNo}-${index}`}
                                style={{
                                  backgroundColor: index % 2 === 0 ? "#ffffff" : "#fcfdff",
                                }}
                              >
                                <td style={tdStyle}>{r.receiptNo || "-"}</td>
                                <td style={tdStyle}>{r.orderNo || "-"}</td>
                                <td style={{ ...tdStyle, fontWeight: 600, color: "#111827" }}>
                                  {r.itemName || "-"}
                                </td>
                                <td style={tdStyle}>{Number(r.qty || 0).toLocaleString()}</td>
                                <td style={tdStyle}>
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
                                      backgroundColor: badge.bg,
                                      color: badge.color,
                                      border: `1px solid ${badge.border}`,
                                    }}
                                  >
                                    {r.status || "미등록"}
                                  </span>
                                </td>
                                <td style={tdStyle}>{r.receiptDate || "-"}</td>
                                <td style={tdStyle}>{r.supplierName || "-"}</td>
                                <td style={tdStyle}>{r.warehouse || "-"}</td>
                                <td style={tdStyle}>
                                  <Button
                                    size="sm"
                                    onClick={() => r.id && openModalForEdit(r.id)}
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
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan={9}
                              style={{
                                textAlign: "center",
                                padding: "44px 16px",
                                color: "#98a2b3",
                                fontSize: "14px",
                              }}
                            >
                              {loading ? "입고 목록을 불러오는 중입니다." : "등록된 입고 내역이 없습니다."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>

                  <BtnRight style={{ marginTop: "14px" }}>
                    <button
                      type="button"
                      onClick={() => fetchList()}
                      style={refreshBtnStyle}
                    >
                      새로고침
                    </button>

                    <button
                      type="button"
                      onClick={openModalForNew}
                      style={primaryBtnStyle}
                    >
                      입고등록
                    </button>
                  </BtnRight>
                </Right>
              </Flex>
            </Col>
          </Row>
        </Container>
      </div>

      <MaterialReceiptModal
        show={showModal}
        selectedId={selectedId}
        receiptForm={receiptForm}
        supplierList={supplierList}
        onClose={closeModal}
        onSetReceiptForm={setReceiptForm}
        onSave={saveReceipt}
        onDelete={deleteReceipt}
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

          <div
            className="top-alert-right"
            style={{ display: "flex", gap: "8px", alignItems: "center" }}
          >
            {isConfirmModal ? (
              <>
                <button
                  type="button"
                  onClick={closeAlertModal}
                  style={{
                    height: "36px",
                    minWidth: "68px",
                    border: "1px solid #d0d5dd",
                    borderRadius: "999px",
                    padding: "0 14px",
                    background: "#ffffff",
                    color: "#475467",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  취소
                </button>

                <button
                  type="button"
                  onClick={confirmDeleteReceipt}
                  className={`top-alert-button ${alertType}`}
                >
                  삭제
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={closeAlertModal}
                className={`top-alert-button ${alertType}`}
              >
                확인
              </button>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

const thStyle: React.CSSProperties = {
  padding: "15px 18px",
  fontSize: "14px",
  fontWeight: 700,
  color: "#475467",
  borderBottom: "1px solid #e8ecf4",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 18px",
  verticalAlign: "middle",
  color: "#374151",
  borderBottom: "1px solid #eef2f7",
};

const refreshBtnStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  color: "#475569",
  border: "1px solid #dbe2ea",
  borderRadius: "10px",
  padding: "10px 14px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  marginRight: "8px",
};

const primaryBtnStyle: React.CSSProperties = {
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
};