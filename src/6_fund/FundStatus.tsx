import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Table } from "react-bootstrap";
import Top from "../include/Top";
import Header from "../include/Header";
import SideBar from "../include/SideBar";
import { Left, Right, Flex, TopWrap } from "../stylesjs/Content.styles";
import { TableTitle } from "../stylesjs/Text.styles";
import Lnb from "../include/Lnb";

/* =========================
   타입
========================= */
type JournalLine = {
  accountCode: string;
  accountName?: string;
  dcType: string;
  amount: number;
};

type Journal = {
  id: number;
  journalDate: string;
  lines?: JournalLine[];
};

type FundRow = {
  accountCode: string;
  accountName: string;
  debitTotal: number;
  creditTotal: number;
  balance: number;
};

/* =========================
   설정
========================= */
const API_BASE = "/api/acc/journals";
const CASH_ACCOUNTS = ["1010", "1020", "1030"];

/* =========================
   axios 인스턴스
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

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.log("❌ API ERROR", err?.response?.status, err?.response?.data);
    return Promise.reject(err);
  }
);

const n = (v: any) => Number(v ?? 0) || 0;

const normalizeDcType = (v: any): "DEBIT" | "CREDIT" | "UNKNOWN" => {
  const s = String(v ?? "").trim().toUpperCase();
  if (s === "DEBIT" || s === "D") return "DEBIT";
  if (s === "CREDIT" || s === "C") return "CREDIT";
  return "UNKNOWN";
};

/* =========================
   컴포넌트
========================= */
export default function FundStatus() {
  const [journalList, setJournalList] = useState<Journal[]>([]);

  const fetchJournals = async () => {
    try {
      const res = await api.get<any>(API_BASE, { params: { page: 0, size: 1000 } });

      const baseList: Journal[] = Array.isArray(res.data)
        ? res.data
        : res.data?.content ?? [];

      console.log("✅ baseList sample:", baseList[0]);

      const ids: number[] = baseList
        .map((j: any) => j?.id)
        .filter((id: any) => typeof id === "number");

      if (ids.length === 0) {
        console.warn("⚠️ 목록에 id가 없어서 상세조회 불가 → baseList 사용");
        setJournalList(
          baseList.map((j: any) => ({
            ...j,
            lines: j.lines ?? [],
          }))
        );
        return;
      }

      const detailList: Journal[] = await Promise.all(
        ids.map(async (id) => {
          const d = await api.get<Journal>(`${API_BASE}/${id}`);
          return d.data;
        })
      );

      console.log("✅ detailList[0].lines:", detailList[0]?.lines);
      setJournalList(detailList);
    } catch (e) {
      console.error("전표 조회 실패", e);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const fundList = useMemo<FundRow[]>(() => {
    const map = new Map<string, FundRow>();

    journalList.forEach((j) => {
      (j.lines ?? []).forEach((l: JournalLine) => {
        const code = String(l.accountCode ?? "").trim();
        // if (!CASH_ACCOUNTS.includes(code)) return;

        if (!map.has(code)) {
          map.set(code, {
            accountCode: code,
            accountName: l.accountName || "",
            debitTotal: 0,
            creditTotal: 0,
            balance: 0,
          });
        }

        const row = map.get(code)!;
        const dc = normalizeDcType(l.dcType);

        if (dc === "DEBIT") row.debitTotal += n(l.amount);
        else if (dc === "CREDIT") row.creditTotal += n(l.amount);

        row.balance = row.debitTotal - row.creditTotal;
      });
    });

    return Array.from(map.values());
  }, [journalList]);

  const totalBalance = fundList.reduce((s, f) => s + f.balance, 0);
  const stockMenu = [{ key: "status", label: "자금현황", path: "/fund" }];

  return (
    <>
      <div className="fixed-top">
        <Header />
        <Top />
      </div>

      {/*<SideBar />*/}

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
                  {/*<Lnb menuList={stockMenu} title="자금현황" />*/}
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
                        자금현황표
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
                            계정코드
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
                            계정명
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
                            차변합
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
                            대변합
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
                            잔액
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {fundList.length === 0 ? (
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
                              자금 내역이 없습니다.
                            </td>
                          </tr>
                        ) : (
                          fundList.map((f, index) => (
                            <tr
                              key={f.accountCode}
                              style={{
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
                                {f.accountCode}
                              </td>
                              <td
                                style={{
                                  padding: "14px 18px",
                                  verticalAlign: "middle",
                                  color: "#374151",
                                  borderBottom: "1px solid #eef2f7",
                                }}
                              >
                                {f.accountName || "-"}
                              </td>
                              <td
                                style={{
                                  padding: "14px 18px",
                                  verticalAlign: "middle",
                                  color: "#374151",
                                  borderBottom: "1px solid #eef2f7",
                                  textAlign: "right",
                                }}
                              >
                                {f.debitTotal.toLocaleString()}
                              </td>
                              <td
                                style={{
                                  padding: "14px 18px",
                                  verticalAlign: "middle",
                                  color: "#374151",
                                  borderBottom: "1px solid #eef2f7",
                                  textAlign: "right",
                                }}
                              >
                                {f.creditTotal.toLocaleString()}
                              </td>
                              <td
                                style={{
                                  padding: "14px 18px",
                                  verticalAlign: "middle",
                                  borderBottom: "1px solid #eef2f7",
                                  textAlign: "right",
                                  fontWeight: 700,
                                  color: f.balance < 0 ? "#b42318" : "#111827",
                                }}
                              >
                                {f.balance.toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>

                      <tfoot>
                        <tr
                          style={{
                            backgroundColor: "#f8fafc",
                          }}
                        >
                          <th
                            colSpan={4}
                            style={{
                              padding: "16px 18px",
                              textAlign: "right",
                              fontSize: "14px",
                              fontWeight: 700,
                              color: "#475467",
                              borderTop: "1px solid #e8ecf4",
                            }}
                          >
                            총 자금 잔액
                          </th>
                          <th
                            style={{
                              padding: "16px 18px",
                              textAlign: "right",
                              fontSize: "15px",
                              fontWeight: 800,
                              color: totalBalance < 0 ? "#b42318" : "#111827",
                              borderTop: "1px solid #e8ecf4",
                            }}
                          >
                            {totalBalance.toLocaleString()}
                          </th>
                        </tr>
                      </tfoot>
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