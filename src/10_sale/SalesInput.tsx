import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Table } from "react-bootstrap";
import Top from "../include/Top";
import Header from "../include/Header";
import SideBar from "../include/SideBar";
import { Left, Right, Flex, TopWrap } from "../stylesjs/Content.styles";
import { JustifyContent } from "../stylesjs/Util.styles";
import { TableTitle } from "../stylesjs/Text.styles";
import { MainSubmitBtn, BtnRight } from "../stylesjs/Button.styles";
import Lnb from "../include/Lnb";

import SalesModal, { Sales, SalesLine, Customer } from "../component/sales/SalesModal";

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

const API_BASE = "/api/sales/sales";

const emptySales = (): Sales => ({
  salesNo: "",
  salesDate: new Date().toISOString().slice(0, 10),
  customerId: null,
  customerName: "",
  remark: "",
  lines: [{ itemName: "", qty: 1, price: 0, amount: 0 }],
});

export default function SalesInput() {
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [show, setShow] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [salesList, setSalesList] = useState<Sales[]>([]);
  const [sales, setSales] = useState<Sales>(emptySales());

  // 합계
  const totalAmount = useMemo(
    () => (sales.lines || []).reduce((s, l) => s + (Number(l.amount) || 0), 0),
    [sales.lines]
  );

  // 거래처 목록 (GeneralJournal 방식 그대로)
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get("/api/acc/customers");
        const rows = Array.isArray(res.data) ? res.data : res.data?.content ?? [];
        // Customer 타입에 맞게 최소 정규화
        const normalized: Customer[] = rows.map((c: any) => ({
          id: c.id ?? c.customerId,
          customerName: c.customerName ?? c.name ?? "",
        }));
        setCustomerList(normalized.filter((c) => c.id && c.customerName));
      } catch (e) {
        console.error("거래처 목록 조회 실패", e);
      }
    };
    fetchCustomers();
  }, []);

  // 목록 조회
  const fetchSales = async () => {
    try {
      const res = await api.get(API_BASE);
      const list = Array.isArray(res.data) ? res.data : res.data?.content ?? [];
      setSalesList(list);
    } catch (e) {
      console.error("판매 조회 실패", e);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // 라인 수정
  const updateLine = (idx: number, patch: Partial<SalesLine>) => {
    setSales((prev) => {
      const lines = (prev.lines || []).map((l, i) => {
        if (i !== idx) return l;
        const updated = { ...l, ...patch };
        updated.amount = (Number(updated.qty) || 0) * (Number(updated.price) || 0);
        return updated;
      });
      return { ...prev, lines };
    });
  };

  const addLine = () => {
    setSales((p) => ({
      ...p,
      lines: [...(p.lines || []), { itemName: "", qty: 1, price: 0, amount: 0 }],
    }));
  };

  const removeLine = (idx: number) => {
    setSales((p) => ({
      ...p,
      lines: (p.lines || []).filter((_, i) => i !== idx),
    }));
  };

  // 신규
  const openNew = () => {
    setSelectedId(null);
    setSales(emptySales());
    setShow(true);
  };

  // 상세
  const openDetail = async (id: number) => {
    try {
      const res = await api.get(`${API_BASE}/${id}`);
      setSelectedId(id);
      setSales(res.data);
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

  // 저장
  const saveSales = async () => {
    try {
      if (!sales.salesDate) return alert("판매일자를 입력하세요");
      if (!sales.lines || sales.lines.length === 0) return alert("판매 라인을 1개 이상 입력하세요");

      // ✅ 거래처는 리스트에서 선택 → customerId 필수
      const customerId = sales.customerId;
      if (!customerId) return alert("거래처를 목록에서 선택해 주세요(customerId 필요)");

      for (const [i, l] of sales.lines.entries()) {
        if (!l.itemName?.trim()) return alert(`라인 ${i + 1}: 품목명을 입력하세요`);
        if (!(Number(l.qty) > 0)) return alert(`라인 ${i + 1}: 수량은 0보다 커야 합니다.`);
        if (!(Number(l.price) >= 0)) return alert(`라인 ${i + 1}: 단가는 0 이상이어야 합니다.`);
      }

      const payload: any = {
        ...sales,
        salesNo: sales.salesNo?.trim() ? sales.salesNo.trim() : undefined,
      };

      if (selectedId) await api.put(`${API_BASE}/${selectedId}`, payload);
      else await api.post(API_BASE, payload);

      await fetchSales();
      handleClose();
    } catch (e) {
      console.error("저장 실패", e);
      alert("저장 실패 (콘솔 확인)");
    }
  };

  // 삭제
  const deleteSales = async () => {
    if (!selectedId) return;
    if (!window.confirm("삭제하시겠습니까?")) return;

    try {
      await api.delete(`${API_BASE}/${selectedId}`);
      await fetchSales();
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
                      <th>판매번호</th>
                      <th>판매일자</th>
                      <th>거래처</th>
                      <th className="text-end">합계금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesList.map((s) => (
                      <tr
                        key={s.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => openDetail(s.id!)}
                      >
                        <td>{s.salesNo}</td>
                        <td>{s.salesDate}</td>
                        <td>{s.customerName}</td>
                        <td className="text-end">
                          {(s.lines || [])
                            .reduce((sum, l) => sum + (Number(l.amount) || 0), 0)
                            .toLocaleString()}
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

      <SalesModal
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