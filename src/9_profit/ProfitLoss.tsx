import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Table } from "react-bootstrap";
import Top from "../include/Top";
import Header from "../include/Header";
// import SideBar from "../include/SideBar";
import { Left, Right, Flex, TopWrap } from "../stylesjs/Content.styles";
import { TableTitle } from "../stylesjs/Text.styles";
// import Lnb from "../include/Lnb";

/* =========================
   타입
========================= */
type DcType = "DEBIT" | "CREDIT" | string;

type JournalLine = {
  accountCode: string;
  accountName?: string | null;
  dcType: DcType;
  amount: number;
};

type Journal = {
  id: number;
  journalDate: string;
  lines: JournalLine[];
};

type PLRow = {
  title: string;
  amount: number;
};

/* =========================
   axios
========================= */
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

/* =========================
   설정
========================= */
const JOURNAL_API = "/api/acc/journals";

const GROUPS = {
  SALES: ["41"],
  COGS: ["51"],
  SGNA: ["52"],
  NON_OP_IN: ["71"],
  NON_OP_OUT: ["72"],
} as const;

const n = (v: any) => Number(v ?? 0) || 0;

const normDc = (v: any): "DEBIT" | "CREDIT" | "UNKNOWN" => {
  const s = String(v ?? "").trim().toUpperCase();
  if (s === "DEBIT" || s === "D") return "DEBIT";
  if (s === "CREDIT" || s === "C") return "CREDIT";
  return "UNKNOWN";
};

const signedAmount = (dcType: any, amount: any) => {
  const dc = normDc(dcType);
  const amt = n(amount);
  if (dc === "CREDIT") return +amt;
  if (dc === "DEBIT") return -amt;
  return 0;
};

const hasPrefix = (code: string, prefixes: readonly string[]) => {
  const c = String(code ?? "").trim();
  if (!c) return false;
  return prefixes.some((p) => c.startsWith(p));
};

/* =========================
   컴포넌트
========================= */
export default function ProfitLoss() {
  const [journalList, setJournalList] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchJournals = async () => {
    try {
      setLoading(true);

      const res = await api.get(JOURNAL_API, { params: { page: 0, size: 2000 } });
      const baseList = Array.isArray(res.data) ? res.data : res.data?.content ?? [];

      const ids: number[] = baseList
        .map((j: any) => j?.id)
        .filter((id: any) => typeof id === "number");

      const detailList: Journal[] = await Promise.all(
        ids.map(async (id) => {
          const d = await api.get(`${JOURNAL_API}/${id}`);
          return d.data as Journal;
        })
      );

      console.log("✅ PL detail sample:", detailList?.[0]);
      console.log("✅ PL detail sample lines:", detailList?.[0]?.lines);

      setJournalList(detailList);
    } catch (e) {
      console.error("손익계산서 전표 조회 실패", e);
      setJournalList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const pl = useMemo(() => {
    let sales = 0;
    let cogs = 0;
    let sgna = 0;
    let nonOpIncome = 0;
    let nonOpExpense = 0;

    for (const j of journalList) {
      for (const l of j.lines || []) {
        const code = String(l.accountCode ?? "").trim();
        if (!code) continue;

        const sAmt = signedAmount(l.dcType, l.amount);

        if (hasPrefix(code, GROUPS.SALES)) {
          sales += sAmt;
        } else if (hasPrefix(code, GROUPS.COGS)) {
          cogs += -sAmt;
        } else if (hasPrefix(code, GROUPS.SGNA)) {
          sgna += -sAmt;
        } else if (hasPrefix(code, GROUPS.NON_OP_IN)) {
          nonOpIncome += sAmt;
        } else if (hasPrefix(code, GROUPS.NON_OP_OUT)) {
          nonOpExpense += -sAmt;
        }
      }
    }

    const grossProfit = sales - cogs;
    const operatingProfit = grossProfit - sgna;
    const ordinaryProfit = operatingProfit + nonOpIncome - nonOpExpense;

    const rows: PLRow[] = [
      { title: "매출액", amount: sales },
      { title: "매출원가", amount: cogs },
      { title: "매출총이익", amount: grossProfit },
      { title: "판매관리비", amount: sgna },
      { title: "영업이익", amount: operatingProfit },
      { title: "영업외수익", amount: nonOpIncome },
      { title: "영업외비용", amount: nonOpExpense },
      { title: "당기순이익", amount: ordinaryProfit },
    ];

    return rows;
  }, [journalList]);

  // const menu = [{ key: "profit", label: "손익계산서", path: "/profit" }];

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
                  {/* <Lnb menuList={menu} title="손익계산서" /> */}
                </Left>

                <Right style={{ marginTop: "-20px" }}>
                  <TopWrap />

                  <div
                    style={{
                      marginBottom: "14px",
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "12px",
                      flexWrap: "wrap",
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
                        손익계산서
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

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        type="button"
                        onClick={fetchJournals}
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

                      {loading && (
                        <span
                          style={{
                            fontSize: "14px",
                            color: "#6b7280",
                            fontWeight: 500,
                          }}
                        >
                          로딩중…
                        </span>
                      )}
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
                      <tbody>
                        {pl.length === 0 ? (
                          <tr>
                            <td
                              colSpan={2}
                              style={{
                                textAlign: "center",
                                padding: "44px 16px",
                                color: "#98a2b3",
                                fontSize: "14px",
                              }}
                            >
                              손익 데이터가 없습니다.
                            </td>
                          </tr>
                        ) : (
                          pl.map((r, idx) => {
                            const isProfitRow = r.title.includes("이익");
                            const isNegative = n(r.amount) < 0;

                            return (
                              <tr
                                key={idx}
                                style={{
                                  backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fcfdff",
                                }}
                              >
                                <td
                                  style={{
                                    padding: "15px 18px",
                                    verticalAlign: "middle",
                                    color: isProfitRow ? "#111827" : "#374151",
                                    fontWeight: isProfitRow ? 700 : 500,
                                    borderBottom: "1px solid #eef2f7",
                                  }}
                                >
                                  {r.title}
                                </td>
                                <td
                                  style={{
                                    padding: "15px 18px",
                                    verticalAlign: "middle",
                                    textAlign: "right",
                                    color: isNegative ? "#b42318" : "#111827",
                                    fontWeight: isProfitRow ? 800 : 600,
                                    borderBottom: "1px solid #eef2f7",
                                  }}
                                >
                                  {n(r.amount).toLocaleString()}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Right>
              </Flex>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}