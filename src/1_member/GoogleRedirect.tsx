import { useEffect, useState } from "react";
import axios from "axios";
import { Modal } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import "../Auth.css";

export default function GoogleRedirect() {
  const [params] = useSearchParams();
  const code = params.get("code");

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error" | "warning">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [redirectPath, setRedirectPath] = useState("/");

  const openAlertModal = (
    type: "success" | "error" | "warning",
    title: string,
    message: string,
    nextPath = "/"
  ) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setRedirectPath(nextPath);
    setShowModal(true);
  };

  const closeAlertModal = () => {
    setShowModal(false);
    window.location.href = redirectPath;
  };

  useEffect(() => {
    if (!code) {
      openAlertModal("error", "로그인 실패", "인가 코드가 없습니다.", "/login");
      return;
    }

    axios
      .post("http://localhost:8888/auth/google", { code })
      .then((res) => {
        const accessToken = res.data?.accessToken || res.data?.token;

        if (accessToken) {
          localStorage.setItem("token", accessToken);
        }

        openAlertModal("success", "구글 로그인 완료", "로그인이 정상적으로 완료되었습니다.", "/");
      })
      .catch((err) => {
        console.error("구글 로그인 실패", err);
        openAlertModal("error", "구글 로그인 실패", "로그인 처리 중 오류가 발생했습니다.", "/login");
      });
  }, [code]);

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
          color: "#475467",
          fontSize: "16px",
          fontWeight: 600,
        }}
      >
        구글 로그인 처리중...
      </div>

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
              onClick={closeAlertModal}
              className={`top-alert-button ${modalType}`}
            >
              확인
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}