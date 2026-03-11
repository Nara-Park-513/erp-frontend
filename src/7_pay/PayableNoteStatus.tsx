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

    const sorted = [...journalList].sort((a, b) =>
      a.journalDate.localeCompare(b.journalDate)
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

  // const stockMenu = [{ key: "status", label: "지급어음조회", path: "/pay" }];

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
                  {/* <Lnb menuList={stockMenu} title="지급어음조회" /> */}
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
                        지급어음 조회
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
                            일자
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
                            전표번호
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
                            거래처
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
                            차변(결제)
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
                            대변(발행)
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
                          <th
                            style={{
                              padding: "15px 18px",
                              fontSize: "14px",
                              fontWeight: 700,
                              color: "#475467",
                              borderBottom: "1px solid #e8ecf4",
                            }}
                          >
                            적요
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {noteList.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7}
                              style={{
                                textAlign: "center",
                                padding: "44px 16px",
                                color: "#98a2b3",
                                fontSize: "14px",
                              }}
                            >
                              지급어음 내역이 없습니다.
                            </td>
                          </tr>
                        ) : (
                          noteList.map((r, idx) => (
                            <tr
                              key={idx}
                              style={{
                                backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fcfdff",
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
                                {r.journalDate}
                              </td>
                              <td
                                style={{
                                  padding: "14px 18px",
                                  verticalAlign: "middle",
                                  color: "#374151",
                                  borderBottom: "1px solid #eef2f7",
                                }}
                              >
                                {r.journalNo}
                              </td>
                              <td
                                style={{
                                  padding: "14px 18px",
                                  verticalAlign: "middle",
                                  color: "#374151",
                                  borderBottom: "1px solid #eef2f7",
                                }}
                              >
                                {r.customerName}
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
                                {r.debit ? r.debit.toLocaleString() : "-"}
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
                                {r.credit ? r.credit.toLocaleString() : "-"}
                              </td>
                              <td
                                style={{
                                  padding: "14px 18px",
                                  verticalAlign: "middle",
                                  borderBottom: "1px solid #eef2f7",
                                  textAlign: "right",
                                  fontWeight: 700,
                                  color: r.balance < 0 ? "#b42318" : "#111827",
                                }}
                              >
                                {r.balance.toLocaleString()}
                              </td>
                              <td
                                style={{
                                  padding: "14px 18px",
                                  verticalAlign: "middle",
                                  color: "#4b5563",
                                  borderBottom: "1px solid #eef2f7",
                                }}
                              >
                                {r.remark}
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
                            colSpan={3}
                            style={{
                              padding: "16px 18px",
                              textAlign: "right",
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
                            {totalDebit.toLocaleString()}
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
                            {totalCredit.toLocaleString()}
                          </th>
                          <th
                            style={{
                              padding: "16px 18px",
                              textAlign: "right",
                              fontSize: "15px",
                              fontWeight: 800,
                              color: finalBalance < 0 ? "#b42318" : "#111827",
                              borderTop: "1px solid #e8ecf4",
                            }}
                          >
                            {finalBalance.toLocaleString()}
                          </th>
                          <th
                            style={{
                              borderTop: "1px solid #e8ecf4",
                              backgroundColor: "#f8fafc",
                            }}
                          ></th>
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
};

export default PayableNoteStatus;