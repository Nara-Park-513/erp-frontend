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
import NoticeModal from "../component/notice/NoticeModal";
import "../Auth.css";

/** axios 설정 */
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

const API_BASE = "/api/notice";

type NoticeRow = {
  id: number;
  title: string;
  content?: string;
  writer: string;
  createdAt: string;
  isPinned?: boolean;
  viewCount?: number;
};

const currentUser = { id: 1 };

export default function NoticeList() {
  const [rows, setRows] = useState<NoticeRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selected, setSelected] = useState<NoticeRow | null>(null);

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error" | "warning">("warning");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isConfirmModal, setIsConfirmModal] = useState(false);

  const [form, setForm] = useState({
    title: "",
    content: "",
    isPinned: false,
    writer: "관리자",
    createdAt: new Date().toISOString().slice(0, 10),
  });

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
      const res = await api.get(API_BASE);
      const data = res.data;

      const list: any[] =
        (Array.isArray(data) ? data : null) ??
        (Array.isArray(data?.content) ? data.content : null) ??
        (Array.isArray(data?.items) ? data.items : null) ??
        (Array.isArray(data?.data) ? data.data : null) ??
        [];

      const normalized: NoticeRow[] = list.map((r: any) => {
        const createdAtRaw =
          r.createdAt ?? r.createdDate ?? r.date ?? new Date().toISOString();

        return {
          id: Number(r.id),
          title: String(r.title ?? r.subject ?? ""),
          writer: "관리자",
          createdAt: createdAtRaw
            ? new Date(String(createdAtRaw)).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10),
          content: String(r.content ?? ""),
          isPinned: Boolean(r.isPinned ?? r.pinned ?? false),
          viewCount: r.viewCount != null ? Number(r.viewCount) : undefined,
        };
      });

      normalized.sort((a, b) => Number(b.isPinned) - Number(a.isPinned));
      setRows(normalized);
    } catch (e: any) {
      console.error("공지사항 조회 실패", e);
      openAlertModal("error", "조회 실패", "공지사항 조회에 실패했습니다. 콘솔을 확인해 주세요.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const openView = async (id: number) => {
    try {
      const res = await api.get(`${API_BASE}/${id}`);
      const r = res.data;

      setSelected({
        id: Number(r.id),
        title: String(r.title ?? r.subject ?? ""),
        content: String(r.content ?? ""),
        writer: "관리자",
        createdAt: r.createdAt
          ? new Date(String(r.createdAt)).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        isPinned: Boolean(r.isPinned ?? r.pinned ?? false),
        viewCount: r.viewCount != null ? Number(r.viewCount) : undefined,
      });

      setIsEditMode(false);
      setShowModal(true);
    } catch {
      openAlertModal("error", "상세 조회 실패", "상세 조회에 실패했습니다. 콘솔을 확인해 주세요.");
    }
  };

  const openCreate = () => {
    const now = new Date();
    setForm({
      title: "",
      content: "",
      isPinned: false,
      writer: "관리자",
      createdAt: now.toISOString().slice(0, 10),
    });
    setSelected(null);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        writer: "관리자",
        createdAt: selected ? selected.createdAt : new Date().toISOString(),
      };

      if (selected) {
        await api.put(`${API_BASE}/${selected.id}`, payload);
      } else {
        await api.post(API_BASE, {
          memberId: currentUser.id,
          ...payload,
        });
      }
      setShowModal(false);
      fetchList();
    } catch {
      openAlertModal("error", "저장 실패", "저장에 실패했습니다. 콘솔을 확인해 주세요.");
    }
  };

  const confirmDelete = async () => {
    if (!selected) return;

    try {
      await api.delete(`${API_BASE}/${selected.id}`);
      setShowModal(false);
      fetchList();
      closeAlertModal();
    } catch {
      closeAlertModal();
      openAlertModal("error", "삭제 실패", "삭제에 실패했습니다. 콘솔을 확인해 주세요.");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    openConfirmModal("warning", "삭제 확인", "정말 삭제하시겠습니까?");
  };

  // const menuList = [{ key: "notice", label: "공지사항", path: "/notice" }];

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
                  {/* <Lnb menuList={menuList} title="공지사항" /> */}
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
                        공지사항
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
                      공지 목록
                    </div>

                    <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                      <Table responsive className="mb-0 align-middle">
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
                                    onClick={() => openView(r.id)}
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
                                  <Button
                                    size="sm"
                                    onClick={() => openView(r.id)}
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
                      onClick={openCreate}
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

      <NoticeModal
        show={showModal}
        onHide={() => setShowModal(false)}
        data={selected}
        isEditMode={isEditMode}
        form={form}
        setForm={setForm}
        onSave={handleSave}
        onDelete={handleDelete}
        onEditMode={() => {
          setForm({
            title: selected?.title ?? "",
            content: selected?.content ?? "",
            isPinned: selected?.isPinned ?? false,
            writer: "관리자",
            createdAt: selected?.createdAt ?? new Date().toISOString().slice(0, 10),
          });
          setIsEditMode(true);
        }}
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