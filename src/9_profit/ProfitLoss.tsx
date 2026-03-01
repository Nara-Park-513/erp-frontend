import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Table } from "react-bootstrap";
import Top from "../include/Top";
import Header from "../include/Header";
import SideBar from "../include/SideBar";
import { Left, Right, Flex, TopWrap } from "../stylesjs/Content.styles";
import { JustifyContent } from "../stylesjs/Util.styles";
import { TableTitle } from "../stylesjs/Text.styles";
import { WhiteBtn } from "../stylesjs/Button.styles";
import Lnb from "../include/Lnb";

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
   axios (GeneralJournal과 동일)
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

/**
 * 계정 분류 규칙 (너 DB 계정체계에 맞게 여기만 고치면 됨)
 * - "71" 처럼 2자리만 있어도 OK
 * - "4100" 같은 4자리도 OK (startsWith)
 */
const GROUPS = {
  SALES: ["41"],       // 매출
  COGS: ["51"],        // 매출원가
  SGNA: ["52"],        // 판매관리비
  NON_OP_IN: ["71"],   // 영업외수익
  NON_OP_OUT: ["72"],  // 영업외비용
} as const;

const n = (v: any) => Number(v ?? 0) || 0;

/** dcType 표준화 (D/C 들어와도 처리) */
const normDc = (v: any): "DEBIT" | "CREDIT" | "UNKNOWN" => {
  const s = String(v ?? "").trim().toUpperCase();
  if (s === "DEBIT" || s === "D") return "DEBIT";
  if (s === "CREDIT" || s === "C") return "CREDIT";
  return "UNKNOWN";
};

/** 보편적인 "부호 있는 금액" 규칙: CREDIT +, DEBIT - */
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

  /** ✅ 전표 목록 -> 상세 병렬 조회해서 lines 100% 확보 */
  const fetchJournals = async () => {
    try {
      setLoading(true);

      // 1) 목록
      const res = await api.get(JOURNAL_API, { params: { page: 0, size: 2000 } });
      const baseList = Array.isArray(res.data) ? res.data : res.data?.content ?? [];

      const ids: number[] = baseList
        .map((j: any) => j?.id)
        .filter((id: any) => typeof id === "number");

      // 2) 상세 병렬(라인 포함)
      const detailList: Journal[] = await Promise.all(
        ids.map(async (id) => {
          const d = await api.get(`${JOURNAL_API}/${id}`);
          return d.data as Journal;
        })
      );

      // 디버그 (필요 시)
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

  /** ✅ 손익 계산(보편적 방식) */
  const pl = useMemo(() => {
    let sales = 0;        // 매출(+)가 되도록
    let cogs = 0;         // 원가(+)가 되도록
    let sgna = 0;         // 판관비(+)가 되도록
    let nonOpIncome = 0;  // 영업외수익(+)가 되도록
    let nonOpExpense = 0; // 영업외비용(+)가 되도록

    for (const j of journalList) {
      for (const l of j.lines || []) {
        const code = String(l.accountCode ?? "").trim();
        if (!code) continue;

        const sAmt = signedAmount(l.dcType, l.amount); // CREDIT + / DEBIT -

        // 매출: 보통 대변(CREDIT) → sAmt가 +로 누적됨
        if (hasPrefix(code, GROUPS.SALES)) {
          sales += sAmt;
        }
        // 원가/비용: 보통 차변(DEBIT) → sAmt가 -로 누적됨
        // 화면엔 “+비용”으로 보이게 절대값으로 처리
        else if (hasPrefix(code, GROUPS.COGS)) {
          cogs += -sAmt; // -(-금액)=+비용
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

  const menu = [{ key: "profit", label: "손익계산서", path: "/profit" }];

  return (
    <>
      <div className="fixed-top">
        <Top />
        <Header />
      </div>
      <SideBar />

      <Container fluid>
        <Row>
          <Col>
            <Flex>
              <Left>
                <Lnb menuList={menu} title="손익계산서" />
              </Left>

              <Right>
                <TopWrap />
                <JustifyContent>
                  <TableTitle>손익계산서</TableTitle>
                  <WhiteBtn className="mx-2" onClick={fetchJournals}>
                    새로고침
                  </WhiteBtn>
                  {loading && <span style={{ marginLeft: 8 }}>로딩중…</span>}
                </JustifyContent>

                <Table bordered>
                  <tbody>
                    {pl.map((r, idx) => (
                      <tr
                        key={idx}
                        style={{
                          fontWeight: r.title.includes("이익") ? 700 : 400,
                        }}
                      >
                        <td>{r.title}</td>
                        <td className="text-end">{n(r.amount).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Right>
            </Flex>
          </Col>
        </Row>
      </Container>
    </>
  );
}