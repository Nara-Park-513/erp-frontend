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
   타입 정의
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

const API_BASE = "http://localhost:8888/api/acc/journals";

/** 자금 계정 (현금/예금) */
const CASH_ACCOUNTS = ["1010", "1020", "1030"]; 
// 1010: 현금 / 1020: 보통예금 / 1030: 당좌예금 (예시)

/* =========================
   컴포넌트
========================= */

const FundStatus = () => {
  const [journalList, setJournalList] = useState<Journal[]>([]);

  /* ===== 전표 목록 조회 ===== */
  const fetchJournals = async () => {
    try {
      const res = await axios.get(API_BASE, {
        params: { page: 0, size: 1000 },
      });
      const list = res.data?.content ?? res.data ?? [];
      setJournalList(list);
    } catch (e) {
      console.error("전표 조회 실패", e);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  /* ===== 자금현황 계산 ===== */
  const fundList = useMemo<FundRow[]>(() => {
    const map = new Map<string, FundRow>();

    journalList.forEach((j) => {
      (j.lines || []).forEach((l) => {
        if (!CASH_ACCOUNTS.includes(l.accountCode)) return;

        if (!map.has(l.accountCode)) {
          map.set(l.accountCode, {
            accountCode: l.accountCode,
            accountName: l.accountName || "",
            debitTotal: 0,
            creditTotal: 0,
            balance: 0,
          });
        }

        const row = map.get(l.accountCode)!;

        if (l.dcType === "DEBIT") {
          row.debitTotal += Number(l.amount) || 0;
        } else {
          row.creditTotal += Number(l.amount) || 0;
        }

        row.balance = row.debitTotal - row.creditTotal;
      });
    });

    return Array.from(map.values());
  }, [journalList]);

  const totalBalance = fundList.reduce((s, f) => s + f.balance, 0);

  const stockMenu = [
  { key: "status", label: "자금현황", path: "/fund" },
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
   <Lnb menuList={stockMenu} title="자금현황"/>
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
                        <td className="text-end">
                          {f.debitTotal.toLocaleString()}
                        </td>
                        <td className="text-end">
                          {f.creditTotal.toLocaleString()}
                        </td>
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
                      <th className="text-end">
                        {totalBalance.toLocaleString()}
                      </th>
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
};

export default FundStatus;
