import { Modal, Button, Form, Table } from "react-bootstrap";

/** ✅ 거래처 타입 */
export type Customer = {
  id: number;
  customerName: string;
};

export type SalesLine = {
  itemName: string;
  qty: number;
  price: number;
  discount: number; // 라인 할인율(%)
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

  discountRate?: number; // ✅ 전체 할인율(옵션)
  totalAmount?: number; // 추가
  lines: SalesLine[];
};

type Props = {
  show: boolean;
  selectedId: number | null;
  sales: Sales;

  onClose: () => void;
  onSetSales: React.Dispatch<React.SetStateAction<Sales>>;

  updateLine: (idx: number, patch: Partial<SalesLine>) => void;
  addLine: () => void;
  removeLine: (idx: number) => void;

  onSave: () => void;
  onDelete: () => void;

  totalAmount: number;

  customerList: Customer[];
};

export default function Sales2Modal({
  show,
  selectedId,
  sales,
  onClose,
  onSetSales,
  updateLine,
  addLine,
  removeLine,
  onSave,
  onDelete,
  totalAmount,
  customerList,
}: Props) {
  return (
    <Modal show={show} onHide={onClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>판매2 {selectedId ? "수정" : "등록"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* 판매번호 */}
        <Form.Control
          placeholder="판매번호"
          value={sales.salesNo}
          onChange={(e) => onSetSales((p) => ({ ...p, salesNo: e.target.value }))}
        />

        {/* 판매일자 */}
        <Form.Control
          className="mt-2"
          type="date"
          value={sales.salesDate}
          onChange={(e) => onSetSales((p) => ({ ...p, salesDate: e.target.value }))}
        />

        {/* 거래처 선택 */}
        <Form.Select
          className="mt-3"
          value={sales.customerId ?? ""}
          onChange={(e) => {
            const id = e.target.value ? Number(e.target.value) : null;
            const cname = id ? customerList.find((c) => c.id === id)?.customerName ?? "" : "";

            onSetSales((p) => ({
              ...p,
              customerId: id,
              customerName: cname,
            }));
          }}
        >
          <option value="">거래처 선택</option>
          {customerList.map((c) => (
            <option key={c.id} value={c.id}>
              {c.customerName}
            </option>
          ))}
        </Form.Select>

        {/* 비고 */}
        <Form.Control
          className="mt-2"
          as="textarea"
          rows={2}
          placeholder="비고"
          value={sales.remark ?? ""}
          onChange={(e) => onSetSales((p) => ({ ...p, remark: e.target.value }))}
        />

        <Table bordered className="mt-3">
          <thead>
            <tr>
              <th>품목</th>
              <th style={{ width: 100 }}>수량</th>
              <th style={{ width: 120 }}>단가</th>
              <th style={{ width: 120 }}>할인(%)</th>
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateLine(idx, { itemName: e.target.value })
                    }
                  />
                </td>

                <td>
                  <Form.Control
                    type="number"
                    value={l.qty}
                    min={0}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateLine(idx, { qty: Number(e.target.value) })
                    }
                  />
                </td>

                <td>
                  <Form.Control
                    type="number"
                    value={l.price}
                    min={0}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateLine(idx, { price: Number(e.target.value) })
                    }
                  />
                </td>

                <td>
                  <Form.Control
                    type="number"
                    value={l.discount}
                    min={0}
                    max={100}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateLine(idx, { discount: Number(e.target.value) })
                    }
                  />
                </td>

                <td className="text-end">{Number(l.amount || 0).toLocaleString()}</td>

                <td className="text-center">
                  <Button size="sm" variant="outline-danger" onClick={() => removeLine(idx)}>
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

        <div style={{ textAlign: "right", fontWeight: 700, marginTop: 8 }}>
          합계금액 : {Number(totalAmount || 0).toLocaleString()}
        </div>
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
        <Button onClick={onSave}>{selectedId ? "수정" : "저장"}</Button>
      </Modal.Footer>
    </Modal>
  );
}