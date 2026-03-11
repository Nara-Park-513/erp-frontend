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
        writer: "관리자",
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
      <div
        style={{
          //background: "linear-gradient(180deg, #f7f8fc 0%, #f3f5f9 100%)",
          minHeight: "100%",
          padding: "0",
        }}
      >
        <div
          className="pay mt-5"
          style={{
            backgroundColor: "transparent",
          }}
        >
          <div
            style={{
              marginBottom: "14px",
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <div style={{ lineHeight: 1.2 }}>
              <h4
                style={{
                  margin: 0,
                  padding: 0,
                  color: "#1f2937",
                  fontWeight: 700,
                  fontSize: "24px",
                  letterSpacing: "-0.02em",
                }}
              >
                공지사항
              </h4>

              <div
                style={{
                  marginTop: "6px",
                  fontSize: "14px",
                  color: "#6b7280",
                  fontWeight: 500,
                }}
              >
                목록
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e8ecf4",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div
              style={{
                padding: "16px 18px 10px 18px",
                borderBottom: "1px solid #eef2f7",
                background: "linear-gradient(180deg, #fbfcfe 0%, #f8fafc 100%)",
                fontSize: "15px",
                fontWeight: 700,
                color: "#374151",
              }}
            >
              공지 목록
            </div>

            <div style={{ maxHeight: "360px", overflowY: "auto" }}>
              <Table responsive className="mb-0 align-middle" style={{ marginBottom: 0 }}>
                <thead>
                  <tr
                    style={{
                      background: "linear-gradient(180deg, #fbfcfe 0%, #f4f7fb 100%)",
                    }}
                  >
                    <th
                      style={{
                        width: "90px",
                        padding: "15px 18px",
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#475467",
                        borderBottom: "1px solid #e8ecf4",
                        textAlign: "center",
                      }}
                    >
                      구분
                    </th>
                    <th
                      style={{
                        padding: "15px 18px",
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#475467",
                        borderBottom: "1px solid #e8ecf4",
                      }}
                    >
                      제목
                    </th>
                    <th
                      style={{
                        width: "140px",
                        padding: "15px 18px",
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#475467",
                        borderBottom: "1px solid #e8ecf4",
                        textAlign: "center",
                      }}
                    >
                      작성자
                    </th>
                    <th
                      style={{
                        width: "160px",
                        padding: "15px 18px",
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#475467",
                        borderBottom: "1px solid #e8ecf4",
                        textAlign: "center",
                      }}
                    >
                      작성일
                    </th>
                    <th
                      style={{
                        width: "90px",
                        padding: "15px 18px",
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#475467",
                        borderBottom: "1px solid #e8ecf4",
                        textAlign: "center",
                      }}
                    >
                      상세
                    </th>
                    <th
                      style={{
                        width: "90px",
                        padding: "15px 18px",
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#475467",
                        borderBottom: "1px solid #e8ecf4",
                        textAlign: "right",
                      }}
                    >
                      조회
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          textAlign: "center",
                          padding: "44px 16px",
                          color: "#98a2b3",
                          fontSize: "14px",
                        }}
                      >
                        {loading ? "불러오는 중..." : "데이터가 없습니다"}
                      </td>
                    </tr>
                  ) : (
                    rows.map((r, idx) => (
                      <tr
                        key={r.id}
                        style={{
                          backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fcfdff",
                        }}
                      >
                        <td
                          style={{
                            textAlign: "center",
                            padding: "14px 18px",
                            color: "#374151",
                            borderBottom: "1px solid #eef2f7",
                            fontWeight: r.isPinned ? 700 : 500,
                          }}
                        >
                          {r.isPinned ? "공지" : "-"}
                        </td>

                        <td
                          style={{
                            padding: "14px 18px",
                            borderBottom: "1px solid #eef2f7",
                            whiteSpace: "pre-line",
                          }}
                        >
                          <span
                            style={{
                              cursor: "pointer",
                              color: "#111827",
                              fontWeight: r.isPinned ? 700 : 500,
                            }}
                            onClick={() => onView(r.id)}
                          >
                            {r.title}
                          </span>
                        </td>

                        <td
                          style={{
                            textAlign: "center",
                            padding: "14px 18px",
                            color: "#374151",
                            borderBottom: "1px solid #eef2f7",
                          }}
                        >
                          {r.writer}
                        </td>

                        <td
                          style={{
                            textAlign: "center",
                            padding: "14px 18px",
                            color: "#374151",
                            borderBottom: "1px solid #eef2f7",
                          }}
                        >
                          {r.createdAt}
                        </td>

                        <td
                          style={{
                            textAlign: "center",
                            padding: "14px 18px",
                            borderBottom: "1px solid #eef2f7",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => onView(r.id)}
                            style={{
                              backgroundColor: "#ffffff",
                              color: "#475569",
                              border: "1px solid #dbe2ea",
                              borderRadius: "8px",
                              padding: "4px 10px",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            보기
                          </button>
                        </td>

                        <td
                          style={{
                            textAlign: "right",
                            padding: "14px 18px",
                            color: "#111827",
                            fontWeight: 600,
                            borderBottom: "1px solid #eef2f7",
                          }}
                        >
                          {r.viewCount != null ? r.viewCount.toLocaleString() : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "12px",
            }}
          >
            <button
              type="button"
              onClick={fetchList}
              style={{
                backgroundColor: "#ffffff",
                color: "#475569",
                border: "1px solid #dbe2ea",
                borderRadius: "10px",
                padding: "10px 14px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              새로고침
            </button>
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header
          closeButton
          style={{
            borderBottom: "1px solid #eef2f7",
            background: "linear-gradient(180deg, #fbfcfe 0%, #f8fafc 100%)",
          }}
        >
          <Modal.Title
            style={{
              fontWeight: 700,
              color: "#1f2937",
            }}
          >
            {selected?.title}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          style={{
            padding: "20px 22px",
            backgroundColor: "#ffffff",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: "10px",
              marginBottom: "14px",
              color: "#475569",
              fontSize: "14px",
            }}
          >
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#111827" }}>작성자:</strong> {selected?.writer}
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#111827" }}>작성일:</strong> {selected?.createdAt}
            </p>
          </div>

          <hr style={{ borderColor: "#eef2f7", margin: "0 0 14px 0" }} />

          <div
            style={{
              whiteSpace: "pre-line",
              color: "#374151",
              lineHeight: 1.7,
              minHeight: "120px",
            }}
          >
            {selected?.content || "-"}
          </div>
        </Modal.Body>

        <Modal.Footer
          style={{
            borderTop: "1px solid #eef2f7",
            backgroundColor: "#ffffff",
          }}
        >
          <Button
            onClick={() => setShowModal(false)}
            style={{
              backgroundColor: "#ffffff",
              color: "#475569",
              border: "1px solid #dbe2ea",
              borderRadius: "10px",
              padding: "8px 14px",
              fontWeight: 600,
            }}
          >
            닫기
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Notice;