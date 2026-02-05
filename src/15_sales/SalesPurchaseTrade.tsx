import axios from "axios";
import { useEffect, useState } from "react";
import { Container, Row, Col, Table } from "react-bootstrap";
import Top from "../include/Top";
import Header from "../include/Header";
import SideBar from "../include/SideBar";
import { Left, Right, Flex, TopWrap } from "../stylesjs/Content.styles";
import {
  JustifyContent,
  Toolbar,
  ToolbarLeft,
  ToolbarRight,
  ToggleGroup,
  SearchWide,
} from "../stylesjs/Util.styles";
import { TableTitle } from "../stylesjs/Text.styles";
import { Search, Radio, Label } from "../stylesjs/Input.styles";
import { WhiteBtn, MainSubmitBtn, BtnRight } from "../stylesjs/Button.styles";
import Lnb from "../include/Lnb";

import TradeModal, {
  Customer,
  Trade,
  TradeType,
  VatType,
  JournalStatus,
  JournalLine,
} from "../component/trade/TradeModal";

// ✅ 계정코드(예시)
const ACC_VAT_OUTPUT = "2100";
const ACC_VAT_INPUT = "1350";
const ACC_FEE = "5120";

const API_BASE = "http://localhost:8888/api/acc/trades";

type ColumnDef = { key: string; label: string };

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

    revenueAccountCode: "4049",
    expenseAccountCode: "5000",
    counterAccountCode: "1089",

    remark: "",
    status: "DRAFT",
    lines: [],
  };
};

function calcVat(vatType: VatType, supply: number) {
  if (vatType === "TAX") return Math.round((Number(supply) || 0) * 0.1);
  return 0;
}

function buildLines(t: Trade): JournalLine[] {
  const supply = Number(t.supplyAmount) || 0;
  const vat = Number(t.vatAmount) || 0;
  const fee = Number(t.feeAmount) || 0;

  const lines: JournalLine[] = [];

  if (t.tradeType === "SALES") {
    const receivableOrCash = supply + vat - fee;

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
      lines.push({
        dcType: "DEBIT",
        accountCode: ACC_FEE,
        amount: fee,
        lineRemark: "수수료",
      });
    }
  } else {
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

  return lines.filter((l) => (Number(l.amount) || 0) !== 0);
}

export default function SalesPurchaseTrade() {
  const [customerList, setCustomerList] = useState<Customer[]>([]);

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

  // ✅ 고객 목록
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get("http://localhost:8888/api/acc/customers");
        const rows = Array.isArray(res.data) ? res.data : (res.data?.content ?? []);
        setCustomerList(rows);
      } catch (e) {
        console.error("Failed to fetch customer list", e);
      }
    };
    fetchCustomers();
  }, []);

  // ✅ 목록조회
  const fetchList = async () => {
    try {
      const res = await axios.get(API_BASE, {
        params: {
          page: 0,
          size: 20,
          q: keyword || undefined,
          type: typeFilter,
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

      const lines = data.lines && data.lines.length > 0 ? data.lines : buildLines(data);

      setSelectedId(id);
      setTrade({ ...data, lines });
      setShow(true);
    } catch (e) {
      console.error("상세 조회 실패", e);
    }
  };

  // ✅ 입력 값 변경
  const patchTrade = (patch: Partial<Trade>) => {
    setTrade((prev) => {
      const next = { ...prev, ...patch };
      const supply = Number(next.supplyAmount) || 0;

      // vatType / supplyAmount 바뀌면 VAT 자동계산
      if (patch.vatType !== undefined || patch.supplyAmount !== undefined) {
        next.vatAmount = calcVat(next.vatType, supply);
      }

      const fee = Number(next.feeAmount) || 0;
      next.totalAmount =
        next.tradeType === "SALES" ? supply + next.vatAmount - fee : supply + next.vatAmount + fee;

      next.lines = buildLines(next);
      return next;
    });
  };

  const save = async () => {
    try {
      if (!trade.tradeDate) return alert("전표일자를 입력하세요.");
      if (!trade.customerName?.trim()) return alert("거래처를 선택하세요.");
      if (!(Number(trade.supplyAmount) > 0)) return alert("공급가액은 0보다 커야 합니다.");
      if (!trade.counterAccountCode?.trim()) return alert("입금/지급 계정을 입력하세요.");

      if (trade.tradeType === "SALES" && !trade.revenueAccountCode?.trim()) {
        return alert("매출계정을 입력하세요.");
      }
      if (trade.tradeType === "PURCHASE" && !trade.expenseAccountCode?.trim()) {
        return alert("매입/비용계정을 입력하세요.");
      }

      // 차대합 체크
      const debitTotal = (trade.lines || [])
        .filter((l) => l.dcType === "DEBIT")
        .reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
      const creditTotal = (trade.lines || [])
        .filter((l) => l.dcType === "CREDIT")
        .reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

      if (debitTotal !== creditTotal) {
        return alert(`차변합(${debitTotal})과 대변합(${creditTotal})이 일치해야 저장됩니다.`);
      }

      const payload = { ...trade };

      if (selectedId) await axios.put(`${API_BASE}/${selectedId}`, payload);
      else await axios.post(API_BASE, payload);

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

  const stockMenu = [{ key: "status", label: "판매조회", path: "/trade" }];

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
                <Lnb menuList={stockMenu} title="판매조회" />
              </Left>

              <Right>
                <TopWrap />
                 <TableTitle>{typeFilter === "SALES" ? "매출전표" : "매입전표"}</TableTitle>
                <JustifyContent>
                 

                  {/* 상단 툴바 */}
                  <Toolbar>
                    <ToolbarLeft>
                      <ToggleGroup>
                        {[
                          ["SALES", "매출"],
                          ["PURCHASE", "매입"],
                        ].map(([v, l]) => (
                          <label key={v}>
                            <Radio checked={typeFilter === (v as TradeType)} onChange={() => setTypeFilter(v as TradeType)} />
                            <span>{l}</span>
                          </label>
                        ))}
                      </ToggleGroup>

                      <WhiteBtn onClick={fetchList}>새로고침</WhiteBtn>
                    </ToolbarLeft>

                    <ToolbarRight>
                      <SearchWide>
                        <Search
                          type="search"
                          placeholder="전표번호/거래처/적요 검색"
                          value={keyword}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
                          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === "Enter") fetchList();
                          }}
                        />
                      </SearchWide>

                      <MainSubmitBtn onClick={fetchList}>Search(F3)</MainSubmitBtn>
                    </ToolbarRight>
                  </Toolbar>
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

      {/* ✅ 모달 분리 */}
      <TradeModal
        show={show}
        selectedId={selectedId}
        trade={trade}
        customerList={customerList}
        onClose={handleClose}
        onPatch={patchTrade}
        onSave={save}
        onDelete={del}
      />
    </>
  );
}