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

type StockMenuKey = "current" | "by-item" | "history";

type StockHistoryRow = {
  id: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  changeType: string;
  changeQty: number;
  beforeQty: number;
  afterQty: number;
  refNo: string;
  remark: string;
  changedAt: string;
};

type Item = {
  id: number;
  itemCode: string;
  itemName: string;
};

const STOCK_MENU: { key: StockMenuKey; label: string }[] = [
  { key: "current", label: "현재고조회" },
  { key: "by-item", label: "품목별재고조회" },
  { key: "history", label: "재고변동이력" },
];

const API_HISTORY = "http://localhost:8888/api/stock-history";
const API_ITEM = "http://localhost:8888/api/inv/items";

const n = (v: any) => Number(v ?? 0) || 0;

const getChangeTypeStyle = (type: string) => {
  switch ((type || "").trim()) {
    case "입고":
      return {
        backgroundColor: "#e8f7ee",
        color: "#1f7a45",
        border: "1px solid #cdebd7",
      };
    case "출고":
      return {
        backgroundColor: "#fdecec",
        color: "#b42318",
        border: "1px solid #f7caca",
      };
    case "조정":
      return {
        backgroundColor: "#fff6e5",
        color: "#a16207",
        border: "1px solid #fde7b0",
      };
    default:
      return {
        backgroundColor: "#f3f4f6",
        color: "#4b5563",
        border: "1px solid #e5e7eb",
      };
  }
};

const formatDateTime = (value: string) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
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

const StockHistoryStatus = () => {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [historyList, setHistoryList] = useState<StockHistoryRow[]>([]);
  const [itemList, setItemList] = useState<Item[]>([]);
  const [activeMenu, setActiveMenu] = useState<StockMenuKey>("history");

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
      }));

      setItemList(normalized);
    } catch (e: any) {
      console.error("❌ 품목 목록 조회 실패", e?.response?.status, e?.response?.data);
      setItemList([]);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(API_HISTORY, {
        params: {
          q: keyword.trim() ? keyword.trim() : undefined,
          page: 0,
          size: 2000,
          sort: "changedAt,desc",
        },
      });

      const rows = Array.isArray(res.data) ? res.data : res.data?.content ?? [];

      const itemMap = new Map<number, Item>();
      itemList.forEach((it) => itemMap.set(it.id, it));

      const mappedList: StockHistoryRow[] = rows.map((i: any) => {
        const itemId = n(i.itemId ?? i.item_id ?? i.item?.id ?? 0);
        const it = itemMap.get(itemId);

        return {
          id: n(i.id),
          itemId,
          itemCode: String(i.itemCode ?? it?.itemCode ?? ""),
          itemName: String(i.itemName ?? it?.itemName ?? ""),
          changeType: String(i.changeType ?? i.type ?? i.historyType ?? ""),
          changeQty: n(i.changeQty ?? i.qty ?? i.quantity ?? 0),
          beforeQty: n(i.beforeQty ?? i.beforeStock ?? 0),
          afterQty: n(i.afterQty ?? i.afterStock ?? 0),
          refNo: String(i.refNo ?? i.referenceNo ?? i.orderNo ?? ""),
          remark: String(i.remark ?? ""),
          changedAt: String(i.changedAt ?? i.createdAt ?? i.regDate ?? ""),
        };
      });

      setHistoryList(mappedList);
    } catch (e: any) {
      console.error("❌ 재고변동이력 조회 실패", e?.response?.status, e?.response?.data);
      openAlertModal("error", "조회 실패", "재고변동이력 조회에 실패했습니다. 콘솔을 확인해 주세요.");
      setHistoryList([]);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (itemList.length > 0) {
      fetchHistory();
    }
  }, [itemList.length]);

  const filteredList = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return historyList;

    return historyList.filter(
      (item) =>
        item.itemCode.toLowerCase().includes(q) ||
        item.itemName.toLowerCase().includes(q) ||
        item.refNo.toLowerCase().includes(q) ||
        item.changeType.toLowerCase().includes(q)
    );
  }, [historyList, keyword]);

  const summary = useMemo(() => {
    return filteredList.reduce(
      (acc, cur) => {
        acc.totalCount += 1;
        acc.totalChangeQty += n(cur.changeQty);
        return acc;
      },
      { totalCount: 0, totalChangeQty: 0 }
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
                        재고변동이력
                      </TableTitle>

                      <div
                        style={{
                          marginTop: "6px",
                          fontSize: "14px",
                          color: "#6b7280",
                          fontWeight: 500,
                        }}
                      >
                        입고 / 출고 / 조정 이력
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
                          이력 건수 <strong>{summary.totalCount}</strong>
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
                          총 변동수량 <strong>{summary.totalChangeQty.toLocaleString()}</strong>
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
                          placeholder="품목코드/품목명/참조번호 검색"
                          value={keyword}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setKeyword(e.target.value)
                          }
                          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === "Enter") fetchHistory();
                          }}
                          style={{
                            width: "300px",
                            borderRadius: "10px",
                            border: "1px solid #dbe2ea",
                            padding: "10px 12px",
                          }}
                        />

                        <button
                          type="button"
                          onClick={fetchHistory}
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
                          <th style={thLeft}>일시</th>
                          <th style={thLeft}>품목코드</th>
                          <th style={thLeft}>품목명</th>
                          <th style={thCenter}>구분</th>
                          <th style={thRight}>변동수량</th>
                          <th style={thRight}>변동전</th>
                          <th style={thRight}>변동후</th>
                          <th style={thLeft}>참조번호</th>
                          <th style={thLeft}>비고</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredList.length === 0 ? (
                          <tr>
                            <td colSpan={9} style={emptyStyle}>
                              조회된 재고변동이력이 없습니다.
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
                              <td style={tdLeft}>{formatDateTime(item.changedAt)}</td>
                              <td style={{ ...tdLeft, fontWeight: 600, color: "#111827" }}>
                                {item.itemCode || "-"}
                              </td>
                              <td style={tdLeft}>{item.itemName || "-"}</td>
                              <td style={tdCenter}>
                                <span
                                  style={{
                                    ...getChangeTypeStyle(item.changeType),
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    minWidth: "64px",
                                    height: "30px",
                                    borderRadius: "999px",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    padding: "0 12px",
                                  }}
                                >
                                  {item.changeType || "-"}
                                </span>
                              </td>
                              <td style={{ ...tdRight, fontWeight: 600 }}>
                                {n(item.changeQty).toLocaleString()}
                              </td>
                              <td style={tdRight}>{n(item.beforeQty).toLocaleString()}</td>
                              <td style={tdRight}>{n(item.afterQty).toLocaleString()}</td>
                              <td style={tdLeft}>{item.refNo || "-"}</td>
                              <td style={tdLeft}>{item.remark || "-"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>

                  <BtnRight style={{ marginTop: "14px" }}>
                    <button
                      type="button"
                      onClick={fetchHistory}
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

export default StockHistoryStatus;