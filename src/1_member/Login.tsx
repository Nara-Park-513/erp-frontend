import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../Auth.css";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error" | "warning">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    const savedRememberMe = localStorage.getItem("rememberMe");

    if (savedRememberMe === "true" && savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

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
    const shouldMoveAdmin = modalType === "success";
    setShowModal(false);

    if (shouldMoveAdmin) {
      navigate("/admin", { replace: true });
    }
  };

  const handleGoogleLogin = () => {
    openModal("warning", "안내", "구글 로그인은 추후 구현 예정입니다.");
  };

  const handleFacebookLogin = () => {
    openModal("warning", "안내", "페이스북 로그인은 추후 구현 예정입니다.");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      openModal("warning", "입력 확인", "이메일을 입력해 주세요.");
      return;
    }

    if (!password.trim()) {
      openModal("warning", "입력 확인", "비밀번호를 입력해 주세요.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8888/auth/login", {
        email,
        password,
      });

      const myId =
        res.data?.id ??
        res.data?.memberId ??
        res.data?.userId ??
        res.data?.member?.id ??
        res.data?.user?.id;

      if (myId) {
        localStorage.setItem("memberId", String(myId));
      }

      const token = res.data?.token;

      if (!token) {
        console.log("login response:", res.data);
        openModal(
          "error",
          "로그인 오류",
          "로그인 응답에 토큰 값이 없습니다. 백엔드 응답을 확인해 주세요."
        );
        return;
      }

      localStorage.setItem("token", token);

      if (rememberMe) {
        localStorage.setItem("savedEmail", email);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("savedEmail");
        localStorage.removeItem("rememberMe");
      }

      openModal("success", "로그인 성공", "관리자 페이지로 이동합니다.");
    } catch (err) {
      console.error(err);
      openModal("error", "로그인 실패", "이메일 또는 비밀번호를 다시 확인해 주세요.");
    }
  };

  return (
    <>
      <Container>
        <div className="row justify-content-center">
          <div className="col-xl-10 col-lg-12 col-md-9">
            <div className="card o-hidden border-0 shadow-lg mt-200">
              <div className="card-body p-0">
                <div className="row g-0">
                  <div className="col-lg-6 d-none d-lg-block bg-login-image"></div>

                  <div className="col-lg-6">
                    <div className="p-5">
                      <div className="text-center">
                        <h1 className="h4 text-gray-900 mb-4">로그인</h1>
                      </div>

                      <form className="user" onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                          <input
                            type="email"
                            className="form-control form-control-user"
                            id="exampleInputEmail"
                            placeholder="이메일을 입력해 주세요"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <input
                            type="password"
                            className="form-control form-control-user"
                            id="exampleInputPassword"
                            placeholder="비밀번호를 입력해 주세요"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <div className="custom-control custom-checkbox small">
                            <input
                              type="checkbox"
                              className="custom-control-input mx-2"
                              id="customCheck"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label className="custom-control-label" htmlFor="customCheck">
                              이메일 저장
                            </label>
                          </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-user btn-block">
                          로그인
                        </button>

                        <hr />

                        <div className="mb-2">
                          <button
                            type="button"
                            className="btn btn-google btn-user btn-block"
                            onClick={handleGoogleLogin}
                          >
                            <i className="fab fa-google fa-fw"></i> 구글로 로그인
                          </button>
                        </div>

                        <button
                          type="button"
                          className="btn btn-facebook btn-user btn-block"
                          onClick={handleFacebookLogin}
                        >
                          <i className="fab fa-facebook-f fa-fw"></i> 페이스북으로 로그인
                        </button>
                      </form>

                      <hr />

                      <div className="text-center">
                        <a className="small" href="/forgot">
                          비밀번호를 잊으셨나요?
                        </a>
                      </div>

                      <div className="text-center">
                        <a className="small" href="/member">
                          회원가입
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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

export default Login;