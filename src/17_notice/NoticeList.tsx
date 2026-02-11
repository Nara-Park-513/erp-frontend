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

/** ✅ axios (SalesPurchaseTrade랑 동일 패턴) */
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

/** ✅ 여기만 너 백엔드에 맞게 바꿔 */
const API_BASE = "/api/notice";

type NoticeRow = {
  id: number;
  title: string;
  writer: string;
  createdAt: string; // 날짜
  isPinned?: boolean; // 상단고정(있으면)
  viewCount?: number; // 조회수(있으면)
};

export default function NoticeList() {
  const [rows, setRows] = useState<NoticeRow[]>([]);
  const [loading, setLoading] = useState(false);

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

      const normalized: NoticeRow[] = list.map((r: any) => ({
        id: Number(r.id),
        title: String(r.title ?? r.subject ?? ""),
        writer: String(r.writer ?? r.createdBy ?? r.author ?? ""),
        createdAt: String(r.createdAt ?? r.createdDate ?? r.date ?? ""),
        isPinned: Boolean(r.isPinned ?? r.pinned ?? false),
        viewCount: r.viewCount != null ? Number(r.viewCount) : undefined,
      }));

      // ✅ pinned가 있으면 상단 정렬
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openView = (id: number) => {
    // ✅ 라우팅 있으면 navigate로 바꿔도 됨
    window.location.href = `/notice/${id}`;
  };

  const menuList = [
    { key: "notice", label: "공지사항", path: "/notice" },
  ];

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
                <Lnb menuList={menuList} title="공지사항" />
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
                            <td className="text-center">
                              {r.isPinned ? "공지" : "-"}
                            </td>
                            <td style={{ whiteSpace: "pre-line" }}>
                              <span
                                style={{ cursor: "pointer", fontWeight: r.isPinned ? 700 : 400 }}
                                onClick={() => openView(r.id)}
                              >
                                {r.title}
                              </span>
                            </td>
                            <td className="text-center">{r.writer}</td>
                            <td className="text-center">
                              {String(r.createdAt ?? "").slice(0, 10)}
                            </td>
                            <td className="text-center">
                              <Button
                                size="sm"
                                variant="link"
                                onClick={() => openView(r.id)}
                              >
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
                  <MainSubmitBtn onClick={() => (window.location.href = "/notice/new")}>
                    신규
                  </MainSubmitBtn>
                </BtnRight>
              </Right>
            </Flex>
          </Col>
        </Row>
      </Container>
    </>
  );
}
