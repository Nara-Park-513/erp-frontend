import { Button, Modal, Form } from "react-bootstrap";
import { RoundRect } from "../../stylesjs/Content.styles";
import { InputGroup, MidLabel } from "../../stylesjs/Input.styles";
import { W30, W70 } from "../../stylesjs/Util.styles";

export type MaterialOrderLine = {
  itemId?: number | null;
  itemName: string;
  qty: number;
  price: number;
  amount: number;
  remark?: string;
};

export type MaterialOrder = {
  id?: number;
  orderNo: string;
  orderDate: string;
  customerId: number | null;
  customerName: string;
  remark?: string;
  status?: string;
  lines: MaterialOrderLine[];
  totalAmount?: number;
};

export type Customer = {
  id: number;
  customerName: string;
};

type Props = {
  show: boolean;
  selectedId: number | null;

  materialOrder: MaterialOrder;
  totalAmount: number;

  onClose: () => void;
  onSetMaterialOrder: React.Dispatch<React.SetStateAction<MaterialOrder>>;

  addLine: () => void;
  removeLine: (idx: number) => void;
  updateLine: (idx: number, patch: Partial<MaterialOrderLine>) => void;

  onSave: () => void;
  onDelete: () => void;

  customerList: Customer[];
};

export default function MaterialOrderModal({
  show,
  selectedId,
  materialOrder,
  onClose,
  onSetMaterialOrder,
  onSave,
  onDelete,
  customerList,
}: Props) {
  return (
    <Modal show={show} onHide={onClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>자재 발주 {selectedId ? "수정" : "등록"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <RoundRect>
          <InputGroup>
            <W30>
              <MidLabel>자재목록</MidLabel>
            </W30>
            <W70>
              <Form.Control
                value={materialOrder.lines?.[0]?.itemName ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  onSetMaterialOrder((p) => {
                    const lines =
                      p.lines && p.lines.length > 0
                        ? p.lines.map((line, idx) =>
                            idx === 0 ? { ...line, itemName: value } : line
                          )
                        : [
                            {
                              itemId: null,
                              itemName: value,
                              qty: 1,
                              price: 0,
                              amount: 0,
                            },
                          ];

                    return { ...p, lines };
                  });
                }}
              />
            </W70>
          </InputGroup>

          <InputGroup className="my-3">
            <W30>
              <MidLabel>발주번호</MidLabel>
            </W30>
            <W70>
              <Form.Control
                value={materialOrder.orderNo}
                onChange={(e) =>
                  onSetMaterialOrder((p) => ({ ...p, orderNo: e.target.value }))
                }
              />
            </W70>
          </InputGroup>

          <InputGroup className="my-3">
            <W30>
              <MidLabel>발주현황</MidLabel>
            </W30>
            <W70>
              <Form.Control
                value={materialOrder.status ?? ""}
                onChange={(e) =>
                  onSetMaterialOrder((p) => ({ ...p, status: e.target.value }))
                }
              />
            </W70>
          </InputGroup>

          <InputGroup className="my-3">
            <W30>
              <MidLabel>발주일자</MidLabel>
            </W30>
            <W70>
              <Form.Control
                type="date"
                value={materialOrder.orderDate}
                onChange={(e) =>
                  onSetMaterialOrder((p) => ({ ...p, orderDate: e.target.value }))
                }
              />
            </W70>
          </InputGroup>

          <InputGroup className="my-3">
            <W30>
              <MidLabel>공급업체</MidLabel>
            </W30>
            <W70>
              <Form.Select
                value={materialOrder.customerId ?? ""}
                onChange={(e) => {
                  const id = e.target.value ? Number(e.target.value) : null;
                  const name =
                    customerList.find((c) => c.id === id)?.customerName ?? "";
                  onSetMaterialOrder((p) => ({
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
        </RoundRect>
      </Modal.Body>

      <Modal.Footer>
        {selectedId && (
          <Button variant="danger" onClick={onDelete}>
            삭제
          </Button>
        )}
        <Button variant="secondary" onClick={onClose}>
          닫기
        </Button>
        <Button onClick={onSave}>저장</Button>
      </Modal.Footer>
    </Modal>
  );
}