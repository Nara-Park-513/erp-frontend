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

/** ✅ 너 백엔드에 맞게 여기만 수정 */
const API_CREATE = `/api/orders/progress`; // POST
const API_DETAIL = (id: number) => `/api/orders/progress/${id}`; // GET
const API_UPDATE = (id: number) => `/api/orders/progress/${id}`; // PUT
const API_DELETE = (id: number) => `/api/orders/progress/${id}`; // DELETE

export type OrderProgressDetail = {
  id: number;
  orderNo: string;
  orderName: string;
  progressText: string;
};

type Props = {
  show: boolean;
  /** ✅ 신규면 null, 수정/삭제면 id */
  id: number | null;
  onHide: () => void;
  /** ✅ 저장/삭제 후 목록 새로고침 */
  onChanged: () => void;
};

export default function OrderProgressModal({ show, id, onHide, onChanged }: Props) {
  const isNew = useMemo(() => !id, [id]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /** ✅ detail은 “DB에 존재하는 레코드”일 때만 세팅 */
  const [detail, setDetail] = useState<OrderProgressDetail | null>(null);

  /** ✅ 입력폼 state (신규/수정 공용) */
  const [orderNo, setOrderNo] = useState("");
  const [orderName, setOrderName] = useState("");
  const [progressText, setProgressText] = useState("");

  const normalizeDetail = (r: any): OrderProgressDetail => ({
    id: Number(r?.id ?? r?.orderId ?? 0),
    orderNo: String(r?.orderNo ?? r?.orderCode ?? r?.no ?? ""),
    orderName: String(r?.orderName ?? r?.name ?? ""),
    progressText: String(
      r?.progressText ?? r?.progress ?? r?.stepName ?? r?.statusText ?? r?.status ?? ""
    ),
  });

  const resetForNew = () => {
    setDetail(null);
    setOrderNo("");
    setOrderName("");
    setProgressText("");
  };

  const loadDetail = async (targetId: number) => {
    setLoading(true);
    try {
      const res = await api.get(API_DETAIL(targetId));
      const data = res.data;

      const raw =
        data?.data ??
        data?.item ??
        data?.result ??
        data;

      const d = normalizeDetail(raw);
      setDetail(d);
      setOrderNo(d.orderNo);
      setOrderName(d.orderName);
      setProgressText(d.progressText);
    } catch (e: any) {
      console.error("상세 조회 실패", e);
      alert(`상세 조회 실패: ${e?.response?.status ?? ""} (콘솔 확인)`);
      setDetail(null);
    } finally {
      setLoading(false);
    }
  };

  /** ✅ 모달 열릴 때: 신규면 초기화 / 수정이면 상세 로드 */
  useEffect(() => {
    if (!show) return;

    if (!id) {
      resetForNew();
      return;
    }

    loadDetail(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, id]);

  const validate = () => {
    // 신규면 orderNo 입력검사 제외 (자동생성 가정)
    if (!isNew && !orderNo.trim()) return "오더관리번호를 입력하세요.";
    if (!orderName.trim()) return "오더관리명을 입력하세요.";
    return "";
  };

  /** ✅ 저장: 신규면 POST / 기존이면 PUT */
  const handleSave = async () => {
    const msg = validate();
    if (msg) return alert(msg);

    setSaving(true);
    try {
      const payload = {
        // 신규면 orderNo 아예 보내지 않음(백엔드 자동생성 가정)
        ...(isNew ? {} : { orderNo: orderNo.trim() }),
        orderName: orderName.trim(),
        progressText: progressText.trim(),
      };

      if (isNew) {
        // ✅ 신규 등록
        await api.post(API_CREATE, payload, {
          headers: { "Content-Type": "application/json" },
        });

        alert("등록 완료");

        // ✅ 목록 새로고침
        onChanged();

        // ✅ 모달 닫기 (⭐ 핵심 추가)
        onHide();

      } else {
        // ✅ 수정
        await api.put(API_UPDATE(id!), payload, {
          headers: { "Content-Type": "application/json" },
        });

        alert("수정 완료");

        // ✅ 목록 새로고침
        onChanged();

        // ✅ 모달 닫기 (일관성 있게 닫아주는 게 UX 좋음)
        onHide();
      }
    } catch (e: any) {
      console.error("저장 실패", e);
      alert(`저장 실패: ${e?.response?.status ?? ""} (콘솔 확인)`);
    } finally {
      setSaving(false);
    }
  };

  /** ✅ 삭제: 신규(미저장)면 불가 / 기존만 가능 */
  const handleDelete = async () => {
    // 신규인데 detail도 없으면 삭제 불가
    const targetId = id ?? detail?.id ?? null;
    if (!targetId) return alert("신규는 저장(등록) 후 삭제할 수 있어요.");

    const ok = window.confirm("정말 삭제할까요?");
    if (!ok) return;

    setDeleting(true);
    try {
      await api.delete(API_DELETE(targetId));
      alert("삭제 완료");
      onHide();
      onChanged();
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
    <Modal show={show} onHide={handleClose} centered backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isNew ? "오더 진행단계 신규" : "오더 진행단계 상세/수정"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading && (
          <div style={{ padding: 20, textAlign: "center" }}>
            <Spinner animation="border" size="sm" /> 불러오는 중...
          </div>
        )}

        {!loading && (
          <>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>오더관리번호</Form.Label>
                  <Form.Control
                    value={orderNo}
                    onChange={(e) => setOrderNo(e.target.value)}
                    placeholder="자동 생성됩니다 예) ORD-2026-0001"
                    disabled={isNew} // 신규면 비활성화
                  />
                </Form.Group>
              </Col>

              <Col md={8}>
                <Form.Group>
                  <Form.Label>오더관리명</Form.Label>
                  <Form.Control
                    value={orderName}
                    onChange={(e) => setOrderName(e.target.value)}
                    placeholder="예) 2월 정기 발주"
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>진행단계</Form.Label>
                  <Form.Control
                    value={progressText}
                    onChange={(e) => setProgressText(e.target.value)}
                    placeholder="예) 제작중 / 출고완료 / 수령완료 등"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
              {id ? `ID: ${id}` : detail?.id ? `ID: ${detail.id}` : "신규(아직 ID 없음)"}
            </div>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={saving || deleting}>
          닫기
        </Button>

        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={(isNew && !detail?.id) || saving || deleting}
          title={isNew && !detail?.id ? "신규는 저장(등록) 후 삭제 가능" : ""}
        >
          {deleting ? "삭제중..." : "삭제"}
        </Button>

        <Button variant="primary" onClick={handleSave} disabled={saving || deleting}>
          {saving ? "저장중..." : isNew ? "등록" : "저장"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}