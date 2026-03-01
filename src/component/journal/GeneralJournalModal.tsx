
import { Modal, Button, Form, Row, Col, Table } from "react-bootstrap";

/* =========================
   ✅ GeneralJournal.tsx와 맞춘 타입
   (GeneralJournal.tsx에서 import 하는 Journal/JournalLine을 여기서 export)
========================= */
export type JournalLine = {
  accountCode: string;
  dcType: "DEBIT" | "CREDIT";
  amount: number;
  lineRemark?: string;
  // 서버가 내려줄 수도 있는 값들 (있어도 되고 없어도 됨)
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

/* =========================
   ✅ GeneralJournal.tsx가 넘기는 Props와 "완전히 동일"하게
========================= */
type Props = {
  show: boolean;
  selectedId: number | null;
  journal: Journal;
  totals: { debitTotal: number; creditTotal: number };

  onClose: () => void;
  onSetJournal: (j: any) => void; // ✅ setState 그대로 받으려고 any 처리(타입 충돌 방지)

  addLine: () => void;
  removeLine: (idx: number) => void;
  updateLine: (idx: number, patch: Partial<JournalLine>) => void;

  onSave: () => void;
  onDelete: () => void;

  customerList: any[];
};

/* =========================
   ✅ 계정과목 데이터가 없으니 프론트 임시 목록
   - 선택하면 accountCode가 자동 입력됨
========================= */
const ACCOUNTS = [
  { code: "1010", name: "현금" },
  { code: "1020", name: "보통예금" },
  { code: "1030", name: "당좌예금" },
  { code: "2110", name: "지급어음" },

  // 손익(분류 코드 prefix)
  { code: "41", name: "매출(41)" },
  { code: "51", name: "매출원가(51)" },
  { code: "52", name: "판매관리비(52)" },
  { code: "71", name: "영업외수익(71)" },
  { code: "72", name: "영업외비용(72)" },
];

const n = (v: any) => Number(v ?? 0) || 0;

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
  // ✅ 헤더 변경 helper
  const patchHeader = (patch: Partial<Journal>) => {
    onSetJournal((prev: Journal) => ({ ...prev, ...patch }));
  };

  return (
    <Modal show={show} onHide={onClose} centered size="xl" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{selectedId ? "전표 수정" : "전표 등록"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* ===== 헤더 ===== */}
        <Row className="g-3 mb-3">
          <Col md={3}>
            <Form.Label>전표일자</Form.Label>
            <Form.Control
              type="date"
              value={journal.journalDate ?? ""}
              onChange={(e) => patchHeader({ journalDate: e.target.value })}
            />
          </Col>

          <Col md={3}>
            <Form.Label>전표번호(선택)</Form.Label>
            <Form.Control
              value={journal.journalNo ?? ""}
              onChange={(e) => patchHeader({ journalNo: e.target.value })}
              placeholder="자동채번이면 비워도 됨"
            />
          </Col>

          <Col md={3}>
            <Form.Label>거래처</Form.Label>
            <Form.Select
              value={journal.customerName ?? ""}
              onChange={(e) => patchHeader({ customerName: e.target.value })}
            >
              <option value="">거래처 선택</option>
              {customerList.map((c: any) => (
                <option
                  key={c.id ?? c.customerId}
                  value={c.customerName ?? c.name ?? ""}
                >
                  {c.customerName ?? c.name ?? "-"}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={3}>
            <Form.Label>적요</Form.Label>
            <Form.Control
              value={journal.remark ?? ""}
              onChange={(e) => patchHeader({ remark: e.target.value })}
              placeholder="메모"
            />
          </Col>
        </Row>

        {/* ===== 라인 ===== */}
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th style={{ width: 60 }}>#</th>
              <th style={{ width: 300 }}>계정</th>
              <th style={{ width: 160 }}>차/대</th>
              <th style={{ width: 200 }} className="text-end">
                금액
              </th>
              <th>적요</th>
              <th style={{ width: 90 }}>삭제</th>
            </tr>
          </thead>

          <tbody>
            {(journal.lines || []).map((l, idx) => (
              <tr key={idx}>
                <td className="text-center">{idx + 1}</td>

                <td>
                  {/* ✅ 드롭다운 선택으로 accountCode 자동 입력 */}
                  <Form.Select
                    value={l.accountCode ?? ""}
                    onChange={(e) =>
                      updateLine(idx, {
                        accountCode: e.target.value,
                        accountName:
                          ACCOUNTS.find((a) => a.code === e.target.value)
                            ?.name ?? null,
                      })
                    }
                  >
                    <option value="">계정 선택</option>
                    {ACCOUNTS.map((a) => (
                      <option key={a.code} value={a.code}>
                        {a.code} - {a.name}
                      </option>
                    ))}
                  </Form.Select>

                  <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                    계정명: {l.accountName ?? "-"}
                  </div>
                </td>

                <td>
                  <Form.Select
                    value={l.dcType}
                    onChange={(e) =>
                      updateLine(idx, {
                        dcType: e.target.value as "DEBIT" | "CREDIT",
                      })
                    }
                  >
                    <option value="DEBIT">차변(DEBIT)</option>
                    <option value="CREDIT">대변(CREDIT)</option>
                  </Form.Select>
                </td>

                <td className="text-end">
                  <Form.Control
                    type="number"
                    min={0}
                    value={n(l.amount)}
                    onChange={(e) => updateLine(idx, { amount: n(e.target.value) })}
                  />
                </td>

                <td>
                  <Form.Control
                    value={l.lineRemark ?? ""}
                    onChange={(e) => updateLine(idx, { lineRemark: e.target.value })}
                    placeholder="라인 적요"
                  />
                </td>

                <td className="text-center">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeLine(idx)}
                  >
                    삭제
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr style={{ fontWeight: 700 }}>
              <td colSpan={3} className="text-end">
                합계
              </td>
              <td className="text-end">
                차변 {n(totals.debitTotal).toLocaleString()} / 대변{" "}
                {n(totals.creditTotal).toLocaleString()}
              </td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </Table>

        <Button variant="outline-primary" onClick={addLine}>
          라인 추가
        </Button>
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