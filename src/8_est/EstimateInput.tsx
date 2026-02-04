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
import { InputGroup, MidLabel } from "../stylesjs/Input.styles";
import { MainSubmitBtn, WhiteBtn, BtnRight } from "../stylesjs/Button.styles";
import Lnb from "../include/Lnb";

/* =========================
   타입
========================= */

type EstimateLine = {
  itemName: string;
  qty: number;
  price: number;
  amount: number;
  remark?: string;
};

type Estimate = {
  id?: number;
  estimateNo: string;
  estimateDate: string;
  customerName: string;
  remark?: string;
  lines: EstimateLine[];
};

/* =========================
   설정
========================= */

const API_BASE = "http://localhost:8888/api/sales/estimates";

const emptyEstimate = (): Estimate => ({
  estimateNo: "",
  estimateDate: new Date().toISOString().slice(0, 10),
  customerName: "",
  remark: "",
  lines: [
    { itemName: "", qty: 1, price: 0, amount: 0 },
  ],
});

/* =========================
   컴포넌트
========================= */

const EstimateInput = () => {
  const [show, setShow] = useState(false);
  const [estimateList, setEstimateList] = useState<Estimate[]>([]);
  const [estimate, setEstimate] = useState<Estimate>(emptyEstimate());
  const [selectedId, setSelectedId] = useState<number | null>(null);

  /* ===== 합계 ===== */
  const totalAmount = useMemo(
    () => estimate.lines.reduce((s, l) => s + l.amount, 0),
    [estimate.lines]
  );

  /* ===== 목록 조회 ===== 
  const fetchEstimates = async () => {
    try {
      const res = await axios.get(API_BASE);
      setEstimateList(res.data ?? []);
    } catch (e) {
      console.error("견적서 조회 실패", e);
    }
  };*/
const fetchEstimates = async () => {
  try {
    const res = await axios.get<Estimate[]>(API_BASE); // ✅ 타입 명시
    const data = res.data.map(e => ({
      ...e,
      estimateDate: e.estimateDate.slice(0, 10), // LocalDate -> yyyy-MM-dd 문자열
      lines: e.lines.map(l => ({
        ...l,
        amount: Number(l.amount) // BigDecimal → number
      }))
    }));
    setEstimateList(data);
  } catch (e) {
    console.error("견적서 조회 실패", e);
  }
};


  useEffect(() => {
    fetchEstimates();
  }, []);

  /* ===== 라인 조작 ===== */
  const updateLine = (idx: number, patch: Partial<EstimateLine>) => {
    setEstimate((prev) => {
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
    setEstimate((p) => ({
      ...p,
      lines: [...p.lines, { itemName: "", qty: 1, price: 0, amount: 0 }],
    }));
  };

  const removeLine = (idx: number) => {
    setEstimate((p) => ({
      ...p,
      lines: p.lines.filter((_, i) => i !== idx),
    }));
  };

  /* ===== 신규 ===== */
  const openNew = () => {
    setSelectedId(null);
    setEstimate(emptyEstimate());
    setShow(true);
  };

  /* ===== 상세 ===== */
  const openDetail = async (id: number) => {
    const res = await axios.get(`${API_BASE}/${id}`);
    setSelectedId(id);
    setEstimate(res.data);
    setShow(true);
  };

  /* ===== 저장 ===== */
  const saveEstimate = async () => {
    if (!estimate.customerName) {
      alert("거래처를 입력하세요");
      return;
    }
    if (estimate.lines.length === 0) {
      alert("라인을 입력하세요");
      return;
    }

    try {
      if (selectedId) {
        await axios.put(`${API_BASE}/${selectedId}`, estimate);
      } else {
        await axios.post(API_BASE, estimate);
      }
      await fetchEstimates();
      setShow(false);
    } catch (e) {
      console.error("저장 실패", e);
    }
  };

  /* ===== 삭제 ===== */
  const deleteEstimate = async () => {
    if (!selectedId) return;
    if (!window.confirm("삭제하시겠습니까?")) return;

    await axios.delete(`${API_BASE}/${selectedId}`);
    await fetchEstimates();
    setShow(false);
  };

    const stockMenu = [
  { key: "status", label: "견적서 입력", path: "/est" },
];

  /* ===== 화면 ===== */
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
                <Lnb menuList={stockMenu} title="견적서입력"/>
              </Left>
              <Right>
                <TopWrap />
                <JustifyContent>
                  <TableTitle>견적서 입력</TableTitle>
                </JustifyContent>

                <Table hover>
                  <thead>
                    <tr>
                      <th>견적번호</th>
                      <th>견적일자</th>
                      <th>거래처</th>
                      <th className="text-end">합계금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estimateList.map((e) => (
                      <tr
                        key={e.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => openDetail(e.id!)}
                      >
                        <td>{e.estimateNo}</td>
                        <td>{e.estimateDate}</td>
                        <td>{e.customerName}</td>
                        <td className="text-end">
                          {e.lines
                            .reduce((s, l) => s + l.amount, 0)
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
          <Modal.Title>견적서 {selectedId ? "수정" : "등록"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <RoundRect>
            <InputGroup>
              <W30><MidLabel>견적번호</MidLabel></W30>
              <W70>
                <Form.Control
                  value={estimate.estimateNo}
                  onChange={(e) =>
                    setEstimate((p) => ({ ...p, estimateNo: e.target.value }))
                  }
                />
              </W70>
            </InputGroup>

            <InputGroup className="my-3">
              <W30><MidLabel>견적일자</MidLabel></W30>
              <W70>
                <Form.Control
                  type="date"
                  value={estimate.estimateDate}
                  onChange={(e) =>
                    setEstimate((p) => ({ ...p, estimateDate: e.target.value }))
                  }
                />
              </W70>
            </InputGroup>

            <InputGroup className="my-3">
              <W30><MidLabel>거래처</MidLabel></W30>
              <W70>
                <Form.Control
                  value={estimate.customerName}
                  onChange={(e) =>
                    setEstimate((p) => ({
                      ...p,
                      customerName: e.target.value,
                    }))
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
                {estimate.lines.map((l, idx) => (
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
            <Button variant="danger" onClick={deleteEstimate}>
              삭제
            </Button>
          )}
          <Button onClick={saveEstimate}>
            {selectedId ? "수정" : "저장"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EstimateInput;
