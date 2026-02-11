import axios from "axios";
import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";

/** ✅ 추가: 타입 */
type OrderRow = {
  id: number;
  orderNo: string;
  orderName: string;
  step: string;
};

/** ✅ 추가: axios */
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

/** ✅ 추가: 백엔드 경로만 맞추면 됨 */
const API_BASE = "/api/orders";

const OrderState = () => {
  /** ✅ 추가: state */
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);

  /** ✅ 추가: 목록 조회 */
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

      const normalized: OrderRow[] = list.map((r: any) => ({
        id: Number(r.id ?? r.orderId ?? 0),
        orderNo: String(r.orderNo ?? r.no ?? ""),
        orderName: String(r.orderName ?? r.name ?? ""),
        step: String(r.step ?? r.progress ?? ""),
      }));

      setRows(normalized);
    } catch (e) {
      console.error("오더 목록 조회 실패", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  /** ✅ 추가: 최초 1회 */
  useEffect(() => {
    fetchList();
  }, []);

  /** ✅ 추가: 상세보기 */
  const onView = (id: number) => {
    window.location.href = `/orders/${id}`;
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
              {/* ✅ 추가: 비어있을 때 */}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center">
                    {loading ? "불러오는 중..." : "데이터가 없습니다"}
                  </td>
                </tr>
              )}

              {/* ✅ 추가: 서버 데이터 */}
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.orderNo}</td>
                  <td>{r.orderName}</td>
                  <td>{r.step}</td>
                  <td>
                    <a
                      href="#!"
                      onClick={(e) => {
                        e.preventDefault();
                        onView(r.id);
                      }}
                    >
                      보기
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot></tfoot>
          </Table>
        </div>
      </div>
    </>
  );
};

export default OrderState;
