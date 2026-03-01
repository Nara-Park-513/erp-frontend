import axios from "axios";
import { useEffect, useState } from "react";
import { Table, Modal, Button } from "react-bootstrap";

/** ✅ 공지사항 타입 */
type NoticeRow = {
  id: number;
  title: string;
  content?: string;
  writer: string;
  createdAt: string;
  isPinned?: boolean;
  viewCount?: number;
};

/** ✅ axios (JWT 토큰 있으면 자동 첨부) */
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

/** ✅ 여기만 백엔드 경로로 */
const API_BASE = "/api/notice";

const Notice = () => {
  /** ✅ 서버 데이터 state */
  const [rows, setRows] = useState<NoticeRow[]>([]);
  const [loading, setLoading] = useState(false);

  /** ✅ 모달 state */
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<NoticeRow | null>(null);

  /** ✅ 목록 조회 */
  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_BASE);
      const data = res.data;

      const list: any[] =
        (Array.isArray(data) ? data : null) ??
        (Array.isArray(data?.content) ? data.content : null) ??
        (Array.isArray(data?.items) ? data.items : null) ??
        [];

      const normalized: NoticeRow[] = list.map((r: any) => ({
        id: Number(r.id ?? r.noticeId ?? 0),
        title: String(r.title ?? r.subject ?? ""),
        content: String(r.content ?? ""),
        writer: "관리자", // 강제
        createdAt: r.createdAt
          ? new Date(String(r.createdAt)).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        isPinned: Boolean(r.isPinned ?? r.pinned ?? false),
        viewCount: r.viewCount != null ? Number(r.viewCount) : undefined,
      }));

      normalized.sort((a, b) => Number(b.isPinned) - Number(a.isPinned));
      setRows(normalized);
    } catch (e) {
      console.error("공지사항 조회 실패", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  /** ✅ 최초 1회 조회 */
  useEffect(() => {
    fetchList();
  }, []);

  /** ✅ 보기 핸들러 */
  const onView = (id: number) => {
    const notice = rows.find((r) => r.id === id);
    if (!notice) return;
    setSelected(notice);
    setShowModal(true);
  };

  return (
    <>
      <div className="pay mt-5">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="fs-16-600-black">공지사항</h4>
          <div className=""></div>
        </div>

        <h5 className="my-2 fs-14-400-gray">내 기안문서</h5>

        <div className="table-wrap">
          <Table variant="table-bordered" className="draft" responsive>
            <thead>
              <tr className="text-center">
                <th>구분</th>
                <th>제목</th>
                <th>작성자</th>
                <th>작성일</th>
                <th>상세</th>
                <th>조회</th>
              </tr>
            </thead>
            <tbody>
              {/* 데이터 없을 때 */}
              {rows.length === 0 && (
                <tr className="text-center">
                  <td colSpan={6}>
                    {loading ? "불러오는 중..." : "데이터가 없습니다"}
                  </td>
                </tr>
              )}

              {/* 서버 데이터 렌더 */}
              {rows.map((r) => (
                <tr key={r.id} className="text-center">
                  <td>{r.isPinned ? "공지" : "-"}</td>
                  <td style={{ whiteSpace: "pre-line", cursor: "pointer", fontWeight: r.isPinned ? 700 : 400 }} onClick={() => onView(r.id)}>
                    {r.title}
                  </td>
                  <td>{r.writer}</td>
                  <td>{r.createdAt}</td>
                  <td style={{ cursor: "pointer", color: "#0d6efd" }} onClick={() => onView(r.id)}>
                    보기
                  </td>
                  <td>{r.viewCount != null ? r.viewCount.toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      {/* 읽기 전용 모달 */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selected?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>작성자:</strong> {selected?.writer}
          </p>
          <p>
            <strong>작성일:</strong> {selected?.createdAt}
          </p>
          <hr />
          <div style={{ whiteSpace: "pre-line" }}>{selected?.content}</div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Notice;