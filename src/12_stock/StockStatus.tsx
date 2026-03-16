import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Table, Modal } from "react-bootstrap";
import Top from "../include/Top";
import Header from "../include/Header";
// import SideBar from "../include/SideBar";
import { Left, Right, Flex, TopWrap } from "../stylesjs/Content.styles";
import { TableTitle } from "../stylesjs/Text.styles";
import { InputGroup, Search } from "../stylesjs/Input.styles";
import { BtnRight } from "../stylesjs/Button.styles";
// import Lnb from "../include/Lnb";

import StockModal, { StockForm } from "../component/stock/StockModal";
import "../Auth.css";

/* =========================
   타입 정의
========================= */
type StockItem = {
  id: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  stockQty: number;
  unitPrice: number;
  totalAmount: number;
};

type Item = {
  id: number;
  itemCode: string;
  itemName: string;
  unitPrice?: number;
};

/* =========================
   API 설정
========================= */
const API_STOCK = "http://localhost:8888/api/stock";
const API_ITEM = "http://localhost:8888/api/inv/items";

const n = (v: any) => Number(v ?? 0) || 0;

const StockStatus = () => {
  const [keyword, setKeyword] = useState("");
  const [stockList, setStockList] = useState<StockItem[]>([]);
  const [itemList, setItemList] = useState<Item[]>([]);

  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error" | "warning">("warning");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isConfirmModal, setIsConfirmModal] = useState(false);

  const emptyForm = (): StockForm => ({
    id: undefined,
    itemId: null,
    itemCode: "",
    itemName: "",
    stockQty: 0,
    unitPrice: 0,
  });

  const [form, setForm] = useState<StockForm>(emptyForm());

  const totals = useMemo(() => {
    const totalQty = stockList.reduce((s, i) => s + n(i.stockQty), 0);
    const totalAmount = stockList.reduce((s, i) => s + n(i.totalAmount), 0);
    return { totalQty, totalAmount };
  }, [stockList]);

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

  const fetchItems = async () => {
    try {
      const res = await axios.get(API_ITEM, {
        params: {
          includeStopped: true,
          page: 0,
          size: 2000,
          sortKey: "id",
          dir: "desc",
        },
      });

      const rows = Array.isArray(res.data) ? res.data : res.data?.content ?? [];
      console.log("✅ items raw sample =", rows?.[0]);

      const normalized: Item[] = rows.map((x: any) => ({
        id: n(x.id ?? x.itemId ?? x.item_id),
        itemCode: String(x.itemCode ?? x.code ?? x.item_code ?? ""),
        itemName: String(x.itemName ?? x.name ?? x.item_name ?? ""),
        unitPrice: n(x.outPrice ?? x.unitPrice ?? 0),
      }));

      console.log("✅ items normalized sample =", normalized?.[0]);
      setItemList(normalized);
    } catch (e: any) {
      console.error("❌ 품목 목록 조회 실패", e?.response?.status, e?.response?.data);
      setItemList([]);
    }
  };

  const fetchStock = async () => {
    try {
      const res = await axios.get(API_STOCK, {
        params: {
          q: keyword?.trim() ? keyword.trim() : undefined,
          page: 0,
          size: 2000,
          sort: "id,desc",
        },
      });

      const rows = Array.isArray(res.data) ? res.data : res.data?.content ?? [];
      console.log("✅ stock raw sample =", rows?.[0]);

      const itemMap = new Map<number, Item>();
      itemList.forEach((it) => itemMap.set(it.id, it));

      const list: StockItem[] = rows.map((i: any) => {
        const itemId = n(i.itemId ?? i.item_id ?? i.item?.id ?? 0);
        const it = itemMap.get(itemId);

        const stockQty = n(i.onHandQty ?? i.stockQty ?? 0);
        const unitPrice = n(i.unitPrice ?? it?.unitPrice ?? 0);

        return {
          id: n(i.id),
          itemId,
          itemCode: String(i.itemCode ?? it?.itemCode ?? ""),
          itemName: String(i.itemName ?? it?.itemName ?? ""),
          stockQty,
          unitPrice,
          totalAmount: stockQty * unitPrice,
        };
      });

      console.log("✅ stock normalized sample =", list?.[0]);
      setStockList(list);
    } catch (e: any) {
      console.error("❌ 재고조회 실패", e?.response?.status, e?.response?.data);
      openAlertModal("error", "조회 실패", "재고조회에 실패했습니다. 콘솔을 확인해 주세요.");
      setStockList([]);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchStock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (itemList.length > 0) {
      fetchStock();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemList.length]);

  // const stockMenu = [{ key: "status", label: "재고현황", path: "/stock" }];

  const openCreate = async () => {
    await fetchItems();
    setMode("create");
    setSelectedId(null);
    setForm(emptyForm());
    setShow(true);
  };

  const openEdit = async (row: StockItem) => {
    await fetchItems();
    setMode("edit");
    setSelectedId(row.id);
    setForm({
      id: row.id,
      itemId: row.itemId,
      itemCode: row.itemCode,
      itemName: row.itemName,
      stockQty: row.stockQty,
      unitPrice: row.unitPrice,
    });
    setShow(true);
  };

  const closeModal = () => {
    setShow(false);
    setSelectedId(null);
    setMode("create");
    setForm(emptyForm());
  };

  const saveStock = async () => {
    const payload = {
      itemId: form.itemId,
      onHandQty: n(form.stockQty),
      reservedQty: 0,
      safetyQty: 0,
    };

    if (!payload.itemId) {
      openAlertModal("warning", "입력 확인", "품목을 선택해 주세요.");
      return;
    }

    if (mode === "create") {
      const exists = stockList.some((s) => s.itemId === payload.itemId);
      if (exists) {
        openAlertModal("warning", "중복 확인", "이미 재고가 등록된 품목입니다. 수정으로 처리해 주세요.");
        return;
      }
    }

    try {
      if (mode === "edit" && selectedId) {
        await axios.put(`${API_STOCK}/${selectedId}`, payload);
      } else {
        await axios.post(API_STOCK, payload);
      }

      await fetchStock();
      closeModal();
    } catch (e: any) {
      console.error("❌ 재고 저장 실패", e?.response?.status, e?.response?.data);
      openAlertModal("error", "저장 실패", "저장에 실패했습니다. 콘솔을 확인해 주세요.");
    }
  };

  const confirmDeleteStock = async () => {
    if (!selectedId) return;

    try {
      await axios.delete(`${API_STOCK}/${selectedId}`);
      await fetchStock();
      closeModal();
      closeAlertModal();
    } catch (e: any) {
      console.error("❌ 재고 삭제 실패", e?.response?.status, e?.response?.data);
      closeAlertModal();
      openAlertModal("error", "삭제 실패", "삭제에 실패했습니다. 콘솔을 확인해 주세요.");
    }
  };

  const deleteStock = async () => {
    if (!selectedId) return;
    openConfirmModal("warning", "삭제 확인", "정말 삭제하시겠습니까?");
  };

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
                  {/* <Lnb menuList={stockMenu} title="재고현황" /> */}
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
                        재고현황
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
                          flexWrap: "nowrap",
                        }}
                      >
                        <Search
                          type="search"
                          placeholder="품목코드/품목명 검색"
                          value={keyword}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setKeyword(e.target.value)
                          }
                          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === "Enter") fetchStock();
                          }}
                          style={{
                            width: "280px",
                            borderRadius: "10px",
                            border: "1px solid #dbe2ea",
                            padding: "10px 12px",
                          }}
                        />

                        <button
                          type="button"
                          onClick={fetchStock}
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
                          조회
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
                          <th
                            style={{
                              padding: "15px 18px",
                              fontSize: "14px",
                              fontWeight: 700,
                              color: "#475467",
                              borderBottom: "1px solid #e8ecf4",
                            }}
                          >
                            품목코드
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
                            품목명
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
                            재고수량
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
                            단가
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
                            재고금액
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {stockList.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              style={{
                                textAlign: "center",
                                padding: "44px 16px",
                                color: "#98a2b3",
                                fontSize: "14px",
                              }}
                            >
                              조회된 재고가 없습니다.
                            </td>
                          </tr>
                        ) : (
                          stockList.map((i, index) => (
                            <tr
                              key={i.id}
                              onClick={() => openEdit(i)}
                              style={{
                                cursor: "pointer",
                                backgroundColor: index % 2 === 0 ? "#ffffff" : "#fcfdff",
                                transition: "all 0.15s ease",
                              }}
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
                                {i.itemCode}
                              </td>
                              <td
                                style={{
                                  padding: "14px 18px",
                                  verticalAlign: "middle",
                                  color: "#374151",
                                  borderBottom: "1px solid #eef2f7",
                                }}
                              >
                                {i.itemName}
                              </td>
                              <td
                                style={{
                                  padding: "14px 18px",
                                  verticalAlign: "middle",
                                  textAlign: "right",
                                  color: "#374151",
                                  borderBottom: "1px solid #eef2f7",
                                }}
                              >
                                {n(i.stockQty).toLocaleString()}
                              </td>
                              <td
                                style={{
                                  padding: "14px 18px",
                                  verticalAlign: "middle",
                                  textAlign: "right",
                                  color: "#374151",
                                  borderBottom: "1px solid #eef2f7",
                                }}
                              >
                                {n(i.unitPrice).toLocaleString()}
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
                                {n(i.totalAmount).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>

                      {stockList.length > 0 && (
                        <tfoot>
                          <tr
                            style={{
                              backgroundColor: "#f8fafc",
                            }}
                          >
                            <th
                              colSpan={2}
                              style={{
                                padding: "16px 18px",
                                textAlign: "center",
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "#475467",
                                borderTop: "1px solid #e8ecf4",
                              }}
                            >
                              합계
                            </th>
                            <th
                              style={{
                                padding: "16px 18px",
                                textAlign: "right",
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "#111827",
                                borderTop: "1px solid #e8ecf4",
                              }}
                            >
                              {totals.totalQty.toLocaleString()}
                            </th>
                            <th
                              style={{
                                borderTop: "1px solid #e8ecf4",
                                backgroundColor: "#f8fafc",
                              }}
                            ></th>
                            <th
                              style={{
                                padding: "16px 18px",
                                textAlign: "right",
                                fontSize: "15px",
                                fontWeight: 800,
                                color: "#111827",
                                borderTop: "1px solid #e8ecf4",
                              }}
                            >
                              {totals.totalAmount.toLocaleString()}
                            </th>
                          </tr>
                        </tfoot>
                      )}
                    </Table>
                  </div>

                  <BtnRight style={{ marginTop: "14px" }}>
                    <button
                      type="button"
                      onClick={openCreate}
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
                      재고등록
                    </button>
                  </BtnRight>
                </Right>
              </Flex>
            </Col>
          </Row>
        </Container>
      </div>

      <StockModal
        show={show}
        mode={mode}
        form={form}
        itemList={itemList.map((x) => ({
          id: x.id,
          itemCode: x.itemCode,
          itemName: x.itemName,
          unitPrice: x.unitPrice ?? 0,
        }))}
        onClose={closeModal}
        onChange={(patch) => setForm((p) => ({ ...p, ...patch }))}
        onSave={saveStock}
        onDelete={mode === "edit" ? deleteStock : undefined}
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
                  onClick={confirmDeleteStock}
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
};

export default StockStatus;