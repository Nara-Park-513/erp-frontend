import { Button, Modal, Table, Form } from "react-bootstrap";
import { RoundRect } from "../../stylesjs/Content.styles";
import { InputGroup, MidLabel } from "../../stylesjs/Input.styles";
import { W30, W70 } from "../../stylesjs/Util.styles";

export type SalesLine = {
itemId?: number | null;   // ✅ 동일하게 추가

  itemName: string;
  qty: number;
  price: number;
  amount: number;
  remark?: string;
};

export type Sales = {
  id?: number;
  salesNo: string;
  salesDate: string;
  customerId: number | null;
  customerName: string;
  remark?: string;
  lines: SalesLine[];
  totalAmount?: number;
};

export type Customer = {
  id: number;
  customerName: string;
};

type Props = {
  show: boolean;
  selectedId: number | null;

  sales: Sales;
  totalAmount: number;

  onClose: () => void;
  onSetSales: React.Dispatch<React.SetStateAction<Sales>>;

  addLine: () => void;
  removeLine: (idx: number) => void;
  updateLine: (idx: number, patch: Partial<SalesLine>) => void;

  onSave: () => void;
  onDelete: () => void;

  customerList: Customer[];
};

export default function SalesModal({
  show,
  selectedId,
  sales,
  totalAmount,
  onClose,
  onSetSales,
  addLine,
  removeLine,
  updateLine,
  onSave,
  onDelete,
  customerList,
}: Props) {
  return (
    <Modal show={show} onHide={onClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>판매 {selectedId ? "수정" : "등록"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <RoundRect>
          <InputGroup>
            <W30>
              <MidLabel>판매번호</MidLabel>
            </W30>
            <W70>
              <Form.Control
                value={sales.salesNo}
                onChange={(e) =>
                  onSetSales((p) => ({ ...p, salesNo: e.target.value }))
                }
              />
            </W70>
          </InputGroup>

          <InputGroup className="my-3">
            <W30>
              <MidLabel>판매일자</MidLabel>
            </W30>
            <W70>
              <Form.Control
                type="date"
                value={sales.salesDate}
                onChange={(e) =>
                  onSetSales((p) => ({ ...p, salesDate: e.target.value }))
                }
              />
            </W70>
          </InputGroup>

          <InputGroup className="my-3">
            <W30>
              <MidLabel>거래처</MidLabel>
            </W30>
            <W70>
              <Form.Select
                value={sales.customerId ?? ""}
                onChange={(e) => {
                  const id = e.target.value ? Number(e.target.value) : null;
                  const name =
                    customerList.find((c) => c.id === id)?.customerName ?? "";
                  onSetSales((p) => ({
                    ...p,
                    customerId: id,
                    customerName: name,
                  }));
                }}
              >
                <option value="">선택하세요</option>
                {customerList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.customerName}
                  </option>
                ))}
              </Form.Select>
            </W70>
          </InputGroup>

          <InputGroup className="my-3">
            <W30>
              <MidLabel>비고</MidLabel>
            </W30>
            <W70>
              <Form.Control
                value={sales.remark ?? ""}
                onChange={(e) =>
                  onSetSales((p) => ({ ...p, remark: e.target.value }))
                }
              />
            </W70>
          </InputGroup>

          <hr />

          {/* ✅ 여기부터: "라인이 안보이는" 문제 방지용 안전 스타일 */}
          <div style={{ overflowX: "auto" }}>
            <Table
              bordered
              responsive
              style={{
                tableLayout: "fixed",
                width: "100%",
                background: "white",
              }}
            >
              <thead>
                <tr>
                  <th style={{ width: "45%" }}>품목</th>
                  <th style={{ width: 120 }}>수량</th>
                  <th style={{ width: 150 }}>단가</th>
                  <th style={{ width: 150 }}>금액</th>
                  <th style={{ width: 90 }}></th>
                </tr>
              </thead>

              <tbody
                style={{
                  // ✅ styled-components에서 tbody에 display:flex 같은게 먹으면 깨짐 → 강제로 복구
                  display: "table-row-group",
                }}
              >
                {(sales.lines || []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center">
                      라인이 없습니다. "라인 추가"를 눌러주세요.
                    </td>
                  </tr>
                )}

                {(sales.lines || []).map((l, idx) => (
                  <tr key={idx}>
                    <td style={{ verticalAlign: "middle" }}>
                      <Form.Control
                        value={l.itemName}
                        onChange={(e) =>
                          updateLine(idx, { itemName: e.target.value })
                        }
                      />
                    </td>
                    <td style={{ verticalAlign: "middle" }}>
                      <Form.Control
                        type="number"
                        value={l.qty}
                        onChange={(e) =>
                          updateLine(idx, { qty: Number(e.target.value) })
                        }
                      />
                    </td>
                    <td style={{ verticalAlign: "middle" }}>
                      <Form.Control
                        type="number"
                        value={l.price}
                        onChange={(e) =>
                          updateLine(idx, { price: Number(e.target.value) })
                        }
                      />
                    </td>
                    <td className="text-end" style={{ verticalAlign: "middle" }}>
                      {(Number(l.amount) || 0).toLocaleString()}
                    </td>
                    <td className="text-end" style={{ verticalAlign: "middle" }}>
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
          </div>
          {/* ✅ 여기까지 */}

          <Button size="sm" onClick={addLine}>
            라인 추가
          </Button>

          <div style={{ textAlign: "right", fontWeight: 700 }}>
            합계금액 : {Number(totalAmount || 0).toLocaleString()}
          </div>
        </RoundRect>
      </Modal.Body>

      <Modal.Footer>
        {selectedId && (
          <Button variant="danger" onClick={onDelete}>
            삭제
          </Button>
        )}
        <Button onClick={onSave}>{selectedId ? "수정" : "저장"}</Button>
      </Modal.Footer>
    </Modal>
  );
}