import axios from "axios";
import { useEffect, useState } from "react";
import { Table, Button, Modal } from "react-bootstrap";
import OrderProgressModal from "../component/orders/OrderProgressModal";

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

/** 백엔드 경로 */
const API_LIST = "/api/orders/progress";

type OrderProgressRow = {
  id: number;
  orderNo: string;
  orderName: string;
  progressText: string;
};


const OrderState = () => {
  /** ✅ state */
  const [rows, setRows] = useState<OrderProgressRow[]>([]);
  const [loading, setLoading] = useState(false);

  /** 모달 상태 */
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  /** ✅ 목록 조회 */
 const fetchList = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_LIST);
      const data = res.data;

      // 배열로 변환: API마다 구조 다를 수 있음
      const list: any[] =
        Array.isArray(data)
          ? data
          : Array.isArray(data.content)
          ? data.content
          : Array.isArray(data.items)
          ? data.items
          : Array.isArray(data.data)
          ? data.data
          : [];

      const normalized: OrderProgressRow[] = list.map((r: any) => ({
        id: Number(r.id ?? r.orderId ?? 0),
        orderNo: String(r.orderNo ?? r.orderCode ?? r.no ?? ""),
        orderName: String(r.orderName ?? r.name ?? ""),
        progressText: String(
          r.progressText ?? r.progress ?? r.stepName ?? r.statusText ?? r.status ?? "-"
        ),
      }));

      setRows(normalized);
    } catch (e: any) {
      console.error("오더 진행단계 조회 실패", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };


  /** ✅ 최초 1회 */
  useEffect(() => {
    fetchList();
  }, []);

 /** 보기 모달 */
  const openModalForEdit = (id: number) => {
    setSelectedId(id);
    setShowModal(true);
  };

  /** 신규 모달 */
  const openModalForNew = () => {
    setSelectedId(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedId(null);
  };

  return (
    <>
      <div className="order-wrap">
        <h5 className="my-2 fs-14-400-gray">오더관리진행단계</h5>
        <div className="table-wrap">
          <Table responsive className="order">
            <colgroup>
              <col style={{ width: "10%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "70%" }} />
              <col style={{ width: "5%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>오더관리번호</th>
                <th>오더관리명</th>
                <th>진행단계</th>
                <th>상세</th>
              </tr>
            </thead>
            <tbody>
              {/* 데이터 없을 때 */}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center">
                    {loading ? "불러오는 중..." : "데이터가 없습니다"}
                  </td>
                </tr>
              )}

              {/* 서버 데이터 */}
              {rows.map((r) => (
                          <tr key={r.id}>
                            <td>{r.orderNo}</td>
                            <td>{r.orderName}</td>
                            <td>{r.progressText}</td>
                            <td className="text-center">
                              <Button
                                size="sm"
                                variant="link"
                                onClick={() => openModalForEdit(r.id)}
                              >
                                보기
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      {/* 모달 */}
<OrderProgressModal
        show={showModal}
        id={selectedId}
        onHide={closeModal}
        onChanged={fetchList}
      />

    </>
  );
};

export default OrderState;