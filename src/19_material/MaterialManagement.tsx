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
import MaterialModal, {
  MaterialOrder,
  MaterialOrderLine,
  Customer,
} from "../component/material/MaterialModal";

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

// 백엔드 확정 전까지 임시 유지
const API_BASE = "/api/material-orders";

const emptyMaterialOrder = (): MaterialOrder => ({
  orderNo: "",
  orderDate: new Date().toISOString().slice(0, 10),
  customerId: null,
  customerName: "",
  remark: "",
  status: "",
  lines: [{ itemId: null, itemName: "", qty: 1, price: 0, amount: 0 }],
});

export default function MaterialManagement() {
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [show, setShow] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [materialOrderList, setMaterialOrderList] = useState<MaterialOrder[]>([]);
  const [materialOrder, setMaterialOrder] = useState<MaterialOrder>(emptyMaterialOrder());

  const totalAmount = useMemo(
    () =>
      (materialOrder.lines || []).reduce(
        (sum, line) => sum + (Number(line.amount) || 0),
        0
      ),
    [materialOrder.lines]
  );

  const fetchMaterialOrders = async (customers: Customer[] = []) => {
    try {
      const res = await api.get(API_BASE);
      const list = Array.isArray(res.data) ? res.data : res.data?.content ?? [];

      const normalized: MaterialOrder[] = list.map((t: any) => {
        const rawLines = t.lines ?? t.tradeLines ?? [];
        const lines: MaterialOrderLine[] = (rawLines || []).map((l: any) => {
          const qty = Number(l.qty ?? 0);
          const price = Number(l.price ?? l.unitPrice ?? 0);

          return {
            itemId: l.itemId ?? l.item?.id ?? l.item?.itemId ?? null,
            itemName: l.itemName ?? l.item?.itemName ?? "",
            qty,
            price,
            amount: Number(l.amount ?? l.totalAmount ?? qty * price),
            remark: l.remark ?? l.lineRemark ?? "",
          };
        });

        const customerName =
          (t.customerName ?? "").trim() ||
          customers.find((c) => c.id === (t.customerId ?? null))?.customerName ||
          "";

        return {
          id: Number(t.id),
          orderNo: t.orderNo ?? t.salesNo ?? t.tradeNo ?? "",
          orderDate: String(t.orderDate ?? t.salesDate ?? t.tradeDate ?? "").slice(0, 10),
          customerId: t.customerId ?? null,
          customerName,
          remark: t.remark ?? "",
          status: t.status ?? "",
          totalAmount: Number(t.totalAmount ?? 0),
          lines:
            lines.length > 0
              ? lines
              : [{ itemId: null, itemName: "", qty: 1, price: 0, amount: 0 }],
        };
      });

      setMaterialOrderList(normalized);
    } catch (e) {
      console.error("발주 조회 실패", e);
    }
  };

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

        fetchMaterialOrders(filtered);
      } catch (e) {
        console.error("공급업체 목록 조회 실패", e);
      }
    };

    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateLine = (idx: number, patch: Partial<MaterialOrderLine>) => {
    setMaterialOrder((prev) => {
      const lines = (prev.lines || []).map((line, i) => {
        if (i !== idx) return line;
        const updated = { ...line, ...patch };
        updated.amount = (Number(updated.qty) || 0) * (Number(updated.price) || 0);
        return updated;
      });
      return { ...prev, lines };
    });
  };

  const addLine = () => {
    setMaterialOrder((prev) => ({
      ...prev,
      lines: [
        ...(prev.lines || []),
        { itemId: null, itemName: "", qty: 1, price: 0, amount: 0 },
      ],
    }));
  };

  const removeLine = (idx: number) => {
    setMaterialOrder((prev) => ({
      ...prev,
      lines: (prev.lines || []).filter((_, i) => i !== idx),
    }));
  };

  const openNew = () => {
    setSelectedId(null);
    setMaterialOrder(emptyMaterialOrder());
    setShow(true);
  };

  const openDetail = async (id: number) => {
    try {
      const res = await api.get(`${API_BASE}/${id}`);
      const t: any = res.data;

      const rawLines =
        t.lines ??
        t.tradeLines ??
        t.lineList ??
        t.tradeLineList ??
        t.items ??
        t.itemList ??
        [];

      const lines: MaterialOrderLine[] = (Array.isArray(rawLines) ? rawLines : []).map(
        (l: any) => {
          const qty = Number(l.qty ?? l.quantity ?? l.q ?? 0);
          const price = Number(l.price ?? l.unitPrice ?? l.unit_price ?? 0);
          const amount = Number(l.amount ?? l.totalAmount ?? l.lineAmount ?? qty * price);

          return {
            itemId: l.itemId ?? l.item?.id ?? l.item?.itemId ?? null,
            itemName: String(l.itemName ?? l.item?.itemName ?? l.item?.name ?? l.name ?? ""),
            qty,
            price,
            amount,
            remark: l.remark ?? l.lineRemark ?? "",
          };
        }
      );

      const customerName =
        (t.customerName ?? "").trim() ||
        customerList.find((c) => c.id === (t.customerId ?? null))?.customerName ||
        "";

      setSelectedId(id);
      setMaterialOrder({
        id: Number(t.id),
        orderNo: String(t.orderNo ?? t.salesNo ?? t.tradeNo ?? t.no ?? ""),
        orderDate: String(t.orderDate ?? t.salesDate ?? t.tradeDate ?? t.date ?? "").slice(
          0,
          10
        ),
        customerId: t.customerId ?? null,
        customerName,
        remark: t.remark ?? "",
        status: t.status ?? "",
        totalAmount: Number(t.totalAmount ?? 0),
        lines:
          lines.length > 0
            ? lines
            : [{ itemId: null, itemName: "", qty: 1, price: 0, amount: 0 }],
      });

      setShow(true);
    } catch (e) {
      console.error("발주 상세 조회 실패", e);
    }
  };

  const handleClose = () => {
    setShow(false);
    setSelectedId(null);
    setMaterialOrder(emptyMaterialOrder());
  };

  const saveMaterialOrder = async () => {
    try {
      if (!materialOrder.orderDate) return alert("발주일자를 입력하세요");
      if (!materialOrder.lines || materialOrder.lines.length === 0) {
        return alert("자재목록을 입력하세요");
      }

      const customerId = materialOrder.customerId;
      if (!customerId) return alert("공급업체를 선택하세요");

      for (const [i, line] of materialOrder.lines.entries()) {
        if (!line.itemName?.trim()) return alert(`라인 ${i + 1}: 자재명을 입력하세요`);
      }

      const orderNo =
        (materialOrder.orderNo ?? "").trim() ||
        `MO-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Date.now()}`;

      const payload = {
        orderNo,
        orderDate: materialOrder.orderDate,
        customerId,
        customerName: materialOrder.customerName,
        remark: materialOrder.remark ?? "",
        status: materialOrder.status ?? "",
        totalAmount,
        lines: (materialOrder.lines || []).map((line) => ({
          itemId: line.itemId ? Number(line.itemId) : null,
          itemName: line.itemName,
          qty: Number(line.qty || 0),
          price: Number(line.price || 0),
          amount: Number(line.amount || 0),
          remark: line.remark ?? "",
        })),
      };

      if (selectedId) await api.put(`${API_BASE}/${selectedId}`, payload);
      else await api.post(API_BASE, payload);

      await fetchMaterialOrders(customerList);
      handleClose();
    } catch (e) {
      console.error("저장 실패", e);
      alert("저장 실패 (콘솔 확인)");
    }
  };

  const deleteMaterialOrder = async () => {
    if (!selectedId) return;
    if (!window.confirm("삭제하시겠습니까?")) return;

    try {
      await api.delete(`${API_BASE}/${selectedId}`);
      await fetchMaterialOrders(customerList);
      handleClose();
    } catch (e) {
      console.error("발주 삭제 실패", e);
      alert("삭제 실패 (콘솔 확인)");
    }
  };

  const stockMenu = [{ key: "status", label: "발주입력", path: "/sale" }];

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
                <Lnb menuList={stockMenu} title="발주입력" />
              </Left>

              <Right>
                <TopWrap />
                <JustifyContent>
                  <TableTitle>자재관리</TableTitle>
                </JustifyContent>

                <Table hover>
                  <thead>
                    <tr>
                      <th>자재목록</th>
                      <th>발주번호</th>
                      <th>발주현황</th>
                      <th>발주일자</th>
                      <th>공급업체</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materialOrderList.map((order) => (
                      <tr
                        key={order.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => openDetail(order.id!)}
                      >
                        <td>{order.lines?.[0]?.itemName ?? ""}</td>
                        <td>{order.orderNo}</td>
                        <td>{order.status ?? ""}</td>
                        <td>{String(order.orderDate ?? "").slice(0, 10)}</td>
                        <td>{order.customerName}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <BtnRight>
                  <MainSubmitBtn onClick={openNew}>발주등록</MainSubmitBtn>
                </BtnRight>
              </Right>
            </Flex>
          </Col>
        </Row>
      </Container>

      <MaterialModal
        show={show}
        selectedId={selectedId}
        materialOrder={materialOrder}
        totalAmount={totalAmount}
        onClose={handleClose}
        onSetMaterialOrder={setMaterialOrder}
        addLine={addLine}
        removeLine={removeLine}
        updateLine={updateLine}
        onSave={saveMaterialOrder}
        onDelete={deleteMaterialOrder}
        customerList={customerList}
      />
    </>
  );
}