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
          width: "100%",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            marginBottom: "10px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ lineHeight: 1.2 }}>
            <h4
              style={{
                margin: 0,
                padding: 0,
                color: "#1f2937",
                fontWeight: 700,
                fontSize: "20px",
                letterSpacing: "-0.02em",
              }}
            >
              전자결재
            </h4>

            <div
              style={{
                marginTop: "4px",
                fontSize: "13px",
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
            width: "100%",
            backgroundColor: "#ffffff",
            border: "1px solid #e8ecf4",
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow: "0 6px 18px rgba(15, 23, 42, 0.04)",
          }}
        >
          <div
            style={{
              padding: "12px 14px",
              borderBottom: "1px solid #eef2f7",
              background: "linear-gradient(180deg, #fbfcfe 0%, #f8fafc 100%)",
              fontSize: "14px",
              fontWeight: 700,
              color: "#374151",
            }}
          >
            내 기안문서
          </div>

          <div
            style={{
              width: "100%",
              overflowX: "auto",
            }}
          >
            <div
              style={{
                minWidth: "720px",
                maxHeight: "280px",
                overflowY: "auto",
              }}
            >
              <Table
                responsive
                className="mb-0 align-middle"
                style={{
                  marginBottom: 0,
                  tableLayout: "fixed",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "linear-gradient(180deg, #fbfcfe 0%, #f4f7fb 100%)",
                    }}
                  >
                    <th
                      style={{
                        width: "120px",
                        padding: "12px 14px",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#475467",
                        borderBottom: "1px solid #e8ecf4",
                        textAlign: "center",
                        verticalAlign: "middle",
                        whiteSpace: "nowrap",
                      }}
                    >
                      기안일자
                    </th>
                    <th
                      style={{
                        minWidth: "180px",
                        padding: "12px 14px",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#475467",
                        borderBottom: "1px solid #e8ecf4",
                        verticalAlign: "middle",
                      }}
                    >
                      제목
                    </th>
                    <th
                      style={{
                        width: "150px",
                        padding: "12px 14px",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#475467",
                        borderBottom: "1px solid #e8ecf4",
                        textAlign: "center",
                        verticalAlign: "middle",
                        whiteSpace: "nowrap",
                      }}
                    >
                      기안자
                    </th>
                    <th
                      style={{
                        width: "150px",
                        padding: "12px 14px",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#475467",
                        borderBottom: "1px solid #e8ecf4",
                        textAlign: "center",
                        verticalAlign: "middle",
                        whiteSpace: "nowrap",
                      }}
                    >
                      결재자
                    </th>
                    <th
                      style={{
                        width: "110px",
                        padding: "12px 14px",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#475467",
                        borderBottom: "1px solid #e8ecf4",
                        textAlign: "center",
                        verticalAlign: "middle",
                        whiteSpace: "nowrap",
                      }}
                    >
                      진행상태
                    </th>
                    <th
                      style={{
                        width: "80px",
                        padding: "12px 14px",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#475467",
                        borderBottom: "1px solid #e8ecf4",
                        textAlign: "center",
                        verticalAlign: "middle",
                        whiteSpace: "nowrap",
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
                          padding: "34px 14px",
                          color: "#98a2b3",
                          fontSize: "13px",
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
                            padding: "12px 14px",
                            color: "#374151",
                            borderBottom: "1px solid #eef2f7",
                            verticalAlign: "middle",
                            whiteSpace: "nowrap",
                            fontSize: "13px",
                          }}
                        >
                          {r.draftDate}
                        </td>

                        <td
                          style={{
                            padding: "12px 14px",
                            color: "#111827",
                            fontWeight: 600,
                            borderBottom: "1px solid #eef2f7",
                            verticalAlign: "middle",
                            wordBreak: "break-word",
                            fontSize: "13px",
                          }}
                        >
                          {r.title}
                        </td>

                        <td
                          style={{
                            textAlign: "center",
                            padding: "12px 14px",
                            color: "#374151",
                            borderBottom: "1px solid #eef2f7",
                            verticalAlign: "middle",
                            wordBreak: "break-all",
                            fontSize: "13px",
                          }}
                        >
                          {r.writer}
                        </td>

                        <td
                          style={{
                            textAlign: "center",
                            padding: "12px 14px",
                            color: "#374151",
                            borderBottom: "1px solid #eef2f7",
                            verticalAlign: "middle",
                            wordBreak: "break-all",
                            fontSize: "13px",
                          }}
                        >
                          {r.approver}
                        </td>

                        <td
                          style={{
                            textAlign: "center",
                            padding: "12px 14px",
                            color: "#374151",
                            borderBottom: "1px solid #eef2f7",
                            fontWeight: 600,
                            verticalAlign: "middle",
                            whiteSpace: "nowrap",
                            fontSize: "13px",
                          }}
                        >
                          {r.status}
                        </td>

                        <td
                          style={{
                            textAlign: "center",
                            padding: "12px 14px",
                            borderBottom: "1px solid #eef2f7",
                            verticalAlign: "middle",
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
                              padding: "5px 10px",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
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
              padding: "10px 14px",
              borderTop: "1px solid #eef2f7",
              backgroundColor: "#ffffff",
            }}
          >
            <button
              type="button"
              onClick={fetchList}
              style={{
                backgroundColor: "#ffffff",
                color: "#475569",
                border: "1px solid #dbe2ea",
                borderRadius: "8px",
                padding: "8px 12px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
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
              fontSize: "18px",
            }}
          >
            {modalData?.title}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          style={{
            padding: "18px 20px",
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
              lineHeight: 1.6,
              fontFamily: "inherit",
              minHeight: "100px",
              fontSize: "14px",
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
              borderRadius: "8px",
              padding: "8px 12px",
              fontWeight: 600,
              fontSize: "13px",
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