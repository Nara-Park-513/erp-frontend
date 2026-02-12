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
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isEditMode ? "공지사항 작성/수정" : "공지사항 상세"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {isEditMode ? (
          <>
            <Form.Group className="mb-3">
              <Form.Label>제목</Form.Label>
              <Form.Control
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>내용</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </Form.Group>

            <Form.Check
              type="checkbox"
              label="상단고정"
              checked={form.isPinned}
              onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
            />

            <div style={{ marginTop: 10, fontSize: 14, color: "#555" }}>
              작성자: {form.writer || "관리자"} | 작성일: {form.createdAt || new Date().toISOString().slice(0, 10)}
            </div>
          </>
        ) : (
          <>
            <h5>{data?.title}</h5>
            <div style={{ marginBottom: 6, fontSize: 14, color: "#555" }}>
              작성자: {data?.writer || "관리자"} | 작성일: {data?.createdAt || new Date().toISOString().slice(0, 10)}
            </div>
            <div style={{ whiteSpace: "pre-line" }}>{data?.content}</div>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        {!isEditMode && (
          <>
            <Button variant="warning" onClick={onEditMode}>
              수정
            </Button>
            <Button variant="danger" onClick={onDelete}>
              삭제
            </Button>
          </>
        )}
        {isEditMode && <Button variant="primary" onClick={onSave}>저장</Button>}
        <Button variant="secondary" onClick={onHide}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
}