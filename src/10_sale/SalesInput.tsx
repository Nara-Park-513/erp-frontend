import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Table, Modal } from "react-bootstrap";
import Top from "../include/Top";
import Header from "../include/Header";
// import SideBar from "../include/SideBar";
import { Left, Right, Flex, TopWrap } from "../stylesjs/Content.styles";
import { TableTitle } from "../stylesjs/Text.styles";
import { BtnRight } from "../stylesjs/Button.styles";
// import Lnb from "../include/Lnb";

import SalesModal, {
  Sales,
  SalesLine,
  Customer,
  ItemOption,
} from "../component/sales/SalesModal";
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

const API_BASE = "/api/sales/sales";

const emptySales = (): Sales => ({
  salesNo: "",
  salesDate: new Date().toISOString().slice(0, 10),
  customerId: null,
  customerName: "",
  remark: "",
  lines: [{ itemId: null, itemName: "", qty: 1, price: 0, amount: 0 }],
});

export default function SalesInput() {
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [itemList, setItemList] = useState<ItemOption[]>([]);
  const [show, setShow] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [salesList, setSalesList] = useState<Sales[]>([]);
  const [sales, setSales] = useState<Sales>(emptySales());

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error" | "warning">("warning");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isConfirmModal, setIsConfirmModal] = useState(false);

  const totalAmount = useMemo(
    () => (sales.lines || []).reduce((s, l) => s + (Number(l.amount) || 0), 0),
    [sales.lines]
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

  const fetchSales = async (customers: Customer[] = []) => {
    try {
      const res = await api.get(API_BASE);
      const list = Array.isArray(res.data) ? res.data : res.data?.content ?? [];

      const normalized: Sales[] = list.map((t: any) => {
        const tradeLines = t.tradeLines ?? t.lines ?? [];
        const lines: SalesLine[] = (tradeLines || []).map((l: any) => {
          const qty = Number(l.qty ?? 0);
          const unitPrice = Number(l.unitPrice ?? l.price ?? 0);
          return {
            itemId: l.itemId ?? l.item?.id ?? l.item?.itemId ?? null,
            itemName: l.itemName ?? l.item?.itemName ?? "",
            qty,
            price: unitPrice,
            amount: Number(l.totalAmount ?? l.amount ?? qty * unitPrice),
            remark: l.remark ?? l.lineRemark ?? "",
          };
        });

        const cname =
          (t.customerName ?? "").trim() ||
          customers.find((c) => c.id === (t.customerId ?? null))?.customerName ||
          "";

        return {
          id: t.id,
          salesNo: t.salesNo ?? t.tradeNo ?? "",
          salesDate: String(t.salesDate ?? t.tradeDate ?? "").slice(0, 10),
          customerId: t.customerId ?? null,
          customerName: cname,
          remark: t.remark ?? "",
          totalAmount: Number(t.totalAmount ?? 0),
          lines,
        };
      });

      setSalesList(normalized);
    } catch (e) {
      console.error("판매 조회 실패", e);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await api.get("/api/inv/items", {
        params: { page: 0, size: 2000, includeStopped: true },
      });

      const rows = Array.isArray(res.data) ? res.data : res.data?.content ?? [];

      const normalized: ItemOption[] = rows.map((it: any) => ({
        id: Number(it.id ?? it.itemId ?? 0),
        itemName: String(it.itemName ?? ""),
        outPrice: Number(it.outPrice ?? it.unitPrice ?? 0),
      }));

      setItemList(normalized);
    } catch (e) {
      console.error("품목 목록 조회 실패", e);
      setItemList([]);
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

        await Promise.all([fetchSales(filtered), fetchItems()]);
      } catch (e) {
        console.error("거래처 목록 조회 실패", e);
      }
    };
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateLine = (idx: number, patch: Partial<SalesLine>) => {
    setSales((prev) => {
      const lines = (prev.lines || []).map((l, i) => {
        if (i !== idx) return l;
        const updated = { ...l, ...patch };
        updated.amount = (Number(updated.qty) || 0) * (Number(updated.price) || 0);
        return updated;
      });
      return { ...prev, lines };
    });
  };

  const addLine = () => {
    setSales((p) => ({
      ...p,
      lines: [
        ...(p.lines || []),
        { itemId: null, itemName: "", qty: 1, price: 0, amount: 0 },
      ],
    }));
  };

  const removeLine = (idx: number) => {
    setSales((p) => ({
      ...p,
      lines: (p.lines || []).filter((_, i) => i !== idx),
    }));
  };

  const openNew = () => {
    setSelectedId(null);
    setSales(emptySales());
    setShow(true);
  };

  const openDetail = async (id: number) => {
    try {
      const res = await api.get(`${API_BASE}/${id}`);
      const t: any = res.data;

      const rawLines =
        t.tradeLines ??
        t.tradeLineList ??
        t.lines ??
        t.lineList ??
        t.items ??
        t.itemList ??
        [];

      const lines: SalesLine[] = (Array.isArray(rawLines) ? rawLines : []).map(
        (l: any) => {
          const qty = Number(l.qty ?? l.quantity ?? l.q ?? 0);
          const unitPrice = Number(l.unitPrice ?? l.price ?? l.unit_price ?? 0);
          const amount = Number(
            l.totalAmount ?? l.amount ?? l.lineAmount ?? qty * unitPrice
          );

          return {
            itemId: l.itemId ?? l.item?.id ?? l.item?.itemId ?? null,
            itemName: String(
              l.itemName ?? l.item?.itemName ?? l.item?.name ?? l.name ?? ""
            ),
            qty,
            price: unitPrice,
            amount,
            remark: l.remark ?? l.lineRemark ?? "",
          };
        }
      );

      const cname =
        (t.customerName ?? "").trim() ||
        customerList.find((c) => c.id === (t.customerId ?? null))?.customerName ||
        "";

      setSelectedId(id);
      setSales({
        id: Number(t.id),
        salesNo: String(t.salesNo ?? t.tradeNo ?? t.no ?? ""),
        salesDate: String(t.salesDate ?? t.tradeDate ?? t.date ?? "").slice(0, 10),
        customerId: t.customerId ?? null,
        customerName: cname,
        remark: t.remark ?? "",
        totalAmount: Number(t.totalAmount ?? 0),
        lines:
          lines.length > 0
            ? lines
            : [{ itemId: null, itemName: "", qty: 1, price: 0, amount: 0 }],
      });

      setShow(true);
    } catch (e) {
      console.error("판매 상세 조회 실패", e);
    }
  };

  const handleClose = () => {
    setShow(false);
    setSelectedId(null);
    setSales(emptySales());
  };

  const saveSales = async () => {
    try {
      if (!sales.salesDate) {
        openAlertModal("warning", "입력 확인", "판매일자를 입력해 주세요.");
        return;
      }

      if (!sales.lines || sales.lines.length === 0) {
        openAlertModal("warning", "입력 확인", "판매 라인을 1개 이상 입력해 주세요.");
        return;
      }

      const customerId = sales.customerId;
      if (!customerId) {
        openAlertModal("warning", "입력 확인", "거래처를 목록에서 선택해 주세요.");
        return;
      }

      for (const [i, l] of sales.lines.entries()) {
        if (!l.itemId) {
          openAlertModal("warning", "입력 확인", `라인 ${i + 1}: 품목을 선택해 주세요.`);
          return;
        }
        if (!l.itemName?.trim()) {
          openAlertModal("warning", "입력 확인", `라인 ${i + 1}: 품목명을 입력해 주세요.`);
          return;
        }
        if (!(Number(l.qty) > 0)) {
          openAlertModal("warning", "입력 확인", `라인 ${i + 1}: 수량은 0보다 커야 합니다.`);
          return;
        }
        if (!(Number(l.price) >= 0)) {
          openAlertModal("warning", "입력 확인", `라인 ${i + 1}: 단가는 0 이상이어야 합니다.`);
          return;
        }
      }

      const tradeNo =
        (sales.salesNo ?? "").trim() ||
        `S-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Date.now()}`;

      const vat = Math.round(totalAmount * 0.1);

      const payload: any = {
        tradeNo,
        tradeDate: sales.salesDate,
        tradeType: "SALES",
        customerId,
        counterAccountCode: "1110",
        supplyAmount: totalAmount,
        vatAmount: vat,
        feeAmount: 0,
        totalAmount: totalAmount + vat,
        remark: sales.remark ?? "",
        status: "DRAFT",

        tradeLines: (sales.lines || []).map((l) => {
          const qty = Number(l.qty || 0);
          const unitPrice = Number(l.price || 0);

          const supplyAmount = qty * unitPrice;
          const vatAmount = Math.round(supplyAmount * 0.1);
          const totalAmount = supplyAmount + vatAmount;

          return {
            itemId: l.itemId ? Number(l.itemId) : null,
            qty,
            unitPrice,
            supplyAmount,
            vatAmount,
            totalAmount,
            remark: l.remark ?? "",
          };
        }),
      };

      if (selectedId) await api.put(`${API_BASE}/${selectedId}`, payload);
      else await api.post(API_BASE, payload);

      await fetchSales(customerList);
      handleClose();
    } catch (e) {
      console.error("저장 실패", e);
      openAlertModal("error", "저장 실패", "저장에 실패했습니다. 콘솔을 확인해 주세요.");
    }
  };

  const confirmDeleteSales = async () => {
    if (!selectedId) return;

    try {
      await api.delete(`${API_BASE}/${selectedId}`);
      await fetchSales(customerList);
      handleClose();
      closeAlertModal();
    } catch (e) {
      console.error("판매 삭제 실패", e);
      closeAlertModal();
      openAlertModal("error", "삭제 실패", "삭제에 실패했습니다. 콘솔을 확인해 주세요.");
    }
  };

  const deleteSales = async () => {
    if (!selectedId) return;
    openConfirmModal("warning", "삭제 확인", "정말 삭제하시겠습니까?");
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
                <Left></Left>

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
                        판매관리
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
                            판매번호
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
                            판매일자
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
                        {salesList.length === 0 ? (
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
                              등록된 판매 내역이 없습니다.
                            </td>
                          </tr>
                        ) : (
                          salesList.map((s, index) => (
                            <tr
                              key={s.id}
                              style={{
                                cursor: "pointer",
                                backgroundColor: index % 2 === 0 ? "#ffffff" : "#fcfdff",
                                transition: "all 0.15s ease",
                              }}
                              onClick={() => openDetail(s.id!)}
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
                                {s.salesNo}
                              </td>
                              <td
                                style={{
                                  padding: "14px 18px",
                                  verticalAlign: "middle",
                                  color: "#374151",
                                  borderBottom: "1px solid #eef2f7",
                                }}
                              >
                                {String(s.salesDate ?? "").slice(0, 10)}
                              </td>
                              <td
                                style={{
                                  padding: "14px 18px",
                                  verticalAlign: "middle",
                                  color: "#374151",
                                  borderBottom: "1px solid #eef2f7",
                                }}
                              >
                                {s.customerName}
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
                                {Number(s.totalAmount ?? 0).toLocaleString()}
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

      <SalesModal
        show={show}
        selectedId={selectedId}
        sales={sales}
        totalAmount={totalAmount}
        onClose={handleClose}
        onSetSales={setSales}
        addLine={addLine}
        removeLine={removeLine}
        updateLine={updateLine}
        onSave={saveSales}
        onDelete={deleteSales}
        customerList={customerList}
        itemList={itemList}
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
                  onClick={confirmDeleteSales}
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