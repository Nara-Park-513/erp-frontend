import { Dispatch, SetStateAction } from "react";
import { Modal, Form, Row, Col } from "react-bootstrap";
import { MaterialReceiptRow, Supplier } from "../../19_material/MaterialReceiptManagement";

type Props = {
  show: boolean;
  selectedId: number | null;
  receiptForm: MaterialReceiptRow;
  supplierList: Supplier[];
  onClose: () => void;
  onSetReceiptForm: Dispatch<SetStateAction<MaterialReceiptRow>>;
  onSave: () => void;
  onDelete: () => void;
};

export default function MaterialReceiptModal({
  show,
  selectedId,
  receiptForm,
  supplierList,
  onClose,
  onSetReceiptForm,
  onSave,
  onDelete,
}: Props) {
  const updateField = <K extends keyof MaterialReceiptRow>(
    key: K,
    value: MaterialReceiptRow[K]
  ) => {
    onSetReceiptForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{selectedId ? "입고 상세 / 수정" : "입고 등록"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>입고번호</Form.Label>
              <Form.Control
                type="text"
                placeholder="자동생성 가능"
                value={receiptForm.receiptNo}
                onChange={(e) => updateField("receiptNo", e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>입고일자</Form.Label>
              <Form.Control
                type="date"
                value={receiptForm.receiptDate}
                onChange={(e) => updateField("receiptDate", e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>발주번호</Form.Label>
              <Form.Control
                type="text"
                value={receiptForm.orderNo}
                onChange={(e) => updateField("orderNo", e.target.value)}
                placeholder="발주번호 입력"
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>공급업체</Form.Label>
              <Form.Select
                value={receiptForm.supplierId ?? ""}
                onChange={(e) => {
                  const value = Number(e.target.value || 0);
                  const supplier = supplierList.find((s) => s.id === value);

                  onSetReceiptForm((prev) => ({
                    ...prev,
                    supplierId: value || null,
                    supplierName: supplier?.customerName ?? "",
                  }));
                }}
              >
                <option value="">공급업체 선택</option>
                {supplierList.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.customerName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>자재명</Form.Label>
              <Form.Control
                type="text"
                value={receiptForm.itemName}
                onChange={(e) => updateField("itemName", e.target.value)}
                placeholder="자재명 입력"
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>입고수량</Form.Label>
              <Form.Control
                type="number"
                min={0}
                value={receiptForm.qty}
                onChange={(e) => updateField("qty", Number(e.target.value || 0))}
                placeholder="입고수량 입력"
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>입고상태</Form.Label>
              <Form.Select
                value={receiptForm.status}
                onChange={(e) => updateField("status", e.target.value)}
              >
                <option value="입고대기">입고대기</option>
                <option value="검수중">검수중</option>
                <option value="부분입고">부분입고</option>
                <option value="입고완료">입고완료</option>
                <option value="입고취소">입고취소</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>창고</Form.Label>
              <Form.Control
                type="text"
                value={receiptForm.warehouse}
                onChange={(e) => updateField("warehouse", e.target.value)}
                placeholder="예: A창고"
              />
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group>
              <Form.Label>비고</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={receiptForm.remark}
                onChange={(e) => updateField("remark", e.target.value)}
                placeholder="검수 메모, 특이사항 등"
              />
            </Form.Group>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          {selectedId ? (
            <button
              type="button"
              onClick={onDelete}
              style={{
                backgroundColor: "#ffffff",
                color: "#b42318",
                border: "1px solid #fecdca",
                borderRadius: "10px",
                padding: "10px 16px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              삭제
            </button>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: "#ffffff",
              color: "#475467",
              border: "1px solid #d0d5dd",
              borderRadius: "10px",
              padding: "10px 16px",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            취소
          </button>

          <button
            type="button"
            onClick={onSave}
            style={{
              backgroundColor: "#6b7280",
              color: "#ffffff",
              border: "1px solid #6b7280",
              borderRadius: "10px",
              padding: "10px 16px",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            저장
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}