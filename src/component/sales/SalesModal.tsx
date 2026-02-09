
import { Button, Modal, Table, Form } from "react-bootstrap";
import { RoundRect } from "../../stylesjs/Content.styles";
import { InputGroup, MidLabel } from "../../stylesjs/Input.styles";
import { W30, W70 } from "../../stylesjs/Util.styles";

export type SalesLine = {
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

          {/* ✅ 거래처: 리스트 선택 */}
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

          <Table bordered>
            <thead>
              <tr>
                <th>품목</th>
                <th style={{ width: 120 }}>수량</th>
                <th style={{ width: 150 }}>단가</th>
                <th style={{ width: 150 }}>금액</th>
                <th style={{ width: 90 }}></th>
              </tr>
            </thead>
            <tbody>
              {(sales.lines || []).map((l, idx) => (
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
                  <td className="text-end">{(Number(l.amount) || 0).toLocaleString()}</td>
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