import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Table, Form } from "react-bootstrap";
import Top from "../include/Top";
import Header from "../include/Header";
import SideBar from "../include/SideBar";
import { Left, Right, Flex, TopWrap } from "../stylesjs/Content.styles";
import { JustifyContent } from "../stylesjs/Util.styles";
import { TableTitle } from "../stylesjs/Text.styles";
import { MainSubmitBtn, BtnRight } from "../stylesjs/Button.styles";
import Lnb from "../include/Lnb";

import Sales2Modal, { Sales, SalesLine, Customer } from "../component/sales2/Sales2Modal";

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

// ✅ TradeService 쓰는 실제 API
const API_BASE = "/api/sales/sales";

const emptySales = (): Sales => ({
  salesNo: "",
  salesDate: new Date().toISOString().slice(0, 10),
  customerId: null,
  customerName: "",
  remark: "",
  discountRate: 0, // ✅ 전체 할인율(%)
  lines: [{ itemName: "", qty: 1, price: 0, discount: 0, amount: 0 }], // ✅ discount 추가
});

export default function SalesInput2() {
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [show, setShow] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [salesList, setSalesList] = useState<Sales[]>([]);
  const [sales, setSales] = useState<Sales>(emptySales());

  // ✅ 라인 합계(라인 discount 반영된 amount 기준)
  const lineSum = useMemo(
    () => (sales.lines || []).reduce((s, l) => s + (Number(l.amount) || 0), 0),
    [sales.lines]
  );

  // ✅ 전체 할인율(0~100)
  const discountRate = useMemo(() => {
    const r = Number((sales as any).discountRate ?? 0);
    if (Number.isNaN(r)) return 0;
    return Math.min(100, Math.max(0, r));
  }, [sales]);

  // ✅ 전체 할인금액 / 할인 후 공급가 (lineSum 기준)
  const discountAmount = useMemo(
    () => Math.round(lineSum * (discountRate / 100)),
    [lineSum, discountRate]
  );
  const supplyAfterDiscount = useMemo(
    () => Math.max(0, lineSum - discountAmount),
    [lineSum, discountAmount]
  );

  // ✅ VAT 10%
  const vatAmount = useMemo(
    () => Math.round(supplyAfterDiscount * 0.1),
    [supplyAfterDiscount]
  );

  // ✅ 총액
  const totalAmount = useMemo(
    () => supplyAfterDiscount + vatAmount,
    [supplyAfterDiscount, vatAmount]
  );

  // ✅ 목록 조회 (customers를 인자로 받아서 customerName 보정)
  const fetchSales = async (customers: Customer[] = []) => {
    try {
      const res = await api.get(API_BASE);
      const list = Array.isArray(res.data) ? res.data : res.data?.content ?? [];

      const normalized: Sales[] = list.map((t: any) => {
        const tradeLines = t.tradeLines ?? t.lines ?? [];
        const lines: SalesLine[] = (tradeLines || []).map((l: any) => {
          const qty = Number(l.qty ?? 0);
          const price = Number(l.unitPrice ?? l.price ?? 0);
          const disc = Number(l.discount ?? 0); // ✅ 라인 할인율(%) 없으면 0
          const raw = qty * price;
          const amt = Math.round(raw * (1 - disc / 100));

          return {
            itemName: l.itemName ?? l.item?.itemName ?? "",
            qty,
            price,
            discount: disc,
            amount: Number(l.totalAmount ?? l.amount ?? amt),
            remark: l.remark ?? l.lineRemark ?? "",
          };
        });

        const cname =
          (t.customerName ?? "").trim() ||
          customers.find((c) => c.id === (t.customerId ?? null))?.customerName ||
          "";

        return {
          id: t.id,
          salesNo: t.salesNo ?? t.tradeNo ?? "",
          salesDate: t.salesDate ?? t.tradeDate ?? "",
          customerId: t.customerId ?? null,
          customerName: cname,
          remark: t.remark ?? "",
          totalAmount: Number(t.totalAmount ?? 0),
          discountRate: Number(t.discountRate ?? 0),
          lines,
        };
      });

      setSalesList(normalized);
    } catch (e) {
      console.error("판매 조회 실패", e);
    }
  };

  // ✅ 거래처 목록 + 로딩 후 sales 재조회
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get("/api/acc/customers");
        const rows = Array.isArray(res.data) ? res.data : res.data?.content ?? [];
        const normalized: Customer[] = rows.map((c: any) => ({
          id: c.id ?? c.customerId,
          customerName: c.customerName ?? c.name ?? "",
        }));

        const filtered = normalized.filter((c) => c.id && c.customerName);
        setCustomerList(filtered);

        fetchSales(filtered);
      } catch (e) {
        console.error("거래처 목록 조회 실패", e);
      }
    };
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ 초기 목록 조회
  useEffect(() => {
    fetchSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ 라인 수정 (라인 할인 반영해서 amount 계산)
  const updateLine = (idx: number, patch: Partial<SalesLine>) => {
    setSales((prev) => {
      const lines = (prev.lines || []).map((l, i) => {
        if (i !== idx) return l;

        const updated = { ...l, ...patch };
        const qty = Number(updated.qty) || 0;
        const price = Number(updated.price) || 0;
        const disc = Math.min(100, Math.max(0, Number(updated.discount) || 0));

        const raw = qty * price;
        updated.discount = disc;
        updated.amount = Math.round(raw * (1 - disc / 100));
        return updated;
      });

      return { ...prev, lines };
    });
  };

  const addLine = () => {
    setSales((p) => ({
      ...p,
      lines: [...(p.lines || []), { itemName: "", qty: 1, price: 0, discount: 0, amount: 0 }],
    }));
  };

  const removeLine = (idx: number) => {
    setSales((p) => ({
      ...p,
      lines: (p.lines || []).filter((_, i) => i !== idx),
    }));
  };

  // ✅ 신규
  const openNew = () => {
    setSelectedId(null);
    setSales(emptySales());
    setShow(true);
  };

  // ✅ 상세
  const openDetail = async (id: number) => {
    try {
      const res = await api.get(`${API_BASE}/${id}`);
      const t: any = res.data;

      const tradeLines = t.tradeLines ?? t.lines ?? [];
      const lines: SalesLine[] = (tradeLines || []).map((l: any) => {
        const qty = Number(l.qty ?? 0);
        const price = Number(l.unitPrice ?? l.price ?? 0);
        const disc = Number(l.discount ?? 0);
        const raw = qty * price;
        const amt = Math.round(raw * (1 - disc / 100));

        return {
          itemName: l.itemName ?? l.item?.itemName ?? "",
          qty,
          price,
          discount: disc,
          amount: Number(l.totalAmount ?? l.amount ?? amt),
          remark: l.remark ?? l.lineRemark ?? "",
        };
      });

      const cname =
        (t.customerName ?? "").trim() ||
        customerList.find((c) => c.id === (t.customerId ?? null))?.customerName ||
        "";

      setSelectedId(id);
      setSales({
        id: t.id,
        salesNo: t.salesNo ?? t.tradeNo ?? "",
        salesDate: t.salesDate ?? t.tradeDate ?? "",
        customerId: t.customerId ?? null,
        customerName: cname,
        remark: t.remark ?? "",
        totalAmount: Number(t.totalAmount ?? 0),
        discountRate: Number(t.discountRate ?? 0),
        lines,
      });

      setShow(true);
    } catch (e) {
      console.error("판매 상세 조회 실패", e);
    }
  };

  const handleClose = () => {
    setShow(false);
    setSelectedId(null);
    setSales(emptySales());
  };

  // ✅ 저장
  const saveSales = async () => {
    try {
      if (!sales.salesDate) return alert("판매일자를 입력하세요");
      if (!sales.lines || sales.lines.length === 0) return alert("판매 라인을 1개 이상 입력하세요");

      const customerId = sales.customerId;
      if (!customerId) return alert("거래처를 목록에서 선택해 주세요(customerId 필요)");

      for (const [i, l] of sales.lines.entries()) {
        if (!l.itemName?.trim()) return alert(`라인 ${i + 1}: 품목명을 입력하세요`);
        if (!(Number(l.qty) > 0)) return alert(`라인 ${i + 1}: 수량은 0보다 커야 합니다.`);
        if (!(Number(l.price) >= 0)) return alert(`라인 ${i + 1}: 단가는 0 이상이어야 합니다.`);
        if (!(Number(l.discount) >= 0 && Number(l.discount) <= 100))
          return alert(`라인 ${i + 1}: 할인율은 0~100 입니다.`);
      }

      const tradeNo =
        (sales.salesNo ?? "").trim() ||
        `S-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Date.now()}`;

      const payload: any = {
        tradeNo,
        tradeDate: sales.salesDate,
        tradeType: "SALES",
        customerId,

        counterAccountCode: "1110",

        // ✅ 전체 할인율/금액 반영(라인 합계 기준)
        discountRate: discountRate,
        discountAmount: discountAmount,

        supplyAmount: supplyAfterDiscount,
        vatAmount: vatAmount,
        feeAmount: 0,
        totalAmount: totalAmount,

        remark: sales.remark ?? "",
        status: "DRAFT",
      };

      if (selectedId) await api.put(`${API_BASE}/${selectedId}`, payload);
      else await api.post(API_BASE, payload);

      await fetchSales(customerList);
      handleClose();
    } catch (e) {
      console.error("저장 실패", e);
      alert("저장 실패 (콘솔 확인)");
    }
  };

  // ✅ 삭제
  const deleteSales = async () => {
    if (!selectedId) return;
    if (!window.confirm("삭제하시겠습니까?")) return;

    try {
      await api.delete(`${API_BASE}/${selectedId}`);
      await fetchSales(customerList);
      handleClose();
    } catch (e) {
      console.error("판매 삭제 실패", e);
      alert("삭제 실패 (콘솔 확인)");
    }
  };

  const stockMenu = [{ key: "status", label: "판매입력", path: "/sale" }];

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
                <Lnb menuList={stockMenu} title="판매입력" />
              </Left>

              <Right>
                <TopWrap />
                <JustifyContent>
                  <TableTitle>판매입력</TableTitle>
                </JustifyContent>

                <Table hover>
                  <thead>
                    <tr>
                      <th style={{ width: 60 }}>선택</th>
                      <th>판매번호</th>
                      <th>판매일자</th>
                      <th>거래처</th>
                      <th className="text-end">할인율(%)</th>
                      <th className="text-end">합계금액</th>
                    </tr>
                  </thead>

                  <tbody>
                    {salesList.map((s) => (
                      <tr key={s.id} style={{ cursor: "pointer" }}>
                        <td onClick={(e) => e.stopPropagation()}>
                          <Form.Check
                            type="checkbox"
                            checked={selectedId === s.id}
                            onChange={(e) => {
                              if (e.target.checked) openDetail(s.id!);
                              else handleClose();
                            }}
                          />
                        </td>

                        <td onClick={() => openDetail(s.id!)}>{s.salesNo}</td>
                        <td onClick={() => openDetail(s.id!)}>{s.salesDate}</td>
                        <td onClick={() => openDetail(s.id!)}>{s.customerName}</td>

                        <td onClick={() => openDetail(s.id!)} className="text-end">
                          {Number((s as any).discountRate ?? 0)}
                        </td>

                        <td onClick={() => openDetail(s.id!)} className="text-end">
                          {Number(s.totalAmount ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <BtnRight>
                  <MainSubmitBtn onClick={openNew}>신규</MainSubmitBtn>
                </BtnRight>
              </Right>
            </Flex>
          </Col>
        </Row>
      </Container>

      {/* ✅ 여기 이름이 Sales2Modal 이어야 함 (SalesModal 아님) */}
      <Sales2Modal
        show={show}
        selectedId={selectedId}
        sales={sales}
        totalAmount={totalAmount}
        onClose={handleClose}
        onSetSales={setSales}
        addLine={addLine}
        removeLine={removeLine}
        updateLine={updateLine}
        onSave={saveSales}
        onDelete={deleteSales}
        customerList={customerList}
      />
    </>
  );
}
