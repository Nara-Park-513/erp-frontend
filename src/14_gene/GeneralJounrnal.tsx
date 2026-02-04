import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import Top from "../include/Top";
import Header from "../include/Header";
import SideBar from "../include/SideBar";
import {
  Left,
  Right,
  Flex,
  TopWrap,
  RoundRect,
} from "../stylesjs/Content.styles";
import { JustifyContent, W70, W30 } from "../stylesjs/Util.styles";
import { TableTitle } from "../stylesjs/Text.styles";
import {
  InputGroup,
  Search,
  Radio,
  Label,
  MidLabel,
} from "../stylesjs/Input.styles";
import { WhiteBtn, MainSubmitBtn, BtnRight } from "../stylesjs/Button.styles";
import Lnb from "../include/Lnb";

type ColumnDef = {key: string; label:string;}

const API_BASE = "http://localhost:8888/api/acc/journals";

//일반전표타입 예시
type JournalStatus = "DRAFT" | "POSTED";

type JournalLine = {
id?:number; accountCode:string; accountName?:string;
dcType:"DEBIT"|"CREDIT";
amount:number; lineRemark?:string;
}

type Journal = {
   id?: number;
  journalNo: string;       // 전표번호
  journalDate: string;     // YYYY-MM-DD
  customerId?: number | null;
  customerName?: string;   // 표시용
  remark?: string;         // 전표 적요
  status: JournalStatus;
  lines: JournalLine[];   
}

//👉 새 전표를 만들 때 사용할 “빈 전표 기본값 생성기”
const emptyJournal = () : Journal => ({
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

const [show, setShow] = useState(false);
//선택된 거래처 iD
const [selectedId, setSelectedId] = useState<number | null>(null);

//검색(간단)
const [keyword, setKeyword] = useState("");

//목록
const [journalList, setJournalList] = useState<any[]>([]);

//편집대상 (전표)
const [journal, setJournal] = useState<Journal>(emptyJournal());

//테이블 컬럼
const columns: ColumnDef[] = [
    { key: "journalNo", label: "전표번호" },
    { key: "journalDate", label: "전표일자" },
    { key: "customerName", label: "거래처" },
    { key: "remark", label: "적요" },
    { key: "debitTotal", label: "차변합" },
    { key: "creditTotal", label: "대변합" },
    { key: "status", label: "상태" },
];

//합계 계산(모달/목록 표시용)
const totals = useMemo(() => {//totals라는 변수에 합계 결과를
    const debitTotal = (journal.lines || [])
//debitTotal = 차변 합계 journal.lines가 혹시 null/undefined면 에러 나니까,없으면 [](빈 배열)로 대신 사용하겠다는 뜻.
    .filter((l) => l.dcType === "DEBIT")
//전표 줄(lines) 중에서 dcType이 "DEBIT"인 줄만 골라내기 (차변만 남김)
    .reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
/*남은 차변 줄들의 금액을 다 더해서 합계 만들기
reduce는 “누적 합계 계산기”
sum = 지금까지 더한 값
l = 현재 줄(한 줄씩)
Number(l.amount)로 숫자로 바꾸고, 혹시 금액이 비었거나 이상하면 || 0으로 0 처리
마지막 0은 “합계를 0부터 시작”하겠다는 뜻
*/
const creditTotal = (journal.lines || [])//creditTotal = 대변 합계
.filter((l) => l.dcType === "CREDIT") //이번에는 "CREDIT"인 줄만 골라내기 (대변만)
.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
//대변 줄들의 금액도 똑같이 전부 더해서 합계 만들기
return{debitTotal, creditTotal};//계산한 두 합계를 객체로 묶어서 반환
},[journal.lines])
/*
useMemo는 기본적으로 “저장해둔 값 재사용”인데,
[journal.lines]가 바뀔 때만 다시 계산하라는 의미.
즉, 전표 줄이 수정/추가/삭제될 때만 합계를 다시 구함.
*/


//목록조회
const fetchJournals = async () => {//async () => //비동기 함수 선언
 try {//에러처리용 구조 서버 통신 실패해도 앱이 죽지 않게 하기 위함
    //정상실행 코드
const res = await axios.get(
    //axios.get(주소, 옵션) HTTP 요청 라이브러리
API_BASE, //요청 url await → 응답 올 때까지 기다림
 {params:{
    page:0, 
    size:20,
q:keyword || undefined, //백엔드가 지원하면 검색
//keyword가 있으면 q=keyword 없으면 undefined → 아예 파라미터를 안 보냄
}
}  //페이징을 한페이지에 20개 
);
//백엔드가 page형태면 res.data.content res.data.content가 있으면 → 그걸 사용 (Page 구조)
const list = res.data?.content ?? res.data ?? [];

//목록에서 차/대 합계를 보여주고 싶으면(서버가 안주면 클라에서 계산)
const normalized = list.map((j:any) => {
//전표 목록 list를 하나씩 돌면서 화면에 쓰기 좋은 형태로 가공(normalize)
 const lines:JournalLine[] = j.lines ?? []; 
 //전표 한 건의 분개(lines) 혹시 lines가 없으면 빈 배열로 처리 타입 안정성 + 에러 방지
 const debitTotal = lines//차변 합계 계산 시작
.filter((l) => l.dcType === "DEBIT")//분개 중에서 차변만 골라냄
.reduce((s, l) => s + (Number(l.amount) || 0), 0);
const creditTotal = lines
.filter((l) => l.dcType === "CREDIT")
.reduce((s, l) => s + (Number(l.amount) || 0), 0);
//차변 금액을 전부 더함 amount가 비었거나 문자면 0 처리 합계는 0부터 시작
return { ...j, debitTotal, creditTotal };
});//기존 전표 데이터 j는 그대로 두고 debitTotal, creditTotal만 추가
setJournalList(normalized);
 } catch(e) {//에러 발생시 실행
console.error("전표 조회 실패", e);
 }
};

useEffect(() => { //컴포넌트의 생명주기 관리
//이화면이 처음 뜰때 이코드를 실행해 처음 딱 한번만 실행
fetchJournals();
},[]);

const handleClose = () => {
    setShow(false);
    setSelectedId(null);
    setJournal(emptyJournal());
}

//상세조회
const openDetail = async (id:number) => {
    try{
        const res = await axios.get(`${API_BASE}/${id}`);
        setSelectedId(id);
        setJournal(res.data);
        setShow(true);
    }catch (e) {
        console.error("전표 상세 조회 실패", e);
    }
};

//라인 추가 삭제 전표 안의 lines 배열을 추가 / 삭제 / 수정하기 위한 함수들이다.
const addLine = () => { //분개 한 줄을 새로 추가하는 함수
    setJournal((prev) => ({ //현재 전표 상태(prev)를 기준으로 안전하게 상태 업데이트
        ...prev,
lines:[...(prev.lines || []), {accountCode:"", dcType:"DEBIT", amount:0, lineRemark:""}],
    }));
};
//기존 분개 목록에 새 분개 한 줄 추가

const removeLine = (idx:number) => {
    setJournal((prev) => ({
        ...prev,
        lines:prev.lines.filter((_, i) => i !== idx),
    }))
}

const updateLine = (idx:number, patch:Partial<JournalLine>) => {
setJournal((prev) => ({
...prev,
lines:prev.lines.map((l, i) => (i === idx ? {...l, ...patch} : l)),
}));
};

//쓰기 after 분기(신규/수정)
const saveJournal = async () => {
try{
    //최소검증
    if(!journal.journalDate) {//수정
        alert("전표일자를 입력하세요");
        return;
    }
    if (!journal.lines || journal.lines.length === 0) {
        alert("전표 라인을 1개 이상 입력하세요");
        return;
    }

    //계정코드 금액체크
    for(const[i, l] of journal.lines.entries()){
        if (!l.accountCode?.trim()) {
            alert(`라인 ${i + 1}: 계정코드를 입력하세요`);
            return;
        }
        if (!(Number(l.amount) > 0)) {
            alert(`라인 ${i + 1}: 금액은 0보다 커야 합니다.`);
            return;
        }
    }
// 차대합 체크
      if (totals.debitTotal !== totals.creditTotal) {
        alert(`차변합(${totals.debitTotal})과 대변합(${totals.creditTotal})이 일치해야 저장됩니다.`);
        return;
      }

      if (selectedId) {
        await axios.put(`${API_BASE}/${selectedId}`, journal);
      } else {
        await axios.post(API_BASE, journal);
      }

      await fetchJournals();
      handleClose();


}catch (e) {
    console.error("저장 실패", e);
}
};

//삭제
const deleteJournal = async () => {
    if (!selectedId) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

try{
await axios.delete(`${API_BASE}/${selectedId}`);
await fetchJournals(); 
handleClose();
}catch (e) {
    console.error("거래처 저장 실패", e);
}
}

//신규
const openNew = () => {
 setSelectedId(null); setJournal(emptyJournal()); setShow(true);
}

 const stockMenu = [
  { key: "status", label: "일반전표", path: "/general" },
];

    return(
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
<Lnb menuList={stockMenu} title="일반전표"/>                  
              </Left>
              <Right>
                <TopWrap />
                <JustifyContent>
                  <TableTitle>일반전표</TableTitle>

                  <InputGroup>
                    <WhiteBtn className="mx-2" onClick={() => fetchJournals()}>
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

                    <MainSubmitBtn className="mx-2" onClick={() => fetchJournals()}>
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
                        onClick={() => {
                          if (j.id) openDetail(j.id);
                          else {
                            // id가 없으면 그냥 기존처럼 세팅(임시)
                            setJournal(j);
                            setSelectedId(j.id ?? null);
                            setShow(true);
                          }
                        }}
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

      {/* ===== 등록/수정 모달 ===== */}
      <Modal show={show} onHide={handleClose} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>일반전표 {selectedId ? "수정" : "등록"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <RoundRect>
            {/* 헤더 영역 */}
            <InputGroup>
              <W30>
                <MidLabel>전표번호</MidLabel>
              </W30>
              <W70>
                <Form.Control
                  value={journal.journalNo}
                  onChange={(e) => setJournal((p) => ({ ...p, journalNo: e.target.value }))}
                  placeholder="(자동채번이면 비워도 됨)"
                />
              </W70>
            </InputGroup>

            <InputGroup className="my-3">
              <W30>
                <MidLabel>전표일자</MidLabel>
              </W30>
              <W70>
                <Form.Control
                  type="date"
                  value={journal.journalDate}
                  onChange={(e) => setJournal((p) => ({ ...p, journalDate: e.target.value }))}
                />
              </W70>
            </InputGroup>

            <InputGroup className="my-3">
              <W30>
                <MidLabel>거래처</MidLabel>
              </W30>
              <W70>
                {/* 거래처 선택을 따로 만들면 customerId로 바꾸세요 */}
                <Form.Control
                  value={journal.customerName || ""}
                  onChange={(e) => setJournal((p) => ({ ...p, customerName: e.target.value }))}
                  placeholder="거래처명(선택/검색 컴포넌트로 교체 가능)"
                />
              </W70>
            </InputGroup>

            <InputGroup className="my-3">
              <W30>
                <MidLabel>전표 적요</MidLabel>
              </W30>
              <W70>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={journal.remark || ""}
                  onChange={(e) => setJournal((p) => ({ ...p, remark: e.target.value }))}
                />
              </W70>
            </InputGroup>

            <Flex className="my-3">
              <W30>
                <MidLabel>상태</MidLabel>
              </W30>
              <W70>
                {[
                  ["DRAFT", "작성중"],
                  ["POSTED", "확정"],
                ].map(([v, l]) => (
                  <span key={v}>
                    <Radio
                      checked={journal.status === (v as JournalStatus)}
                      onChange={() => setJournal((p) => ({ ...p, status: v as JournalStatus }))}
                    />
                    <Label className="mx-2">{l}</Label>
                  </span>
                ))}
              </W70>
            </Flex>

            <hr />

            {/* 라인 영역 */}
            <JustifyContent>
              <div style={{ fontWeight: 700 }}>전표 라인</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div>차변합: {totals.debitTotal.toLocaleString()}</div>
                <div>대변합: {totals.creditTotal.toLocaleString()}</div>
                <Button size="sm" variant="outline-primary" onClick={addLine}>
                  라인 추가
                </Button>
              </div>
            </JustifyContent>

            <Table responsive className="mt-2">
              <thead>
                <tr>
                  <th style={{ width: 110 }}>차/대</th>
                  <th style={{ width: 160 }}>계정코드</th>
                  <th>계정명</th>
                  <th style={{ width: 180 }}>금액</th>
                  <th>라인 적요</th>
                  <th style={{ width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {journal.lines.map((l, idx) => (
                  <tr key={idx}>
                    <td>
                      <Form.Select
                        value={l.dcType}
                        onChange={(e) => updateLine(idx, { dcType: e.target.value as "DEBIT" | "CREDIT" })}
                      >
                        <option value="DEBIT">차변</option>
                        <option value="CREDIT">대변</option>
                      </Form.Select>
                    </td>

                    <td>
                      <Form.Control
                        value={l.accountCode}
                        onChange={(e) => updateLine(idx, { accountCode: e.target.value })}
                        placeholder="예: 1110"
                      />
                    </td>

                    <td>
                      <Form.Control
                        value={l.accountName || ""}
                        onChange={(e) => updateLine(idx, { accountName: e.target.value })}
                        placeholder="(선택) 계정명"
                        disabled
                      />
                      {/* 계정명은 보통 계정코드로 서버에서 조회해 채우는게 정석이라 disabled */}
                    </td>

                    <td>
                      <Form.Control
                        type="number"
                        value={l.amount}
                        onChange={(e) => updateLine(idx, { amount: Number(e.target.value) || 0 })}
                        min={0}
                      />
                    </td>

                    <td>
                      <Form.Control
                        value={l.lineRemark || ""}
                        onChange={(e) => updateLine(idx, { lineRemark: e.target.value })}
                        placeholder="라인 적요"
                      />
                    </td>

                    <td className="text-end">
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => removeLine(idx)}
                        disabled={journal.lines.length <= 2}
                        title="최소 2라인(차/대) 유지"
                      >
                        삭제
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {totals.debitTotal !== totals.creditTotal && (
              <div style={{ color: "crimson", fontWeight: 700 }}>
                ⚠ 차변합과 대변합이 일치하지 않습니다. (저장 불가)
              </div>
            )}
          </RoundRect>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            close
          </Button>

          {selectedId && (
            <Button variant="danger" onClick={deleteJournal}>
              Delete
            </Button>
          )}

          <Button variant="primary" onClick={saveJournal}>
            {selectedId ? "Update" : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
        </>
    )
}

export default GeneralJournal;