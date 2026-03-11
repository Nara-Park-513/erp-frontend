import { Modal, Button, Form } from "react-bootstrap";

type NoticeRow = {
  id?: number;
  title: string;
  content?: string;
  writer?: string;
  createdAt?: string;
  isPinned?: boolean;
  viewCount?: number;
};

type Props = {
  show: boolean;
  onHide: () => void;
  data: NoticeRow | null;
  isEditMode: boolean;
  form: {
    title: string;
    content: string;
    isPinned: boolean;
    writer: string;
    createdAt: string;
  };
  setForm: React.Dispatch<
    React.SetStateAction<{
      title: string;
      content: string;
      isPinned: boolean;
      writer: string;
      createdAt: string;
    }>
  >;
  onSave: () => void;
  onDelete: () => void;
  onEditMode: () => void;
};

const inputStyle = {
  height: "44px",
  borderRadius: "12px",
  borderColor: "#dbe2ea",
  boxShadow: "none",
};

const textAreaStyle = {
  borderRadius: "12px",
  borderColor: "#dbe2ea",
  boxShadow: "none",
  resize: "none" as const,
};

export default function NoticeModal({
  show,
  onHide,
  data,
  isEditMode,
  form,
  setForm,
  onSave,
  onDelete,
  onEditMode,
}: Props) {
  return (
    <Modal
      show={show}
      onHide={onHide}
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
          {isEditMode ? "공지사항 작성/수정" : "공지사항 상세"}
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
          {isEditMode ? (
            <div
              style={{
                display: "grid",
                gap: "16px",
              }}
            >
              <Form.Group className="mb-0">
                <Form.Label
                  style={{
                    fontWeight: 700,
                    color: "#475467",
                    marginBottom: "8px",
                  }}
                >
                  제목
                </Form.Label>
                <Form.Control
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  style={inputStyle}
                />
              </Form.Group>

              <Form.Group className="mb-0">
                <Form.Label
                  style={{
                    fontWeight: 700,
                    color: "#475467",
                    marginBottom: "8px",
                  }}
                >
                  내용
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={8}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  style={textAreaStyle}
                />
              </Form.Group>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  paddingTop: "4px",
                }}
              >
                <Form.Check
                  type="checkbox"
                  label="상단고정"
                  checked={form.isPinned}
                  onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                  style={{
                    color: "#374151",
                    fontWeight: 500,
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: "2px",
                  fontSize: "14px",
                  color: "#6b7280",
                  fontWeight: 500,
                  paddingTop: "14px",
                  borderTop: "1px solid #eef2f7",
                }}
              >
                작성자: {form.writer || "관리자"} | 작성일:{" "}
                {form.createdAt || new Date().toISOString().slice(0, 10)}
              </div>
            </div>
          ) : (
            <div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#111827",
                  lineHeight: 1.4,
                  marginBottom: "10px",
                }}
              >
                {data?.title}
              </div>

              <div
                style={{
                  marginBottom: "16px",
                  fontSize: "14px",
                  color: "#6b7280",
                  fontWeight: 500,
                  paddingBottom: "14px",
                  borderBottom: "1px solid #eef2f7",
                }}
              >
                작성자: {data?.writer || "관리자"} | 작성일:{" "}
                {data?.createdAt || new Date().toISOString().slice(0, 10)}
              </div>

              <div
                style={{
                  whiteSpace: "pre-line",
                  color: "#374151",
                  lineHeight: 1.8,
                  minHeight: "180px",
                  fontSize: "15px",
                }}
              >
                {data?.content || "-"}
              </div>
            </div>
          )}
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
        {!isEditMode && (
          <>
            <Button
              onClick={onEditMode}
              style={{
                backgroundColor: "#ffffff",
                color: "#475569",
                border: "1px solid #dbe2ea",
                borderRadius: "10px",
                padding: "10px 16px",
                fontWeight: 700,
              }}
            >
              수정
            </Button>

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
          </>
        )}

        {isEditMode && (
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
        )}

        <Button
          onClick={onHide}
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
      </Modal.Footer>
    </Modal>
  );
}