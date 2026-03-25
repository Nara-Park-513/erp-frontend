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

const ORDER_STATUS_OPTIONS = [
  "발주요청",
  "발주완료",
  "입고대기",
  "부분입고",
  "입고완료",
  "발주취소",
];

const inputStyle = {
  height: "44px",
  borderRadius: "12px",
  borderColor: "#dbe2ea",
  boxShadow: "none",
  width: "795px",
};

const readOnlyStyle = {
  ...inputStyle,
  backgroundColor: "#f8fafc",
  color: "#475467",
};

const extractExpectedDate = (remark?: string) => {
  const value = (remark ?? "").trim();
  if (!value) return "";

  const match = value.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : "";
};

export default function MaterialOrderModal({
  show,
  selectedId,
  materialOrder,
  totalAmount,
  onClose,
  onSetMaterialOrder,
  onSave,
  onDelete,
  customerList,
}: Props) {
  const firstLine =
    materialOrder.lines && materialOrder.lines.length > 0
      ? materialOrder.lines[0]
      : { itemId: null, itemName: "", qty: 1, price: 0, amount: 0 };

  const expectedDate = extractExpectedDate(materialOrder.remark);

  return (
    <Modal
      show={show}
      onHide={onClose}
      size="xl"
      centered
      contentClassName="border-0 shadow-lg"
    >
      <Modal.Header
        closeButton
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid #eef2f7",
          background: "linear-gradient(180deg, #fbfcfe 0%, #f8fafc 100%)",
        }}
      >
        <Modal.Title
          style={{
            fontWeight: 800,
            color: "#1f2937",
            fontSize: "28px",
            letterSpacing: "-0.02em",
          }}
        >
          자재 발주 {selectedId ? "수정" : "등록"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body
        style={{
          backgroundColor: "#f8fafc",
          padding: "24px",
        }}
      >
        <RoundRect
          style={{
            width: "100%",
            backgroundColor: "#ffffff",
            border: "1px solid #e8ecf4",
            borderRadius: "20px",
            padding: "24px",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: "16px",
            }}
          >
            <InputGroup style={{ alignItems: "center", margin: 0 }}>
              <W30>
                <MidLabel
                  style={{
                    color: "#475467",
                    fontWeight: 700,
                  }}
                >
                  자재명
                </MidLabel>
              </W30>
              <W70>
                <Form.Control
                  value={firstLine.itemName ?? ""}
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
                  placeholder="자재명을 입력하세요"
                  style={inputStyle}
                />
              </W70>
            </InputGroup>

            <InputGroup style={{ alignItems: "center", margin: 0 }}>
              <W30>
                <MidLabel
                  style={{
                    color: "#475467",
                    fontWeight: 700,
                  }}
                >
                  발주번호
                </MidLabel>
              </W30>
              <W70>
                <Form.Control
                  value={materialOrder.orderNo}
                  onChange={(e) =>
                    onSetMaterialOrder((p) => ({ ...p, orderNo: e.target.value }))
                  }
                  placeholder="자동 생성 가능"
                  style={selectedId ? inputStyle : readOnlyStyle}
                  disabled={!selectedId}
                />
              </W70>
            </InputGroup>

            <InputGroup style={{ alignItems: "center", margin: 0 }}>
              <W30>
                <MidLabel
                  style={{
                    color: "#475467",
                    fontWeight: 700,
                  }}
                >
                  공급업체
                </MidLabel>
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
                  style={inputStyle}
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

            <InputGroup style={{ alignItems: "center", margin: 0 }}>
              <W30>
                <MidLabel
                  style={{
                    color: "#475467",
                    fontWeight: 700,
                  }}
                >
                  발주수량
                </MidLabel>
              </W30>
              <W70>
                <Form.Control
                  type="number"
                  min={1}
                  value={firstLine.qty ?? 1}
                  onChange={(e) => {
                    const qty = Number(e.target.value || 0);
                    onSetMaterialOrder((p) => {
                      const lines =
                        p.lines && p.lines.length > 0
                          ? p.lines.map((line, idx) =>
                              idx === 0
                                ? {
                                    ...line,
                                    qty,
                                    amount: qty * Number(line.price || 0),
                                  }
                                : line
                            )
                          : [
                              {
                                itemId: null,
                                itemName: "",
                                qty,
                                price: 0,
                                amount: 0,
                              },
                            ];

                      return { ...p, lines };
                    });
                  }}
                  placeholder="발주수량"
                  style={inputStyle}
                />
              </W70>
            </InputGroup>

            <InputGroup style={{ alignItems: "center", margin: 0 }}>
              <W30>
                <MidLabel
                  style={{
                    color: "#475467",
                    fontWeight: 700,
                  }}
                >
                  단가
                </MidLabel>
              </W30>
              <W70>
                <Form.Control
                  type="number"
                  min={0}
                  value={firstLine.price ?? 0}
                  onChange={(e) => {
                    const price = Number(e.target.value || 0);
                    onSetMaterialOrder((p) => {
                      const lines =
                        p.lines && p.lines.length > 0
                          ? p.lines.map((line, idx) =>
                              idx === 0
                                ? {
                                    ...line,
                                    price,
                                    amount: Number(line.qty || 0) * price,
                                  }
                                : line
                            )
                          : [
                              {
                                itemId: null,
                                itemName: "",
                                qty: 1,
                                price,
                                amount: price,
                              },
                            ];

                      return { ...p, lines };
                    });
                  }}
                  placeholder="단가"
                  style={inputStyle}
                />
              </W70>
            </InputGroup>

            <InputGroup style={{ alignItems: "center", margin: 0 }}>
              <W30>
                <MidLabel
                  style={{
                    color: "#475467",
                    fontWeight: 700,
                  }}
                >
                  발주일자
                </MidLabel>
              </W30>
              <W70>
                <Form.Control
                  type="date"
                  value={materialOrder.orderDate}
                  onChange={(e) =>
                    onSetMaterialOrder((p) => ({ ...p, orderDate: e.target.value }))
                  }
                  style={inputStyle}
                />
              </W70>
            </InputGroup>

            <InputGroup style={{ alignItems: "center", margin: 0 }}>
              <W30>
                <MidLabel
                  style={{
                    color: "#475467",
                    fontWeight: 700,
                  }}
                >
                  예상입고일
                </MidLabel>
              </W30>
              <W70>
                <Form.Control
                  type="date"
                  value={expectedDate}
                  onChange={(e) =>
                    onSetMaterialOrder((p) => ({
                      ...p,
                      remark: e.target.value ? `예상입고일:${e.target.value}` : "",
                    }))
                  }
                  style={inputStyle}
                />
              </W70>
            </InputGroup>

            <InputGroup style={{ alignItems: "center", margin: 0 }}>
              <W30>
                <MidLabel
                  style={{
                    color: "#475467",
                    fontWeight: 700,
                  }}
                >
                  발주상태
                </MidLabel>
              </W30>
              <W70>
                <Form.Select
                  value={materialOrder.status ?? "발주요청"}
                  onChange={(e) =>
                    onSetMaterialOrder((p) => ({ ...p, status: e.target.value }))
                  }
                  style={inputStyle}
                >
                  {ORDER_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Form.Select>
              </W70>
            </InputGroup>

            <div
              style={{
                marginTop: "4px",
                paddingTop: "14px",
                borderTop: "1px solid #eef2f7",
                fontSize: "13px",
                color: "#98a2b3",
                fontWeight: 500,
                textAlign: "right",
              }}
            >
              총 발주금액: {Number(totalAmount || 0).toLocaleString()}원
            </div>
          </div>
        </RoundRect>
      </Modal.Body>

      <Modal.Footer
        style={{
          padding: "18px 24px",
          borderTop: "1px solid #eef2f7",
          backgroundColor: "#ffffff",
          gap: "10px",
        }}
      >
        {selectedId && (
          <Button
            variant="danger"
            onClick={onDelete}
            style={{
              borderRadius: "10px",
              padding: "10px 16px",
              fontWeight: 700,
            }}
          >
            삭제
          </Button>
        )}

        <Button
          onClick={onSave}
          style={{
            backgroundColor: "#6b7280",
            borderColor: "#6b7280",
            borderRadius: "10px",
            padding: "10px 18px",
            fontWeight: 700,
          }}
        >
          저장
        </Button>
      </Modal.Footer>
    </Modal>
  );
}