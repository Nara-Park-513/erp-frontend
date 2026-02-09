import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Table, Button } from "react-bootstrap";
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
} from "../component/journal/GeneralJournalModal"; // ✅ 경로 맞추기

//axios인스턴스
const api = axios.create({
  baseURL:"http://localhost:8888",
  timeout:10000, //안에 응답이 없으면 자동으로 실패 처리(타임아웃 에러).
})

api.interceptors.request.use((config) => {
  //요청 보내기 직전에 가로채서(config를) 수정할 수 있는 “요청 인터셉터”.
  //로컬스토리지에서 토큰을 찾는다.
  const token =
  localStorage.getItem("token") || localStorage.getItem("accessToken") || localStorage.getItem("jwt");

  if(token) {//토큰이 존재할 때만 헤더를 붙인다(로그인 안 한 상태면 안 붙임).
    config.headers = config.headers ?? {}; //?? 는 “null 또는 undefined 일 때만” 오른쪽 값을 사용.
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
})

api.interceptors.response.use(//이번엔 응답을 받은 직후를 가로채는 “응답 인터셉터”.
  (res) => res, (err) => {
    console.log("❌ API ERROR", err?.response?.status, err?.response?.data);
    //디버깅용 로그.
    return Promise.reject(err);//에러를 다시 던져서(reject) 호출한 쪽에서 catch로 처리하게 만든다.
  }
)

const API_BASE = "/api/acc/Journals";

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



//👉 새 전표를 만들 때 사용할 “빈 전표 기본값 생성기”
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

const GeneralJournal = () => {

//거래처 때문에 추가 도리꺼임
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

  //거래처 목록 추가 
  useEffect(() => {
    const fetchCustomers = async () => {
      try{
        const res = await api.get("/api/acc/customers");
        const rows = Array.isArray(res.data) ? res.data : res.data?.content ?? [];
        setCustomerList(rows);
      } catch (e) {
        console.error("거래처 목록 조회 실패", e);
      }
    };
    fetchCustomers();
  },[]);

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
      const res = await axios.get(API_BASE, {
        params: {
          page: 0,
          size: 20,
          q: keyword || undefined,
        },
      });

      const list = res.data?.content ?? res.data ?? [];

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
      const res = await axios.get(`${API_BASE}/${id}`);
      setSelectedId(id);
      setJournal(res.data);
      setShow(true);
    } catch (e) {
      console.error("전표 상세 조회 실패", e);
    }
  };

  //라인 추가/삭제/수정
  const addLine = () => {
    setJournal((prev) => ({
      ...prev,
      lines: [...(prev.lines || []), { accountCode: "", dcType: "DEBIT", amount: 0, lineRemark: "" }],
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
if (!journal.journalDate) return alert("전표일자를 입력하세요");
if (!journal.lines || journal.lines.length === 0)  return alert("전표 라인을 1개 이상 입력하세요");
//거래처 선택
if (!journal.customerName?.trim()) return alert("거래처 선택하세요");
//거래처 리스트에서 커스터머id 보정
const matched : any =
(customerList as any[]).find((c) => c.customerName === journal.customerName) ??
(customerList as any[]).find((c) => c.name === journal.customerName)

const customerId = matched?.id ?? matched?.customerId ?? null;
if (!customerId) return alert("거래처를 목록에서 선택해 주세요(customerId 필요)");

//라인 검증
for (const [i, l] of journal.lines.entries()) {
if (!l.accountCode?.trim()) return  alert(`라인 ${i + 1}: 계정코드를 입력하세요`);
if (!(Number(l.amount) > 0)) return alert(`라인 ${i + 1}: 금액은 0보다 커야 합니다.`);
}
//차대합 검증
if (totals.debitTotal !== totals.creditTotal) {
return  alert(`차변합(${totals.debitTotal})과 대변합(${totals.creditTotal})이 일치해야 저장됩니다.`);
}

//payload customid 강제 세팅
const payload: any = {
  ...journal, customerId,
  journalNo: journal.journalNo?.trim() ? journal.journalNo : undefined,
}

      if (selectedId) await axios.put(`${API_BASE}/${selectedId}`, journal);
      else await axios.post(API_BASE, journal);

      await fetchJournals();
      handleClose();
    } catch (e) {
      console.error("저장 실패", e);
      alert("저장실패 콘솔 확인")
    }
  };

  const deleteJournal = async () => {
    if (!selectedId) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`${API_BASE}/${selectedId}`);
      await fetchJournals();
      handleClose();
    } catch (e) {
      console.error("전표 삭제 실패", e);
      alert("삭제실패 (콘솔 확인)")
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
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

      {/* ✅ 모달 분리 적용 */}
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
};

export default GeneralJournal;