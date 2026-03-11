import { Modal, Button, Form, Row, Col, Table } from "react-bootstrap";

export type JournalLine = {
  accountCode: string;
  dcType: "DEBIT" | "CREDIT";
  amount: number;
  lineRemark?: string;
  accountName?: string | null;
};

export type Journal = {
  journalNo: string;
  journalDate: string;
  customerId: number | null;
  customerName: string;
  remark: string;
  status: string;
  lines: JournalLine[];
};

type Props = {
  show: boolean;
  selectedId: number | null;
  journal: Journal;
  totals: { debitTotal: number; creditTotal: number };

  onClose: () => void;
  onSetJournal: (updater: any) => void;

  addLine: () => void;
  removeLine: (idx: number) => void;
  updateLine: (idx: number, patch: Partial<JournalLine>) => void;

  onSave: () => void;
  onDelete: () => void;

  customerList: any[];
};

const ACCOUNTS = [
  { code: "1010", name: "현금" },
  { code: "1020", name: "보통예금" },
  { code: "1030", name: "당좌예금" },
  { code: "2110", name: "지급어음" },
  { code: "41", name: "매출(41)" },
  { code: "51", name: "매출원가(51)" },
  { code: "52", name: "판매관리비(52)" },
  { code: "71", name: "영업외수익(71)" },
  { code: "72", name: "영업외비용(72)" },
];

const n = (v: any) => Number(v ?? 0) || 0;

const inputStyle = {
  height: "44px",
  borderRadius: "12px",
  borderColor: "#dbe2ea",
  boxShadow: "none",
};

const selectStyle = {
  height: "44px",
  borderRadius: "12px",
  borderColor: "#dbe2ea",
  boxShadow: "none",
};

export default function GeneralJournalModal({
  show,
  selectedId,
  journal,
  totals,
  onClose,
  onSetJournal,
  addLine,
  removeLine,
  updateLine,
  onSave,
  onDelete,
  customerList,
}: Props) {
  const patchHeader = (patch: Partial<Journal>) => {
    onSetJournal((prev: Journal) => ({ ...prev, ...patch }));
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size="xl"
      backdrop="static"
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
          {selectedId ? "전표 수정" : "전표 등록"}
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
          <Row className="g-4" style={{ marginBottom: "22px" }}>
            <Col md={3}>
              <Form.Label
                style={{
                  fontWeight: 700,
                  color: "#475467",
                  marginBottom: "8px",
                }}
              >
                전표일자
              </Form.Label>
              <Form.Control
                type="date"
                value={journal.journalDate ?? ""}
                onChange={(e) => patchHeader({ journalDate: e.target.value })}
                style={inputStyle}
              />
            </Col>

            <Col md={3}>
              <Form.Label
                style={{
                  fontWeight: 700,
                  color: "#475467",
                  marginBottom: "8px",
                }}
              >
                전표번호(선택)
              </Form.Label>
              <Form.Control
                value={journal.journalNo ?? ""}
                onChange={(e) => patchHeader({ journalNo: e.target.value })}
                placeholder="자동채번이면 비워도 됨"
                style={inputStyle}
              />
            </Col>

            <Col md={3}>
              <Form.Label
                style={{
                  fontWeight: 700,
                  color: "#475467",
                  marginBottom: "8px",
                }}
              >
                거래처
              </Form.Label>
              <Form.Select
                value={journal.customerId ?? ""}
                onChange={(e) => {
                  const selectedId = e.target.value ? Number(e.target.value) : null;
                  const selectedCustomer =
                    customerList.find(
                      (c: any) => Number(c.id ?? c.customerId) === selectedId
                    ) ?? null;

                  patchHeader({
                    customerId: selectedId,
                    customerName:
                      selectedCustomer?.customerName ?? selectedCustomer?.name ?? "",
                  });
                }}
                style={selectStyle}
              >
                <option value="">거래처 선택</option>
                {customerList.map((c: any) => {
                  const id = c.id ?? c.customerId;
                  const name = c.customerName ?? c.name ?? "";
                  return (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  );
                })}
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Label
                style={{
                  fontWeight: 700,
                  color: "#475467",
                  marginBottom: "8px",
                }}
              >
                적요
              </Form.Label>
              <Form.Control
                value={journal.remark ?? ""}
                onChange={(e) => patchHeader({ remark: e.target.value })}
                placeholder="메모"
                style={inputStyle}
              />
            </Col>
          </Row>

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
            전표 라인
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
                hover
                responsive
                className="mb-0 align-middle"
                style={{
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
                        width: 60,
                        padding: "14px 16px",
                        fontWeight: 700,
                        color: "#475467",
                        textAlign: "center",
                      }}
                    >
                      #
                    </th>
                    <th
                      style={{
                        width: 300,
                        padding: "14px 16px",
                        fontWeight: 700,
                        color: "#475467",
                      }}
                    >
                      계정
                    </th>
                    <th
                      style={{
                        width: 160,
                        padding: "14px 16px",
                        fontWeight: 700,
                        color: "#475467",
                      }}
                    >
                      차/대
                    </th>
                    <th
                      style={{
                        width: 200,
                        padding: "14px 16px",
                        fontWeight: 700,
                        color: "#475467",
                        textAlign: "right",
                      }}
                    >
                      금액
                    </th>
                    <th
                      style={{
                        padding: "14px 16px",
                        fontWeight: 700,
                        color: "#475467",
                      }}
                    >
                      적요
                    </th>
                    <th
                      style={{
                        width: 90,
                        padding: "14px 16px",
                        fontWeight: 700,
                        color: "#475467",
                        textAlign: "center",
                      }}
                    >
                      삭제
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {(journal.lines || []).map((l, idx) => (
                    <tr key={idx}>
                      <td
                        className="text-center"
                        style={{
                          verticalAlign: "middle",
                          padding: "10px 12px",
                          fontWeight: 600,
                          color: "#475467",
                        }}
                      >
                        {idx + 1}
                      </td>

                      <td style={{ padding: "10px" }}>
                        <Form.Select
                          value={l.accountCode ?? ""}
                          onChange={(e) =>
                            updateLine(idx, {
                              accountCode: e.target.value,
                              accountName:
                                ACCOUNTS.find((a) => a.code === e.target.value)?.name ?? "",
                            })
                          }
                          style={{
                            ...selectStyle,
                            height: "42px",
                            borderRadius: "10px",
                          }}
                        >
                          <option value="">계정 선택</option>
                          {ACCOUNTS.map((a) => (
                            <option key={a.code} value={a.code}>
                              {a.code} - {a.name}
                            </option>
                          ))}
                        </Form.Select>
                      </td>

                      <td style={{ padding: "10px" }}>
                        <Form.Select
                          value={l.dcType}
                          onChange={(e) =>
                            updateLine(idx, {
                              dcType: e.target.value as "DEBIT" | "CREDIT",
                            })
                          }
                          style={{
                            ...selectStyle,
                            height: "42px",
                            borderRadius: "10px",
                          }}
                        >
                          <option value="DEBIT">차변(DEBIT)</option>
                          <option value="CREDIT">대변(CREDIT)</option>
                        </Form.Select>
                      </td>

                      <td
                        className="text-end"
                        style={{
                          verticalAlign: "middle",
                          padding: "10px",
                        }}
                      >
                        <Form.Control
                          type="number"
                          min={0}
                          value={n(l.amount)}
                          onChange={(e) => updateLine(idx, { amount: n(e.target.value) })}
                          style={{
                            ...inputStyle,
                            height: "42px",
                            borderRadius: "10px",
                            textAlign: "right",
                          }}
                        />
                      </td>

                      <td style={{ padding: "10px" }}>
                        <Form.Control
                          value={l.lineRemark ?? ""}
                          onChange={(e) =>
                            updateLine(idx, { lineRemark: e.target.value })
                          }
                          placeholder="라인 적요"
                          style={{
                            ...inputStyle,
                            height: "42px",
                            borderRadius: "10px",
                          }}
                        />
                      </td>

                      <td
                        className="text-center"
                        style={{
                          verticalAlign: "middle",
                          padding: "10px",
                        }}
                      >
                        <Button
                          variant="outline-danger"
                          size="sm"
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

                <tfoot>
                  <tr
                    style={{
                      backgroundColor: "#f8fafc",
                      fontWeight: 700,
                    }}
                  >
                    <td
                      colSpan={3}
                      className="text-end"
                      style={{
                        padding: "14px 16px",
                        color: "#475467",
                      }}
                    >
                      합계
                    </td>
                    <td
                      className="text-end"
                      style={{
                        padding: "14px 16px",
                        color: "#111827",
                        fontWeight: 800,
                      }}
                    >
                      차변 {n(totals.debitTotal).toLocaleString()} / 대변{" "}
                      {n(totals.creditTotal).toLocaleString()}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              marginTop: "16px",
            }}
          >
            <Button
              variant="outline-primary"
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
          </div>
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