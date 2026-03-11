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
    <>
      <div
        style={{
          //background: "linear-gradient(180deg, #f7f8fc 0%, #f3f5f9 100%)",
          minHeight: "100%",
          padding: "0",
        }}
      >
        <div
          className="pay mt-120"
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
                전자결재
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
              내 기안문서
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
                        width: "140px",
                        padding: "15px 18px",
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#475467",
                        borderBottom: "1px solid #e8ecf4",
                        textAlign: "center",
                      }}
                    >
                      기안일자
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
                      기안자
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
                      결재자
                    </th>
                    <th
                      style={{
                        width: "120px",
                        padding: "15px 18px",
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#475467",
                        borderBottom: "1px solid #e8ecf4",
                        textAlign: "center",
                      }}
                    >
                      진행상태
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
                      보기
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
                        {loading ? "불러오는 중..." : "기안문서가 없습니다"}
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
                          }}
                        >
                          {r.draftDate}
                        </td>

                        <td
                          style={{
                            padding: "14px 18px",
                            color: "#111827",
                            fontWeight: 600,
                            borderBottom: "1px solid #eef2f7",
                            whiteSpace: "pre-line",
                          }}
                        >
                          {r.title}
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
                          {r.approver}
                        </td>

                        <td
                          style={{
                            textAlign: "center",
                            padding: "14px 18px",
                            color: "#374151",
                            borderBottom: "1px solid #eef2f7",
                            fontWeight: 600,
                          }}
                        >
                          {r.status}
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

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
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
            {modalData?.title}
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
              gap: "8px",
              marginBottom: "14px",
              color: "#475569",
              fontSize: "14px",
            }}
          >
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#111827" }}>기안자:</strong> {modalData?.writer}
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#111827" }}>결재자:</strong> {modalData?.approver}
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#111827" }}>진행상태:</strong> {modalData?.status}
            </p>
          </div>

          <hr style={{ borderColor: "#eef2f7", margin: "0 0 14px 0" }} />

          <pre
            style={{
              whiteSpace: "pre-wrap",
              margin: 0,
              color: "#374151",
              lineHeight: 1.7,
              fontFamily: "inherit",
              minHeight: "120px",
            }}
          >
            {modalData?.content || "-"}
          </pre>
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

export default Pay;