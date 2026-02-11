import { Modal, Button, Tab, Tabs, Form } from "react-bootstrap";
import { Flex, RoundRect } from "../../stylesjs/Content.styles";
import { W30, W70 } from "../../stylesjs/Util.styles";
import { TabTitle } from "../../stylesjs/Text.styles";
import { InputGroup, Radio, Label, MidLabel, CheckGroup, Check } from "../../stylesjs/Input.styles";
import { SmallBadge } from "../../stylesjs/Button.styles";

export type ItemForm = {
  itemCode: string;
  itemName: string;
  itemGroup: string;
  spec: string;
  barcode: string;
  specMode: "NAME" | "GROUP" | "CALC" | "CALC_GROUP";
  unit: string;
  process: string;
  itemType: string;
  isSetYn: "Y" | "N";
  inPrice: number;
  inVatIncludedYn: "Y" | "N";
  outPrice: number;
  outVatIncludedYn: "Y" | "N";
  image: string;
  useYn: boolean;
};

type Props = {
  show: boolean;
  onClose: () => void;
  onSave: () => void;

  item: ItemForm;
  setItem: React.Dispatch<React.SetStateAction<ItemForm>>;
};

export default function InventoryModal({ show, onClose, onSave, item, setItem }: Props) {
  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>품목등록</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <TabTitle>품목등록</TabTitle>

        <Tabs defaultActiveKey="basic" justify>
          <Tab eventKey="basic" title="기본">
            <RoundRect>
              {/* 품목코드 */}
              <InputGroup>
                <W30>
                  <MidLabel>품목코드</MidLabel>
                </W30>
                <W70>
                  <Form.Control
                    type="text"
                    placeholder="예시 Z00021"
                    value={item.itemCode}
                    onChange={(e) => setItem((p) => ({ ...p, itemCode: e.target.value }))}
                  />
                </W70>
              </InputGroup>

              {/* 품목명 */}
              <InputGroup className="my-3">
                <W30>
                  <MidLabel>품목명</MidLabel>
                </W30>
                <W70>
                  <Form.Control
                    type="text"
                    placeholder="품목명"
                    value={item.itemName}
                    onChange={(e) => setItem((p) => ({ ...p, itemName: e.target.value }))}
                  />
                </W70>
              </InputGroup>

              {/* 규격 */}
              <Flex>
                <W30>
                  <MidLabel>규격</MidLabel>
                </W30>
                <W70>
                  <Flex className="my-2">
                    <Radio
                      type="radio"
                      checked={item.specMode === "NAME"}
                      onChange={() => setItem((p) => ({ ...p, specMode: "NAME" }))}
                    />
                    <Label className="mx-2">규격명</Label>

                    <Radio
                      type="radio"
                      checked={item.specMode === "GROUP"}
                      onChange={() => setItem((p) => ({ ...p, specMode: "GROUP" }))}
                    />
                    <Label className="mx-2">규격그룹</Label>

                    <Radio
                      type="radio"
                      checked={item.specMode === "CALC"}
                      onChange={() => setItem((p) => ({ ...p, specMode: "CALC" }))}
                    />
                    <Label className="mx-2">규격계산</Label>

                    <Radio
                      type="radio"
                      checked={item.specMode === "CALC_GROUP"}
                      onChange={() => setItem((p) => ({ ...p, specMode: "CALC_GROUP" }))}
                    />
                    <Label className="mx-2">규격계산그룹</Label>
                  </Flex>

                  <Form.Control
                    type="text"
                    placeholder="규격"
                    value={item.spec}
                    onChange={(e) => setItem((p) => ({ ...p, spec: e.target.value }))}
                  />
                </W70>
              </Flex>

              {/* 단위 */}
              <InputGroup className="my-3">
                <W30>
                  <MidLabel>단위</MidLabel>
                </W30>
                <W70>
                  <Form.Control
                    type="text"
                    placeholder="단위"
                    className="w-75"
                    value={item.unit}
                    onChange={(e) => setItem((p) => ({ ...p, unit: e.target.value }))}
                  />
                </W70>
              </InputGroup>

              {/* 품목구분 */}
              <Flex>
                <W30>
                  <MidLabel>품목구분</MidLabel>
                </W30>
                <W70>
                  <Flex className="my-2">
                    {[
                      ["RAW_MATERIAL", "원재료"],
                      ["SUB_MATERIAL", "부재료"],
                      ["PRODUCT", "제품"],
                      ["SEMI_PRODUCT", "반제품"],
                      ["GOODS", "상품"],
                      ["INTANGIBLE", "무형상품"],
                    ].map(([v, l]) => (
                      <span key={v}>
                        <Radio
                          type="radio"
                          checked={item.itemType === v}
                          onChange={() => setItem((p) => ({ ...p, itemType: v }))}
                        />
                        <Label className="mx-2">{l}</Label>
                      </span>
                    ))}
                  </Flex>

                  <Flex className="my-2">
                    <SmallBadge className="mx-5">세트여부</SmallBadge>
                    <Radio
                      type="radio"
                      checked={item.isSetYn === "Y"}
                      onChange={() => setItem((p) => ({ ...p, isSetYn: "Y" }))}
                    />
                    <Label className="mx-2">사용</Label>
                    <Radio
                      type="radio"
                      checked={item.isSetYn === "N"}
                      onChange={() => setItem((p) => ({ ...p, isSetYn: "N" }))}
                    />
                    <Label className="mx-2">사용안함</Label>
                  </Flex>
                </W70>
              </Flex>

              {/* 생산공정 */}
              <InputGroup className="my-3">
                <W30>
                  <MidLabel>생산공정</MidLabel>
                </W30>
                <W70>
                  <Form.Control
                    type="text"
                    placeholder="생산공정"
                    value={item.process}
                    onChange={(e) => setItem((p) => ({ ...p, process: e.target.value }))}
                  />
                </W70>
              </InputGroup>

              {/* 입고단가 */}
              <InputGroup>
                <W30>
                  <MidLabel>입고단가</MidLabel>
                </W30>
                <W70>
                  <Flex>
                    <Form.Control
                      type="number"
                      value={item.inPrice}
                      onChange={(e) => setItem((p) => ({ ...p, inPrice: Number(e.target.value) }))}
                    />
                    <CheckGroup>
                      <Check
                        type="checkbox"
                        className="mx-2"
                        checked={item.inVatIncludedYn === "Y"}
                        onChange={(e: any) =>
                          setItem((p) => ({
                            ...p,
                            inVatIncludedYn: e.target.checked ? "Y" : "N",
                          }))
                        }
                      />
                      <Label>VAT 포함</Label>
                    </CheckGroup>
                  </Flex>
                </W70>
              </InputGroup>

              {/* 출고단가 */}
              <InputGroup className="my-3">
                <W30>
                  <MidLabel>출고단가</MidLabel>
                </W30>
                <W70>
                  <Flex>
                    <Form.Control
                      type="number"
                      value={item.outPrice}
                      onChange={(e) => setItem((p) => ({ ...p, outPrice: Number(e.target.value) }))}
                      placeholder="출고단가"
                    />
                    <CheckGroup>
                      <Check
                        type="checkbox"
                        className="mx-2"
                        checked={item.outVatIncludedYn === "Y"}
                        onChange={(e: any) =>
                          setItem((p) => ({
                            ...p,
                            outVatIncludedYn: e.target.checked ? "Y" : "N",
                          }))
                        }
                      />
                      <Label>VAT 포함</Label>
                    </CheckGroup>
                  </Flex>
                </W70>
              </InputGroup>

              {/* 사용여부(useYn) */}
              <InputGroup className="my-3">
                <W30>
                  <MidLabel>사용여부</MidLabel>
                </W30>
                <W70>
                  <Form.Control value={item.useYn ? "Y" : "N"} readOnly />
                </W70>
              </InputGroup>
            </RoundRect>
          </Tab>

          <Tab eventKey="info" title="품목정보" />
          <Tab eventKey="qty" title="수량" />
          <Tab eventKey="price" title="단가" />
          <Tab eventKey="cost" title="원가" />
          <Tab eventKey="etc" title="부가정보" />
          <Tab eventKey="manage" title="관리대상" />
        </Tabs>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" onClick={onSave}>
          Save Change
        </Button>
      </Modal.Footer>
    </Modal>
  );
}