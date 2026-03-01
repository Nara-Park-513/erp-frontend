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
import ApprovalModal, { ApprovalDocForm } from "../component/approval/ApprovalModal";

/** ✅ axios (SalesPurchaseTrade랑 동일 패턴) */
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

  // 이미 영문이면 그대로
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

/** ✅ ApprovalDocController 기준으로 경로 수정 */
const API_LIST = "/api/approval/my-drafts"; // 내 기안 목록 (GET, drafterId 파라미터)
const API_DETAIL = (id: number) => `/api/approval/docs/${id}`; // 상세 (GET)
const API_CREATE = "/api/approval/docs"; // 생성 (POST)
const API_UPDATE = (id: number) => `/api/approval/docs/${id}`; // 수정 (PUT)
const API_DELETE = (id: number) => `/api/approval/docs/${id}`; // 삭제 (DELETE)

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

  /** ✅ TODO: 로그인 사용자 ID로 교체 (없으면 null로 두면 전체 리스트로 fallback됨) */
  const drafterId: number | null = null;

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
    progressStatus: String(r.progressStatus ?? r.status ?? ""),
  };
});


      setRows(normalized);
    } catch (e: any) {
      console.error("전자결재 조회 실패", e);
      alert(`전자결재 조회 실패: ${e?.response?.status ?? ""} (콘솔 확인)`);
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

      // ✅ 여기!
      drafter: pickPersonName(d.drafterName ?? d.drafter),
      approver: pickPersonName(d.approverName ?? d.approver),

      // ✅ status enum -> 한글 표시
      progressStatus: fromApprovalStatus(d.progressStatus ?? d.status),

      content: String(d.content ?? d.body ?? d.memo ?? ""),
    });
      setShow(true);
    } catch (e) {
      console.error("상세 조회 실패", e);
      alert("상세 조회 실패(콘솔 확인)");
    }
  };

  /** ✅ 복사: 원본 상세 불러오되 selectedId는 null로 => 저장 시 POST로 신규 생성 */
  const openCopy = async (id: number) => {
    try {
      const res = await api.get(API_DETAIL(id));
      const d: any = res.data;

      setSelectedId(null);
      setDoc({
        draftDate: new Date().toISOString().slice(0, 10), // 복사 시 오늘 날짜로
        title: String(d.title ?? d.subject ?? ""),
        drafter: String(d.drafter ?? d.writer ?? d.createdBy ?? ""),
        approver: String(d.approver ?? d.approverName ?? ""),
        progressStatus: String(d.progressStatus ?? d.status ?? "진행중"),
        content: String(d.content ?? d.body ?? d.memo ?? ""),
      });
      setShow(true);
    } catch (e) {
      console.error("복사 불러오기 실패", e);
      alert("복사 불러오기 실패(콘솔 확인)");
    }
  };

  const handleClose = () => {
    setShow(false);
    setSelectedId(null);
    setDoc(emptyDoc());
  };

const save = async () => {
  try {
    if (!doc.title.trim()) return alert("제목을 입력하세요.");
    if (!doc.draftDate) return alert("기안일자를 입력하세요.");

    const loginUserId = 1; // TODO: 로그인 연동 시 교체

    const payload = {
      draftDate: doc.draftDate,
      title: doc.title,
      drafterId: loginUserId,
      approverId: loginUserId,
      status: toApprovalStatus(doc.progressStatus), // ✅ 여기!
      content: doc.content,
    };

    if (selectedId) await api.put(API_UPDATE(selectedId), payload);
    else await api.post(API_CREATE, payload);

    await fetchList();
    handleClose();
  } catch (e) {
    console.error("저장 실패", e);
    alert("저장 실패(콘솔 확인)");
  }
};


  const del = async () => {
    if (!selectedId) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await api.delete(API_DELETE(selectedId));
      await fetchList();
      handleClose();
    } catch (e) {
      console.error("삭제 실패", e);
      alert("삭제 실패(콘솔 확인)");
    }
  };

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

                <div
                  style={{
                    marginTop: 8,
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ maxHeight: 260, overflowY: "auto" }}>
                    <Table bordered hover responsive style={{ marginBottom: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ width: 140 }}>기안일자</th>
                          <th>제목</th>
                          <th style={{ width: 140 }}>기안자</th>
                          <th style={{ width: 140 }}>결재자</th>
                          <th style={{ width: 140 }}>진행상태</th>
                          <th style={{ width: 90 }}>보기</th>
                          <th style={{ width: 110 }}>복사</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.length === 0 && (
                          <tr>
                            <td colSpan={7} className="text-center">
                              {loading ? "불러오는 중..." : "데이터 없음"}
                            </td>
                          </tr>
                        )}

                        {rows.map((r) => (
                          <tr key={r.id}>
                            <td>{r.draftDate}</td>
                            <td style={{ whiteSpace: "pre-line" }}>{r.title}</td>
                            <td>{r.drafter}</td>
                            <td>{r.approver}</td>
                            <td>{r.progressStatus}</td>
                            <td>
                              <Button size="sm" variant="link" onClick={() => openEdit(r.id)}>
                                보기
                              </Button>
                            </td>
                            <td>
                              <Button size="sm" variant="link" onClick={() => openCopy(r.id)}>
                                복사
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>

                <BtnRight style={{ marginTop: 12 }}>
                  <WhiteBtn onClick={fetchList}>새로고침</WhiteBtn>
                  <MainSubmitBtn onClick={openNew}>신규</MainSubmitBtn>
                </BtnRight>
              </Right>
            </Flex>
          </Col>
        </Row>
      </Container>

      <ApprovalModal
        show={show}
        selectedId={selectedId}
        doc={doc}
        onSetDoc={setDoc}
        onClose={handleClose}
        onSave={save}
        onDelete={del}
      />
    </>
  );
}