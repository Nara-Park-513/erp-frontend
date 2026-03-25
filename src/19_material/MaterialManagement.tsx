import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Table, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Top from "../include/Top";
import Header from "../include/Header";
import { Left, Right, Flex, TopWrap } from "../stylesjs/Content.styles";
import { TableTitle } from "../stylesjs/Text.styles";
import { BtnRight } from "../stylesjs/Button.styles";
import MaterialModal, {
  MaterialOrder,
  MaterialOrderLine,
  Customer,
} from "../component/material/MaterialModal";
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

const API_BASE = "/api/material-orders";

type MaterialMenuKey = "material-order" | "receipt" | "vendor";

const MATERIAL_MENU: { key: MaterialMenuKey; label: string }[] = [
  { key: "material-order", label: "자재발주등록" },
  { key: "receipt", label: "입고관리" },
];

const emptyMaterialOrder = (): MaterialOrder => ({
  orderNo: "",
  orderDate: new Date().toISOString().slice(0, 10),
  customerId: null,
  customerName: "",
  remark: "",
  status: "발주요청",
  lines: [{ itemId: null, itemName: "", qty: 1, price: 0, amount: 0 }],
});

const getStatusStyle = (status?: string) => {
  const value = (status ?? "").trim();

  if (value.includes("완료")) {
    return {
      backgroundColor: "#e8f7ee",
      color: "#1f7a45",
      border: "1px solid #cdebd7",
    };
  }

  if (value.includes("대기")) {
    return {
      backgroundColor: "#fff6e5",
      color: "#a16207",
      border: "1px solid #fde7b0",
    };
  }

  if (value.includes("취소")) {
    return {
      backgroundColor: "#fdecec",
      color: "#b42318",
      border: "1px solid #f7caca",
    };
  }

  if (value.includes("요청")) {
    return {
      backgroundColor: "#f5f3ff",
      color: "#6941c6",
      border: "1px solid #ddd6fe",
    };
  }

  if (value.includes("진행")) {
    return {
      backgroundColor: "#eaf2ff",
      color: "#2457c5",
      border: "1px solid #cfe0ff",
    };
  }

  return {
    backgroundColor: "#f3f4f6",
    color: "#4b5563",
    border: "1px solid #e5e7eb",
  };
};

const extractExpectedDate = (remark?: string) => {
  const value = (remark ?? "").trim();
  if (!value) return "";

  const match = value.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : "";
};

export default function MaterialManagement() {
  const navigate = useNavigate();

  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [show, setShow] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [materialOrderList, setMaterialOrderList] = useState<MaterialOrder[]>([]);
  const [materialOrder, setMaterialOrder] = useState<MaterialOrder>(emptyMaterialOrder());

  const [activeMenu, setActiveMenu] = useState<MaterialMenuKey>("material-order");

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error" | "warning">("warning");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isConfirmModal, setIsConfirmModal] = useState(false);

  const totalAmount = useMemo(
    () =>
      (materialOrder.lines || []).reduce(
        (sum, line) => sum + (Number(line.amount) || 0),
        0
      ),
    [materialOrder.lines]
  );

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

  const fetchMaterialOrders = async (customers: Customer[] = []) => {
    try {
      const res = await api.get(API_BASE);
      const list = Array.isArray(res.data) ? res.data : res.data?.content ?? [];

      const normalized: MaterialOrder[] = list.map((t: any) => {
        const rawLines = t.lines ?? t.tradeLines ?? [];
        const lines: MaterialOrderLine[] = (rawLines || []).map((l: any) => {
          const qty = Number(l.qty ?? 0);
          const price = Number(l.price ?? l.unitPrice ?? 0);

          return {
            itemId: l.itemId ?? l.item?.id ?? l.item?.itemId ?? null,
            itemName: l.itemName ?? l.item?.itemName ?? "",
            qty,
            price,
            amount: Number(l.amount ?? l.totalAmount ?? qty * price),
            remark: l.remark ?? l.lineRemark ?? "",
          };
        });

        const customerName =
          (t.customerName ?? "").trim() ||
          customers.find((c) => c.id === (t.customerId ?? null))?.customerName ||
          "";

        return {
          id: Number(t.id),
          orderNo: t.orderNo ?? t.salesNo ?? t.tradeNo ?? "",
          orderDate: String(t.orderDate ?? t.salesDate ?? t.tradeDate ?? "").slice(0, 10),
          customerId: t.customerId ?? null,
          customerName,
          remark: t.remark ?? "",
          status: t.status ?? "",
          totalAmount: Number(t.totalAmount ?? 0),
          lines:
            lines.length > 0
              ? lines
              : [{ itemId: null, itemName: "", qty: 1, price: 0, amount: 0 }],
        };
      });

      setMaterialOrderList(normalized);
    } catch (e) {
      console.error("발주 조회 실패", e);
      openAlertModal("error", "조회 실패", "발주 목록 조회에 실패했습니다.");
    }
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get("/api/acc/customers");
        const rows = Array.isArray(res.data) ? res.data : res.data?.content ?? [];
        const normalized: Customer[] = rows.map((c: any) => ({
          id: c.id ?? c.customerId,
          customerName: c.customerName ?? c.name ?? "",
        }));

        const filtered = normalized.filter((c) => c.id && c.customerName);
        setCustomerList(filtered);

        fetchMaterialOrders(filtered);
      } catch (e) {
        console.error("공급업체 목록 조회 실패", e);
      }
    };

    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateLine = (idx: number, patch: Partial<MaterialOrderLine>) => {
    setMaterialOrder((prev) => {
      const lines = (prev.lines || []).map((line, i) => {
        if (i !== idx) return line;
        const updated = { ...line, ...patch };
        updated.amount = (Number(updated.qty) || 0) * (Number(updated.price) || 0);
        return updated;
      });
      return { ...prev, lines };
    });
  };

  const addLine = () => {
    setMaterialOrder((prev) => ({
      ...prev,
      lines: [
        ...(prev.lines || []),
        { itemId: null, itemName: "", qty: 1, price: 0, amount: 0 },
      ],
    }));
  };

  const removeLine = (idx: number) => {
    setMaterialOrder((prev) => ({
      ...prev,
      lines: (prev.lines || []).filter((_, i) => i !== idx),
    }));
  };

  const openNew = () => {
    setSelectedId(null);
    setMaterialOrder(emptyMaterialOrder());
    setShow(true);
  };

  const openDetail = async (id: number) => {
    try {
      const res = await api.get(`${API_BASE}/${id}`);
      const t: any = res.data;

      const rawLines =
        t.lines ??
        t.tradeLines ??
        t.lineList ??
        t.tradeLineList ??
        t.items ??
        t.itemList ??
        [];

      const lines: MaterialOrderLine[] = (Array.isArray(rawLines) ? rawLines : []).map(
        (l: any) => {
          const qty = Number(l.qty ?? l.quantity ?? l.q ?? 0);
          const price = Number(l.price ?? l.unitPrice ?? l.unit_price ?? 0);
          const amount = Number(l.amount ?? l.totalAmount ?? l.lineAmount ?? qty * price);

          return {
            itemId: l.itemId ?? l.item?.id ?? l.item?.itemId ?? null,
            itemName: String(l.itemName ?? l.item?.itemName ?? l.item?.name ?? l.name ?? ""),
            qty,
            price,
            amount,
            remark: l.remark ?? l.lineRemark ?? "",
          };
        }
      );

      const customerName =
        (t.customerName ?? "").trim() ||
        customerList.find((c) => c.id === (t.customerId ?? null))?.customerName ||
        "";

      setSelectedId(id);
      setMaterialOrder({
        id: Number(t.id),
        orderNo: String(t.orderNo ?? t.salesNo ?? t.tradeNo ?? t.no ?? ""),
        orderDate: String(t.orderDate ?? t.salesDate ?? t.tradeDate ?? t.date ?? "").slice(
          0,
          10
        ),
        customerId: t.customerId ?? null,
        customerName,
        remark: t.remark ?? "",
        status: t.status ?? "발주요청",
        totalAmount: Number(t.totalAmount ?? 0),
        lines:
          lines.length > 0
            ? lines
            : [{ itemId: null, itemName: "", qty: 1, price: 0, amount: 0 }],
      });

      setShow(true);
    } catch (e) {
      console.error("발주 상세 조회 실패", e);
      openAlertModal("error", "상세 조회 실패", "발주 상세 조회에 실패했습니다.");
    }
  };

  const handleClose = () => {
    setShow(false);
    setSelectedId(null);
    setMaterialOrder(emptyMaterialOrder());
  };

  const saveMaterialOrder = async () => {
    try {
      if (!materialOrder.orderDate) {
        openAlertModal("warning", "입력 확인", "발주일자를 입력해 주세요.");
        return;
      }

      if (!materialOrder.lines || materialOrder.lines.length === 0) {
        openAlertModal("warning", "입력 확인", "자재명을 입력해 주세요.");
        return;
      }

      const customerId = materialOrder.customerId;
      if (!customerId) {
        openAlertModal("warning", "입력 확인", "공급업체를 선택해 주세요.");
        return;
      }

      const firstLine = materialOrder.lines[0];
      if (!firstLine?.itemName?.trim()) {
        openAlertModal("warning", "입력 확인", "자재명을 입력해 주세요.");
        return;
      }

      if (!Number(firstLine.qty || 0)) {
        openAlertModal("warning", "입력 확인", "발주수량을 입력해 주세요.");
        return;
      }

      const orderNo =
        (materialOrder.orderNo ?? "").trim() ||
        `MO-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Date.now()}`;

      const payload = {
        orderNo,
        orderDate: materialOrder.orderDate,
        customerId,
        customerName: materialOrder.customerName,
        remark: materialOrder.remark ?? "",
        status: materialOrder.status ?? "발주요청",
        totalAmount,
        lines: (materialOrder.lines || []).map((line) => ({
          itemId: line.itemId ? Number(line.itemId) : null,
          itemName: line.itemName,
          qty: Number(line.qty || 0),
          price: Number(line.price || 0),
          amount: Number(line.amount || 0),
          remark: line.remark ?? "",
        })),
      };

      if (selectedId) {
        await api.put(`${API_BASE}/${selectedId}`, payload);
        openAlertModal("success", "저장 완료", "발주 정보가 저장되었습니다.");
      } else {
        await api.post(API_BASE, payload);
        openAlertModal("success", "등록 완료", "자재 발주가 등록되었습니다.");
      }

      await fetchMaterialOrders(customerList);
      handleClose();
    } catch (e) {
      console.error("저장 실패", e);
      openAlertModal("error", "저장 실패", "저장에 실패했습니다. 콘솔을 확인해 주세요.");
    }
  };

  const confirmDeleteMaterialOrder = async () => {
    if (!selectedId) return;

    try {
      await api.delete(`${API_BASE}/${selectedId}`);
      await fetchMaterialOrders(customerList);
      handleClose();
      closeAlertModal();
    } catch (e) {
      console.error("발주 삭제 실패", e);
      closeAlertModal();
      openAlertModal("error", "삭제 실패", "삭제에 실패했습니다. 콘솔을 확인해 주세요.");
    }
  };

  const deleteMaterialOrder = async () => {
    if (!selectedId) return;
    openConfirmModal("warning", "삭제 확인", "정말 삭제하시겠습니까?");
  };

  const handleCategoryClick = (key: MaterialMenuKey) => {
    setActiveMenu(key);

    if (key === "material-order") {
      navigate("/material");
      return;
    }

    if (key === "receipt") {
      navigate("/material-receipt");
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
                        자재관리
                      </TableTitle>

                      <div
                        style={{
                          marginTop: "6px",
                          fontSize: "14px",
                          color: "#6b7280",
                          fontWeight: 500,
                        }}
                      >
                        발주현황
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
                          <th
                            style={{
                              padding: "15px 18px",
                              fontSize: "14px",
                              fontWeight: 700,
                              color: "#475467",
                              borderBottom: "1px solid #e8ecf4",
                            }}
                          >
                            자재명
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
                            발주번호
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
                            발주수량
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
                            발주상태
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
                            발주일자
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
                            공급업체
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {materialOrderList.length > 0 ? (
                          materialOrderList.map((order, index) => {
                            const firstLine = order.lines?.[0];

                            return (
                              <tr
                                key={order.id}
                                style={{
                                  cursor: "pointer",
                                  backgroundColor: index % 2 === 0 ? "#ffffff" : "#fcfdff",
                                  transition: "all 0.15s ease",
                                }}
                                onClick={() => openDetail(order.id!)}
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
                                  {firstLine?.itemName ?? "-"}
                                </td>
                                <td
                                  style={{
                                    padding: "14px 18px",
                                    verticalAlign: "middle",
                                    color: "#374151",
                                    borderBottom: "1px solid #eef2f7",
                                  }}
                                >
                                  {order.orderNo || "-"}
                                </td>
                                <td
                                  style={{
                                    padding: "14px 18px",
                                    verticalAlign: "middle",
                                    color: "#374151",
                                    borderBottom: "1px solid #eef2f7",
                                    fontWeight: 600,
                                  }}
                                >
                                  {Number(firstLine?.qty ?? 0).toLocaleString()}
                                </td>
                                <td
                                  style={{
                                    padding: "14px 18px",
                                    verticalAlign: "middle",
                                    borderBottom: "1px solid #eef2f7",
                                  }}
                                >
                                  <span
                                    style={{
                                      ...getStatusStyle(order.status),
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      minWidth: "76px",
                                      height: "30px",
                                      borderRadius: "999px",
                                      fontSize: "12px",
                                      fontWeight: 700,
                                      padding: "0 12px",
                                    }}
                                  >
                                    {order.status || "미등록"}
                                  </span>
                                </td>
                                <td
                                  style={{
                                    padding: "14px 18px",
                                    verticalAlign: "middle",
                                    color: "#4b5563",
                                    borderBottom: "1px solid #eef2f7",
                                  }}
                                >
                                  {String(order.orderDate ?? "").slice(0, 10)}
                                </td>
                                <td
                                  style={{
                                    padding: "14px 18px",
                                    verticalAlign: "middle",
                                    color: "#374151",
                                    borderBottom: "1px solid #eef2f7",
                                  }}
                                >
                                  {order.customerName || "-"}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan={6}
                              style={{
                                textAlign: "center",
                                padding: "44px 16px",
                                color: "#98a2b3",
                                fontSize: "14px",
                              }}
                            >
                              등록된 발주 내역이 없습니다.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>

                  <BtnRight style={{ marginTop: "14px" }}>
                    <button
                      type="button"
                      onClick={() => fetchMaterialOrders(customerList)}
                      style={{
                        backgroundColor: "#ffffff",
                        color: "#475569",
                        border: "1px solid #dbe2ea",
                        borderRadius: "10px",
                        padding: "10px 14px",
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor: "pointer",
                        marginRight: "8px",
                      }}
                    >
                      새로고침
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/material-order")}
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
                    >
                      자재발주등록
                    </button>
                  </BtnRight>
                </Right>
              </Flex>
            </Col>
          </Row>
        </Container>
      </div>

      <MaterialModal
        show={show}
        selectedId={selectedId}
        materialOrder={materialOrder}
        totalAmount={totalAmount}
        onClose={handleClose}
        onSetMaterialOrder={setMaterialOrder}
        addLine={addLine}
        removeLine={removeLine}
        updateLine={updateLine}
        onSave={saveMaterialOrder}
        onDelete={deleteMaterialOrder}
        customerList={customerList}
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
                  onClick={confirmDeleteMaterialOrder}
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