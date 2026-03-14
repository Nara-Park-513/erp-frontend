import { Modal, Button, Tab, Tabs, Form } from "react-bootstrap";
import { RoundRect } from "../../stylesjs/Content.styles";
import { W30, W70 } from "../../stylesjs/Util.styles";
import { TabTitle } from "../../stylesjs/Text.styles";
import {
  InputGroup,
  Radio,
  Label,
  MidLabel,
  CheckGroup,
  Check,
} from "../../stylesjs/Input.styles";
import { SmallBadge } from "../../stylesjs/Button.styles";

export type InventoryDetailForm = {
  id?: number;
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
  onDelete: () => void;
  item: InventoryDetailForm | null;
  setItem: React.Dispatch<React.SetStateAction<InventoryDetailForm | null>>;
  saving?: boolean;
  deleting?: boolean;
};

const inputStyle = {
  height: "44px",
  borderRadius: "12px",
  borderColor: "#dbe2ea",
  boxShadow: "none",
};

const readOnlyStyle = {
  ...inputStyle,
  backgroundColor: "#f8fafc",
  color: "#475467",
};

const sectionLabelStyle = {
  color: "#475467",
  fontWeight: 700,
  fontSize: "14px",
};

const radioWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap" as const,
  marginBottom: "10px",
};

const tabPlaceholderStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e8ecf4",
  borderRadius: "16px",
  padding: "24px",
  minHeight: "240px",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
};

export default function InventoryDetailModal({
  show,
  onClose,
  onSave,
  onDelete,
  item,
  setItem,
  saving = false,
  deleting = false,
}: Props) {
  const disabled = saving || deleting;

  const updateField = <K extends keyof InventoryDetailForm>(
    key: K,
    value: InventoryDetailForm[K]
  ) => {
    setItem((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

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
          품목 상세 / 수정
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
            marginBottom: "14px",
            lineHeight: 1.2,
          }}
        >
          <TabTitle
            style={{
              margin: 0,
              color: "#1f2937",
              fontWeight: 700,
            }}
          >
            품목정보
          </TabTitle>
          <div
            style={{
              marginTop: "6px",
              fontSize: "14px",
              color: "#6b7280",
              fontWeight: 500,
            }}
          >
            기본정보 및 품목 속성을 수정하거나 삭제할 수 있습니다.
          </div>
        </div>

        <Tabs
          defaultActiveKey="basic"
          justify
          style={{
            marginBottom: "18px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <Tab eventKey="basic" title="기본">
            <div style={{ paddingTop: "18px" }}>
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
                  }}
                >
                  <InputGroup style={{ alignItems: "center", margin: 0 }}>
                    <W30>
                      <MidLabel style={sectionLabelStyle}>품목 ID</MidLabel>
                    </W30>
                    <W70>
                      <Form.Control
                        value={item?.id ?? ""}
                        readOnly
                        style={{
                          ...readOnlyStyle,
                          maxWidth: "220px",
                        }}
                      />
                    </W70>
                  </InputGroup>

                  <InputGroup style={{ alignItems: "center", margin: 0 }}>
                    <W30>
                      <MidLabel style={sectionLabelStyle}>품목 코드</MidLabel>
                    </W30>
                    <W70>
                      <Form.Control
                        type="text"
                        placeholder="예시 Z00021"
                        value={item?.itemCode ?? ""}
                        readOnly
                        style={inputStyle}
                      />
                    </W70>
                  </InputGroup>

                  <InputGroup style={{ alignItems: "center", margin: 0 }}>
                    <W30>
                      <MidLabel style={sectionLabelStyle}>품목명</MidLabel>
                    </W30>
                    <W70>
                      <Form.Control
                        type="text"
                        placeholder="품목명"
                        value={item?.itemName ?? ""}
                        onChange={(e) => updateField("itemName", e.target.value)}
                        style={inputStyle}
                        disabled={disabled}
                      />
                    </W70>
                  </InputGroup>

                  <InputGroup style={{ alignItems: "flex-start", margin: 0 }}>
                    <W30>
                      <MidLabel style={sectionLabelStyle}>품목그룹</MidLabel>
                    </W30>
                    <W70>
                      <Form.Control
                        type="text"
                        placeholder="품목그룹"
                        value={item?.itemGroup ?? ""}
                        onChange={(e) => updateField("itemGroup", e.target.value)}
                        style={inputStyle}
                        disabled={disabled}
                      />
                    </W70>
                  </InputGroup>

                  <InputGroup style={{ alignItems: "flex-start", margin: 0 }}>
                    <W30>
                      <MidLabel style={sectionLabelStyle}>규격</MidLabel>
                    </W30>
                    <W70>
                      <div style={radioWrapStyle}>
                        <span style={{ display: "flex", alignItems: "center" }}>
                          <Radio
                            type="radio"
                            checked={item?.specMode === "NAME"}
                            onChange={() => updateField("specMode", "NAME")}
                            disabled={disabled}
                          />
                          <Label className="mx-2">규격명</Label>
                        </span>

                        <span style={{ display: "flex", alignItems: "center" }}>
                          <Radio
                            type="radio"
                            checked={item?.specMode === "GROUP"}
                            onChange={() => updateField("specMode", "GROUP")}
                            disabled={disabled}
                          />
                          <Label className="mx-2">규격그룹</Label>
                        </span>

                        <span style={{ display: "flex", alignItems: "center" }}>
                          <Radio
                            type="radio"
                            checked={item?.specMode === "CALC"}
                            onChange={() => updateField("specMode", "CALC")}
                            disabled={disabled}
                          />
                          <Label className="mx-2">규격계산</Label>
                        </span>

                        <span style={{ display: "flex", alignItems: "center" }}>
                          <Radio
                            type="radio"
                            checked={item?.specMode === "CALC_GROUP"}
                            onChange={() => updateField("specMode", "CALC_GROUP")}
                            disabled={disabled}
                          />
                          <Label className="mx-2">규격계산그룹</Label>
                        </span>
                      </div>

                      <Form.Control
                        type="text"
                        placeholder="규격"
                        value={item?.spec ?? ""}
                        onChange={(e) => updateField("spec", e.target.value)}
                        style={inputStyle}
                        disabled={disabled}
                      />
                    </W70>
                  </InputGroup>

                  <InputGroup style={{ alignItems: "center", margin: 0 }}>
                    <W30>
                      <MidLabel style={sectionLabelStyle}>바코드</MidLabel>
                    </W30>
                    <W70>
                      <Form.Control
                        type="text"
                        placeholder="바코드"
                        value={item?.barcode ?? ""}
                        onChange={(e) => updateField("barcode", e.target.value)}
                        style={inputStyle}
                        disabled={disabled}
                      />
                    </W70>
                  </InputGroup>

                  <InputGroup style={{ alignItems: "center", margin: 0 }}>
                    <W30>
                      <MidLabel style={sectionLabelStyle}>단위</MidLabel>
                    </W30>
                    <W70>
                      <Form.Control
                        type="text"
                        placeholder="단위"
                        value={item?.unit ?? ""}
                        onChange={(e) => updateField("unit", e.target.value)}
                        style={{
                          ...inputStyle,
                          maxWidth: "320px",
                        }}
                        disabled={disabled}
                      />
                    </W70>
                  </InputGroup>

                  <InputGroup style={{ alignItems: "flex-start", margin: 0 }}>
                    <W30>
                      <MidLabel style={sectionLabelStyle}>품목구분</MidLabel>
                    </W30>
                    <W70>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "12px",
                          flexWrap: "nowrap",
                          width: "100%",
                        }}
                      >
                        {[
                          ["RAW_MATERIAL", "원재료"],
                          ["SUB_MATERIAL", "부재료"],
                          ["PRODUCT", "제품"],
                          ["SEMI_PRODUCT", "반제품"],
                          ["GOODS", "상품"],
                          ["INTANGIBLE", "무형상품"],
                        ].map(([v, l]) => (
                          <span
                            key={v}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              whiteSpace: "nowrap",
                              flex: "0 0 auto",
                            }}
                          >
                            <Radio
                              type="radio"
                              checked={item?.itemType === v}
                              onChange={() => updateField("itemType", v)}
                              disabled={disabled}
                            />
                            <Label
                              className="mx-2"
                              style={{
                                whiteSpace: "nowrap",
                                marginBottom: 0,
                              }}
                            >
                              {l}
                            </Label>
                          </span>
                        ))}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          flexWrap: "wrap",
                          marginTop: "4px",
                        }}
                      >
                        <SmallBadge
                          style={{
                            backgroundColor: "#eef2f7",
                            color: "#475569",
                            border: "1px solid #dbe2ea",
                            padding: "6px 10px",
                            borderRadius: "999px",
                            fontWeight: 700,
                          }}
                        >
                          세트여부
                        </SmallBadge>

                        <span style={{ display: "flex", alignItems: "center" }}>
                          <Radio
                            type="radio"
                            checked={item?.isSetYn === "Y"}
                            onChange={() => updateField("isSetYn", "Y")}
                            disabled={disabled}
                          />
                          <Label className="mx-2">사용</Label>
                        </span>

                        <span style={{ display: "flex", alignItems: "center" }}>
                          <Radio
                            type="radio"
                            checked={item?.isSetYn === "N"}
                            onChange={() => updateField("isSetYn", "N")}
                            disabled={disabled}
                          />
                          <Label className="mx-2">사용안함</Label>
                        </span>
                      </div>
                    </W70>
                  </InputGroup>

                  <InputGroup style={{ alignItems: "center", margin: 0 }}>
                    <W30>
                      <MidLabel style={sectionLabelStyle}>생산공정</MidLabel>
                    </W30>
                    <W70>
                      <Form.Control
                        type="text"
                        placeholder="생산공정"
                        value={item?.process ?? ""}
                        onChange={(e) => updateField("process", e.target.value)}
                        style={inputStyle}
                        disabled={disabled}
                      />
                    </W70>
                  </InputGroup>

                  <InputGroup style={{ alignItems: "center", margin: 0 }}>
                    <W30>
                      <MidLabel style={sectionLabelStyle}>입고단가</MidLabel>
                    </W30>
                    <W70>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          flexWrap: "wrap",
                        }}
                      >
                        <Form.Control
                          type="number"
                          value={item?.inPrice ?? 0}
                          onChange={(e) =>
                            updateField("inPrice", Number(e.target.value))
                          }
                          style={{
                            ...inputStyle,
                            maxWidth: "320px",
                          }}
                          disabled={disabled}
                        />

                        <CheckGroup
                          style={{
                            display: "flex",
                            alignItems: "center",
                            margin: 0,
                          }}
                        >
                          <Check
                            type="checkbox"
                            className="mx-2"
                            checked={item?.inVatIncludedYn === "Y"}
                            onChange={(e: any) =>
                              updateField(
                                "inVatIncludedYn",
                                e.target.checked ? "Y" : "N"
                              )
                            }
                            disabled={disabled}
                          />
                          <Label>VAT 포함</Label>
                        </CheckGroup>
                      </div>
                    </W70>
                  </InputGroup>

                  <InputGroup style={{ alignItems: "center", margin: 0 }}>
                    <W30>
                      <MidLabel style={sectionLabelStyle}>출고단가</MidLabel>
                    </W30>
                    <W70>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          flexWrap: "wrap",
                        }}
                      >
                        <Form.Control
                          type="number"
                          value={item?.outPrice ?? 0}
                          onChange={(e) =>
                            updateField("outPrice", Number(e.target.value))
                          }
                          placeholder="출고단가"
                          style={{
                            ...inputStyle,
                            maxWidth: "320px",
                          }}
                          disabled={disabled}
                        />

                        <CheckGroup
                          style={{
                            display: "flex",
                            alignItems: "center",
                            margin: 0,
                          }}
                        >
                          <Check
                            type="checkbox"
                            className="mx-2"
                            checked={item?.outVatIncludedYn === "Y"}
                            onChange={(e: any) =>
                              updateField(
                                "outVatIncludedYn",
                                e.target.checked ? "Y" : "N"
                              )
                            }
                            disabled={disabled}
                          />
                          <Label>VAT 포함</Label>
                        </CheckGroup>
                      </div>
                    </W70>
                  </InputGroup>

                  <InputGroup style={{ alignItems: "center", margin: 0 }}>
                    <W30>
                      <MidLabel style={sectionLabelStyle}>이미지</MidLabel>
                    </W30>
                    <W70>
                      <Form.Control
                        type="text"
                        placeholder="이미지 경로"
                        value={item?.image ?? ""}
                        onChange={(e) => updateField("image", e.target.value)}
                        style={inputStyle}
                        disabled={disabled}
                      />
                    </W70>
                  </InputGroup>

                  <InputGroup style={{ alignItems: "center", margin: 0 }}>
                    <W30>
                      <MidLabel style={sectionLabelStyle}>사용여부</MidLabel>
                    </W30>
                    <W70>
                      <Form.Control
                        value={item?.useYn ? "Y" : "N"}
                        readOnly
                        style={{
                          ...readOnlyStyle,
                          maxWidth: "160px",
                        }}
                      />
                    </W70>
                  </InputGroup>
                </div>
              </RoundRect>
            </div>
          </Tab>

          <Tab eventKey="info" title="품목정보">
            <div style={{ paddingTop: "18px" }}>
              <div style={tabPlaceholderStyle}>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#1f2937",
                    marginBottom: "8px",
                  }}
                >
                  품목정보
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    lineHeight: 1.7,
                  }}
                >
                  추가 품목 속성, 이미지, 설명, 거래처 연계 정보 등을 이 영역에 확장할 수 있습니다.
                </div>
              </div>
            </div>
          </Tab>

          <Tab eventKey="qty" title="수량">
            <div style={{ paddingTop: "18px" }}>
              <div style={tabPlaceholderStyle}>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#1f2937",
                    marginBottom: "8px",
                  }}
                >
                  수량 정보
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    lineHeight: 1.7,
                  }}
                >
                  재고수량, 안전재고, 발주기준수량 등 수량 관련 확장 항목을 배치할 수 있습니다.
                </div>
              </div>
            </div>
          </Tab>

          <Tab eventKey="price" title="단가">
            <div style={{ paddingTop: "18px" }}>
              <div style={tabPlaceholderStyle}>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#1f2937",
                    marginBottom: "8px",
                  }}
                >
                  단가 정보
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    lineHeight: 1.7,
                  }}
                >
                  판매단가, 구매단가, VAT 포함 여부, 가격 이력 정보를 연결하기 좋은 탭입니다.
                </div>
              </div>
            </div>
          </Tab>

          <Tab eventKey="cost" title="원가">
            <div style={{ paddingTop: "18px" }}>
              <div style={tabPlaceholderStyle}>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#1f2937",
                    marginBottom: "8px",
                  }}
                >
                  원가 정보
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    lineHeight: 1.7,
                  }}
                >
                  제조원가, 재료비, 노무비, 경비 등 원가 산정 정보로 확장할 수 있습니다.
                </div>
              </div>
            </div>
          </Tab>

          <Tab eventKey="etc" title="부가정보">
            <div style={{ paddingTop: "18px" }}>
              <div style={tabPlaceholderStyle}>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#1f2937",
                    marginBottom: "8px",
                  }}
                >
                  부가정보
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    lineHeight: 1.7,
                  }}
                >
                  메모, 참조코드, 분류 태그 등 추가 데이터를 저장하기 좋은 영역입니다.
                </div>
              </div>
            </div>
          </Tab>

          <Tab eventKey="manage" title="관리대상">
            <div style={{ paddingTop: "18px" }}>
              <div style={tabPlaceholderStyle}>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#1f2937",
                    marginBottom: "8px",
                  }}
                >
                  관리대상
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    lineHeight: 1.7,
                  }}
                >
                  LOT, 유통기한, 시리얼번호, 품질관리 여부 등 관리 정책을 연결하기 좋습니다.
                </div>
              </div>
            </div>
          </Tab>
        </Tabs>
      </Modal.Body>

      <Modal.Footer
        style={{
          padding: "18px 24px",
          borderTop: "1px solid #eef2f7",
          backgroundColor: "#ffffff",
          gap: "10px",
        }}
      >
        {/*<Button
          variant="secondary"
          onClick={onClose}
          disabled={disabled}
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
        </Button>*/}

        <Button
          variant="danger"
          onClick={onDelete}
          disabled={disabled}
          style={{
            backgroundColor: "#ef4444",
            borderColor: "#ef4444",
            borderRadius: "10px",
            padding: "10px 18px",
            fontWeight: 700,
          }}
        >
          {deleting ? "삭제중..." : "삭제"}
        </Button>

        <Button
          variant="primary"
          onClick={onSave}
          disabled={disabled}
          style={{
            backgroundColor: "#6b7280",
            borderColor: "#6b7280",
            borderRadius: "10px",
            padding: "10px 18px",
            fontWeight: 700,
          }}
        >
          {saving ? "저장중..." : "저장"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}