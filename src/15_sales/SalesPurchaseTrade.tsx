import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Table, Button, Modal, Form } from "react-bootstrap";
import Top from "../include/Top";
import Header from "../include/Header";
import SideBar from "../include/SideBar";
import { Left, Right, Flex, TopWrap, RoundRect } from "../stylesjs/Content.styles";
import { JustifyContent, W70, W30 } from "../stylesjs/Util.styles";
import { TableTitle } from "../stylesjs/Text.styles";
import { InputGroup, Search, Radio, Label, MidLabel } from "../stylesjs/Input.styles";
import { WhiteBtn, MainSubmitBtn, BtnRight } from "../stylesjs/Button.styles";
import Lnb from "../include/Lnb";

type ColumnDef = { key: string; label: string };

// ✅ 매출/매입 구분
type TradeType = "SALES" | "PURCHASE";

// ✅ 부가세유형(필요한 것만 먼저)
type VatType = "TAX" | "ZERO" | "EXEMPT"; // 과세/영세/면세

// ✅ 전표 상태(원 코드 유지)
type JournalStatus = "DRAFT" | "POSTED";

// ✅ 자동 생성될 분개 라인(원 코드 유지 + accountName은 표시용)
type JournalLine = {
  id?: number;
  accountCode: string;
  accountName?: string;
  dcType: "DEBIT" | "CREDIT";
  amount: number;
  lineRemark?: string;
};

// ✅ 화면에서 입력하는 “거래(매출/매입)”
type Trade = {
  id?: number;
  tradeType: TradeType;

  tradeNo: string;         // 전표번호/거래번호
  tradeDate: string;       // YYYY-MM-DD

  deptCode?: string;       // 부서
  deptName?: string;

  projectCode?: string;
  projectName?: string;

  customerId?: number | null;
  customerName?: string;

  vatType: VatType;

  supplyAmount: number;    // 공급가액
  vatAmount: number;       // 부가세
  feeAmount: number;       // 수수료(선택)
  totalAmount: number;     // 합계(=공급+부가세 ± 수수료 정책)

  // 계정
  revenueAccountCode?: string;  // 매출계정(매출일 때)
  expenseAccountCode?: string;  // 매입/비용계정(매입일 때)
  counterAccountCode: string;   // 입금/지급 계정(예금/외상매출금/외상매입금)

  remark?: string;
  status: JournalStatus;

  // 저장시 서버로 같이 보내는 분개(선택: 서버가 생성하면 안 보내도 됨)
  lines: JournalLine[];
};

// ✅ 계정코드(프로젝트에 맞게 바꾸면 됨)
const ACC_VAT_OUTPUT = "2100"; // 부가세예수금(예시)
const ACC_VAT_INPUT = "1350";  // 부가세대급금(예시)
const ACC_FEE = "5120";        // 지급수수료(예시)

const API_BASE = "http://localhost:8888/api/acc/trades";

const emptyTrade = (type: TradeType): Trade => {
  const today = new Date().toISOString().slice(0, 10);
  return {
    tradeType: type,
    tradeNo: "",
    tradeDate: today,

    deptCode: "",
    deptName: "",
    projectCode: "",
    projectName: "",

    customerId: null,
    customerName: "",

    vatType: "TAX",

    supplyAmount: 0,
    vatAmount: 0,
    feeAmount: 0,
    totalAmount: 0,

    // 기본 계정(너희 기준으로 변경)
    revenueAccountCode: "4049",     // 제품매출
    expenseAccountCode: "5000",     // 매입/비용(임시)
    counterAccountCode: "1089",     // 외상매출금/예금 등

    remark: "",
    status: "DRAFT",
    lines: [],
  };
};

// ✅ VAT 자동 계산: 과세면 10%, 영세/면세는 0
function calcVat(vatType: VatType, supply: number) {
  if (vatType === "TAX") return Math.round((Number(supply) || 0) * 0.1);
  return 0;
}

// ✅ 거래 -> 자동 분개 생성
function buildLines(t: Trade): JournalLine[] {
  const supply = Number(t.supplyAmount) || 0;
  const vat = Number(t.vatAmount) || 0;
  const fee = Number(t.feeAmount) || 0;

  const lines: JournalLine[] = [];

  if (t.tradeType === "SALES") {
    // 매출: 입금/외상 계정 차변, 매출/부가세 대변
    const receivableOrCash = (supply + vat) - fee;

    lines.push({
      dcType: "DEBIT",
      accountCode: t.counterAccountCode || "",
      amount: receivableOrCash,
      lineRemark: "매출대금(입금/외상)",
    });

    lines.push({
      dcType: "CREDIT",
      accountCode: t.revenueAccountCode || "",
      amount: supply,
      lineRemark: "매출",
    });

    if (vat > 0) {
      lines.push({
        dcType: "CREDIT",
        accountCode: ACC_VAT_OUTPUT,
        amount: vat,
        lineRemark: "부가세예수금",
      });
    }

    if (fee > 0) {
      // 수수료가 있으면 비용 차변으로 별도 분개(회사 정책에 맞게 조정)
      lines.push({
        dcType: "DEBIT",
        accountCode: ACC_FEE,
        amount: fee,
        lineRemark: "수수료",
      });
    }
  } else {
    // 매입: 비용/매입 차변, 부가세대급금 차변, 지급계정 대변
    const payableOrCash = supply + vat + fee;

    lines.push({
      dcType: "DEBIT",
      accountCode: t.expenseAccountCode || "",
      amount: supply,
      lineRemark: "매입/비용",
    });

    if (vat > 0) {
      lines.push({
        dcType: "DEBIT",
        accountCode: ACC_VAT_INPUT,
        amount: vat,
        lineRemark: "부가세대급금",
      });
    }

    if (fee > 0) {
      lines.push({
        dcType: "DEBIT",
        accountCode: ACC_FEE,
        amount: fee,
        lineRemark: "수수료",
      });
    }

    lines.push({
      dcType: "CREDIT",
      accountCode: t.counterAccountCode || "",
      amount: payableOrCash,
      lineRemark: "지급(예금/외상매입금)",
    });
  }

  // 0원 라인 제거(깔끔)
  return lines.filter((l) => (Number(l.amount) || 0) !== 0);
}

export default function SalesPurchaseTrade() {
  const [show, setShow] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState<TradeType>("SALES");

  const [list, setList] = useState<any[]>([]);
  const [trade, setTrade] = useState<Trade>(emptyTrade("SALES"));

  const columns: ColumnDef[] = [
    { key: "tradeNo", label: "전표번호" },
    { key: "tradeDate", label: "전표일자" },
    { key: "tradeType", label: "구분" },
    { key: "customerName", label: "거래처" },
    { key: "supplyAmount", label: "공급가" },
    { key: "vatAmount", label: "부가세" },
    { key: "totalAmount", label: "합계" },
    { key: "remark", label: "적요" },
    { key: "status", label: "상태" },
  ];

  const totals = useMemo(() => {
    const debitTotal = (trade.lines || [])
      .filter((l) => l.dcType === "DEBIT")
      .reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

    const creditTotal = (trade.lines || [])
      .filter((l) => l.dcType === "CREDIT")
      .reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

    return { debitTotal, creditTotal };
  }, [trade.lines]);

  // ✅ 목록조회
  const fetchList = async () => {
    try {
      const res = await axios.get(API_BASE, {
        params: {
          page: 0,
          size: 20,
          q: keyword || undefined,
          type: typeFilter, // SALES / PURCHASE
        },
      });

      const rows = res.data?.content ?? res.data ?? [];
      setList(rows);
    } catch (e) {
      console.error("거래 조회 실패", e);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]);

  const handleClose = () => {
    setShow(false);
    setSelectedId(null);
    setTrade(emptyTrade(typeFilter));
  };

  const openNew = () => {
    setSelectedId(null);
    setTrade(emptyTrade(typeFilter));
    setShow(true);
  };

  const openDetail = async (id: number) => {
    try {
      const res = await axios.get(`${API_BASE}/${id}`);
      const data: Trade = res.data;

      // ✅ 혹시 서버가 lines 안주면 프론트에서 생성
      const lines = (data.lines && data.lines.length > 0) ? data.lines : buildLines(data);

      setSelectedId(id);
      setTrade({ ...data, lines });
      setShow(true);
    } catch (e) {
      console.error("상세 조회 실패", e);
    }
  };

  // ✅ 입력 값 변경 헬퍼
  const patchTrade = (patch: Partial<Trade>) => {
    setTrade((prev) => {
      const next = { ...prev, ...patch };

      // 공급가/부가세/유형 바뀌면 자동 계산
      const supply = Number(next.supplyAmount) || 0;

      // vatAmount를 사용자가 직접 수정할 수도 있으니:
      // - vatType 또는 supplyAmount가 바뀌면 vat 자동 재계산
      if (patch.vatType !== undefined || patch.supplyAmount !== undefined) {
        next.vatAmount = calcVat(next.vatType, supply);
      }

      // total 정책:
      // - 매출: 공급+부가세-수수료(수수료는 공제되는 카드수수료 같은 케이스 가정)
      // - 매입: 공급+부가세+수수료(수수료가 추가비용)
      const fee = Number(next.feeAmount) || 0;
      next.totalAmount =
        next.tradeType === "SALES" ? (supply + next.vatAmount - fee) : (supply + next.vatAmount + fee);

      // 라인은 항상 최신으로 자동 생성
      next.lines = buildLines(next);

      return next;
    });
  };

  const save = async () => {
    try {
      if (!trade.tradeDate) return alert("전표일자를 입력하세요.");
      if (!trade.customerName?.trim()) return alert("거래처를 입력(선택)하세요.");
      if (!(Number(trade.supplyAmount) > 0)) return alert("공급가액은 0보다 커야 합니다.");
      if (!trade.counterAccountCode?.trim()) return alert("입금/지급 계정을 입력하세요.");

      if (trade.tradeType === "SALES" && !trade.revenueAccountCode?.trim()) {
        return alert("매출계정을 입력하세요.");
      }
      if (trade.tradeType === "PURCHASE" && !trade.expenseAccountCode?.trim()) {
        return alert("매입/비용계정을 입력하세요.");
      }

      // 차대합 체크(자동분개니까 거의 항상 맞아야 정상)
      if (totals.debitTotal !== totals.creditTotal) {
        return alert(`차변합(${totals.debitTotal})과 대변합(${totals.creditTotal})이 일치해야 저장됩니다.`);
      }

      const payload = { ...trade };

      if (selectedId) {
        await axios.put(`${API_BASE}/${selectedId}`, payload);
      } else {
        await axios.post(API_BASE, payload);
      }

      await fetchList();
      handleClose();
    } catch (e) {
      console.error("저장 실패", e);
      alert("저장 실패(콘솔 확인)");
    }
  };

  const del = async () => {
    if (!selectedId) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`${API_BASE}/${selectedId}`);
      await fetchList();
      handleClose();
    } catch (e) {
      console.error("삭제 실패", e);
      alert("삭제 실패(콘솔 확인)");
    }
  };

const stockMenu = [
  { key: "status", label: "판매조회", path: "/trade" },
];

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
<Lnb menuList={stockMenu} title="판매조회"/>                
              </Left>
              <Right>
                <TopWrap />
                <JustifyContent>
                  <TableTitle>{typeFilter === "SALES" ? "매출전표" : "매입전표"}</TableTitle>

                  <InputGroup>
                    {/* 구분 토글 */}
                    <span style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 12 }}>
                      {[
                        ["SALES", "매출"],
                        ["PURCHASE", "매입"],
                      ].map(([v, l]) => (
                        <span key={v}>
                          <Radio
                            checked={typeFilter === (v as TradeType)}
                            onChange={() => setTypeFilter(v as TradeType)}
                          />
                          <Label className="mx-2">{l}</Label>
                        </span>
                      ))}
                    </span>

                    <WhiteBtn className="mx-2" onClick={fetchList}>
                      새로고침
                    </WhiteBtn>

                    <Search
                      type="search"
                      placeholder="전표번호/거래처/적요 검색"
                      value={keyword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === "Enter") fetchList();
                      }}
                    />

                    <MainSubmitBtn className="mx-2" onClick={fetchList}>
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
                    {list.length === 0 && (
                      <tr>
                        <td colSpan={columns.length} className="text-center">
                          등록된 전표가 없습니다
                        </td>
                      </tr>
                    )}

                    {list.map((r, idx) => (
                      <tr
                        key={r.id ?? idx}
                        onClick={() => r.id && openDetail(r.id)}
                        style={{ cursor: "pointer" }}
                      >
                        {columns.map((col) => (
                          <td key={col.key}>
                            {col.key === "tradeType"
                              ? r.tradeType === "SALES"
                                ? "매출"
                                : "매입"
                              : r[col.key] ?? "-"}
                          </td>
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
          <Modal.Title>
            {trade.tradeType === "SALES" ? "매출전표" : "매입전표"} {selectedId ? "수정" : "등록"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <RoundRect>
            {/* 전표번호 */}
            <InputGroup>
              <W30><MidLabel>전표번호</MidLabel></W30>
              <W70>
                <Form.Control
                  value={trade.tradeNo}
                  onChange={(e) => patchTrade({ tradeNo: e.target.value })}
                  placeholder="(자동채번이면 비워도 됨)"
                />
              </W70>
            </InputGroup>

            {/* 전표일자 */}
            <InputGroup className="my-3">
              <W30><MidLabel>전표일자</MidLabel></W30>
              <W70>
                <Form.Control
                  type="date"
                  value={trade.tradeDate}
                  onChange={(e) => patchTrade({ tradeDate: e.target.value })}
                />
              </W70>
            </InputGroup>

            {/* 부서 */}
            <InputGroup className="my-3">
              <W30><MidLabel>부서</MidLabel></W30>
              <W70 style={{ display: "flex", gap: 8 }}>
                <Form.Control
                  value={trade.deptCode || ""}
                  onChange={(e) => patchTrade({ deptCode: e.target.value })}
                  placeholder="부서코드"
                  style={{ width: 160 }}
                />
                <Form.Control
                  value={trade.deptName || ""}
                  onChange={(e) => patchTrade({ deptName: e.target.value })}
                  placeholder="부서명"
                />
              </W70>
            </InputGroup>

            {/* 프로젝트 */}
            <InputGroup className="my-3">
              <W30><MidLabel>프로젝트</MidLabel></W30>
              <W70 style={{ display: "flex", gap: 8 }}>
                <Form.Control
                  value={trade.projectCode || ""}
                  onChange={(e) => patchTrade({ projectCode: e.target.value })}
                  placeholder="프로젝트코드"
                  style={{ width: 160 }}
                />
                <Form.Control
                  value={trade.projectName || ""}
                  onChange={(e) => patchTrade({ projectName: e.target.value })}
                  placeholder="프로젝트명"
                />
              </W70>
            </InputGroup>

            {/* 부가세유형 */}
            <InputGroup className="my-3">
              <W30><MidLabel>부가세유형</MidLabel></W30>
              <W70>
                <Form.Select
                  value={trade.vatType}
                  onChange={(e) => patchTrade({ vatType: e.target.value as VatType })}
                >
                  <option value="TAX">과세(10%)</option>
                  <option value="ZERO">영세(0%)</option>
                  <option value="EXEMPT">면세(0%)</option>
                </Form.Select>
              </W70>
            </InputGroup>

            {/* 거래처 */}
            <InputGroup className="my-3">
              <W30><MidLabel>거래처</MidLabel></W30>
              <W70>
                <Form.Control
                  value={trade.customerName || ""}
                  onChange={(e) => patchTrade({ customerName: e.target.value })}
                  placeholder="거래처명(검색/선택 컴포넌트로 교체 가능)"
                />
              </W70>
            </InputGroup>

            {/* 공급/부가세/수수료/합계 */}
            <InputGroup className="my-3">
              <W30><MidLabel>공급가액</MidLabel></W30>
              <W70>
                <Form.Control
                  type="number"
                  value={trade.supplyAmount}
                  onChange={(e) => patchTrade({ supplyAmount: Number(e.target.value) || 0 })}
                  min={0}
                />
              </W70>
            </InputGroup>

            <InputGroup className="my-3">
              <W30><MidLabel>부가세</MidLabel></W30>
              <W70 style={{ display: "flex", gap: 8 }}>
                <Form.Control
                  type="number"
                  value={trade.vatAmount}
                  onChange={(e) => patchTrade({ vatAmount: Number(e.target.value) || 0 })}
                  min={0}
                />
                <div style={{ display: "flex", alignItems: "center", opacity: 0.7 }}>
                  (유형/공급가 바꾸면 자동계산)
                </div>
              </W70>
            </InputGroup>

            <InputGroup className="my-3">
              <W30><MidLabel>수수료</MidLabel></W30>
              <W70>
                <Form.Control
                  type="number"
                  value={trade.feeAmount}
                  onChange={(e) => patchTrade({ feeAmount: Number(e.target.value) || 0 })}
                  min={0}
                />
              </W70>
            </InputGroup>

            <InputGroup className="my-3">
              <W30><MidLabel>합계</MidLabel></W30>
              <W70>
                <Form.Control type="number" value={trade.totalAmount} disabled />
              </W70>
            </InputGroup>

            {/* 계정: 매출/매입에 따라 다르게 */}
            {trade.tradeType === "SALES" ? (
              <InputGroup className="my-3">
                <W30><MidLabel>매출계정</MidLabel></W30>
                <W70>
                  <Form.Control
                    value={trade.revenueAccountCode || ""}
                    onChange={(e) => patchTrade({ revenueAccountCode: e.target.value })}
                    placeholder="예: 4049"
                  />
                </W70>
              </InputGroup>
            ) : (
              <InputGroup className="my-3">
                <W30><MidLabel>매입/비용계정</MidLabel></W30>
                <W70>
                  <Form.Control
                    value={trade.expenseAccountCode || ""}
                    onChange={(e) => patchTrade({ expenseAccountCode: e.target.value })}
                    placeholder="예: 5000"
                  />
                </W70>
              </InputGroup>
            )}

            <InputGroup className="my-3">
              <W30><MidLabel>{trade.tradeType === "SALES" ? "입금계정" : "지급계정"}</MidLabel></W30>
              <W70>
                <Form.Control
                  value={trade.counterAccountCode || ""}
                  onChange={(e) => patchTrade({ counterAccountCode: e.target.value })}
                  placeholder="예: 1089(외상) / 1110(예금)"
                />
              </W70>
            </InputGroup>

            {/* 적요 */}
            <InputGroup className="my-3">
              <W30><MidLabel>적요</MidLabel></W30>
              <W70>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={trade.remark || ""}
                  onChange={(e) => patchTrade({ remark: e.target.value })}
                />
              </W70>
            </InputGroup>

            {/* 상태 */}
            <Flex className="my-3">
              <W30><MidLabel>상태</MidLabel></W30>
              <W70>
                {[
                  ["DRAFT", "작성중"],
                  ["POSTED", "확정"],
                ].map(([v, l]) => (
                  <span key={v}>
                    <Radio
                      checked={trade.status === (v as JournalStatus)}
                      onChange={() => patchTrade({ status: v as JournalStatus })}
                    />
                    <Label className="mx-2">{l}</Label>
                  </span>
                ))}
              </W70>
            </Flex>

            <hr />

            {/* 자동 분개 미리보기 */}
            <JustifyContent>
              <div style={{ fontWeight: 700 }}>자동 분개(미리보기)</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div>차변합: {totals.debitTotal.toLocaleString()}</div>
                <div>대변합: {totals.creditTotal.toLocaleString()}</div>
              </div>
            </JustifyContent>

            <Table responsive className="mt-2">
              <thead>
                <tr>
                  <th style={{ width: 110 }}>차/대</th>
                  <th style={{ width: 160 }}>계정코드</th>
                  <th style={{ width: 180 }}>금액</th>
                  <th>적요</th>
                </tr>
              </thead>
              <tbody>
                {(trade.lines || []).map((l, idx) => (
                  <tr key={idx}>
                    <td>{l.dcType === "DEBIT" ? "차변" : "대변"}</td>
                    <td>{l.accountCode}</td>
                    <td className="text-end">{Number(l.amount || 0).toLocaleString()}</td>
                    <td>{l.lineRemark || "-"}</td>
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
          <Button variant="secondary" onClick={handleClose}>close</Button>
          {selectedId && <Button variant="danger" onClick={del}>Delete</Button>}
          <Button variant="primary" onClick={save}>{selectedId ? "Update" : "Save"}</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
