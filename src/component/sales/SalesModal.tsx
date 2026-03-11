import { Button, Modal, Table, Form } from "react-bootstrap";
import { RoundRect } from "../../stylesjs/Content.styles";
import { InputGroup, MidLabel } from "../../stylesjs/Input.styles";
import { W30, W70 } from "../../stylesjs/Util.styles";

export type SalesLine = {
  itemId?: number | null;
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

export type ItemOption = {
  id: number;
  itemName: string;
  outPrice?: number;
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
  itemList?: ItemOption[]; // ✅ optional
};

const inputStyle = {
  height: "44px",
  borderRadius: "12px",
  borderColor: "#dbe2ea",
  boxShadow: "none",
};

const topInputStyle = {
  ...inputStyle,
  width: "795px",
};

const topSelectStyle = {
  ...inputStyle,
  width: "795px",
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
  itemList = [], // ✅ default value
}: Props) {
  const hasItemList = itemList.length > 0;

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
          판매 {selectedId ? "수정" : "등록"}
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
              marginBottom: "20px",
            }}
          >
            <InputGroup style={{ alignItems: "center", margin: 0 }}>
              <W30>
                <MidLabel style={{ color: "#475467", fontWeight: 700 }}>
                  판매번호
                </MidLabel>
              </W30>
              <W70>
                <Form.Control
                  value={sales.salesNo}
                  onChange={(e) =>
                    onSetSales((p) => ({ ...p, salesNo: e.target.value }))
                  }
                  style={topInputStyle}
                />
              </W70>
            </InputGroup>

            <InputGroup style={{ alignItems: "center", margin: 0 }}>
              <W30>
                <MidLabel style={{ color: "#475467", fontWeight: 700 }}>
                  판매일자
                </MidLabel>
              </W30>
              <W70>
                <Form.Control
                  type="date"
                  value={sales.salesDate}
                  onChange={(e) =>
                    onSetSales((p) => ({ ...p, salesDate: e.target.value }))
                  }
                  style={topInputStyle}
                />
              </W70>
            </InputGroup>

            <InputGroup style={{ alignItems: "center", margin: 0 }}>
              <W30>
                <MidLabel style={{ color: "#475467", fontWeight: 700 }}>
                  거래처
                </MidLabel>
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
                  style={topSelectStyle}
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
                <MidLabel style={{ color: "#475467", fontWeight: 700 }}>
                  비고
                </MidLabel>
              </W30>
              <W70>
                <Form.Control
                  value={sales.remark ?? ""}
                  onChange={(e) =>
                    onSetSales((p) => ({ ...p, remark: e.target.value }))
                  }
                  style={topInputStyle}
                />
              </W70>
            </InputGroup>
          </div>

          <div
            style={{
              marginBottom: "14px",
              paddingTop: "18px",
              borderTop: "1px solid #eef2f7",
              fontSize: "15px",
              fontWeight: 700,
              color: "#374151",
            }}
          >
            판매 품목
          </div>

          <div
            style={{
              border: "1px solid #e8ecf4",
              borderRadius: "16px",
              overflow: "hidden",
              backgroundColor: "#ffffff",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <Table
                bordered
                responsive
                className="mb-0 align-middle"
                style={{
                  tableLayout: "fixed",
                  width: "100%",
                  marginBottom: 0,
                  background: "white",
                  borderColor: "#e8ecf4",
                }}
              >
                <thead
                  style={{
                    background: "linear-gradient(180deg, #fbfcfe 0%, #f4f7fb 100%)",
                  }}
                >
                  <tr>
                    <th
                      style={{
                        width: "45%",
                        padding: "14px 16px",
                        fontWeight: 700,
                        color: "#475467",
                      }}
                    >
                      품목
                    </th>
                    <th
                      style={{
                        width: 120,
                        padding: "14px 16px",
                        fontWeight: 700,
                        color: "#475467",
                      }}
                    >
                      수량
                    </th>
                    <th
                      style={{
                        width: 150,
                        padding: "14px 16px",
                        fontWeight: 700,
                        color: "#475467",
                      }}
                    >
                      단가
                    </th>
                    <th
                      style={{
                        width: 150,
                        padding: "14px 16px",
                        fontWeight: 700,
                        color: "#475467",
                      }}
                    >
                      금액
                    </th>
                    <th
                      style={{
                        width: 90,
                        padding: "14px 16px",
                      }}
                    ></th>
                  </tr>
                </thead>

                <tbody style={{ display: "table-row-group" }}>
                  {(sales.lines || []).length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center"
                        style={{
                          padding: "28px 16px",
                          color: "#98a2b3",
                          fontSize: "14px",
                        }}
                      >
                        라인이 없습니다. "라인 추가"를 눌러주세요.
                      </td>
                    </tr>
                  )}

                  {(sales.lines || []).map((l, idx) => (
                    <tr key={idx}>
                      <td style={{ verticalAlign: "middle", padding: "10px" }}>
                        {hasItemList ? (
                          <Form.Select
                            value={l.itemId ?? ""}
                            onChange={(e) => {
                              const id = e.target.value ? Number(e.target.value) : null;
                              const item = itemList.find((it) => it.id === id);

                              updateLine(idx, {
                                itemId: id,
                                itemName: item?.itemName ?? "",
                                price: Number(item?.outPrice ?? 0),
                              });
                            }}
                            style={{
                              ...inputStyle,
                              height: "42px",
                              borderRadius: "10px",
                            }}
                          >
                            <option value="">품목 선택</option>
                            {itemList.map((it) => (
                              <option key={it.id} value={it.id}>
                                {it.itemName}
                              </option>
                            ))}
                          </Form.Select>
                        ) : (
                          <Form.Control
                            value={l.itemName}
                            onChange={(e) =>
                              updateLine(idx, { itemName: e.target.value })
                            }
                            style={{
                              ...inputStyle,
                              height: "42px",
                              borderRadius: "10px",
                            }}
                          />
                        )}
                      </td>

                      <td style={{ verticalAlign: "middle", padding: "10px" }}>
                        <Form.Control
                          type="number"
                          value={l.qty}
                          onChange={(e) =>
                            updateLine(idx, { qty: Number(e.target.value) })
                          }
                          style={{
                            ...inputStyle,
                            height: "42px",
                            borderRadius: "10px",
                          }}
                        />
                      </td>

                      <td style={{ verticalAlign: "middle", padding: "10px" }}>
                        <Form.Control
                          type="number"
                          value={l.price}
                          onChange={(e) =>
                            updateLine(idx, { price: Number(e.target.value) })
                          }
                          style={{
                            ...inputStyle,
                            height: "42px",
                            borderRadius: "10px",
                          }}
                        />
                      </td>

                      <td
                        className="text-end"
                        style={{
                          verticalAlign: "middle",
                          padding: "10px 16px",
                          fontWeight: 700,
                          color: "#111827",
                        }}
                      >
                        {(Number(l.amount) || 0).toLocaleString()}
                      </td>

                      <td
                        className="text-end"
                        style={{
                          verticalAlign: "middle",
                          padding: "10px",
                        }}
                      >
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => removeLine(idx)}
                          style={{
                            borderRadius: "10px",
                            padding: "8px 12px",
                            fontWeight: 600,
                          }}
                        >
                          삭제
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "16px",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <Button
              size="sm"
              onClick={addLine}
              style={{
                backgroundColor: "#eef2f7",
                border: "1px solid #dbe2ea",
                color: "#475569",
                borderRadius: "10px",
                padding: "9px 14px",
                fontWeight: 700,
              }}
            >
              라인 추가
            </Button>

            <div
              style={{
                textAlign: "right",
                fontWeight: 800,
                color: "#111827",
                fontSize: "18px",
                letterSpacing: "-0.02em",
              }}
            >
              합계금액 : {Number(totalAmount || 0).toLocaleString()}
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
          {selectedId ? "수정" : "저장"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}