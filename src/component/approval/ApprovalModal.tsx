import { Button, Modal, Form } from "react-bootstrap";
import { RoundRect } from "../../stylesjs/Content.styles";
import { InputGroup, MidLabel } from "../../stylesjs/Input.styles";
import { W30, W70 } from "../../stylesjs/Util.styles";

export type ApprovalDocForm = {
  draftDate: string;
  title: string;
  drafter: string;
  approver: string;
  progressStatus: string;
  content: string;
};

type Props = {
  show: boolean;
  selectedId: number | null;
  doc: ApprovalDocForm;
  onSetDoc: React.Dispatch<React.SetStateAction<ApprovalDocForm>>;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
};

const inputStyle = {
  height: "44px",
  borderRadius: "12px",
  borderColor: "#dbe2ea",
  boxShadow: "none",
  width: "545px",
};

const textAreaStyle = {
  borderRadius: "12px",
  borderColor: "#dbe2ea",
  boxShadow: "none",
  resize: "none" as const,
  width:"545px",
};

export default function ApprovalModal({
  show,
  selectedId,
  doc,
  onSetDoc,
  onClose,
  onSave,
  onDelete,
}: Props) {
  return (
    <Modal
      show={show}
      onHide={onClose}
      size="lg"
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
          기안 {selectedId ? "수정" : "작성"}
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
            }}
          >
            <InputGroup style={{ alignItems: "center", margin: 0 }}>
              <W30>
                <MidLabel style={{ color: "#475467", fontWeight: 700 }}>
                  기안일자
                </MidLabel>
              </W30>
              <W70>
                <Form.Control
                  type="date"
                  value={doc.draftDate}
                  onChange={(e) =>
                    onSetDoc((p) => ({ ...p, draftDate: e.target.value }))
                  }
                  style={inputStyle}
                />
              </W70>
            </InputGroup>

            <InputGroup style={{ alignItems: "center", margin: 0 }}>
              <W30>
                <MidLabel style={{ color: "#475467", fontWeight: 700 }}>
                  제목
                </MidLabel>
              </W30>
              <W70>
                <Form.Control
                  value={doc.title}
                  onChange={(e) =>
                    onSetDoc((p) => ({ ...p, title: e.target.value }))
                  }
                  style={inputStyle}
                />
              </W70>
            </InputGroup>

            <InputGroup style={{ alignItems: "center", margin: 0 }}>
              <W30>
                <MidLabel style={{ color: "#475467", fontWeight: 700 }}>
                  기안자
                </MidLabel>
              </W30>
              <W70>
                <Form.Control
                  value={doc.drafter}
                  onChange={(e) =>
                    onSetDoc((p) => ({ ...p, drafter: e.target.value }))
                  }
                  style={inputStyle}
                />
              </W70>
            </InputGroup>

            <InputGroup style={{ alignItems: "center", margin: 0 }}>
              <W30>
                <MidLabel style={{ color: "#475467", fontWeight: 700 }}>
                  결재자
                </MidLabel>
              </W30>
              <W70>
                <Form.Control
                  value={doc.approver}
                  onChange={(e) =>
                    onSetDoc((p) => ({ ...p, approver: e.target.value }))
                  }
                  style={inputStyle}
                />
              </W70>
            </InputGroup>

            <InputGroup style={{ alignItems: "center", margin: 0 }}>
              <W30>
                <MidLabel style={{ color: "#475467", fontWeight: 700 }}>
                  진행상태
                </MidLabel>
              </W30>
              <W70>
                <Form.Select
                  value={doc.progressStatus}
                  onChange={(e) =>
                    onSetDoc((p) => ({ ...p, progressStatus: e.target.value }))
                  }
                  style={inputStyle}
                >
                  <option value="진행중">진행중</option>
                  <option value="반려">반려</option>
                  <option value="완료">완료</option>
                </Form.Select>
              </W70>
            </InputGroup>

            <InputGroup style={{ alignItems: "flex-start", margin: 0 }}>
              <W30>
                <MidLabel style={{ color: "#475467", fontWeight: 700 }}>
                  내용
                </MidLabel>
              </W30>
              <W70>
                <Form.Control
                  as="textarea"
                  rows={8}
                  value={doc.content}
                  onChange={(e) =>
                    onSetDoc((p) => ({ ...p, content: e.target.value }))
                  }
                  style={textAreaStyle}
                />
              </W70>
            </InputGroup>
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
        <Button
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

        {selectedId && (
          <Button
            onClick={onDelete}
            style={{
              backgroundColor: "#ef4444",
              borderColor: "#ef4444",
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