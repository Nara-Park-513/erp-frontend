import axios from "axios";
import {
  useEffect,
  useMemo,
  useState,
  ChangeEvent,
  KeyboardEvent,
} from "react";
import { Container, Row, Col, Table, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Top from "../include/Top";
import Header from "../include/Header";
import { Left, Right, Flex, TopWrap } from "../stylesjs/Content.styles";
import { TableTitle } from "../stylesjs/Text.styles";
import { InputGroup, Search } from "../stylesjs/Input.styles";
import { BtnRight } from "../stylesjs/Button.styles";
import "../Auth.css";

type StockItem = {
  id: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  stockQty: number;
  availableQty: number;
  stockStatus: string;
  unitPrice: number;
  totalAmount: number;
};

type Item = {
  id: number;
  itemCode: string;
  itemName: string;
  unitPrice?: number;
};

type StockMenuKey = "current" | "by-item" | "history";

const STOCK_MENU: { key: StockMenuKey; label: string }[] = [
  { key: "current", label: "현재고조회" },
  { key: "by-item", label: "품목별재고조회" },
  { key: "history", label: "재고변동이력" },
];

const API_STOCK = "http://localhost:8888/api/stock";
const API_ITEM = "http://localhost:8888/api/inv/items";

const n = (v: any) => Number(v ?? 0) || 0;

const getStockStatus = (qty: number) => {
  if (qty <= 0) return "품절";
  if (qty < 10) return "부족";
  return "정상";
};

const getStockStatusStyle = (status: string) => {
  switch (status) {
    case "정상":
      return {
        backgroundColor: "#e8f7ee",
        color: "#1f7a45",
        border: "1px solid #cdebd7",
      };
    case "부족":
      return {
        backgroundColor: "#fff6e5",
        color: "#a16207",
        border: "1px solid #fde7b0",
      };
    case "품절":
      return {
        backgroundColor: "#fdecec",
        color: "#b42318",
        border: "1px solid #f7caca",
      };
    default:
      return {
        backgroundColor: "#f3f4f6",
        color: "#4b5563",
        border: "1px solid #e5e7eb",
      };
  }
};

const thLeft = {
  padding: "15px 18px",
  fontSize: "14px",
  fontWeight: 700,
  color: "#475467",
  borderBottom: "1px solid #e8ecf4",
  textAlign: "left" as const,
};

const thRight = {
  ...thLeft,
  textAlign: "right" as const,
};

const thCenter = {
  ...thLeft,
  textAlign: "center" as const,
};

const tdLeft = {
  padding: "14px 18px",
  verticalAlign: "middle" as const,
  color: "#374151",
  borderBottom: "1px solid #eef2f7",
  textAlign: "left" as const,
};

const tdRight = {
  ...tdLeft,
  textAlign: "right" as const,
};

const tdCenter = {
  ...tdLeft,
  textAlign: "center" as const,
};

const tfootLabel = {
  padding: "16px 18px",
  textAlign: "center" as const,
  fontSize: "14px",
  fontWeight: 700,
  color: "#475467",
  borderTop: "1px solid #e8ecf4",
};

const tfootValue = {
  padding: "16px 18px",
  textAlign: "right" as const,
  fontSize: "14px",
  fontWeight: 700,
  color: "#111827",
  borderTop: "1px solid #e8ecf4",
};

const emptyStyle = {
  textAlign: "center" as const,
  padding: "44px 16px",
  color: "#98a2b3",
  fontSize: "14px",
};

const refreshBtnStyle = {
  backgroundColor: "#ffffff",
  color: "#475569",
  border: "1px solid #dbe2ea",
  borderRadius: "10px",
  padding: "10px 14px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
};

const StockItemStatus = () => {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [stockList, setStockList] = useState<StockItem[]>([]);
  const [itemList, setItemList] = useState<Item[]>([]);
  const [activeMenu, setActiveMenu] = useState<StockMenuKey>("by-item");

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error" | "warning">("warning");
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

      const normalized: Item[] = rows.map((x: any) => ({
        id: n(x.id ?? x.itemId ?? x.item_id),
        itemCode: String(x.itemCode ?? x.code ?? x.item_code ?? ""),
        itemName: String(x.itemName ?? x.name ?? x.item_name ?? ""),
        unitPrice: n(x.outPrice ?? x.unitPrice ?? 0),
      }));

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
          q: keyword.trim() ? keyword.trim() : undefined,
          page: 0,
          size: 2000,
          sort: "itemId,asc",
        },
      });

      const rows = Array.isArray(res.data) ? res.data : res.data?.content ?? [];

      const itemMap = new Map<number, Item>();
      itemList.forEach((it) => itemMap.set(it.id, it));

      const mappedList: StockItem[] = rows.map((i: any) => {
        const itemId = n(i.itemId ?? i.item_id ?? i.item?.id ?? 0);
        const it = itemMap.get(itemId);

        const stockQty = n(i.onHandQty ?? i.stockQty ?? 0);
        const availableQty = stockQty;
        const unitPrice = n(i.unitPrice ?? it?.unitPrice ?? 0);

        return {
          id: n(i.id),
          itemId,
          itemCode: String(i.itemCode ?? it?.itemCode ?? ""),
          itemName: String(i.itemName ?? it?.itemName ?? ""),
          stockQty,
          availableQty,
          stockStatus: getStockStatus(stockQty),
          unitPrice,
          totalAmount: stockQty * unitPrice,
        };
      });

      const sortedList = mappedList.sort((a: StockItem, b: StockItem) => {
        const nameCompare = a.itemName.localeCompare(b.itemName, "ko");
        if (nameCompare !== 0) return nameCompare;
        return a.itemCode.localeCompare(b.itemCode, "ko");
      });

      setStockList(sortedList);
    } catch (e: any) {
      console.error("❌ 품목별 재고조회 실패", e?.response?.status, e?.response?.data);
      openAlertModal("error", "조회 실패", "품목별 재고조회에 실패했습니다. 콘솔을 확인해 주세요.");
      setStockList([]);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (itemList.length > 0) {
      fetchStock();
    }
  }, [itemList.length]);

  const filteredList = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return stockList;

    return stockList.filter(
      (item) =>
        item.itemCode.toLowerCase().includes(q) ||
        item.itemName.toLowerCase().includes(q)
    );
  }, [stockList, keyword]);

  const summary = useMemo(() => {
    return filteredList.reduce(
      (acc, cur) => {
        acc.totalQty += n(cur.stockQty);
        acc.totalAvailableQty += n(cur.availableQty);
        acc.totalAmount += n(cur.totalAmount);
        return acc;
      },
      { totalQty: 0, totalAvailableQty: 0, totalAmount: 0 }
    );
  }, [filteredList]);

  const handleCategoryClick = (key: StockMenuKey) => {
    setActiveMenu(key);

    if (key === "current") {
      navigate("/stock");
      return;
    }

    if (key === "by-item") {
      navigate("/stock-item");
      return;
    }

    if (key === "history") {
      navigate("/stock-history");
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
                        minWidth: "120px",
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
                        재고현황
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: "8px",
                        }}
                      >
                        {STOCK_MENU.map((item) => {
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
                        품목별재고조회
                      </TableTitle>

                      <div
                        style={{
                          marginTop: "6px",
                          fontSize: "14px",
                          color: "#6b7280",
                          fontWeight: 500,
                        }}
                      >
                        품목 기준 재고현황
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
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          style={{
                            padding: "10px 14px",
                            border: "1px solid #e4e7ec",
                            borderRadius: "10px",
                            fontSize: "13px",
                            color: "#475467",
                            backgroundColor: "#f8fafc",
                          }}
                        >
                          품목 수 <strong>{filteredList.length}</strong>
                        </div>

                        <div
                          style={{
                            padding: "10px 14px",
                            border: "1px solid #e4e7ec",
                            borderRadius: "10px",
                            fontSize: "13px",
                            color: "#475467",
                            backgroundColor: "#f8fafc",
                          }}
                        >
                          총 현재고 <strong>{summary.totalQty.toLocaleString()}</strong>
                        </div>
                      </div>

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
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setKeyword(e.target.value)
                          }
                          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
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
                          <th style={thLeft}>품목코드</th>
                          <th style={thLeft}>품목명</th>
                          <th style={thRight}>현재고</th>
                          <th style={thRight}>가용재고</th>
                          <th style={thRight}>단가</th>
                          <th style={thRight}>재고금액</th>
                          <th style={thCenter}>재고상태</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredList.length === 0 ? (
                          <tr>
                            <td colSpan={7} style={emptyStyle}>
                              조회된 품목별 재고가 없습니다.
                            </td>
                          </tr>
                        ) : (
                          filteredList.map((item, index) => (
                            <tr
                              key={item.id}
                              style={{
                                backgroundColor: index % 2 === 0 ? "#ffffff" : "#fcfdff",
                              }}
                            >
                              <td style={{ ...tdLeft, fontWeight: 600, color: "#111827" }}>
                                {item.itemCode || "-"}
                              </td>
                              <td style={tdLeft}>{item.itemName || "-"}</td>
                              <td style={tdRight}>{n(item.stockQty).toLocaleString()}</td>
                              <td style={tdRight}>{n(item.availableQty).toLocaleString()}</td>
                              <td style={tdRight}>{n(item.unitPrice).toLocaleString()}</td>
                              <td style={{ ...tdRight, fontWeight: 600 }}>
                                {n(item.totalAmount).toLocaleString()}
                              </td>
                              <td style={tdCenter}>
                                <span
                                  style={{
                                    ...getStockStatusStyle(item.stockStatus),
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    minWidth: "70px",
                                    height: "30px",
                                    borderRadius: "999px",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    padding: "0 12px",
                                  }}
                                >
                                  {item.stockStatus}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>

                      {filteredList.length > 0 && (
                        <tfoot>
                          <tr style={{ backgroundColor: "#f8fafc" }}>
                            <th colSpan={2} style={tfootLabel}>
                              합계
                            </th>
                            <th style={tfootValue}>{summary.totalQty.toLocaleString()}</th>
                            <th style={tfootValue}>{summary.totalAvailableQty.toLocaleString()}</th>
                            <th style={tfootValue}>-</th>
                            <th style={tfootValue}>{summary.totalAmount.toLocaleString()}</th>
                            <th style={{ borderTop: "1px solid #e8ecf4" }}></th>
                          </tr>
                        </tfoot>
                      )}
                    </Table>
                  </div>

                  <BtnRight style={{ marginTop: "14px" }}>
                    <button
                      type="button"
                      onClick={fetchStock}
                      style={refreshBtnStyle}
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

      <Modal
        show={showAlertModal}
        onHide={closeAlertModal}
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
};

export default StockItemStatus;