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
  lineRemark?: string;
};

type Journal = {
  id: number;
  journalNo: string;
  journalDate: string;
  customerName?: string;
  lines: JournalLine[];
};

type NoteRow = {
  journalDate: string;
  journalNo: string;
  customerName: string;
  debit: number;
  credit: number;
  balance: number;
  remark: string;
};

/* =========================
   설정
========================= */

const API_BASE = "http://localhost:8888/api/acc/journals";

/** 지급어음 계정 */
const NOTE_PAYABLE_ACCOUNTS = ["2110"]; 

/* =========================
   컴포넌트
========================= */

const PayableNoteStatus = () => {
  const [journalList, setJournalList] = useState<Journal[]>([]);

  /* ===== 전표 조회 ===== */
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

  /* ===== 지급어음 데이터 생성 ===== */
  const noteList = useMemo<NoteRow[]>(() => {
    let runningBalance = 0;
    const rows: NoteRow[] = [];

    // 날짜순 정렬
    const sorted = [...journalList].sort(
      (a, b) => a.journalDate.localeCompare(b.journalDate)
    );

    sorted.forEach((j) => {
      j.lines?.forEach((l) => {
        if (!NOTE_PAYABLE_ACCOUNTS.includes(l.accountCode)) return;

        const debit = l.dcType === "DEBIT" ? l.amount : 0;
        const credit = l.dcType === "CREDIT" ? l.amount : 0;

        runningBalance += credit - debit;

        rows.push({
          journalDate: j.journalDate,
          journalNo: j.journalNo,
          customerName: j.customerName || "",
          debit,
          credit,
          balance: runningBalance,
          remark: l.lineRemark || "",
        });
      });
    });

    return rows;
  }, [journalList]);

  const totalCredit = noteList.reduce((s, r) => s + r.credit, 0);
  const totalDebit = noteList.reduce((s, r) => s + r.debit, 0);
  const finalBalance = totalCredit - totalDebit;

  const stockMenu = [
  { key: "status", label: "지급어음조회", path: "/pay" },
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
                  <Lnb menuList={stockMenu} title="지급어음조회"/>
              </Left>
              <Right>
                <TopWrap />

                <JustifyContent>
                  <TableTitle>지급어음 조회</TableTitle>
                </JustifyContent>

                <Table bordered hover responsive>
                  <thead>
                    <tr>
                      <th>일자</th>
                      <th>전표번호</th>
                      <th>거래처</th>
                      <th className="text-end">차변(결제)</th>
                      <th className="text-end">대변(발행)</th>
                      <th className="text-end">잔액</th>
                      <th>적요</th>
                    </tr>
                  </thead>
                  <tbody>
                    {noteList.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center">
                          지급어음 내역이 없습니다
                        </td>
                      </tr>
                    )}

                    {noteList.map((r, idx) => (
                      <tr key={idx}>
                        <td>{r.journalDate}</td>
                        <td>{r.journalNo}</td>
                        <td>{r.customerName}</td>
                        <td className="text-end">
                          {r.debit ? r.debit.toLocaleString() : "-"}
                        </td>
                        <td className="text-end">
                          {r.credit ? r.credit.toLocaleString() : "-"}
                        </td>
                        <td
                          className="text-end"
                          style={{
                            fontWeight: 700,
                            color: r.balance < 0 ? "crimson" : "black",
                          }}
                        >
                          {r.balance.toLocaleString()}
                        </td>
                        <td>{r.remark}</td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    <tr>
                      <th colSpan={3} className="text-end">
                        합계
                      </th>
                      <th className="text-end">
                        {totalDebit.toLocaleString()}
                      </th>
                      <th className="text-end">
                        {totalCredit.toLocaleString()}
                      </th>
                      <th className="text-end">
                        {finalBalance.toLocaleString()}
                      </th>
                      <th></th>
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

export default PayableNoteStatus;