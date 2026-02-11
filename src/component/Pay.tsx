import axios from "axios";
import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";

/** ✅ 추가: 타입 */
type DraftRow = {
  id: number;
  draftDate: string;
  title: string;
  writer: string;
  approver: string;
  status: string;
};

/** ✅ 추가: axios */
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

/** ✅ 추가: API 경로 */
const API_BASE = "/api/drafts";

const Pay = () => {
  /** ✅ 추가: state */
  const [rows, setRows] = useState<DraftRow[]>([]);
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

      const normalized: DraftRow[] = list.map((r: any) => ({
        id: Number(r.id ?? 0),
        draftDate: String(r.draftDate ?? r.date ?? ""),
        title: String(r.title ?? ""),
        writer: String(r.writer ?? r.userName ?? "guest"),
        approver: String(r.approver ?? "대표이사"),
        status: String(r.status ?? "진행중"),
      }));

      setRows(normalized);
    } catch (e) {
      console.error("전자결재 목록 조회 실패", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  /** ✅ 추가: 최초 1회 */
  useEffect(() => {
    fetchList();
  }, []);

  /** ✅ 추가: 보기 */
  const onView = (id: number) => {
    window.location.href = `/drafts/${id}`;
  };

  /** ✅ 추가: 복사 */
  const onCopy = (id: number) => {
    alert(`기안서 복사: ${id}`);
  };

  return (
    <>
      <div className="pay mt-120">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="fs-16-600-black">전자결재</h4>
          <div className=""></div>
        </div>
        <h5 className="my-2 fs-14-400-gray ">내 기안문서</h5>
        <div className="table-wrap">
          {/* ✅ variant 때문에 빨간줄 나는 경우가 많아서 className으로 처리 */}
          <Table className="draft table-bordered" responsive>
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
            <tbody className="tbody-wrap">
              {rows.length === 0 && (
                <tr className="text-center">
                  <td colSpan={7}>
                    {loading ? "불러오는 중..." : "기안문서가 없습니다"}
                  </td>
                </tr>
              )}

              {rows.map((r) => (
                <tr key={r.id} className="text-center">
                  <td>{r.draftDate}</td>
                  <td>{r.title}</td>
                  <td>{r.writer}</td>
                  <td>{r.approver}</td>
                  <td>{r.status}</td>
                  <td>
                    <a
                      href="#!"
                      onClick={(e) => {
                        e.preventDefault();
                        onView(r.id);
                      }}
                    >
                      보기
                    </a>
                  </td>
                  <td>
                    <a
                      href="#!"
                      onClick={(e) => {
                        e.preventDefault();
                        onCopy(r.id);
                      }}
                    >
                      복사
                    </a>
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
