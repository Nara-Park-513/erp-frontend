import { useMemo } from "react";
import { Button, Modal, Form, Table } from "react-bootstrap";
import { Flex, RoundRect } from "../../stylesjs/Content.styles";
import { W30, W70, JustifyContent } from "../../stylesjs/Util.styles";
import { InputGroup, Radio, Label, MidLabel } from "../../stylesjs/Input.styles";

export type TradeType = "SALES" | "PURCHASE";
export type VatType = "TAX" | "ZERO" | "EXEMPT";
export type JournalStatus = "DRAFT" | "POSTED";

export type JournalLine = {
  id?: number;
  accountCode: string;
  accountName?: string;
  dcType: "DEBIT" | "CREDIT";
  amount: number;
  lineRemark?: string;
};

export type Trade = {
  id?: number;
  tradeType: TradeType;

  tradeNo: string;
  tradeDate: string;

  deptCode?: string;
  deptName?: string;

  projectCode?: string;
  projectName?: string;

  customerId?: number | null;
  customerName?: string;

  vatType: VatType;

  supplyAmount: number;
  vatAmount: number;
  feeAmount: number;
  totalAmount: number;

  revenueAccountCode?: string;
  expenseAccountCode?: string;
  counterAccountCode: string;

  remark?: string;
  status: JournalStatus;

  lines: JournalLine[];
};

export type Customer = {
  id: number;
  customerName: string;
};

type Props = {
  show: boolean;
  selectedId: number | null;
  trade: Trade;
  customerList: Customer[];

  onClose: () => void;
  onPatch: (patch: Partial<Trade>) => void;

  onSave: () => void;
  onDelete: () => void;
};

export default function TradeModal({
  show,
  selectedId,
  trade,
  customerList,
  onClose,
  onPatch,
  onSave,
  onDelete,
}: Props) {
  const totals = useMemo(() => {
    const debitTotal = (trade.lines || [])
      .filter((l) => l.dcType === "DEBIT")
      .reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

    const creditTotal = (trade.lines || [])
      .filter((l) => l.dcType === "CREDIT")
      .reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

    return { debitTotal, creditTotal };
  }, [trade.lines]);

  return (
    <Modal show={show} onHide={onClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {trade.tradeType === "SALES" ? "매출전표" : "매입전표"}{" "}
          {selectedId ? "수정" : "등록"}
        </Modal.Title>
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
                value={trade.tradeNo}
                onChange={(e) => onPatch({ tradeNo: e.target.value })}
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
                value={trade.tradeDate}
                onChange={(e) => onPatch({ tradeDate: e.target.value })}
              />
            </W70>
          </InputGroup>

          {/* 부서 */}
          <InputGroup className="my-3">
            <W30>
              <MidLabel>부서</MidLabel>
            </W30>
            <W70 style={{ display: "flex", gap: 8 }}>
              <Form.Control
                value={trade.deptCode || ""}
                onChange={(e) => onPatch({ deptCode: e.target.value })}
                placeholder="부서코드"
                style={{ width: 160 }}
              />
              <Form.Control
                value={trade.deptName || ""}
                onChange={(e) => onPatch({ deptName: e.target.value })}
                placeholder="부서명"
              />
            </W70>
          </InputGroup>

          {/* 프로젝트 */}
          <InputGroup className="my-3">
            <W30>
              <MidLabel>프로젝트</MidLabel>
            </W30>
            <W70 style={{ display: "flex", gap: 8 }}>
              <Form.Control
                value={trade.projectCode || ""}
                onChange={(e) => onPatch({ projectCode: e.target.value })}
                placeholder="프로젝트코드"
                style={{ width: 160 }}
              />
              <Form.Control
                value={trade.projectName || ""}
                onChange={(e) => onPatch({ projectName: e.target.value })}
                placeholder="프로젝트명"
              />
            </W70>
          </InputGroup>

          {/* 부가세유형 */}
          <InputGroup className="my-3">
            <W30>
              <MidLabel>부가세유형</MidLabel>
            </W30>
            <W70>
              <Form.Select
                value={trade.vatType}
                onChange={(e) => onPatch({ vatType: e.target.value as any })}
              >
                <option value="TAX">과세(10%)</option>
                <option value="ZERO">영세(0%)</option>
                <option value="EXEMPT">면세(0%)</option>
              </Form.Select>
            </W70>
          </InputGroup>

          {/* 거래처 */}
          <InputGroup className="my-3">
            <W30>
              <MidLabel>거래처</MidLabel>
            </W30>
            <W70>
              <Form.Select
                value={trade.customerName || ""}
                onChange={(e) => onPatch({ customerName: e.target.value })}
              >
                <option value="">-- 선택 --</option>
                {customerList.map((c) => (
                  <option key={c.id} value={c.customerName ?? ""}>
                    {c.customerName}
                  </option>
                ))}
              </Form.Select>
            </W70>
          </InputGroup>

          {/* 공급/부가세/수수료/합계 */}
          <InputGroup className="my-3">
            <W30>
              <MidLabel>공급가액</MidLabel>
            </W30>
            <W70>
              <Form.Control
                type="number"
                value={trade.supplyAmount}
                onChange={(e) => onPatch({ supplyAmount: Number(e.target.value) || 0 })}
                min={0}
              />
            </W70>
          </InputGroup>

          <InputGroup className="my-3">
            <W30>
              <MidLabel>부가세</MidLabel>
            </W30>
            <W70 style={{ display: "flex", gap: 8 }}>
              <Form.Control
                type="number"
                value={trade.vatAmount}
                onChange={(e) => onPatch({ vatAmount: Number(e.target.value) || 0 })}
                min={0}
              />
              <div style={{ display: "flex", alignItems: "center", opacity: 0.7 }}>
                (유형/공급가 바꾸면 자동계산)
              </div>
            </W70>
          </InputGroup>

          <InputGroup className="my-3">
            <W30>
              <MidLabel>수수료</MidLabel>
            </W30>
            <W70>
              <Form.Control
                type="number"
                value={trade.feeAmount}
                onChange={(e) => onPatch({ feeAmount: Number(e.target.value) || 0 })}
                min={0}
              />
            </W70>
          </InputGroup>

          <InputGroup className="my-3">
            <W30>
              <MidLabel>합계</MidLabel>
            </W30>
            <W70>
              <Form.Control type="number" value={trade.totalAmount} disabled />
            </W70>
          </InputGroup>

          {/* 계정 */}
          {trade.tradeType === "SALES" ? (
            <InputGroup className="my-3">
              <W30>
                <MidLabel>매출계정</MidLabel>
              </W30>
              <W70>
                <Form.Control
                  value={trade.revenueAccountCode || ""}
                  onChange={(e) => onPatch({ revenueAccountCode: e.target.value })}
                  placeholder="예: 4049"
                />
              </W70>
            </InputGroup>
          ) : (
            <InputGroup className="my-3">
              <W30>
                <MidLabel>매입/비용계정</MidLabel>
              </W30>
              <W70>
                <Form.Control
                  value={trade.expenseAccountCode || ""}
                  onChange={(e) => onPatch({ expenseAccountCode: e.target.value })}
                  placeholder="예: 5000"
                />
              </W70>
            </InputGroup>
          )}

          <InputGroup className="my-3">
            <W30>
              <MidLabel>{trade.tradeType === "SALES" ? "입금계정" : "지급계정"}</MidLabel>
            </W30>
            <W70>
              <Form.Control
                value={trade.counterAccountCode || ""}
                onChange={(e) => onPatch({ counterAccountCode: e.target.value })}
                placeholder="예: 1089(외상) / 1110(예금)"
              />
            </W70>
          </InputGroup>

          {/* 적요 */}
          <InputGroup className="my-3">
            <W30>
              <MidLabel>적요</MidLabel>
            </W30>
            <W70>
              <Form.Control
                as="textarea"
                rows={2}
                value={trade.remark || ""}
                onChange={(e) => onPatch({ remark: e.target.value })}
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
                <span key={v} style={{ marginRight: 12 }}>
                  <Radio
                    checked={trade.status === (v as any)}
                    onChange={() => onPatch({ status: v as any })}
                  />
                  <Label className="mx-2">{l}</Label>
                </span>
              ))}
            </W70>
          </Flex>

          <hr />

          {/* 자동 분개 미리보기 */}
          <JustifyContent>
            <div style={{ fontWeight: 700 }}>자동 분개(미리보기)</div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div>차변합: {totals.debitTotal.toLocaleString()}</div>
              <div>대변합: {totals.creditTotal.toLocaleString()}</div>
            </div>
          </JustifyContent>

          <Table responsive className="mt-2">
            <thead>
              <tr>
                <th style={{ width: 110 }}>차/대</th>
                <th style={{ width: 160 }}>계정코드</th>
                <th style={{ width: 180 }}>금액</th>
                <th>적요</th>
              </tr>
            </thead>
            <tbody>
              {(trade.lines || []).map((l, idx) => (
                <tr key={idx}>
                  <td>{l.dcType === "DEBIT" ? "차변" : "대변"}</td>
                  <td>{l.accountCode}</td>
                  <td className="text-end">{Number(l.amount || 0).toLocaleString()}</td>
                  <td>{l.lineRemark || "-"}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          {totals.debitTotal !== totals.creditTotal && (
            <div style={{ color: "crimson", fontWeight: 700 }}>
              ⚠ 차변합과 대변합이 일치하지 않습니다. (저장 불가)
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