import { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import axios from "axios";

/** ✅ axios (프로젝트 패턴 동일) */
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

/** ✅ 여기만 너 백엔드에 맞게 수정 */
const API_CREATE = `/api/orders/progress`;
const API_DETAIL = (id: number) => `/api/orders/progress/${id}`;
const API_UPDATE = (id: number) => `/api/orders/progress/${id}`;
const API_DELETE = (id: number) => `/api/orders/progress/${id}`;

export type OrderProgressDetail = {
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

export default function OrderProgressModal({ show, id, onHide, onChanged }: Props) {
  const isNew = useMemo(() => id === null, [id]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [detail, setDetail] = useState<OrderProgressDetail | null>(null);

  const [orderNo, setOrderNo] = useState("");
  const [orderName, setOrderName] = useState("");
  const [progressText, setProgressText] = useState("");

  const normalizeDetail = (
    r: any,
    fallback?: Partial<OrderProgressDetail>
  ): OrderProgressDetail => ({
    id: Number(r?.id ?? r?.orderId ?? fallback?.id ?? 0),
    orderNo: String(r?.orderNo ?? r?.orderCode ?? r?.no ?? fallback?.orderNo ?? ""),
    orderName: String(r?.orderName ?? r?.name ?? fallback?.orderName ?? ""),
    progressText: String(
      r?.progressText ??
        r?.progress ??
        r?.stepName ??
        r?.statusText ??
        r?.status ??
        fallback?.progressText ??
        ""
    ),
  });

  const resetForNew = () => {
    setDetail(null);
    setOrderNo("");
    setOrderName("");
    setProgressText("");
  };

  const loadDetail = async (
    targetId: number,
    fallback?: Partial<OrderProgressDetail>
  ) => {
    setLoading(true);
    try {
      const res = await api.get(API_DETAIL(targetId));
      const data = res.data;
      const raw = data?.data ?? data?.item ?? data?.result ?? data;

      const d = normalizeDetail(raw, fallback);
      setDetail(d);
      setOrderNo(d.orderNo);
      setOrderName(d.orderName);
      setProgressText(d.progressText);
    } catch (e: any) {
      console.error("상세 조회 실패", e);

      if (fallback) {
        const safe = normalizeDetail({}, fallback);
        setDetail(safe);
        setOrderNo(safe.orderNo);
        setOrderName(safe.orderName);
        setProgressText(safe.progressText);
      } else {
        alert(`상세 조회 실패: ${e?.response?.status ?? ""} (콘솔 확인)`);
        setDetail(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!show) return;

    if (id === null) {
      resetForNew();
      return;
    }

    loadDetail(id, detail ?? undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, id]);

  const validate = () => {
    if (!isNew && !orderNo.trim()) return "오더관리번호를 입력하세요.";
    if (!orderName.trim()) return "오더관리명을 입력하세요.";
    return "";
  };

  const handleSave = async () => {
    const msg = validate();
    if (msg) return alert(msg);

    setSaving(true);
    try {
      const payload = {
        ...(isNew ? {} : { orderNo: orderNo.trim() }),
        orderName: orderName.trim(),
        progressText: progressText.trim(),
      };

      if (isNew) {
        await api.post(API_CREATE, payload, {
          headers: { "Content-Type": "application/json" },
        });

        alert("등록 완료");
        await Promise.resolve(onChanged());
      } else {
        const currentData: OrderProgressDetail = {
          id: id!,
          orderNo: orderNo.trim(),
          orderName: orderName.trim(),
          progressText: progressText.trim(),
        };

        await api.put(API_UPDATE(id!), payload, {
          headers: { "Content-Type": "application/json" },
        });

        // 수정 후 화면에서 값 안 사라지게 현재 입력값 유지
        setDetail(currentData);
        setOrderNo(currentData.orderNo);
        setOrderName(currentData.orderName);
        setProgressText(currentData.progressText);

        alert("수정 완료");
        await Promise.resolve(onChanged());
      }
    } catch (e: any) {
      console.error("저장 실패", e);
      alert(`저장 실패: ${e?.response?.status ?? ""} (콘솔 확인)`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const targetId = id ?? detail?.id ?? null;
    if (!targetId) return alert("신규는 저장(등록) 후 삭제할 수 있어요.");

    const ok = window.confirm("정말 삭제할까요?");
    if (!ok) return;

    setDeleting(true);
    try {
      await api.delete(API_DELETE(targetId));
      alert("삭제 완료");
      onHide();
      await Promise.resolve(onChanged());
    } catch (e: any) {
      console.error("삭제 실패", e);
      alert(`삭제 실패: ${e?.response?.status ?? ""} (콘솔 확인)`);
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      size="lg"
      contentClassName="border-0 shadow-lg"
    >
      <Modal.Header
        closeButton={!isNew}
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
          {isNew ? "오더 진행단계 신규" : "오더 진행단계 상세/수정"}
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
            <>
              <Row className="g-4">
                <Col md={4}>
                  <Form.Label
                    style={{
                      fontWeight: 700,
                      color: "#475467",
                      marginBottom: "8px",
                    }}
                  >
                    오더관리번호
                  </Form.Label>
                  <Form.Control
                    value={orderNo}
                    onChange={(e) => setOrderNo(e.target.value)}
                    placeholder="자동 생성됩니다 예) ORD-2026-0001"
                    disabled={isNew}
                    style={isNew ? readOnlyStyle : inputStyle}
                  />
                </Col>

                <Col md={8}>
                  <Form.Label
                    style={{
                      fontWeight: 700,
                      color: "#475467",
                      marginBottom: "8px",
                    }}
                  >
                    오더관리명
                  </Form.Label>
                  <Form.Control
                    value={orderName}
                    onChange={(e) => setOrderName(e.target.value)}
                    placeholder="예) 2월 정기 발주"
                    style={inputStyle}
                  />
                </Col>

                <Col md={12}>
                  <Form.Label
                    style={{
                      fontWeight: 700,
                      color: "#475467",
                      marginBottom: "8px",
                    }}
                  >
                    진행단계
                  </Form.Label>
                  <Form.Control
                    value={progressText}
                    onChange={(e) => setProgressText(e.target.value)}
                    placeholder="예) 제작중 / 출고완료 / 수령완료 등"
                    style={inputStyle}
                  />
                </Col>
              </Row>

              <div
                style={{
                  marginTop: "18px",
                  paddingTop: "14px",
                  borderTop: "1px solid #eef2f7",
                  fontSize: "13px",
                  color: "#98a2b3",
                  fontWeight: 500,
                }}
              >
                {id ? `ID: ${id}` : detail?.id ? `ID: ${detail.id}` : "신규(아직 ID 없음)"}
              </div>
            </>
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
        {isNew && (
          <Button
            onClick={handleClose}
            disabled={saving || deleting}
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
        )}

        {!isNew && (
          <Button
            onClick={handleDelete}
            disabled={(isNew && !detail?.id) || saving || deleting}
            title={isNew && !detail?.id ? "신규는 저장(등록) 후 삭제 가능" : ""}
            style={{
              backgroundColor: "#ef4444",
              borderColor: "#ef4444",
              borderRadius: "10px",
              padding: "10px 16px",
              fontWeight: 700,
              opacity: (isNew && !detail?.id) || saving || deleting ? 0.65 : 1,
            }}
          >
            {deleting ? "삭제중..." : "삭제"}
          </Button>
        )}

        <Button
          onClick={handleSave}
          disabled={saving || deleting}
          style={{
            backgroundColor: "#6b7280",
            borderColor: "#6b7280",
            borderRadius: "10px",
            padding: "10px 18px",
            fontWeight: 700,
          }}
        >
          {saving ? "저장중..." : isNew ? "등록" : "저장"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}