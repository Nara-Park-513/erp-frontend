import { useState } from "react";
import axios from "axios";
import { Container, Row, Col, Button, Form, Card, Modal } from "react-bootstrap";
import "../Auth.css";

const Forgot = () => {
  const [email, setEmail] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error" | "warning">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const openModal = (
    type: "success" | "error" | "warning",
    title: string,
    message: string
  ) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      openModal("warning", "입력 확인", "이메일 주소를 입력해 주세요.");
      return;
    }

    try {
      await axios.post("http://localhost:8888/auth/forgot-password", { email });

      openModal(
        "success",
        "메일 전송 완료",
        "비밀번호 재설정 링크를 이메일로 전송했습니다. 메일함을 확인해 주세요."
      );
    } catch (err) {
      console.error(err);
      openModal(
        "error",
        "전송 실패",
        "해당 이메일로 가입된 계정을 찾을 수 없습니다. 다시 확인해 주세요."
      );
    }
  };

  return (
    <>
      <Container fluid className="px-0">
        <Row className="justify-content-center mt-150 mx-0 g-0">
          <Col xl={6} lg={7} md={9} sm={11} xs={12} className="px-0">
            <Card className="o-hidden border-0 shadow-lg my-5 w-100">
              <Card.Body className="p-0">
                <div className="p-5">
                  <div className="text-center">
                    <h1 className="h4 text-gray-900 mb-2">비밀번호를 잊으셨나요?</h1>
                    <p className="mb-4 text-muted">
                      가입한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
                    </p>
                  </div>

                  <Form className="user" onSubmit={handleSubmit} noValidate>
                    <div className="form-group mb-3">
                      <Form.Control
                        type="email"
                        className="form-control form-control-user"
                        placeholder="이메일 주소를 입력해 주세요"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="btn btn-primary btn-user btn-block w-100"
                    >
                      비밀번호 재설정 메일 보내기
                    </Button>
                  </Form>

                  <hr />

                  <div className="text-center">
                    <a className="small" href="/member">
                      회원가입
                    </a>
                  </div>

                  <div className="text-center">
                    <a className="small" href="/login">
                      이미 계정이 있으신가요? 로그인
                    </a>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal
        show={showModal}
        onHide={() => {}}
        centered={false}
        backdrop={true}
        keyboard={false}
        dialogClassName="top-alert-modal"
        contentClassName="top-alert-content"
      >
        <Modal.Body className={`top-alert-body ${modalType}`}>
          <div className="top-alert-left">
            <div className={`top-alert-icon ${modalType}`}>
              {modalType === "success" ? "✓" : modalType === "error" ? "✕" : "!"}
            </div>
          </div>

          <div className="top-alert-center">
            <h3 className="top-alert-title">{modalTitle}</h3>
            <p className="top-alert-text">{modalMessage}</p>
          </div>

          <div className="top-alert-right">
            <button
              type="button"
              onClick={handleCloseModal}
              className={`top-alert-button ${modalType}`}
            >
              확인
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Forgot;