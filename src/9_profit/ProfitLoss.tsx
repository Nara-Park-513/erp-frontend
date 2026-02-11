import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Table } from "react-bootstrap";
import Top from "../include/Top";
import Header from "../include/Header";
import SideBar from "../include/SideBar";
import {
  Left,
  Right,
  Flex,
  TopWrap,
} from "../stylesjs/Content.styles";
import { JustifyContent } from "../stylesjs/Util.styles";
import { TableTitle } from "../stylesjs/Text.styles";
import Lnb from "../include/Lnb";

/* =========================
   타입
========================= */

type JournalLine = {
  accountCode: string;
  accountName?: string;
  dcType: "DEBIT" | "CREDIT";
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
   설정
========================= */

const API_BASE = "http://localhost:8888/api/acc/journals";

/* 계정코드 분류 (예시) */
const SALES_PREFIX = "41";
const COGS_PREFIX = "51";
const SGNA_PREFIX = "52";
const NON_OP_IN_PREFIX = "71";
const NON_OP_OUT_PREFIX = "72";

/* =========================
   컴포넌트
========================= */

const ProfitLoss = () => {
  const [journalList, setJournalList] = useState<Journal[]>([]);

  /* ===== 전표 조회 ===== */
// ✅ axios 인스턴스 (GeneralJournal과 동일하게)
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

const API_BASE = "/api/acc/journals";

const fetchJournals = async () => {
  try {
    const res = await api.get<any>(API_BASE, { params: { page: 0, size: 2000 } });
    const baseList = Array.isArray(res.data) ? res.data : res.data?.content ?? [];

    console.log("PL base sample:", baseList?.[0], "lines:", baseList?.[0]?.lines);

    const ids: number[] = baseList
      .map((j: any) => j?.id)
      .filter((id: any) => typeof id === "number");

    // id가 없으면 baseList로라도 세팅
    if (ids.length === 0) {
      setJournalList(baseList.map((j: any) => ({ ...j, lines: j.lines ?? [] })));
      return;
    }

    const detailList: Journal[] = await Promise.all(
      ids.map(async (id) => {
        const d = await api.get<Journal>(`${API_BASE}/${id}`);
        return d.data;
      })
    );

    console.log("PL detail sample lines:", detailList?.[0]?.lines);

    setJournalList(detailList);
  } catch (e) {
    console.error("전표 조회 실패", e);
  }
};



  useEffect(() => {
    fetchJournals();
  }, []);

  /* ===== 손익 계산 ===== */
  const plData = useMemo(() => {
    let sales = 0;
    let cogs = 0;
    let sgna = 0;
    let nonOpIncome = 0;
    let nonOpExpense = 0;

    journalList.forEach((j) => {
      j.lines?.forEach((l) => {
        const amt = Number(l.amount) || 0;

        /* 매출 */
        if (l.accountCode.startsWith(SALES_PREFIX)) {
          sales += l.dcType === "CREDIT" ? amt : -amt;
        }

        /* 매출원가 */
        else if (l.accountCode.startsWith(COGS_PREFIX)) {
          cogs += l.dcType === "DEBIT" ? amt : -amt;
        }

        /* 판관비 */
        else if (l.accountCode.startsWith(SGNA_PREFIX)) {
          sgna += l.dcType === "DEBIT" ? amt : -amt;
        }

        /* 영업외수익 */
        else if (l.accountCode.startsWith(NON_OP_IN_PREFIX)) {
          nonOpIncome += l.dcType === "CREDIT" ? amt : -amt;
        }

        /* 영업외비용 */
        else if (l.accountCode.startsWith(NON_OP_OUT_PREFIX)) {
          nonOpExpense += l.dcType === "DEBIT" ? amt : -amt;
        }
      });
    });

    const grossProfit = sales - cogs;
    const operatingProfit = grossProfit - sgna;
    const ordinaryProfit = operatingProfit + nonOpIncome - nonOpExpense;

    const rows: PLRow[] = [
      { title: "매출액", amount: sales },
      { title: "매출원가", amount: -cogs },
      { title: "매출총이익", amount: grossProfit },
      { title: "판매관리비", amount: -sgna },
      { title: "영업이익", amount: operatingProfit },
      { title: "영업외수익", amount: nonOpIncome },
      { title: "영업외비용", amount: -nonOpExpense },
      { title: "당기순이익", amount: ordinaryProfit },
    ];

    return rows;
  }, [journalList]);

const stockMenu = [
  { key: "status", label: "손익계산서", path: "/profit" },
];

  /* ===== 화면 ===== */
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
<Lnb menuList={stockMenu} title="손익계산서"/>
              </Left>
              <Right>
                <TopWrap />
                <JustifyContent>
                  <TableTitle>손익계산서</TableTitle>
                </JustifyContent>

                <Table bordered>
                  <tbody>
                    {plData.map((r, idx) => (
                      <tr
                        key={idx}
                        style={{
                          fontWeight:
                            r.title.includes("이익") ? 700 : 400,
                        }}
                      >
                        <td>{r.title}</td>
                        <td className="text-end">
                          {r.amount.toLocaleString()}
                        </td>
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
};

export default ProfitLoss;