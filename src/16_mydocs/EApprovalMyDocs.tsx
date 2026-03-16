import axios from "axios";
import { useEffect, useState } from "react";
import { Container, Row, Col, Table, Button, Modal } from "react-bootstrap";
import Top from "../include/Top";
import Header from "../include/Header";
// import SideBar from "../include/SideBar";
import { Left, Right, Flex, TopWrap } from "../stylesjs/Content.styles";
import { TableTitle } from "../stylesjs/Text.styles";
import { BtnRight } from "../stylesjs/Button.styles";
// import Lnb from "../include/Lnb";
import ApprovalModal, { ApprovalDocForm } from "../component/approval/ApprovalModal";
import "../Auth.css";

/** axios */
const api = axios.create({
  baseURL: "http://localhost:8888",
  timeout: 10000,
});

const toApprovalStatus = (v: string) => {
  const s = (v ?? "").trim();
  if (s === "진행중") return "IN_PROGRESS";
  if (s === "대기") return "DRAFT";
  if (s === "승인") return "APPROVED";
  if (s === "반려") return "REJECTED";
  return s;
};

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

const API_LIST = "/api/approval/my-drafts";
const API_DETAIL = (id: number) => `/api/approval/docs/${id}`;
const API_CREATE = "/api/approval/docs";
const API_UPDATE = (id: number) => `/api/approval/docs/${id}`;
const API_DELETE = (id: number) => `/api/approval/docs/${id}`;

type ApprovalDocRow = {
  id: number;
  draftDate: string;
  title: string;
  drafter: string;
  approver: string;
  progressStatus: string;
};

const emptyDoc = (): ApprovalDocForm => ({
  draftDate: new Date().toISOString().slice(0, 10),
  title: "",
  drafter: "",
  approver: "",
  progressStatus: "진행중",
  content: "",
});

export default function EApprovalMyDocs() {
  const [rows, setRows] = useState<ApprovalDocRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [show, setShow] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [doc, setDoc] = useState<ApprovalDocForm>(emptyDoc());

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error" | "warning">("warning");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isConfirmModal, setIsConfirmModal] = useState(false);

  const drafterId: number | null = null;

  const openAlertModal = (
    type: "success" | "error" | "warning",
    title: string,
    message: string
  ) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setIsConfirmModal(false);
    setShowAlertModal(true);
  };

  const openConfirmModal = (
    type: "success" | "error" | "warning",
    title: string,
    message: string
  ) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setIsConfirmModal(true);
    setShowAlertModal(true);
  };

  const closeAlertModal = () => {
    setShowAlertModal(false);
    setIsConfirmModal(false);
  };

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_LIST, {
        params: drafterId ? { drafterId } : {},
      });
      const data = res.data;

      const list: any[] =
        (Array.isArray(data) ? data : null) ??
        (Array.isArray(data?.content) ? data.content : null) ??
        (Array.isArray(data?.items) ? data.items : null) ??
        [];

      const normalized: ApprovalDocRow[] = list.map((r: any) => {
        const drafter =
          r?.drafterName ??
          r?.drafter?.username ??
          r?.drafter?.firstName ??
          r?.drafter?.name ??
          r?.drafter?.email ??
          r?.drafter ??
          "";

        const approver =
          r?.approverName ??
          r?.approver?.username ??
          r?.approver?.firstName ??
          r?.approver?.name ??
          r?.approver?.email ??
          r?.approver ??
          "";

        return {
          id: Number(r.id),
          draftDate: String(r.draftDate ?? r.date ?? r.createdAt ?? "").slice(0, 10),
          title: String(r.title ?? r.subject ?? ""),
          drafter:
            typeof drafter === "string"
              ? drafter
              : String(drafter?.username ?? drafter?.name ?? ""),
          approver:
            typeof approver === "string"
              ? approver
              : String(approver?.username ?? approver?.name ?? ""),
          progressStatus: fromApprovalStatus(r.progressStatus ?? r.status ?? ""),
        };
      });

      setRows(normalized);
    } catch (e: any) {
      console.error("전자결재 조회 실패", e);
      openAlertModal("error", "조회 실패", "전자결재 조회에 실패했습니다. 콘솔을 확인해 주세요.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNew = () => {
    setSelectedId(null);
    setDoc(emptyDoc());
    setShow(true);
  };

  const openEdit = async (id: number) => {
    try {
      const res = await api.get(API_DETAIL(id));
      const d: any = res.data;

      setSelectedId(id);
      setDoc({
        draftDate: String(d.draftDate ?? d.date ?? d.createdAt ?? "").slice(0, 10),
        title: String(d.title ?? d.subject ?? ""),
        drafter: pickPersonName(d.drafterName ?? d.drafter),
        approver: pickPersonName(d.approverName ?? d.approver),
        progressStatus: fromApprovalStatus(d.progressStatus ?? d.status),
        content: String(d.content ?? d.body ?? d.memo ?? ""),
      });
      setShow(true);
    } catch (e) {
      console.error("상세 조회 실패", e);
      openAlertModal("error", "상세 조회 실패", "상세 조회에 실패했습니다. 콘솔을 확인해 주세요.");
    }
  };

  const openCopy = async (id: number) => {
    try {
      const res = await api.get(API_DETAIL(id));
      const d: any = res.data;

      setSelectedId(null);
      setDoc({
        draftDate: new Date().toISOString().slice(0, 10),
        title: String(d.title ?? d.subject ?? ""),
        drafter: pickPersonName(d.drafterName ?? d.drafter),
        approver: pickPersonName(d.approverName ?? d.approver),
        progressStatus: fromApprovalStatus(d.progressStatus ?? d.status ?? "진행중"),
        content: String(d.content ?? d.body ?? d.memo ?? ""),
      });
      setShow(true);
    } catch (e) {
      console.error("복사 불러오기 실패", e);
      openAlertModal("error", "복사 불러오기 실패", "복사 불러오기에 실패했습니다. 콘솔을 확인해 주세요.");
    }
  };

  const handleClose = () => {
    setShow(false);
    setSelectedId(null);
    setDoc(emptyDoc());
  };

  const save = async () => {
    try {
      if (!doc.title.trim()) {
        openAlertModal("warning", "입력 확인", "제목을 입력하세요.");
        return;
      }
      if (!doc.draftDate) {
        openAlertModal("warning", "입력 확인", "기안일자를 입력하세요.");
        return;
      }

      const loginUserId = 1;

      const payload = {
        draftDate: doc.draftDate,
        title: doc.title,
        drafterId: loginUserId,
        approverId: loginUserId,
        status: toApprovalStatus(doc.progressStatus),
        content: doc.content,
      };

      if (selectedId) await api.put(API_UPDATE(selectedId), payload);
      else await api.post(API_CREATE, payload);

      await fetchList();
      handleClose();
    } catch (e) {
      console.error("저장 실패", e);
      openAlertModal("error", "저장 실패", "저장에 실패했습니다. 콘솔을 확인해 주세요.");
    }
  };

  const confirmDelete = async () => {
    if (!selectedId) return;

    try {
      await api.delete(API_DELETE(selectedId));
      await fetchList();
      handleClose();
      closeAlertModal();
    } catch (e) {
      console.error("삭제 실패", e);
      closeAlertModal();
      openAlertModal("error", "삭제 실패", "삭제에 실패했습니다. 콘솔을 확인해 주세요.");
    }
  };

  const del = async () => {
    if (!selectedId) return;
    openConfirmModal("warning", "삭제 확인", "정말 삭제하시겠습니까?");
  };

  // const menuList = [{ key: "approval", label: "전자결재", path: "/approval" }];

  return (
    <>
      <div className="fixed-top">
        <Header />
        <Top />
      </div>

      {/* <SideBar /> */}

      <div
        style={{
          backgroundColor: "#ffffff",
          minHeight: "100vh",
          paddingTop: "120px",
        }}
      >
        <Container fluid>
          <Row>
            <Col>
              <Flex>
                <Left>
                  {/* <Lnb menuList={menuList} title="전자결재" /> */}
                </Left>

                <Right style={{ marginTop: "-20px" }}>
                  <TopWrap />

                  <div
                    style={{
                      marginBottom: "14px",
                      display: "flex",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ lineHeight: 1.2 }}>
                      <TableTitle
                        style={{
                          margin: 0,
                          padding: 0,
                          color: "#1f2937",
                          fontWeight: 700,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        전자결재
                      </TableTitle>

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

                    <div style={{ maxHeight: 320, overflowY: "auto" }}>
                      <Table responsive className="mb-0 align-middle">
                        <thead>
                          <tr
                            style={{
                              background: "linear-gradient(180deg, #fbfcfe 0%, #f4f7fb 100%)",
                            }}
                          >
                            <th
                              style={{
                                width: 140,
                                padding: "15px 18px",
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "#475467",
                                borderBottom: "1px solid #e8ecf4",
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
                                width: 140,
                                padding: "15px 18px",
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "#475467",
                                borderBottom: "1px solid #e8ecf4",
                              }}
                            >
                              기안자
                            </th>
                            <th
                              style={{
                                width: 140,
                                padding: "15px 18px",
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "#475467",
                                borderBottom: "1px solid #e8ecf4",
                              }}
                            >
                              결재자
                            </th>
                            <th
                              style={{
                                width: 140,
                                padding: "15px 18px",
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "#475467",
                                borderBottom: "1px solid #e8ecf4",
                              }}
                            >
                              진행상태
                            </th>
                            <th
                              style={{
                                width: 90,
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
                            <th
                              style={{
                                width: 110,
                                padding: "15px 18px",
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "#475467",
                                borderBottom: "1px solid #e8ecf4",
                                textAlign: "center",
                              }}
                            >
                              복사
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {rows.length === 0 ? (
                            <tr>
                              <td
                                colSpan={7}
                                style={{
                                  textAlign: "center",
                                  padding: "44px 16px",
                                  color: "#98a2b3",
                                  fontSize: "14px",
                                }}
                              >
                                {loading ? "불러오는 중..." : "데이터 없음"}
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
                                    padding: "14px 18px",
                                    color: "#374151",
                                    borderBottom: "1px solid #eef2f7",
                                  }}
                                >
                                  {r.drafter}
                                </td>
                                <td
                                  style={{
                                    padding: "14px 18px",
                                    color: "#374151",
                                    borderBottom: "1px solid #eef2f7",
                                  }}
                                >
                                  {r.approver}
                                </td>
                                <td
                                  style={{
                                    padding: "14px 18px",
                                    color: "#374151",
                                    borderBottom: "1px solid #eef2f7",
                                  }}
                                >
                                  {r.progressStatus}
                                </td>
                                <td
                                  style={{
                                    padding: "14px 18px",
                                    textAlign: "center",
                                    borderBottom: "1px solid #eef2f7",
                                  }}
                                >
                                  <Button
                                    size="sm"
                                    onClick={() => openEdit(r.id)}
                                    style={{
                                      backgroundColor: "#ffffff",
                                      color: "#475569",
                                      border: "1px solid #dbe2ea",
                                      borderRadius: "8px",
                                      padding: "4px 10px",
                                      fontSize: "12px",
                                      fontWeight: 600,
                                    }}
                                  >
                                    보기
                                  </Button>
                                </td>
                                <td
                                  style={{
                                    padding: "14px 18px",
                                    textAlign: "center",
                                    borderBottom: "1px solid #eef2f7",
                                  }}
                                >
                                  <Button
                                    size="sm"
                                    onClick={() => openCopy(r.id)}
                                    style={{
                                      backgroundColor: "#ffffff",
                                      color: "#475569",
                                      border: "1px solid #dbe2ea",
                                      borderRadius: "8px",
                                      padding: "4px 10px",
                                      fontSize: "12px",
                                      fontWeight: 600,
                                    }}
                                  >
                                    복사
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </div>

                  <BtnRight style={{ marginTop: "12px", gap: "10px" }}>
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

                    <button
                      type="button"
                      onClick={openNew}
                      style={{
                        backgroundColor: "#6b7280",
                        color: "#ffffff",
                        border: "1px solid #6b7280",
                        borderRadius: "10px",
                        padding: "10px 18px",
                        fontSize: "14px",
                        fontWeight: 600,
                        boxShadow: "0 4px 10px rgba(107, 114, 128, 0.16)",
                        cursor: "pointer",
                      }}
                    >
                      신규
                    </button>
                  </BtnRight>
                </Right>
              </Flex>
            </Col>
          </Row>
        </Container>
      </div>

      <ApprovalModal
        show={show}
        selectedId={selectedId}
        doc={doc}
        onSetDoc={setDoc}
        onClose={handleClose}
        onSave={save}
        onDelete={del}
      />

      <Modal
        show={showAlertModal}
        onHide={() => {}}
        centered={false}
        backdrop={true}
        keyboard={false}
        dialogClassName="top-alert-modal"
        contentClassName="top-alert-content"
      >
        <Modal.Body className={`top-alert-body ${alertType}`}>
          <div className="top-alert-left">
            <div className={`top-alert-icon ${alertType}`}>
              {alertType === "success" ? "✓" : alertType === "error" ? "✕" : "!"}
            </div>
          </div>

          <div className="top-alert-center">
            <h3 className="top-alert-title">{alertTitle}</h3>
            <p className="top-alert-text">{alertMessage}</p>
          </div>

          <div
            className="top-alert-right"
            style={{ display: "flex", gap: "8px", alignItems: "center" }}
          >
            {isConfirmModal ? (
              <>
                <button
                  type="button"
                  onClick={closeAlertModal}
                  style={{
                    height: "36px",
                    minWidth: "68px",
                    border: "1px solid #d0d5dd",
                    borderRadius: "999px",
                    padding: "0 14px",
                    background: "#ffffff",
                    color: "#475467",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  취소
                </button>

                <button
                  type="button"
                  onClick={confirmDelete}
                  className={`top-alert-button ${alertType}`}
                >
                  삭제
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={closeAlertModal}
                className={`top-alert-button ${alertType}`}
              >
                확인
              </button>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}