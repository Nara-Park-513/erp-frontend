import axios from "axios";
import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";

/** ✅ 너 기존 마크업/클래스 훼손 안 하고, "데이터만" 붙일 타입 */
type PayRow = {
  id: number;
  draftDate: string;
  title: string;
  drafter: string;
  approver: string;
  status: string;
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

/** ✅ 여기만 너 백엔드 경로로 바꿔 */
const API_BASE = "/api/notices"; // 예: 공지사항 목록

const Pay = () => {
  /** ✅ 추가: 서버데이터 state */
  const [rows, setRows] = useState<PayRow[]>([]);
  const [loading, setLoading] = useState(false);

  /** ✅ 추가: 목록 조회 */
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

      const normalized: PayRow[] = list.map((r: any) => ({
        id: Number(r.id ?? r.noticeId ?? r.docId ?? 0),
        draftDate: String(r.draftDate ?? r.noticeDate ?? r.date ?? r.createdAt ?? ""),
        title: String(r.title ?? r.subject ?? ""),
        drafter: String(r.drafter ?? r.writer ?? r.createdBy ?? "guest"),
        approver: String(r.approver ?? r.approverName ?? "대표이사"),
        status: String(r.progressStatus ?? r.status ?? "진행중"),
      }));

      setRows(normalized);
    } catch (e) {
      console.error("공지사항 조회 실패", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  /** ✅ 추가: 최초 1회 조회 */
  useEffect(() => {
    fetchList();
  }, []);

  /** ✅ 추가: 보기/복사 핸들러(필요하면 라우팅으로 바꿔) */
  const onView = (id: number) => {
    // 예: 상세페이지로 이동
    window.location.href = `/notices/${id}`;
  };

  const onCopy = (id: number) => {
    // 예: 신규작성에 복사 파라미터
    window.location.href = `/notices/new?copyFrom=${id}`;
  };

  return (
    <>
      <div className="pay mt-5">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="fs-16-600-black">공지사항</h4>
          <div className=""></div>
        </div>
        <h5 className="my-2 fs-14-400-gray ">내 기안문서</h5>
        <div className="table-wrap">
          <Table variant="table-bordered " className="draft" responsive>
            <thead className="">
              <tr className="text-center">
                <th>기안일자</th>
                <th>제목</th>
                <th>기안자</th>
                <th>결재자</th>
                <th>진행상태</th>
                <th>결재</th>
                <th>기안서복사</th>
              </tr>
            </thead>
            <tbody>
              {/* ✅ 추가: 데이터 없을 때 */}
              {rows.length === 0 && (
                <tr className="text-center">
                  <td colSpan={7}>
                    {loading ? "불러오는 중..." : "데이터가 없습니다"}
                  </td>
                </tr>
              )}

              {/* ✅ 추가: 서버 데이터 렌더 */}
              {rows.map((r) => (
                <tr key={r.id} className="text-center">
                  <td>{r.draftDate}</td>
                  <td>{r.title}</td>
                  <td>{r.drafter}</td>
                  <td>{r.approver}</td>
                  <td>{r.status}</td>
                  <td
                    style={{ cursor: "pointer", color: "#0d6efd" }}
                    onClick={() => onView(r.id)}
                  >
                    보기
                  </td>
                  <td
                    style={{ cursor: "pointer", color: "#0d6efd" }}
                    onClick={() => onCopy(r.id)}
                  >
                    복사
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default Pay;
