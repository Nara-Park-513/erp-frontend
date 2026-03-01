import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Table } from "react-bootstrap";
import Top from "../include/Top";
import Header from "../include/Header";
import SideBar from "../include/SideBar";
import { Left, Right, Flex, TopWrap } from "../stylesjs/Content.styles";
import { JustifyContent } from "../stylesjs/Util.styles";
import { TableTitle } from "../stylesjs/Text.styles";
import { InputGroup, Search } from "../stylesjs/Input.styles";
import { WhiteBtn, MainSubmitBtn, BtnRight } from "../stylesjs/Button.styles";
import Lnb from "../include/Lnb";

import GeneralJournalModal, {
  Journal,
  JournalLine,
} from "../component/journal/GeneralJournalModal";

// ✅ axios 인스턴스
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

// ✅ 대소문자 주의: journals 소문자
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

// ✅ 빈 전표
const emptyJournal = (): Journal => ({
  journalNo: "",
  journalDate: new Date().toISOString().slice(0, 10),
  customerId: null,
  customerName: "",
  remark: "",
  status: "DRAFT",
  lines: [
    { accountCode: "", dcType: "DEBIT", amount: 0, lineRemark: "" },
    { accountCode: "", dcType: "CREDIT", amount: 0, lineRemark: "" },
  ],
});

export default function GeneralJournal() {
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [show, setShow] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [keyword, setKeyword] = useState("");
  const [journalList, setJournalList] = useState<any[]>([]);
  const [journal, setJournal] = useState<Journal>(emptyJournal());

  const columns: ColumnDef[] = [
    { key: "journalNo", label: "전표번호" },
    { key: "journalDate", label: "전표일자" },
    { key: "customerName", label: "거래처" },
    { key: "remark", label: "적요" },
    { key: "debitTotal", label: "차변합" },
    { key: "creditTotal", label: "대변합" },
    { key: "status", label: "상태" },
  ];

  // ✅ 거래처 목록
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get("/api/acc/customers");
        const rows = Array.isArray(res.data)
          ? res.data
          : res.data?.content ?? [];
        setCustomerList(rows);
      } catch (e) {
        console.error("거래처 목록 조회 실패", e);
      }
    };
    fetchCustomers();
  }, []);

  // ✅ 차/대 합계
  const totals = useMemo(() => {
    const debitTotal = (journal.lines || [])
      .filter((l) => l.dcType === "DEBIT")
      .reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

    const creditTotal = (journal.lines || [])
      .filter((l) => l.dcType === "CREDIT")
      .reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

    return { debitTotal, creditTotal };
  }, [journal.lines]);

  // ✅ 전표 목록 조회 (Page든 List든 안전 처리)
  const fetchJournals = async () => {
    try {
      const res = await api.get(API_BASE, {
        params: {
          page: 0,
          size: 20,
          q: keyword?.trim() ? keyword.trim() : undefined,
        },
      });

      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.content ?? [];

      const normalized = list.map((j: any) => {
        const lines: JournalLine[] = j.lines ?? [];
        const debitTotal = lines
          .filter((l) => l.dcType === "DEBIT")
          .reduce((s, l) => s + (Number(l.amount) || 0), 0);
        const creditTotal = lines
          .filter((l) => l.dcType === "CREDIT")
          .reduce((s, l) => s + (Number(l.amount) || 0), 0);

        return { ...j, debitTotal, creditTotal };
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
      setJournal(res.data);
      setShow(true);
    } catch (e) {
      console.error("전표 상세 조회 실패", e);
    }
  };

  // ✅ 라인 추가/삭제/수정
  const addLine = () => {
    setJournal((prev) => ({
      ...prev,
      lines: [
        ...(prev.lines || []),
        { accountCode: "", dcType: "DEBIT", amount: 0, lineRemark: "" },
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

  // ✅ 저장
  const saveJournal = async () => {
    try {
      if (!journal.journalDate) return alert("전표일자를 입력하세요");
      if (!journal.lines || journal.lines.length === 0)
        return alert("전표 라인을 1개 이상 입력하세요");

       // 👇 여기 넣는다
    const codes = new Map<string, Set<string>>();
    for (const l of journal.lines) {
      const code = (l.accountCode ?? "").trim();
      if (!code) continue;
      if (!codes.has(code)) codes.set(code, new Set());
      codes.get(code)!.add(l.dcType);
    }
    for (const [code, set] of codes.entries()) {
      if (set.has("DEBIT") && set.has("CREDIT")) {
        return alert(
          `같은 계정코드(${code})가 차변/대변에 동시에 존재합니다. 상대계정을 넣어주세요.`
        );
      }
    }
    // 👆 여기까지

      if (!journal.customerName?.trim())
        return alert("거래처 선택하세요");

      const matched: any =
        (customerList as any[]).find(
          (c) => c.customerName === journal.customerName
        ) ??
        (customerList as any[]).find((c) => c.name === journal.customerName);

      const customerId = matched?.id ?? matched?.customerId ?? null;
      if (!customerId)
        return alert("거래처를 목록에서 선택해 주세요(customerId 필요)");

      for (const [i, l] of journal.lines.entries()) {
        if (!l.accountCode?.trim())
          return alert(`라인 ${i + 1}: 계정코드를 입력하세요`);
        if (!(Number(l.amount) > 0))
          return alert(`라인 ${i + 1}: 금액은 0보다 커야 합니다.`);
      }

      if (totals.debitTotal !== totals.creditTotal) {
        return alert(
          `차변합(${totals.debitTotal})과 대변합(${totals.creditTotal})이 일치해야 저장됩니다.`
        );
      }

      // ✅ customerId 포함 payload를 실제로 전송해야 함
      const payload: any = {
        ...journal,
        customerId,
        journalNo: journal.journalNo?.trim() ? journal.journalNo.trim() : undefined,
      };

      if (selectedId) await api.put(`${API_BASE}/${selectedId}`, payload);
      else await api.post(API_BASE, payload);

      await fetchJournals();
      handleClose();
    } catch (e) {
      console.error("저장 실패", e);
      alert("저장실패 콘솔 확인");
    }
  };

  // ✅ 삭제
  const deleteJournal = async () => {
    if (!selectedId) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await api.delete(`${API_BASE}/${selectedId}`);
      await fetchJournals();
      handleClose();
    } catch (e) {
      console.error("전표 삭제 실패", e);
      alert("삭제실패 (콘솔 확인)");
    }
  };

  const openNew = () => {
    setSelectedId(null);
    setJournal(emptyJournal());
    setShow(true);
  };

  const stockMenu = [{ key: "status", label: "일반전표", path: "/general" }];

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
                <Lnb menuList={stockMenu} title="일반전표" />
              </Left>

              <Right>
                <TopWrap />
                <JustifyContent>
                  <TableTitle>일반전표</TableTitle>

                  <InputGroup>
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
                    />

                    <MainSubmitBtn className="mx-2" onClick={fetchJournals}>
                      Search(F3)
                    </MainSubmitBtn>
                  </InputGroup>
                </JustifyContent>

                <Table responsive>
                  <thead>
                    <tr>
                      {columns.map((c) => (
                        <th key={c.key}>{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {journalList.length === 0 && (
                      <tr>
                        <td colSpan={columns.length} className="text-center">
                          등록된 전표가 없습니다
                        </td>
                      </tr>
                    )}

                    {journalList.map((j, idx) => (
                      <tr
                        key={j.id ?? idx}
                        onClick={() => (j.id ? openDetail(j.id) : null)}
                        style={{ cursor: "pointer" }}
                      >
                        {columns.map((col) => (
                          <td key={col.key}>{j[col.key] ?? "-"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <BtnRight>
                  <MainSubmitBtn onClick={openNew}>신규(F2)</MainSubmitBtn>
                </BtnRight>
              </Right>
            </Flex>
          </Col>
        </Row>
      </Container>

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
    </>
  );
}