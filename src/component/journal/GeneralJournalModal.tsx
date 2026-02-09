import { Button, Modal, Form, Table } from "react-bootstrap";
import { Flex, RoundRect } from "../../stylesjs/Content.styles";
import { JustifyContent, W70, W30 } from "../../stylesjs/Util.styles";
import { InputGroup, Radio, Label, MidLabel } from "../../stylesjs/Input.styles";

/* =========================
   타입들
========================= */

export type JournalStatus = "DRAFT" | "POSTED";

export type JournalLine = {
  id?: number;
  accountCode: string;
  accountName?: string;
  dcType: "DEBIT" | "CREDIT";
  amount: number;
  lineRemark?: string;
};

export type Journal = {
  id?: number;
  journalNo: string;
  journalDate: string; // YYYY-MM-DD
  customerId?: number | null;
  customerName?: string;
  remark?: string;
  status: JournalStatus;
  lines: JournalLine[];
};

/** ✅ 거래처 타입 (부모에서도 동일 타입 쓰면 가장 좋음) */
export type Customer = {
  id: number;
  customerName: string;
  customerCode?: string;
  ceoName?: string;
  phone?: string;
  email?: string;
  address?: string;
  remark?: string;
  detailAddress?: string;
  customerType?: string;
};

type Totals = { debitTotal: number; creditTotal: number };

type Props = {
  show: boolean;
  selectedId: number | null;
  journal: Journal;
  totals: Totals;

  /** ✅ 거래처 목록 (배열!) */
  customerList: Customer[];

  onClose: () => void;
  onSetJournal: React.Dispatch<React.SetStateAction<Journal>>;

  addLine: () => void;
  removeLine: (idx: number) => void;
  updateLine: (idx: number, patch: Partial<JournalLine>) => void;

  onSave: () => void;
  onDelete: () => void;
};

export default function GeneralJournalModal({
  show,
  selectedId,
  journal,
  totals,
  customerList,
  onClose,
  onSetJournal,
  addLine,
  removeLine,
  updateLine,
  onSave,
  onDelete,
}: Props) {
  /** 현재 선택된 거래처 id (string) 계산 */
  const selectedCustomerId = (() => {
    if (journal.customerId != null) return String(journal.customerId);
    const matched = customerList.find(
      (c) => c.customerName === (journal.customerName || "")
    );
    return matched ? String(matched.id) : "";
  })();

  return (
    <Modal show={show} onHide={onClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>일반전표 {selectedId ? "수정" : "등록"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <RoundRect>
          {/* 전표번호 */}
          <InputGroup>
            <W30>
              <MidLabel>전표번호</MidLabel>
            </W30>
            <W70>
              <Form.Control
                value={journal.journalNo}
                onChange={(e) =>
                  onSetJournal((p) => ({ ...p, journalNo: e.target.value }))
                }
                placeholder="(자동채번이면 비워도 됨)"
              />
            </W70>
          </InputGroup>

          {/* 전표일자 */}
          <InputGroup className="my-3">
            <W30>
              <MidLabel>전표일자</MidLabel>
            </W30>
            <W70>
              <Form.Control
                type="date"
                value={journal.journalDate}
                onChange={(e) =>
                  onSetJournal((p) => ({ ...p, journalDate: e.target.value }))
                }
              />
            </W70>
          </InputGroup>

          {/* 거래처 - select */}
          <InputGroup className="my-3">
            <W30>
              <MidLabel>거래처</MidLabel>
            </W30>
            <W70>
              <Form.Select
                value={selectedCustomerId}
                onChange={(e) => {
                  const id = e.target.value ? Number(e.target.value) : null;
                  const c = customerList.find((x) => x.id === id);
                  onSetJournal((p) => ({
                    ...p,
                    customerId: id,
                    customerName: c?.customerName || "",
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
            </W70>
          </InputGroup>

          {/* 적요 */}
          <InputGroup className="my-3">
            <W30>
              <MidLabel>전표 적요</MidLabel>
            </W30>
            <W70>
              <Form.Control
                as="textarea"
                rows={2}
                value={journal.remark || ""}
                onChange={(e) =>
                  onSetJournal((p) => ({ ...p, remark: e.target.value }))
                }
              />
            </W70>
          </InputGroup>

          {/* 상태 */}
          <Flex className="my-3">
            <W30>
              <MidLabel>상태</MidLabel>
            </W30>
            <W70>
              {[
                ["DRAFT", "작성중"],
                ["POSTED", "확정"],
              ].map(([v, l]) => (
                <span key={v}>
                  <Radio
                    checked={journal.status === (v as JournalStatus)}
                    onChange={() =>
                      onSetJournal((p) => ({
                        ...p,
                        status: v as JournalStatus,
                      }))
                    }
                  />
                  <Label className="mx-2">{l}</Label>
                </span>
              ))}
            </W70>
          </Flex>

          <hr />

          {/* 라인 헤더 */}
          <JustifyContent>
            <div style={{ fontWeight: 700 }}>전표 라인</div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div>차변합: {totals.debitTotal.toLocaleString()}</div>
              <div>대변합: {totals.creditTotal.toLocaleString()}</div>
              <Button size="sm" variant="outline-primary" onClick={addLine}>
                라인 추가
              </Button>
            </div>
          </JustifyContent>

          {/* 라인 테이블 */}
          <Table responsive className="mt-2">
            <thead>
              <tr>
                <th style={{ width: 110 }}>차/대</th>
                <th style={{ width: 160 }}>계정코드</th>
                <th>계정명</th>
                <th style={{ width: 180 }}>금액</th>
                <th>라인 적요</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {journal.lines.map((l, idx) => (
                <tr key={idx}>
                  <td>
                    <Form.Select
                      value={l.dcType}
                      onChange={(e) =>
                        updateLine(idx, {
                          dcType: e.target.value as "DEBIT" | "CREDIT",
                        })
                      }
                    >
                      <option value="DEBIT">차변</option>
                      <option value="CREDIT">대변</option>
                    </Form.Select>
                  </td>

                  <td>
                    <Form.Control
                      value={l.accountCode}
                      onChange={(e) =>
                        updateLine(idx, { accountCode: e.target.value })
                      }
                      placeholder="예: 1110"
                    />
                  </td>

                  <td>
                    <Form.Control
                      value={l.accountName || ""}
                      disabled
                    />
                  </td>

                  <td>
                    <Form.Control
                      type="number"
                      value={l.amount}
                      onChange={(e) =>
                        updateLine(idx, {
                          amount: Number(e.target.value) || 0,
                        })
                      }
                      min={0}
                    />
                  </td>

                  <td>
                    <Form.Control
                      value={l.lineRemark || ""}
                      onChange={(e) =>
                        updateLine(idx, { lineRemark: e.target.value })
                      }
                    />
                  </td>

                  <td className="text-end">
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => removeLine(idx)}
                      disabled={journal.lines.length <= 2}
                    >
                      삭제
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {totals.debitTotal !== totals.creditTotal && (
            <div style={{ color: "crimson", fontWeight: 700 }}>
              ⚠ 차변합과 대변합이 일치하지 않습니다.
            </div>
          )}
        </RoundRect>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          close
        </Button>
        {selectedId && (
          <Button variant="danger" onClick={onDelete}>
            Delete
          </Button>
        )}
        <Button variant="primary" onClick={onSave}>
          {selectedId ? "Update" : "Save"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}