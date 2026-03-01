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
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>기안 {selectedId ? "수정" : "작성"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <RoundRect>
          <InputGroup>
            <W30>
              <MidLabel>기안일자</MidLabel>
            </W30>
            <W70>
              <Form.Control
                type="date"
                value={doc.draftDate}
                onChange={(e) => onSetDoc((p) => ({ ...p, draftDate: e.target.value }))}
              />
            </W70>
          </InputGroup>

          <InputGroup className="my-3">
            <W30>
              <MidLabel>제목</MidLabel>
            </W30>
            <W70>
              <Form.Control
                value={doc.title}
                onChange={(e) => onSetDoc((p) => ({ ...p, title: e.target.value }))}
              />
            </W70>
          </InputGroup>

          <InputGroup className="my-3">
            <W30>
              <MidLabel>기안자</MidLabel>
            </W30>
            <W70>
              <Form.Control
                value={doc.drafter}
                onChange={(e) => onSetDoc((p) => ({ ...p, drafter: e.target.value }))}
              />
            </W70>
          </InputGroup>

          <InputGroup className="my-3">
            <W30>
              <MidLabel>결재자</MidLabel>
            </W30>
            <W70>
              <Form.Control
                value={doc.approver}
                onChange={(e) => onSetDoc((p) => ({ ...p, approver: e.target.value }))}
              />
            </W70>
          </InputGroup>

          <InputGroup className="my-3">
            <W30>
              <MidLabel>진행상태</MidLabel>
            </W30>
            <W70>
              <Form.Select
                value={doc.progressStatus}
                onChange={(e) => onSetDoc((p) => ({ ...p, progressStatus: e.target.value }))}
              >
                <option value="진행중">진행중</option>
                <option value="반려">반려</option>
                <option value="완료">완료</option>
              </Form.Select>
            </W70>
          </InputGroup>

          <InputGroup className="my-3">
            <W30>
              <MidLabel>내용</MidLabel>
            </W30>
            <W70>
              <Form.Control
                as="textarea"
                rows={6}
                value={doc.content}
                onChange={(e) => onSetDoc((p) => ({ ...p, content: e.target.value }))}
              />
            </W70>
          </InputGroup>
        </RoundRect>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          닫기
        </Button>
        {selectedId && (
          <Button variant="danger" onClick={onDelete}>
            삭제
          </Button>
        )}
        <Button variant="primary" onClick={onSave}>
          {selectedId ? "수정" : "저장"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}