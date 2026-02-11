// ✅ StockModal.tsx (전체 복붙용) — itemId 기반(Select) + 금액 자동계산 + 생성/수정/삭제
import { useMemo } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

export type StockForm = {
  id?: number;
  itemId: number | null;
  itemCode: string;
  itemName: string;
  stockQty: number; // 화면표시용 = onHandQty
  unitPrice: number; // 품목 단가(표시용)
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

  // ✅ 품목 선택용 목록
  itemList: ItemOption[];

  onClose: () => void;
  onChange: (patch: Partial<StockForm>) => void;

  onSave: () => void;
  onDelete?: () => void;
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
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{mode === "create" ? "재고 등록" : "재고 수정"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Row className="g-3">
          <Col md={12}>
            <Form.Label>품목 선택</Form.Label>
            <Form.Select
              value={form.itemId ?? ""}
              onChange={(e) => handleSelectItem(e.target.value)}
              disabled={mode === "edit"} // ✅ 수정모드에서는 품목 변경 막기(중복/정합성 방지)
            >
              <option value="">-- 품목을 선택하세요 --</option>
              {itemList.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.itemCode} / {it.itemName}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              * 수정 모드에서는 품목 변경이 제한됩니다.
            </Form.Text>
          </Col>

          <Col md={6}>
            <Form.Label>품목코드</Form.Label>
            <Form.Control value={form.itemCode ?? ""} readOnly />
          </Col>

          <Col md={6}>
            <Form.Label>품목명</Form.Label>
            <Form.Control value={form.itemName ?? ""} readOnly />
          </Col>

          <Col md={6}>
            <Form.Label>재고수량</Form.Label>
            <Form.Control
              type="number"
              value={Number(form.stockQty ?? 0)}
              onChange={(e) =>
                onChange({ stockQty: Number(e.target.value ?? 0) })
              }
              min={0}
            />
          </Col>

          <Col md={6}>
            <Form.Label>단가</Form.Label>
            <Form.Control
              type="number"
              value={Number(form.unitPrice ?? 0)}
              onChange={(e) =>
                onChange({ unitPrice: Number(e.target.value ?? 0) })
              }
              min={0}
              readOnly // ✅ 단가는 품목에서 따라오게(원하면 readOnly 제거)
            />
            <Form.Text className="text-muted">
              * 단가는 품목 단가를 사용합니다.
            </Form.Text>
          </Col>

          <Col md={12}>
            <Form.Label>재고금액</Form.Label>
            <Form.Control value={totalAmount.toLocaleString()} readOnly />
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer>
        {mode === "edit" && onDelete && (
          <Button variant="danger" onClick={onDelete}>
            삭제
          </Button>
        )}
        <Button variant="secondary" onClick={onClose}>
          닫기
        </Button>
        <Button
          onClick={() => {
            if (!form.itemId) return alert("품목을 선택해 주세요.");
            if ((Number(form.stockQty) || 0) < 0) return alert("수량은 0 이상이어야 합니다.");
            onSave();
          }}
        >
          {mode === "create" ? "저장" : "수정"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}