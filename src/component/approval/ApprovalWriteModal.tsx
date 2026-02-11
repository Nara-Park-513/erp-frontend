import { Modal, Button, Form } from "react-bootstrap";
import { useState, useEffect } from "react";

export type ApprovalForm = {
  draftDate:string; title:string;
  drafter:string; approver:string;
  progressStatus:string; content:string;
}

type Props = {
  show: boolean;
  onClose: () => void;
  onSaved: (data: ApprovalForm) => void;
  onDelete?: () => void; //수정
  initialData?: ApprovalForm; //수정용 데이터
};

//add
const emptyForm: ApprovalForm = {
  draftDate:new Date().toISOString().slice(0, 10),
  title:"", drafter:"", approver:"",
  progressStatus:"진행중", content:"",
}

export default function ApprovalWriteModal({ 
  show, 
  onClose, 
  onSaved,
  onDelete,
  initialData,
}: Props) {
  const [form, setForm] = useState<ApprovalForm>(emptyForm);
  //const [title, setTitle] = useState(""); 하나일때만

  //수정 모드일때 데이터 세팅
  //모달이 열릴 때마다 실행
  useEffect(() => {
    if(initialData) setForm(initialData);
    else setForm(emptyForm);
  },[initialData, show]);

  //patch함수
  const patch = (key: keyof ApprovalForm, value:string) => {
    setForm((p) => ({...p, [key]: value}));
  }

  const save = () => {
    if(!form.title.trim()) return alert("제목을 입력하세요");
    if(!form.drafter.trim()) return alert("기한자를 입력하세요");
    if(!form.approver.trim()) return alert("결제자를 입력하세요");
    console.log("저장:", form);
    onSaved(form);
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>기안 {initialData ? "수정" : "작성"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>기안 일자</Form.Label>
          <Form.Control
          type="date"
          value={form.draftDate}
          onChange={(e) => patch("draftDate", e.target.value)}
        />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>제목</Form.Label>
          <Form.Control
          placeholder="제목 입력"
          value={form.title}
          onChange={(e) => patch("title", e.target.value)}
        />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>기안자</Form.Label>
          <Form.Control
          placeholder="기안하는 작성자를 쓰세요."
          value={form.drafter}
          onChange={(e) => patch("drafter", e.target.value)}
        />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>결제자</Form.Label>
          <Form.Control
          placeholder="결제하는 작성자를 쓰세요."
          value={form.approver}
          onChange={(e) => patch("approver", e.target.value)}
        />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>진행상태</Form.Label>
          <Form.Select
          value={form.progressStatus}
          onChange={(e) => patch("approver", e.target.value)}
        >
          <option value="진행중">진행중</option>
          <option value="반려">반려</option>
          <option value="완료">완료</option>
        </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>내용</Form.Label>
          <Form.Control
          as="textarea"
          rows={5}
          value={form.content}
          onChange={(e) => patch("content", e.target.value)}
        />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          취소
        </Button>
        {initialData && onDelete &&(
          <Button variant="danger" onClick={onDelete}>
          삭제
        </Button>
        )}
        <Button variant="primary" onClick={save}>
          저장
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
