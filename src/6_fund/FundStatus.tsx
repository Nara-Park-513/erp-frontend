import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Table } from "react-bootstrap";
import Top from "../include/Top";
import Header from "../include/Header";
import SideBar from "../include/SideBar";
import { Left, Right, Flex, TopWrap } from "../stylesjs/Content.styles";
import { JustifyContent } from "../stylesjs/Util.styles";
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

    // ✅ 핵심: id가 없으면 상세조회 못하니까 baseList 그대로 세팅
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
        //if (!CASH_ACCOUNTS.includes(code)) return;

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
        <Top />
        <Header />
      </div>
      <SideBar />

      <Container fluid>
        <Row>
          <Col>
            <Flex>
              <Left>
                <Lnb menuList={stockMenu} title="자금현황" />
              </Left>

              <Right>
                <TopWrap />
                <JustifyContent>
                  <TableTitle>자금현황표</TableTitle>
                </JustifyContent>

                <Table bordered hover responsive>
                  <thead>
                    <tr>
                      <th>계정코드</th>
                      <th>계정명</th>
                      <th className="text-end">차변합</th>
                      <th className="text-end">대변합</th>
                      <th className="text-end">잔액</th>
                    </tr>
                  </thead>

                  <tbody>
                    {fundList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center">
                          자금 내역이 없습니다
                        </td>
                      </tr>
                    )}

                    {fundList.map((f) => (
                      <tr key={f.accountCode}>
                        <td>{f.accountCode}</td>
                        <td>{f.accountName || "-"}</td>
                        <td className="text-end">{f.debitTotal.toLocaleString()}</td>
                        <td className="text-end">{f.creditTotal.toLocaleString()}</td>
                        <td
                          className="text-end"
                          style={{
                            fontWeight: 700,
                            color: f.balance < 0 ? "crimson" : "black",
                          }}
                        >
                          {f.balance.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    <tr>
                      <th colSpan={4} className="text-end">
                        총 자금 잔액
                      </th>
                      <th className="text-end">{totalBalance.toLocaleString()}</th>
                    </tr>
                  </tfoot>
                </Table>
              </Right>
            </Flex>
          </Col>
        </Row>
      </Container>
    </>
  );
}