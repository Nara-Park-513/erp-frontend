import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Button, Form, Card, Modal } from "react-bootstrap";
import "../Auth.css";

const INSTAGRAM_CLIENT_ID = "YOUR_INSTAGRAM_CLIENT_ID";
const INSTAGRAM_REDIRECT_URI = "http://localhost:5174/auth/instagram";

const KAKAO_CLIENT_ID = "YOUR_KAKAO_CLIENT_ID";
const KAKAO_REDIRECT_URI = "http://localhost:5174/auth/kakao";

const handleInstagramLogin = () => {
  const url = `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    INSTAGRAM_REDIRECT_URI
  )}&scope=user_profile,user_media&response_type=code`;
  window.location.href = url;
};

const handleKakaoLogin = () => {
  const url = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    KAKAO_REDIRECT_URI
  )}&response_type=code`;
  window.location.href = url;
};

type Gender = "male" | "female" | "other" | "";

interface MemberFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  repeatPassword: string;
  companyName: string;
  position: string;
  tel: string;
  address: string;
  detailAddress: string;
  gender: Gender;
}

declare global {
  interface Window {
    daum: any;
  }
}

const Member = () => {
  const [formData, setFormData] = useState<MemberFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    repeatPassword: "",
    companyName: "",
    position: "",
    tel: "",
    address: "",
    detailAddress: "",
    gender: "",
  });

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
    const shouldMoveLogin = modalType === "success";
    setShowModal(false);

    if (shouldMoveLogin) {
      window.location.href = "http://localhost:5173/login";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressSearch = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!window.daum || !window.daum.Postcode) {
      openModal("error", "주소 검색 오류", "주소 검색 서비스를 불러오지 못했습니다.");
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data: any) => {
        setFormData((prev) => ({
          ...prev,
          address: data.address,
        }));
      },
    }).open();
  };

  useEffect(() => {
    const id = "daum-postcode-script";
    if (document.getElementById(id)) return;

    const script = document.createElement("script");
    script.id = id;
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.firstName.trim()) {
      openModal("warning", "입력 확인", "이름을 입력해 주세요.");
      return;
    }

    if (!formData.lastName.trim()) {
      openModal("warning", "입력 확인", "성을 입력해 주세요.");
      return;
    }

    if (!formData.email.trim()) {
      openModal("warning", "입력 확인", "이메일을 입력해 주세요.");
      return;
    }

    if (!formData.password.trim()) {
      openModal("warning", "입력 확인", "비밀번호를 입력해 주세요.");
      return;
    }

    if (!formData.repeatPassword.trim()) {
      openModal("warning", "입력 확인", "비밀번호 확인을 입력해 주세요.");
      return;
    }

    if (formData.password !== formData.repeatPassword) {
      openModal("warning", "입력 확인", "비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    if (!formData.gender) {
      openModal("warning", "입력 확인", "성별을 선택해 주세요.");
      return;
    }

    try {
      const { repeatPassword, ...payload } = formData;
      await axios.post("http://localhost:8888/members", payload);

      openModal(
        "success",
        "회원가입 완료",
        "회원가입이 완료되었습니다. 로그인 페이지로 이동합니다."
      );
    } catch (err) {
      console.error(err);
      openModal("error", "회원가입 실패", "회원가입 중 오류가 발생했습니다. 다시 시도해 주세요.");
    }
  };

  return (
    <>
      <Container fluid className="mt-5 px-0">
        <Row className="mx-0 justify-content-center">
          <Col xl={10} lg={12} md={11}>
            <Card className="o-hidden border-0 shadow-lg mt-150">
              <Card.Body className="p-0">
                <Row className="g-0">
                  <div className="col-lg-5 d-none d-lg-block bg-register-image"></div>

                  <div className="col-lg-7">
                    <div className="p-5">
                      <div className="text-center">
                        <h1 className="h4 text-gray-900 mb-4">ERP 사용자 등록</h1>
                      </div>

                      <Form className="user" onSubmit={handleSubmit} noValidate>
                        <div className="form-group row mb-2">
                          <Col sm={6} className="mb-3 mb-sm-0">
                            <Form.Control
                              type="text"
                              className="form-control-user"
                              placeholder="이름"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleChange}
                            />
                          </Col>

                          <Col sm={6}>
                            <Form.Control
                              type="text"
                              className="form-control-user"
                              placeholder="성"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleChange}
                            />
                          </Col>
                        </div>

                        <div className="form-group mb-2">
                          <Form.Control
                            type="email"
                            className="form-control-user"
                            placeholder="이메일"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="form-group row mb-2">
                          <Col sm={6} className="mb-3 mb-sm-0">
                            <Form.Control
                              type="password"
                              className="form-control-user"
                              placeholder="비밀번호"
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                            />
                          </Col>

                          <Col sm={6}>
                            <Form.Control
                              type="password"
                              className="form-control-user"
                              placeholder="비밀번호 확인"
                              name="repeatPassword"
                              value={formData.repeatPassword}
                              onChange={handleChange}
                            />
                          </Col>
                        </div>

                        <div className="form-group mb-3">
                          <label className="mr-3 form-label mx-2">성별 :</label>

                          <Form.Check
                            inline
                            type="radio"
                            label="남성"
                            name="gender"
                            value="male"
                            checked={formData.gender === "male"}
                            onChange={handleChange}
                          />

                          <Form.Check
                            inline
                            type="radio"
                            label="여성"
                            name="gender"
                            value="female"
                            checked={formData.gender === "female"}
                            onChange={handleChange}
                          />

                          <Form.Check
                            inline
                            type="radio"
                            label="기타"
                            name="gender"
                            value="other"
                            checked={formData.gender === "other"}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="form-group">
                          <div className="d-flex justify-between">
                            <Form.Control
                              type="text"
                              className="form-control-user"
                              placeholder="회사명"
                              name="companyName"
                              value={formData.companyName}
                              onChange={handleChange}
                            />

                            <Form.Control
                              type="text"
                              className="form-control-user mx-4"
                              placeholder="직급"
                              name="position"
                              value={formData.position}
                              onChange={handleChange}
                            />

                            <Form.Control
                              type="text"
                              className="form-control-user"
                              placeholder="전화번호"
                              name="tel"
                              value={formData.tel}
                              onChange={handleChange}
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <div className="d-flex btn-group br50">
                            <Form.Control
                              type="text"
                              className="form-control w-75"
                              name="address"
                              value={formData.address}
                              readOnly
                            />

                            <button
                              type="button"
                              onClick={handleAddressSearch}
                              className="btn btn-secondary w-25"
                            >
                              주소검색
                            </button>
                          </div>

                          <div>
                            <Form.Control
                              type="text"
                              className="form-control-user w-100 mt-3"
                              placeholder="상세주소"
                              name="detailAddress"
                              value={formData.detailAddress}
                              onChange={handleChange}
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          variant="primary"
                          className="btn-user btn-block mb-2"
                        >
                          ERP 계정 생성
                        </Button>

                        <div className="text-center text-muted small mb-3">
                          본 시스템은 관리자 승인 후 사용 가능합니다.
                        </div>
                      </Form>

                      <hr />

                      <a
                        href="#"
                        className="btn btn-google btn-user btn-block mb-2"
                        onClick={(e) => {
                          e.preventDefault();
                          handleInstagramLogin();
                        }}
                      >
                        관리자 승인 요청
                      </a>

                      <a
                        href="#"
                        className="btn btn-facebook btn-user btn-block mb-2"
                        onClick={(e) => {
                          e.preventDefault();
                          handleKakaoLogin();
                        }}
                      >
                        회사 이메일로 가입
                      </a>

                      <div className="text-center mb-2">
                        <a href="/forgot" className="small">
                          비밀번호 찾기
                        </a>
                      </div>

                      <div className="text-center">
                        <a href="/login" className="small">
                          이미 계정이 있으신가요? 로그인
                        </a>
                      </div>
                    </div>
                  </div>
                </Row>
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

export default Member;