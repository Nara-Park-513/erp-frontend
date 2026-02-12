import axios from "axios";
import { useEffect, useState } from "react";
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import Top from "../include/Top";
import Header from "../include/Header";
import SideBar from "../include/SideBar";
import { Left, Right, Flex, TopWrap } from "../stylesjs/Content.styles";
import { JustifyContent } from "../stylesjs/Util.styles";
import { TableTitle } from "../stylesjs/Text.styles";
import { BtnRight, MainSubmitBtn, WhiteBtn } from "../stylesjs/Button.styles";
import Lnb from "../include/Lnb";
import NoticeModal from "../component/notice/NoticeModal";

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

// 임시 테스트용 로그인 유저
const currentUser = { id: 1 };

export default function NoticeList() {
  const [rows, setRows] = useState<NoticeRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selected, setSelected] = useState<NoticeRow | null>(null);

  const [form, setForm] = useState({
    title: "",
    content: "",
    isPinned: false,
    writer: "관리자",
    createdAt: new Date().toISOString().slice(0, 10),
  });

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
        const writerName = r.member?.username ?? r.writer ?? r.createdBy ?? r.author ?? "관리자";
        const createdAtRaw = r.createdAt ?? r.createdDate ?? r.date ?? new Date().toISOString();

        return {
          id: Number(r.id),
          title: String(r.title ?? r.subject ?? ""),
          writer: "관리자", // 작성자 강제
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
      alert(`공지사항 조회 실패: ${e?.response?.status ?? ""} (콘솔 확인)`);
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
      alert("상세조회 실패");
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
      alert("저장실패");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (!window.confirm("삭제하시겠습니까")) return;
    try {
      await api.delete(`${API_BASE}/${selected.id}`);
      setShowModal(false);
      fetchList();
    } catch {
      alert("삭제 실패");
    }
  };

  return (
    <>
      <div className="fixed-top">
        <Top />
        <Header />
      </div>
      <SideBar />

      <Container fluid>
        <Row>
          <Col>
            <Flex>
              <Left>
                <Lnb
                  menuList={[{ key: "notice", label: "공지사항", path: "/notice" }]}
                  title="공지사항"
                />
              </Left>

              <Right>
                <TopWrap />
                <JustifyContent>
                  <TableTitle>공지사항</TableTitle>
                </JustifyContent>

                <div style={{ marginTop: 8, fontWeight: 700 }}>공지 목록</div>

                <div
                  style={{
                    marginTop: 8,
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ maxHeight: 360, overflowY: "auto" }}>
                    <Table bordered hover responsive style={{ marginBottom: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ width: 90 }}>구분</th>
                          <th>제목</th>
                          <th style={{ width: 140 }}>작성자</th>
                          <th style={{ width: 160 }}>작성일</th>
                          <th style={{ width: 90 }}>상세</th>
                          <th style={{ width: 90 }}>조회</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center">
                              {loading ? "불러오는 중..." : "데이터가 없습니다"}
                            </td>
                          </tr>
                        )}

                        {rows.map((r) => (
                          <tr key={r.id}>
                            <td className="text-center">{r.isPinned ? "공지" : "-"}</td>
                            <td style={{ whiteSpace: "pre-line" }}>
                              <span
                                style={{ cursor: "pointer", fontWeight: r.isPinned ? 700 : 400 }}
                                onClick={() => openView(r.id)}
                              >
                                {r.title}
                              </span>
                            </td>
                            <td className="text-center">{r.writer}</td>
                            <td className="text-center">{r.createdAt}</td>
                            <td className="text-center">
                              <Button size="sm" variant="link" onClick={() => openView(r.id)}>
                                보기
                              </Button>
                            </td>
                            <td className="text-end">
                              {r.viewCount != null ? r.viewCount.toLocaleString() : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>

                <BtnRight style={{ marginTop: 12 }}>
                  <WhiteBtn onClick={fetchList}>새로고침</WhiteBtn>
                  <MainSubmitBtn onClick={openCreate}>신규</MainSubmitBtn>
                </BtnRight>
              </Right>
            </Flex>
          </Col>
        </Row>
      </Container>

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
    </>
  );
}