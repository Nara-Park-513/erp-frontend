import axios from "axios";
import { useEffect, useState } from "react";
import { Table, Modal, Button } from "react-bootstrap";

/** 타입 */
type DraftRow = {
  id: number;
  draftDate: string;
  title: string;
  writer: string;
  approver: string;
  status: string;
};

/** 상세 모달용 타입 */
type DraftDetail = {
  title: string;
  writer: string;
  approver: string;
  status: string;
  content: string;
};

/** axios */
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

/** API 경로 */
const API_LIST = "/api/approval/my-drafts";
const API_DETAIL = (id: number) => `/api/approval/docs/${id}`;

/** helper */
const pickPersonName = (v: any) => {
  if (!v) return "";
  if (typeof v === "string") return v;
  return String(v.username ?? v.firstName ?? v.name ?? v.email ?? "");
};

const fromApprovalStatus = (v: any) => {
  const s = String(v ?? "").trim();
  if (s === "IN_PROGRESS") return "진행중";
  if (s === "DRAFT") return "대기";
  if (s === "APPROVED") return "승인";
  if (s === "REJECTED") return "반려";
  return s || "진행중";
};

const Pay = () => {
  const [rows, setRows] = useState<DraftRow[]>([]);
  const [loading, setLoading] = useState(false);

  /** 모달 상태 */
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<DraftDetail | null>(null);

  /** 목록 조회 */
  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_LIST);
      const data = res.data;

      const list: any[] =
        (Array.isArray(data) ? data : null) ??
        (Array.isArray(data?.content) ? data.content : null) ??
        (Array.isArray(data?.items) ? data.items : null) ??
        [];

      const normalized: DraftRow[] = list.map((r: any) => ({
        id: Number(r.id ?? 0),
        draftDate: String(r.draftDate ?? r.date ?? r.createdAt ?? "").slice(0, 10),
        title: String(r.title ?? r.subject ?? ""),
        writer: pickPersonName(r.drafterName ?? r.drafter ?? r.writer),
        approver: pickPersonName(r.approverName ?? r.approver),
        status: fromApprovalStatus(r.progressStatus ?? r.status),
      }));

      setRows(normalized);
    } catch (e) {
      console.error("전자결재 목록 조회 실패", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  /** 상세 조회 */
  const onView = async (id: number) => {
    try {
      const res = await api.get(API_DETAIL(id));
      const d = res.data;

      setModalData({
        title: String(d.title ?? d.subject ?? ""),
        writer: pickPersonName(d.drafterName ?? d.drafter ?? d.writer),
        approver: pickPersonName(d.approverName ?? d.approver),
        status: fromApprovalStatus(d.progressStatus ?? d.status),
        content: String(d.content ?? d.body ?? d.memo ?? ""),
      });
      setShowModal(true);
    } catch (e) {
      console.error("상세 조회 실패", e);
      alert("상세 조회 실패(콘솔 확인)");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="pay mt-120">
      <h4 className="fs-16-600-black">전자결재</h4>
      <h5 className="my-2 fs-14-400-gray">내 기안문서</h5>
      <div className="table-wrap">
        <Table className="draft table-bordered" responsive>
          <thead>
            <tr className="text-center">
              <th>기안일자</th>
              <th>제목</th>
              <th>기안자</th>
              <th>결재자</th>
              <th>진행상태</th>
              <th>보기</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr className="text-center">
                <td colSpan={6}>{loading ? "불러오는 중..." : "기안문서가 없습니다"}</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="text-center">
                  <td>{r.draftDate}</td>
                  <td>{r.title}</td>
                  <td>{r.writer}</td>
                  <td>{r.approver}</td>
                  <td>{r.status}</td>
                  <td>
                    <Button size="sm" variant="link" onClick={() => onView(r.id)}>
                      보기
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* 읽기 전용 모달 */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modalData?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>기안자:</strong> {modalData?.writer} <br />
            <strong>결재자:</strong> {modalData?.approver} <br />
            <strong>진행상태:</strong> {modalData?.status}
          </p>
          <hr />
          <pre style={{ whiteSpace: "pre-wrap" }}>{modalData?.content}</pre>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Pay;