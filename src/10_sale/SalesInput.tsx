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
import { JustifyContent, W30, W70 } from "../stylesjs/Util.styles";
import { TableTitle } from "../stylesjs/Text.styles";
import { InputGroup, MidLabel } from "../stylesjs/Input.styles";
import { MainSubmitBtn, BtnRight } from "../stylesjs/Button.styles";
import Lnb from "../include/Lnb";

/* =========================
   타입
========================= */

type SalesLine = {
  itemName: string;
  qty: number;
  price: number;
  amount: number;
  remark?: string;
};

type Sales = {
  id?: number;
  salesNo: string;
  salesDate: string;
  customerName: string;
  remark?: string;
  lines: SalesLine[];
};

/* =========================
   설정
========================= */

const API_BASE = "http://localhost:8888/api/sales/sales";

/* 빈 데이터 */
const emptySales = (): Sales => ({
  salesNo: "",
  salesDate: new Date().toISOString().slice(0, 10),
  customerName: "",
  remark: "",
  lines: [{ itemName: "", qty: 1, price: 0, amount: 0 }],
});

/* =========================
   컴포넌트
========================= */

const SalesInput = () => {
  const [show, setShow] = useState(false);
  const [salesList, setSalesList] = useState<Sales[]>([]);
  const [sales, setSales] = useState<Sales>(emptySales());
  const [selectedId, setSelectedId] = useState<number | null>(null);

  /* ===== 합계 ===== */
  const totalAmount = useMemo(
    () => sales.lines.reduce((s, l) => s + l.amount, 0),
    [sales.lines]
  );

  /* ===== 목록 조회 ===== */
  const fetchSales = async () => {
    try {
      const res = await axios.get(API_BASE);
      setSalesList(res.data ?? []);
    } catch (e) {
      console.error("판매 조회 실패", e);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  /* ===== 라인 수정 ===== */
  const updateLine = (idx: number, patch: Partial<SalesLine>) => {
    setSales((prev) => {
      const lines = prev.lines.map((l, i) => {
        if (i !== idx) return l;
        const updated = { ...l, ...patch };
        updated.amount = updated.qty * updated.price;
        return updated;
      });
      return { ...prev, lines };
    });
  };

  const addLine = () => {
    setSales((p) => ({
      ...p,
      lines: [...p.lines, { itemName: "", qty: 1, price: 0, amount: 0 }],
    }));
  };

  const removeLine = (idx: number) => {
    setSales((p) => ({
      ...p,
      lines: p.lines.filter((_, i) => i !== idx),
    }));
  };

  /* ===== 신규 ===== */
  const openNew = () => {
    setSelectedId(null);
    setSales(emptySales());
    setShow(true);
  };

  /* ===== 상세 ===== */
  const openDetail = async (id: number) => {
    const res = await axios.get(`${API_BASE}/${id}`);
    setSelectedId(id);
    setSales(res.data);
    setShow(true);
  };

  /* ===== 저장 ===== */
  const saveSales = async () => {
    if (!sales.customerName) {
      alert("거래처를 입력하세요");
      return;
    }
    if (sales.lines.length === 0) {
      alert("라인을 입력하세요");
      return;
    }

    try {
      if (selectedId) {
        await axios.put(`${API_BASE}/${selectedId}`, sales);
      } else {
        await axios.post(API_BASE, sales);
      }
      await fetchSales();
      setShow(false);
    } catch (e) {
      console.error("저장 실패", e);
    }
  };

  /* ===== 삭제 ===== */
  const deleteSales = async () => {
    if (!selectedId) return;
    if (!window.confirm("삭제하시겠습니까?")) return;

    await axios.delete(`${API_BASE}/${selectedId}`);
    await fetchSales();
    setShow(false);
  };



const stockMenu = [
  { key: "status", label: "판매입력", path: "/sale" },
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
<Lnb menuList={stockMenu} title="판매입력"/>
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
                          {s.lines
                            .reduce((sum, l) => sum + l.amount, 0)
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

      {/* ===== 모달 ===== */}
      <Modal show={show} onHide={() => setShow(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>판매 {selectedId ? "수정" : "등록"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <RoundRect>
            <InputGroup>
              <W30><MidLabel>판매번호</MidLabel></W30>
              <W70>
                <Form.Control
                  value={sales.salesNo}
                  onChange={(e) =>
                    setSales((p) => ({ ...p, salesNo: e.target.value }))
                  }
                />
              </W70>
            </InputGroup>

            <InputGroup className="my-3">
              <W30><MidLabel>판매일자</MidLabel></W30>
              <W70>
                <Form.Control
                  type="date"
                  value={sales.salesDate}
                  onChange={(e) =>
                    setSales((p) => ({ ...p, salesDate: e.target.value }))
                  }
                />
              </W70>
            </InputGroup>

            <InputGroup className="my-3">
              <W30><MidLabel>거래처</MidLabel></W30>
              <W70>
                <Form.Control
                  value={sales.customerName}
                  onChange={(e) =>
                    setSales((p) => ({ ...p, customerName: e.target.value }))
                  }
                />
              </W70>
            </InputGroup>

            <hr />

            <Table bordered>
              <thead>
                <tr>
                  <th>품목</th>
                  <th style={{ width: 120 }}>수량</th>
                  <th style={{ width: 150 }}>단가</th>
                  <th style={{ width: 150 }}>금액</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sales.lines.map((l, idx) => (
                  <tr key={idx}>
                    <td>
                      <Form.Control
                        value={l.itemName}
                        onChange={(e) =>
                          updateLine(idx, { itemName: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        value={l.qty}
                        onChange={(e) =>
                          updateLine(idx, { qty: Number(e.target.value) })
                        }
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        value={l.price}
                        onChange={(e) =>
                          updateLine(idx, { price: Number(e.target.value) })
                        }
                      />
                    </td>
                    <td className="text-end">
                      {l.amount.toLocaleString()}
                    </td>
                    <td className="text-end">
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => removeLine(idx)}
                      >
                        삭제
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Button size="sm" onClick={addLine}>
              라인 추가
            </Button>

            <div style={{ textAlign: "right", fontWeight: 700 }}>
              합계금액 : {totalAmount.toLocaleString()}
            </div>
          </RoundRect>
        </Modal.Body>

        <Modal.Footer>
          {selectedId && (
            <Button variant="danger" onClick={deleteSales}>
              삭제
            </Button>
          )}
          <Button onClick={saveSales}>
            {selectedId ? "수정" : "저장"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SalesInput;
