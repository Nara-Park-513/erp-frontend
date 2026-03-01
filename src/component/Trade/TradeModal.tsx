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

/** ✅ 추가: TRADE_LINES 용 */
export type TradeLine = {
  id?: number;
  itemId: number | null;
  itemCode?: string;
  itemName: string;
  qty: number;
  unitPrice: number;
  supplyAmount: number;
  vatAmount: number;
  totalAmount: number;
  remark?: string;
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

  /** ✅ 기존 자동분개 미리보기 */
  lines: JournalLine[];

  /** ✅ 추가: 품목 라인(TradeLine) */
  tradeLines?: TradeLine[];
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
  /** ✅ VAT 계산(공급가 기준) */
  const calcVat = (vatType: VatType, supply: number) => {
    if (vatType === "TAX") return Math.round((Number(supply) || 0) * 0.1);
    return 0;
  };

  /** ✅ 품목라인 합계 → 헤더 공급가/부가세/합계 자동 반영 */
  const tradeLineTotals = useMemo(() => {
    const lines = trade.tradeLines || [];
    const supply = lines.reduce((s, l) => s + (Number(l.supplyAmount) || 0), 0);
    const vat = lines.reduce((s, l) => s + (Number(l.vatAmount) || 0), 0);
    const total = lines.reduce((s, l) => s + (Number(l.totalAmount) || 0), 0);
    return { supply, vat, total };
  }, [trade.tradeLines]);

  /** ✅ 자동분개(미리보기) 합계 */
  const totals = useMemo(() => {
    const debitTotal = (trade.lines || [])
      .filter((l) => l.dcType === "DEBIT")
      .reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

    const creditTotal = (trade.lines || [])
      .filter((l) => l.dcType === "CREDIT")
      .reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

    return { debitTotal, creditTotal };
  }, [trade.lines]);

  /** ✅ tradeLines 라인 추가/삭제/수정 (onPatch로만 상태 변경) */
  const addTradeLine = () => {
    const next: TradeLine[] = [
      ...(trade.tradeLines || []),
      {
        itemId: null,
        itemName: "",
        qty: 1,
        unitPrice: 0,
        supplyAmount: 0,
        vatAmount: 0,
        totalAmount: 0,
        remark: "",
      },
    ];
    onPatch({ tradeLines: next });
  };

  const removeTradeLine = (idx: number) => {
    const next = (trade.tradeLines || []).filter((_, i) => i !== idx);
    onPatch({ tradeLines: next });
  };

  const updateTradeLine = (idx: number, patch: Partial<TradeLine>) => {
    const vatType = trade.vatType;

    const next = (trade.tradeLines || []).map((l, i) => {
      if (i !== idx) return l;
      const u: TradeLine = { ...l, ...patch };

      const qty = Number(u.qty) || 0;
      const unit = Number(u.unitPrice) || 0;
      const supply = qty * unit;
      const vat = calcVat(vatType, supply);

      u.supplyAmount = supply;
      u.vatAmount = vat;
      u.totalAmount = supply + vat;

      return u;
    });

    onPatch({ tradeLines: next });
  };

  /** ✅ vatType 변경 시: 모든 tradeLines의 vat 재계산 */
  const onChangeVatType = (nextVatType: VatType) => {
    const nextLines = (trade.tradeLines || []).map((l) => {
      const qty = Number(l.qty) || 0;
      const unit = Number(l.unitPrice) || 0;
      const supply = qty * unit;
      const vat = nextVatType === "TAX" ? Math.round(supply * 0.1) : 0;
      return {
        ...l,
        supplyAmount: supply,
        vatAmount: vat,
        totalAmount: supply + vat,
      };
    });

    // ✅ 헤더값은 부모에서 onPatch 로직이 갱신하지만,
    // 여기서도 tradeLines 먼저 반영되게 같이 보냄
    onPatch({ vatType: nextVatType, tradeLines: nextLines });
  };

  /** ✅ tradeLines 합계를 헤더에 반영(화면에서만 자동) */
  const syncHeaderFromTradeLines = () => {
    const supply = tradeLineTotals.supply;
    const vat = tradeLineTotals.vat;
    const fee = Number(trade.feeAmount) || 0;

    const total =
      trade.tradeType === "SALES" ? supply + vat - fee : supply + vat + fee;

    onPatch({
      supplyAmount: supply,
      vatAmount: vat,
      totalAmount: total,
    });
  };

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
                onChange={(e) => onChangeVatType(e.target.value as VatType)}
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

          {/* ✅ 품목라인 입력(TRADE_LINES) */}
          <hr />
          <JustifyContent>
            <div style={{ fontWeight: 700 }}>품목 라인</div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div>공급가합: {tradeLineTotals.supply.toLocaleString()}</div>
              <div>부가세합: {tradeLineTotals.vat.toLocaleString()}</div>
              <div>합계: {tradeLineTotals.total.toLocaleString()}</div>
              <Button size="sm" variant="outline-primary" onClick={syncHeaderFromTradeLines}>
                헤더 금액에 반영
              </Button>
            </div>
          </JustifyContent>

          <Table bordered className="mt-2">
            <thead>
              <tr>
                <th>품목명</th>
                <th style={{ width: 120 }} className="text-end">수량</th>
                <th style={{ width: 150 }} className="text-end">단가</th>
                <th style={{ width: 160 }} className="text-end">공급가</th>
                <th style={{ width: 150 }} className="text-end">부가세</th>
                <th style={{ width: 160 }} className="text-end">합계</th>
                <th style={{ width: 90 }}></th>
              </tr>
            </thead>
            <tbody>
              {(trade.tradeLines || []).length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center" style={{ opacity: 0.7 }}>
                    라인이 없습니다. "라인 추가"를 눌러주세요.
                  </td>
                </tr>
              )}

              {(trade.tradeLines || []).map((l, idx) => (
                <tr key={idx}>
                  <td>
                    <Form.Control
                      value={l.itemName || ""}
                      onChange={(e) => updateTradeLine(idx, { itemName: e.target.value })}
                      placeholder="품목명(임시)"
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={l.qty ?? 0}
                      onChange={(e) => updateTradeLine(idx, { qty: Number(e.target.value) || 0 })}
                      min={0}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={l.unitPrice ?? 0}
                      onChange={(e) => updateTradeLine(idx, { unitPrice: Number(e.target.value) || 0 })}
                      min={0}
                    />
                  </td>
                  <td className="text-end">{Number(l.supplyAmount || 0).toLocaleString()}</td>
                  <td className="text-end">{Number(l.vatAmount || 0).toLocaleString()}</td>
                  <td className="text-end">{Number(l.totalAmount || 0).toLocaleString()}</td>
                  <td className="text-end">
                    <Button size="sm" variant="outline-danger" onClick={() => removeTradeLine(idx)}>
                      삭제
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Button size="sm" onClick={addTradeLine}>
            라인 추가
          </Button>

          {/* 공급/부가세/수수료/합계 */}
          <hr />
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
                (품목라인 기준이면 "헤더 금액에 반영" 버튼 사용)
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