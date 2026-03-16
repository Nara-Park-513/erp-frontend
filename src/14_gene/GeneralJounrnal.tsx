import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Table, Modal } from "react-bootstrap";
import Top from "../include/Top";
import Header from "../include/Header";
// import SideBar from "../include/SideBar";
import { Left, Right, Flex, TopWrap } from "../stylesjs/Content.styles";
import { TableTitle } from "../stylesjs/Text.styles";
import { InputGroup, Search } from "../stylesjs/Input.styles";
import { WhiteBtn, BtnRight } from "../stylesjs/Button.styles";
// import Lnb from "../include/Lnb";

import GeneralJournalModal, {
  Journal,
  JournalLine,
} from "../component/journal/GeneralJournalModal";
import "../Auth.css";

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

const API_BASE = "/api/acc/journals";

type ColumnDef = { key: string; label: string };

type Customer = {
  id: number;
  customerName: string;
  customerCode?: string;
  ceoName?: string;
  phone?: string;
  email?: string;
  address?: string;
  remark?: string;
  detailAddress?: string;
  customerType?: string;
};

type ApiJournal = {
  id?: number;
  journalNo?: string;
  journalDate?: string;
  remark?: string;
  status?: string;
  customer?: {
    id?: number | null;
    customerName?: string;
    name?: string;
  } | null;
  customerName?: string;
  lines?: Array<{
    id?: number;
    accountCode?: string;
    accountName?: string;
    dcType?: "DEBIT" | "CREDIT";
    amount?: number;
    lineRemark?: string;
  }>;
};

const emptyJournal = (): Journal => ({
  journalNo: "",
  journalDate: new Date().toISOString().slice(0, 10),
  customerId: null,
  customerName: "",
  remark: "",
  status: "DRAFT",
  lines: [
    { accountCode: "", accountName: "", dcType: "DEBIT", amount: 0, lineRemark: "" },
    { accountCode: "", accountName: "", dcType: "CREDIT", amount: 0, lineRemark: "" },
  ],
});

const normalizeJournalFromApi = (data: ApiJournal): Journal => {
  const normalizedLines: JournalLine[] =
    (data.lines ?? []).map((line) => ({
      accountCode: line.accountCode ?? "",
      accountName: line.accountName ?? "",
      dcType: line.dcType ?? "DEBIT",
      amount: Number(line.amount) || 0,
      lineRemark: line.lineRemark ?? "",
    })) || [];

  return {
    journalNo: data.journalNo ?? "",
    journalDate: data.journalDate ?? new Date().toISOString().slice(0, 10),
    customerId: data.customer?.id ?? null,
    customerName: data.customer?.customerName ?? data.customer?.name ?? data.customerName ?? "",
    remark: data.remark ?? "",
    status: data.status ?? "DRAFT",
    lines:
      normalizedLines.length > 0
        ? normalizedLines
        : [
            { accountCode: "", accountName: "", dcType: "DEBIT", amount: 0, lineRemark: "" },
            { accountCode: "", accountName: "", dcType: "CREDIT", amount: 0, lineRemark: "" },
          ],
  };
};

export default function GeneralJournal() {
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [show, setShow] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [keyword, setKeyword] = useState("");
  const [journalList, setJournalList] = useState<any[]>([]);
  const [journal, setJournal] = useState<Journal>(emptyJournal());

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error" | "warning">("warning");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isConfirmModal, setIsConfirmModal] = useState(false);

  const columns: ColumnDef[] = [
    { key: "journalNo", label: "전표번호" },
    { key: "journalDate", label: "전표일자" },
    { key: "customerName", label: "거래처" },
    { key: "remark", label: "적요" },
    { key: "debitTotal", label: "차변합" },
    { key: "creditTotal", label: "대변합" },
    { key: "status", label: "상태" },
  ];

  const openAlertModal = (
    type: "success" | "error" | "warning",
    title: string,
    message: string
  ) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setIsConfirmModal(false);
    setShowAlertModal(true);
  };

  const openConfirmModal = (
    type: "success" | "error" | "warning",
    title: string,
    message: string
  ) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setIsConfirmModal(true);
    setShowAlertModal(true);
  };

  const closeAlertModal = () => {
    setShowAlertModal(false);
    setIsConfirmModal(false);
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get("/api/acc/customers");
        const rows = Array.isArray(res.data) ? res.data : res.data?.content ?? [];
        setCustomerList(rows);
      } catch (e) {
        console.error("거래처 목록 조회 실패", e);
      }
    };
    fetchCustomers();
  }, []);

  const totals = useMemo(() => {
    const debitTotal = (journal.lines || [])
      .filter((l) => l.dcType === "DEBIT")
      .reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

    const creditTotal = (journal.lines || [])
      .filter((l) => l.dcType === "CREDIT")
      .reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

    return { debitTotal, creditTotal };
  }, [journal.lines]);

  const fetchJournals = async () => {
    try {
      const res = await api.get(API_BASE, {
        params: {
          page: 0,
          size: 20,
          q: keyword?.trim() ? keyword.trim() : undefined,
        },
      });

      const list = Array.isArray(res.data) ? res.data : res.data?.content ?? [];

      const normalized = list.map((j: any) => {
        const lines: JournalLine[] = (j.lines ?? []).map((l: any) => ({
          accountCode: l.accountCode ?? "",
          accountName: l.accountName ?? "",
          dcType: l.dcType ?? "DEBIT",
          amount: Number(l.amount) || 0,
          lineRemark: l.lineRemark ?? "",
        }));

        const debitTotal = lines
          .filter((l) => l.dcType === "DEBIT")
          .reduce((s, l) => s + (Number(l.amount) || 0), 0);

        const creditTotal = lines
          .filter((l) => l.dcType === "CREDIT")
          .reduce((s, l) => s + (Number(l.amount) || 0), 0);

        return {
          ...j,
          customerName: j.customerName ?? j.customer?.customerName ?? j.customer?.name ?? "-",
          debitTotal,
          creditTotal,
        };
      });

      setJournalList(normalized);
    } catch (e) {
      console.error("전표 조회 실패", e);
    }
  };

  useEffect(() => {
    fetchJournals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    setShow(false);
    setSelectedId(null);
    setJournal(emptyJournal());
  };

  const openDetail = async (id: number) => {
    try {
      const res = await api.get(`${API_BASE}/${id}`);
      setSelectedId(id);
      setJournal(normalizeJournalFromApi(res.data));
      setShow(true);
    } catch (e) {
      console.error("전표 상세 조회 실패", e);
    }
  };

  const addLine = () => {
    setJournal((prev) => ({
      ...prev,
      lines: [
        ...(prev.lines || []),
        { accountCode: "", accountName: "", dcType: "DEBIT", amount: 0, lineRemark: "" },
      ],
    }));
  };

  const removeLine = (idx: number) => {
    setJournal((prev) => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== idx),
    }));
  };

  const updateLine = (idx: number, patch: Partial<JournalLine>) => {
    setJournal((prev) => ({
      ...prev,
      lines: prev.lines.map((l, i) => (i === idx ? { ...l, ...patch } : l)),
    }));
  };

  const saveJournal = async () => {
    try {
      if (!journal.journalDate) {
        openAlertModal("warning", "입력 확인", "전표일자를 입력해 주세요.");
        return;
      }

      if (!journal.lines || journal.lines.length === 0) {
        openAlertModal("warning", "입력 확인", "전표 라인을 1개 이상 입력해 주세요.");
        return;
      }

      if (!journal.customerId) {
        openAlertModal("warning", "입력 확인", "거래처를 선택해 주세요.");
        return;
      }

      const codes = new Map<string, Set<string>>();
      for (const l of journal.lines) {
        const code = (l.accountCode ?? "").trim();
        if (!code) continue;
        if (!codes.has(code)) codes.set(code, new Set());
        codes.get(code)!.add(l.dcType);
      }

      for (const [code, set] of codes.entries()) {
        if (set.has("DEBIT") && set.has("CREDIT")) {
          openAlertModal(
            "warning",
            "입력 확인",
            `같은 계정코드(${code})가 차변/대변에 동시에 존재합니다. 상대계정을 넣어 주세요.`
          );
          return;
        }
      }

      for (const [i, l] of journal.lines.entries()) {
        if (!l.accountCode?.trim()) {
          openAlertModal("warning", "입력 확인", `라인 ${i + 1}: 계정코드를 입력해 주세요.`);
          return;
        }
        if (!(Number(l.amount) > 0)) {
          openAlertModal("warning", "입력 확인", `라인 ${i + 1}: 금액은 0보다 커야 합니다.`);
          return;
        }
      }

      if (totals.debitTotal !== totals.creditTotal) {
        openAlertModal(
          "warning",
          "입력 확인",
          `차변합(${totals.debitTotal})과 대변합(${totals.creditTotal})이 일치해야 저장됩니다.`
        );
        return;
      }

      const payload = {
        journalNo: journal.journalNo?.trim() ? journal.journalNo.trim() : null,
        journalDate: journal.journalDate,
        customerId: journal.customerId,
        remark: journal.remark ?? "",
        status: journal.status,
        lines: (journal.lines || []).map((l) => ({
          accountCode: l.accountCode?.trim() ?? "",
          accountName: l.accountName?.trim() ?? "",
          dcType: l.dcType,
          amount: Number(l.amount) || 0,
          lineRemark: l.lineRemark ?? "",
        })),
      };

      console.log("저장 payload =", payload);

      if (selectedId) await api.put(`${API_BASE}/${selectedId}`, payload);
      else await api.post(API_BASE, payload);

      await fetchJournals();
      handleClose();
    } catch (e: any) {
      console.error("저장 실패", e);
      console.error("응답 데이터", e?.response?.data);
      openAlertModal("error", "저장 실패", "저장에 실패했습니다. 콘솔을 확인해 주세요.");
    }
  };

  const confirmDeleteJournal = async () => {
    if (!selectedId) return;

    try {
      await api.delete(`${API_BASE}/${selectedId}`);
      await fetchJournals();
      handleClose();
      closeAlertModal();
    } catch (e) {
      console.error("전표 삭제 실패", e);
      closeAlertModal();
      openAlertModal("error", "삭제 실패", "삭제에 실패했습니다. 콘솔을 확인해 주세요.");
    }
  };

  const deleteJournal = async () => {
    if (!selectedId) return;
    openConfirmModal("warning", "삭제 확인", "정말 삭제하시겠습니까?");
  };

  const openNew = () => {
    setSelectedId(null);
    setJournal(emptyJournal());
    setShow(true);
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
                <Left>{/* <Lnb menuList={stockMenu} title="일반전표" /> */}</Left>

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
                        일반전표
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
                      padding: "16px",
                      boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
                      marginBottom: "14px",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <InputGroup
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                          flexWrap: "wrap",
                          justifyContent: "flex-end",
                        }}
                      >
                        <WhiteBtn className="mx-2" onClick={fetchJournals}>
                          새로고침
                        </WhiteBtn>

                        <Search
                          type="search"
                          placeholder="전표번호/거래처/적요 검색"
                          value={keyword}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setKeyword(e.target.value)
                          }
                          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === "Enter") fetchJournals();
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
                          onClick={fetchJournals}
                          style={{
                            backgroundColor: "#6b7280",
                            color: "#ffffff",
                            border: "1px solid #6b7280",
                            borderRadius: "10px",
                            padding: "10px 14px",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Search(F3)
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
                          {columns.map((c) => (
                            <th
                              key={c.key}
                              style={{
                                padding: "15px 18px",
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "#475467",
                                borderBottom: "1px solid #e8ecf4",
                                textAlign:
                                  c.key === "debitTotal" || c.key === "creditTotal"
                                    ? "right"
                                    : "left",
                              }}
                            >
                              {c.label}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {journalList.length === 0 ? (
                          <tr>
                            <td
                              colSpan={columns.length}
                              style={{
                                textAlign: "center",
                                padding: "44px 16px",
                                color: "#98a2b3",
                                fontSize: "14px",
                              }}
                            >
                              등록된 전표가 없습니다
                            </td>
                          </tr>
                        ) : (
                          journalList.map((j, idx) => (
                            <tr
                              key={j.id ?? idx}
                              onClick={() => (j.id ? openDetail(j.id) : null)}
                              style={{
                                cursor: "pointer",
                                backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fcfdff",
                                transition: "all 0.15s ease",
                              }}
                            >
                              {columns.map((col) => (
                                <td
                                  key={col.key}
                                  style={{
                                    padding: "14px 18px",
                                    verticalAlign: "middle",
                                    color:
                                      col.key === "debitTotal" || col.key === "creditTotal"
                                        ? "#111827"
                                        : "#374151",
                                    fontWeight:
                                      col.key === "debitTotal" || col.key === "creditTotal"
                                        ? 700
                                        : 500,
                                    borderBottom: "1px solid #eef2f7",
                                    textAlign:
                                      col.key === "debitTotal" || col.key === "creditTotal"
                                        ? "right"
                                        : "left",
                                  }}
                                >
                                  {j[col.key] ?? "-"}
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>

                  <BtnRight style={{ marginTop: "14px" }}>
                    <button
                      type="button"
                      onClick={openNew}
                      style={{
                        backgroundColor: "#6b7280",
                        color: "#ffffff",
                        border: "1px solid #6b7280",
                        borderRadius: "10px",
                        padding: "10px 18px",
                        fontSize: "14px",
                        fontWeight: 600,
                        boxShadow: "0 4px 10px rgba(107, 114, 128, 0.16)",
                        cursor: "pointer",
                      }}
                    >
                      신규(F2)
                    </button>
                  </BtnRight>
                </Right>
              </Flex>
            </Col>
          </Row>
        </Container>
      </div>

      <GeneralJournalModal
        show={show}
        selectedId={selectedId}
        journal={journal}
        totals={totals}
        onClose={handleClose}
        onSetJournal={setJournal}
        addLine={addLine}
        removeLine={removeLine}
        updateLine={updateLine}
        onSave={saveJournal}
        onDelete={deleteJournal}
        customerList={customerList}
      />

      <Modal
        show={showAlertModal}
        onHide={() => {}}
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

          <div
            className="top-alert-right"
            style={{ display: "flex", gap: "8px", alignItems: "center" }}
          >
            {isConfirmModal ? (
              <>
                <button
                  type="button"
                  onClick={closeAlertModal}
                  style={{
                    height: "36px",
                    minWidth: "68px",
                    border: "1px solid #d0d5dd",
                    borderRadius: "999px",
                    padding: "0 14px",
                    background: "#ffffff",
                    color: "#475467",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  취소
                </button>

                <button
                  type="button"
                  onClick={confirmDeleteJournal}
                  className={`top-alert-button ${alertType}`}
                >
                  삭제
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={closeAlertModal}
                className={`top-alert-button ${alertType}`}
              >
                확인
              </button>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}