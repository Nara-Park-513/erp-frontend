import { ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";

interface Props {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const isValidToken =
    !!token && token !== "null" && token !== "undefined" && token.trim() !== "";

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error" | "warning">("warning");
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

  useEffect(() => {
    if (!isValidToken) {
      openModal("warning", "로그인 필요", "로그인이 필요합니다.");
    }
  }, [isValidToken]);

  const handleCloseModal = () => {
    setShowModal(false);
    navigate("/login", { replace: true, state: { from: location } });
  };

  if (!isValidToken) {
    return (
      <>
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
  }

  return <>{children}</>;
};

export default ProtectedRoute;