import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

/** axios (기존 패턴 동일) */
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

/** ✅ 백엔드 엔드포인트(컨트롤러에 맞춰 수정) */
const API_CREATE = "/api/approval/docs";
const API_UPDATE = (id: number) => `/api/approval/docs/${id}`;
const API_DELETE = (id: number) => `/api/approval/docs/${id}`;

/**
 * ✅ 내 ID 가져오기 (강화 버전)
 * 1) localStorage 단일 키(memberId/userId/id/MEMBER_ID 등)
 * 2) localStorage에 user/member JSON 저장돼있으면 거기서 id
 * 3) JWT payload에서 숫자 필드(memberId/userId/id 등)
 * 4) 그래도 없으면 서버 /api/members/me 호출로 id 가져오기
 */
function getMyIdFromLocal(): number | null {
  // 1) 단일 키로 저장돼있는 경우(프로젝트마다 다름)
  const directKeys = [
    "memberId",
    "userId",
    "loginId",
    "id",
    "MEMBER_ID",
    "member_id",
    "USER_ID",
  ];

  for (const k of directKeys) {
    const v = localStorage.getItem(k);
    if (!v) continue;
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }

  // 2) user/member JSON 형태로 저장하는 경우
  const jsonKeys = ["user", "member", "loginUser", "me"];
  for (const k of jsonKeys) {
    const raw = localStorage.getItem(k);
    if (!raw) continue;
    try {
      const obj = JSON.parse(raw);
      const n = Number(obj?.id ?? obj?.memberId ?? obj?.userId ?? obj?.MEMBER_ID);
      if (Number.isFinite(n) && n > 0) return n;
    } catch {
      // ignore
    }
  }

  // 3) JWT payload에서 찾기
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("jwt");

  if (!token) return null;

  try {
    const payloadPart = token.split(".")[1];
    const json = JSON.parse(decodeURIComponent(escape(atob(payloadPart))));

    const candidates = [
      json.memberId,
      json.userId,
      json.id,
      json.uid,
      json.user?.id,
      json.member?.id,
      json.MEMBER_ID,
    ];

    for (const v of candidates) {
      const n = Number(v);
      if (Number.isFinite(n) && n > 0) return n;
    }

    // sub는 보통 username/email이라 숫자 아닐 확률 큼 (마지막 fallback)
    const subN = Number(json.sub);
    if (Number.isFinite(subN) && subN > 0) return subN;

    return null;
  } catch {
    return null;
  }
}

/** ✅ 서버에서 내 id 받아오기 fallback (✅ 여기 “딱 한 개”만 남김) */
async function fetchMyIdFromServer(): Promise<number | null> {
  const ME_ENDPOINT = "/api/members/me"; // ✅ 너가 만든 진짜 엔드포인트만 사용

  try {
    const res = await api.get(ME_ENDPOINT);
    const data = res.data;

    const n = Number(
      data?.id ??
        data?.memberId ??
        data?.userId ??
        data?.MEMBER_ID ??
        data?.member?.id ??
        data?.user?.id
    );
    if (Number.isFinite(n) && n > 0) return n;

    return null;
  } catch {
    return null;
  }
}

export type ApprovalForm = {
  id?: number;
  draftDate: string; // yyyy-mm-dd
  title: string;
  drafterId: number | null; // ✅ 자동
  approverId: number | null; // ✅ 입력
  status: "DRAFT" | "IN_PROGRESS" | "REJECTED" | "DONE";
  content: string;
};

type Props = {
  show: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: ApprovalForm | null; // 수정 모드 (없으면 신규)
};

export default function ApprovalWriteModal({
  show,
  onClose,
  onSaved,
  initialData,
}: Props) {
  const emptyForm: ApprovalForm = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      draftDate: today,
      title: "",
      drafterId: null,
      approverId: null,
      status: "DRAFT",
      content: "",
    };
  }, []);

  const [form, setForm] = useState<ApprovalForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  // ✅ 열릴 때: 수정이면 initialData, 신규면 drafterId 자동 세팅(로컬 → 서버 fallback)
  useEffect(() => {
    if (!show) return;

    const init = async () => {
      if (initialData) {
        setForm({
          ...emptyForm,
          ...initialData,
          draftDate: String(initialData.draftDate ?? "").slice(0, 10),
        });
        return;
      }

      let drafterId = getMyIdFromLocal();

      // ✅ 로컬에 없으면 서버에서 me 조회로 가져오기
      if (!drafterId) {
        drafterId = await fetchMyIdFromServer();
        if (drafterId) localStorage.setItem("memberId", String(drafterId));
      }

      setForm({
        ...emptyForm,
        drafterId: drafterId ?? null,
      });
    };

    init();
  }, [show, initialData, emptyForm]);

  const patch = (key: keyof ApprovalForm, value: any) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const save = async () => {
    // ✅ 여기서도 한번 더 보정
    let drafterId = form.drafterId ?? getMyIdFromLocal();
    if (!drafterId) {
      drafterId = await fetchMyIdFromServer();
      if (drafterId) {
        localStorage.setItem("memberId", String(drafterId));
        setForm((p) => ({ ...p, drafterId }));
      }
    }

    if (!drafterId) return alert("drafterId가 없습니다(로그인 사용자 id 저장 확인)");
    if (!form.draftDate) return alert("기안일자를 입력하세요");
    if (!form.title.trim()) return alert("제목을 입력하세요");
    if (!form.approverId) return alert("결재자ID를 입력하세요");
    if (!form.content.trim()) return alert("내용을 입력하세요");

    setSaving(true);
    try {
      const payload = {
        draftDate: form.draftDate,
        title: form.title,
        content: form.content,
        status: form.status,
        drafterId,
        approverId: form.approverId,
      };

      if (form.id) await api.put(API_UPDATE(form.id), payload);
      else await api.post(API_CREATE, payload);

      onSaved();
    } catch (e: any) {
      console.error("기안 저장 실패", e);
      alert(`저장 실패: ${e?.response?.status ?? ""} (콘솔 확인)`);
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!form.id) return;
    if (!window.confirm("삭제하시겠습니까?")) return;

    setSaving(true);
    try {
      await api.delete(API_DELETE(form.id));
      onSaved();
    } catch (e: any) {
      console.error("기안 삭제 실패", e);
      alert(`삭제 실패: ${e?.response?.status ?? ""} (콘솔 확인)`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>기안 {form.id ? "수정" : "작성"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>기안일자</Form.Label>
              <Form.Control
                type="date"
                value={form.draftDate}
                onChange={(e) => patch("draftDate", e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>진행상태</Form.Label>
              <Form.Select
                value={form.status}
                onChange={(e) => patch("status", e.target.value)}
              >
                <option value="DRAFT">임시저장</option>
                <option value="IN_PROGRESS">진행중</option>
                <option value="REJECTED">반려</option>
                <option value="DONE">완료</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group>
              <Form.Label>제목</Form.Label>
              <Form.Control
                placeholder="제목 입력"
                value={form.title}
                onChange={(e) => patch("title", e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>기안자ID(자동)</Form.Label>
              <Form.Control value={form.drafterId ?? ""} disabled />
              <Form.Text className="text-muted">
                ※ 여기 값이 계속 비면, /api/members/me 가 200으로 id를 못 주는 상태임
              </Form.Text>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>결재자ID</Form.Label>
              <Form.Control
                type="number"
                value={form.approverId ?? ""}
                onChange={(e) =>
                  patch("approverId", e.target.value ? Number(e.target.value) : null)
                }
                placeholder="예: 2"
              />
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group>
              <Form.Label>내용</Form.Label>
              <Form.Control
                as="textarea"
                rows={7}
                value={form.content}
                onChange={(e) => patch("content", e.target.value)}
                placeholder="내용 입력"
              />
            </Form.Group>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={saving}>
          취소
        </Button>

        {form.id && (
          <Button variant="danger" onClick={del} disabled={saving}>
            삭제
          </Button>
        )}

        <Button variant="primary" onClick={save} disabled={saving}>
          {saving ? "저장중..." : "저장"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}