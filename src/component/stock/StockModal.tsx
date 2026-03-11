import { useMemo } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

export type StockForm = {
  id?: number;
  itemId: number | null;
  itemCode: string;
  itemName: string;
  stockQty: number;
  unitPrice: number;
};

type ItemOption = {
  id: number;
  itemCode: string;
  itemName: string;
  unitPrice?: number;
};

type Props = {
  show: boolean;
  mode: "create" | "edit";
  form: StockForm;
  itemList: ItemOption[];
  onClose: () => void;
  onChange: (patch: Partial<StockForm>) => void;
  onSave: () => void;
  onDelete?: () => void;
};

const inputStyle = {
  height: "44px",
  borderRadius: "12px",
  borderColor: "#dbe2ea",
  boxShadow: "none",
};

const readOnlyStyle = {
  ...inputStyle,
  backgroundColor: "#f8fafc",
  color: "#475467",
};

export default function StockModal({
  show,
  mode,
  form,
  itemList,
  onClose,
  onChange,
  onSave,
  onDelete,
}: Props) {
  const totalAmount = useMemo(() => {
    const qty = Number(form.stockQty) || 0;
    const price = Number(form.unitPrice) || 0;
    return qty * price;
  }, [form.stockQty, form.unitPrice]);

  const handleSelectItem = (rawId: string) => {
    const id = rawId ? Number(rawId) : null;
    const it = itemList.find((x) => x.id === id);

    onChange({
      itemId: id,
      itemCode: it?.itemCode ?? "",
      itemName: it?.itemName ?? "",
      unitPrice: Number(it?.unitPrice ?? 0),
    });
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size="lg"
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
          {mode === "create" ? "재고 등록" : "재고 수정"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body
        style={{
          backgroundColor: "#f8fafc",
          padding: "24px",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e8ecf4",
            borderRadius: "20px",
            padding: "24px",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
          }}
        >
          <Row className="g-4">
            <Col md={12}>
              <Form.Label
                style={{
                  fontWeight: 700,
                  color: "#475467",
                  marginBottom: "8px",
                }}
              >
                품목 선택
              </Form.Label>
              <Form.Select
                value={form.itemId ?? ""}
                onChange={(e) => handleSelectItem(e.target.value)}
                disabled={mode === "edit"}
                style={inputStyle}
              >
                <option value="">-- 품목을 선택하세요 --</option>
                {itemList.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.itemCode} / {it.itemName}
                  </option>
                ))}
              </Form.Select>
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "13px",
                  color: "#98a2b3",
                  fontWeight: 500,
                }}
              >
                * 수정 모드에서는 품목 변경이 제한됩니다.
              </div>
            </Col>

            <Col md={6}>
              <Form.Label
                style={{
                  fontWeight: 700,
                  color: "#475467",
                  marginBottom: "8px",
                }}
              >
                품목 코드
              </Form.Label>
              <Form.Control value={form.itemCode ?? ""} readOnly style={readOnlyStyle} />
            </Col>

            <Col md={6}>
              <Form.Label
                style={{
                  fontWeight: 700,
                  color: "#475467",
                  marginBottom: "8px",
                }}
              >
                품목명
              </Form.Label>
              <Form.Control value={form.itemName ?? ""} readOnly style={readOnlyStyle} />
            </Col>

            <Col md={6}>
              <Form.Label
                style={{
                  fontWeight: 700,
                  color: "#475467",
                  marginBottom: "8px",
                }}
              >
                재고 수량
              </Form.Label>
              <Form.Control
                type="number"
                value={Number(form.stockQty ?? 0)}
                onChange={(e) => onChange({ stockQty: Number(e.target.value ?? 0) })}
                min={0}
                style={inputStyle}
              />
            </Col>

            <Col md={6}>
              <Form.Label
                style={{
                  fontWeight: 700,
                  color: "#475467",
                  marginBottom: "8px",
                }}
              >
                단가
              </Form.Label>
              <Form.Control
                type="number"
                value={Number(form.unitPrice ?? 0)}
                onChange={(e) => onChange({ unitPrice: Number(e.target.value ?? 0) })}
                min={0}
                readOnly
                style={readOnlyStyle}
              />
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "13px",
                  color: "#98a2b3",
                  fontWeight: 500,
                }}
              >
                * 단가는 품목 단가를 사용합니다.
              </div>
            </Col>

            <Col md={12}>
              <div
                style={{
                  borderTop: "1px solid #eef2f7",
                  paddingTop: "18px",
                  marginTop: "4px",
                }}
              >
                <Form.Label
                  style={{
                    fontWeight: 700,
                    color: "#475467",
                    marginBottom: "8px",
                  }}
                >
                  재고 금액
                </Form.Label>
                <Form.Control
                  value={totalAmount.toLocaleString()}
                  readOnly
                  style={{
                    ...readOnlyStyle,
                    fontWeight: 700,
                    color: "#111827",
                  }}
                />
              </div>
            </Col>
          </Row>
        </div>
      </Modal.Body>

      <Modal.Footer
        style={{
          padding: "18px 24px",
          borderTop: "1px solid #eef2f7",
          backgroundColor: "#ffffff",
          gap: "10px",
        }}
      >
        {mode === "edit" && onDelete && (
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
          variant="secondary"
          onClick={onClose}
          style={{
            backgroundColor: "#ffffff",
            color: "#475569",
            border: "1px solid #dbe2ea",
            borderRadius: "10px",
            padding: "10px 16px",
            fontWeight: 700,
          }}
        >
          닫기
        </Button>

        <Button
          onClick={() => {
            if (!form.itemId) return alert("품목을 선택해 주세요.");
            if ((Number(form.stockQty) || 0) < 0) return alert("수량은 0 이상이어야 합니다.");
            onSave();
          }}
          style={{
            backgroundColor: "#6b7280",
            borderColor: "#6b7280",
            borderRadius: "10px",
            padding: "10px 18px",
            fontWeight: 700,
          }}
        >
          {mode === "create" ? "저장" : "수정"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}