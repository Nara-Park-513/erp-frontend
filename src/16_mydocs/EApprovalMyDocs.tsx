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
import ApprovalWriteModal from "../component/approval/ApprovalWriteModal";

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

const API_BASE = "/api/approval/my-drafts";

type ApprovalDocRow = {
  id: number;
  draftDate: string;
  title: string;
  drafter: string;
  approver: string;
  progressStatus: string;
};

export default function EApprovalMyDocs() {
  const [rows, setRows] = useState<ApprovalDocRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [showWrite, setShowWrite] = useState(false); // ⭐ 모달 상태 추가

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_BASE);
      const data = res.data;

      const list: any[] =
        (Array.isArray(data) ? data : null) ??
        (Array.isArray(data?.content) ? data.content : null) ??
        [];

      const normalized: ApprovalDocRow[] = list.map((r: any) => ({
        id: Number(r.id),
        draftDate: String(r.draftDate ?? r.createdAt ?? ""),
        title: String(r.title ?? ""),
        drafter: String(r.drafter ?? ""),
        approver: String(r.approver ?? ""),
        progressStatus: String(r.progressStatus ?? ""),
      }));

      setRows(normalized);
    } catch (e) {
      console.error("전자결재 조회 실패", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const menuList = [{ key: "approval", label: "전자결재", path: "/approval" }];

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
                <Lnb menuList={menuList} title="전자결재" />
              </Left>

              <Right>
                <TopWrap />
                <JustifyContent>
                  <TableTitle>전자결재</TableTitle>
                </JustifyContent>

                <div style={{ marginTop: 8, fontWeight: 700 }}>내 기안문서</div>

                <Table bordered hover responsive>
                  <thead>
                    <tr>
                      <th>기안일자</th>
                      <th>제목</th>
                      <th>기안자</th>
                      <th>결재자</th>
                      <th>진행상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center">
                          {loading ? "불러오는 중..." : "데이터 없음"}
                        </td>
                      </tr>
                    )}

                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td>{r.draftDate}</td>
                        <td>{r.title}</td>
                        <td>{r.drafter}</td>
                        <td>{r.approver}</td>
                        <td>{r.progressStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <BtnRight>
                  <WhiteBtn onClick={fetchList}>새로고침</WhiteBtn>
                  <MainSubmitBtn onClick={() => setShowWrite(true)}>
                    신규
                  </MainSubmitBtn>
                </BtnRight>
              </Right>
            </Flex>
          </Col>
        </Row>
      </Container>

      {/* ⭐ 신규작성 모달 */}
      <ApprovalWriteModal
        show={showWrite}
        onClose={() => setShowWrite(false)}
        onSaved={() => {
          setShowWrite(false);
          fetchList();
        }}
      />
    </>
  );
}
