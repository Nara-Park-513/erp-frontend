import { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8888",
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("jwt");

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.log("❌ API ERROR", err?.response?.status, err?.response?.data);
    return Promise.reject(err);
  }
);

const API_DETAIL = (id: number) => `/api/orders/progress/${id}`;
const API_UPDATE = (id: number) => `/api/orders/progress/${id}`;

type DeliveryDetail = {
  id: number;
  orderNo: string;
  orderName: string;
  progressText: string;
};

type Props = {
  show: boolean;
  id: number | null;
  onHide: () => void;
  onChanged: () => void | Promise<void>;
};

const DELIVERY_STATUS_OPTIONS = ["배송중", "완료"];

const inputStyle = {
  height: "44px",
  borderRadius: "12px",
  borderColor: "#dbe2ea",
  boxShadow: "none",
};

const readOnlyStyle = {
  ...inputStyle,
  backgroundColor: "#f8fafc",
  color: "#475467",
};

export default function DeliveryStatusModal({
  show,
  id,
  onHide,
  onChanged,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [detail, setDetail] = useState<DeliveryDetail | null>(null);

  const [orderNo, setOrderNo] = useState("");
  const [orderName, setOrderName] = useState("");
  const [progressText, setProgressText] = useState("배송중");
  const [deliveryMemo, setDeliveryMemo] = useState("");

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error" | "warning">("warning");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const openAlertModal = (
    type: "success" | "error" | "warning",
    title: string,
    message: string
  ) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlertModal(true);
  };

  const closeAlertModal = () => {
    setShowAlertModal(false);
  };

  const normalizeDetail = (r: any): DeliveryDetail => ({
    id: Number(r?.id ?? r?.orderId ?? 0),
    orderNo: String(r?.orderNo ?? r?.orderCode ?? r?.no ?? ""),
    orderName: String(r?.orderName ?? r?.name ?? ""),
    progressText: String(
      r?.progressText ?? r?.progress ?? r?.stepName ?? r?.statusText ?? r?.status ?? "배송중"
    ),
  });

  const loadDetail = async (targetId: number) => {
    setLoading(true);
    try {
      const res = await api.get(API_DETAIL(targetId));
      const data = res.data;
      const raw = data?.data ?? data?.item ?? data?.result ?? data;

      const d = normalizeDetail(raw);
      setDetail(d);
      setOrderNo(d.orderNo);
      setOrderName(d.orderName);
      setProgressText(d.progressText || "배송중");
      setDeliveryMemo("");
    } catch (e: any) {
      console.error("배송 상세 조회 실패", e);
      openAlertModal("error", "상세 조회 실패", "배송 상세 조회에 실패했습니다. 콘솔을 확인해 주세요.");
      setDetail(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!show || id == null) return;
    loadDetail(id);
  }, [show, id]);

  const validate = () => {
    if (!orderNo.trim()) return "오더번호가 없습니다.";
    if (!orderName.trim()) return "오더명이 없습니다.";
    if (!progressText.trim()) return "배송상태를 선택하세요.";
    return "";
  };

  const handleSave = async () => {
    if (id == null) {
      openAlertModal("warning", "처리 불가", "배송 대상 정보가 없습니다.");
      return;
    }

    const msg = validate();
    if (msg) {
      openAlertModal("warning", "입력 확인", msg);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        orderNo: orderNo.trim(),
        orderName: orderName.trim(),
        progressText: progressText.trim(),
      };

      await api.put(API_UPDATE(id), payload, {
        headers: { "Content-Type": "application/json" },
      });

      openAlertModal("success", "처리 완료", "배송 상태가 저장되었습니다.");
      await Promise.resolve(onChanged());
    } catch (e: any) {
      console.error("배송 저장 실패", e);
      openAlertModal("error", "저장 실패", "배송 상태 저장에 실패했습니다. 콘솔을 확인해 주세요.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        centered
        backdrop="static"
        size="lg"
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
            배송상태 관리
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
            {loading && (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  color: "#6b7280",
                  fontWeight: 500,
                }}
              >
                <Spinner animation="border" size="sm" style={{ marginRight: "8px" }} />
                불러오는 중...
              </div>
            )}

            {!loading && (
              <Row className="g-4">
                <Col md={4}>
                  <Form.Label style={{ fontWeight: 700, color: "#475467", marginBottom: "8px" }}>
                    오더번호
                  </Form.Label>
                  <Form.Control value={orderNo} readOnly style={readOnlyStyle} />
                </Col>

                <Col md={8}>
                  <Form.Label style={{ fontWeight: 700, color: "#475467", marginBottom: "8px" }}>
                    오더명
                  </Form.Label>
                  <Form.Control value={orderName} readOnly style={readOnlyStyle} />
                </Col>

                <Col md={12}>
                  <Form.Label style={{ fontWeight: 700, color: "#475467", marginBottom: "8px" }}>
                    배송상태
                  </Form.Label>
                  <Form.Select
                    value={progressText}
                    onChange={(e) => setProgressText(e.target.value)}
                    style={inputStyle}
                  >
                    {DELIVERY_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                <Col md={12}>
                  <Form.Label style={{ fontWeight: 700, color: "#475467", marginBottom: "8px" }}>
                    배송 메모
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={deliveryMemo}
                    onChange={(e) => setDeliveryMemo(e.target.value)}
                    placeholder="배송 관련 메모를 입력하세요"
                    style={{
                      borderRadius: "12px",
                      borderColor: "#dbe2ea",
                      boxShadow: "none",
                      resize: "none",
                    }}
                  />
                </Col>

                <Col md={12}>
                  <div
                    style={{
                      marginTop: "4px",
                      paddingTop: "14px",
                      borderTop: "1px solid #eef2f7",
                      fontSize: "13px",
                      color: "#98a2b3",
                      fontWeight: 500,
                    }}
                  >
                    현재 구조에서는 메모는 화면 입력용이며, 상태값은 progressText 기준으로 저장됩니다.
                  </div>
                </Col>
              </Row>
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
          <Button
            onClick={onHide}
            disabled={saving}
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

          <Button
            onClick={handleSave}
            disabled={saving || loading}
            style={{
              backgroundColor: "#6b7280",
              borderColor: "#6b7280",
              borderRadius: "10px",
              padding: "10px 18px",
              fontWeight: 700,
            }}
          >
            {saving ? "저장중..." : "저장"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showAlertModal}
        onHide={() => {}}
        centered={false}
        backdrop={true}
        keyboard={false}
        dialogClassName="top-alert-modal"
        contentClassName="top-alert-content"
      >
        <Modal.Body className={`top-alert-body ${alertType}`}>
          <div className="top-alert-left">
            <div className={`top-alert-icon ${alertType}`}>
              {alertType === "success" ? "✓" : alertType === "error" ? "✕" : "!"}
            </div>
          </div>

          <div className="top-alert-center">
            <h3 className="top-alert-title">{alertTitle}</h3>
            <p className="top-alert-text">{alertMessage}</p>
          </div>

          <div className="top-alert-right">
            <button
              type="button"
              onClick={closeAlertModal}
              className={`top-alert-button ${alertType}`}
            >
              확인
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}