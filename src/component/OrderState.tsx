import axios from "axios";
import { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import OrderProgressModal from "./orders/OrderProgressModal";

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
  const [rows, setRows] = useState<OrderProgressRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_LIST);
      const data = res.data;

      const list: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
        ? data.content
        : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.data)
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

  useEffect(() => {
    fetchList();
  }, []);

  const openModalForEdit = (id: number) => {
    setSelectedId(id);
    setShowModal(true);
  };

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
      <div
        style={{
          width: "100%",
          marginTop: "10px",
          marginBottom: "40px",
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
              오더관리진행단계
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
            오더 진행 목록
          </div>

          <div
            style={{
              width: "100%",
              overflowX: "auto",
            }}
          >
            <div
              style={{
                minWidth: "760px",
                maxHeight: "300px",
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
                <colgroup>
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "24%" }} />
                  <col style={{ width: "46%" }} />
                  <col style={{ width: "12%" }} />
                </colgroup>

                <thead>
                  <tr
                    style={{
                      background: "linear-gradient(180deg, #fbfcfe 0%, #f4f7fb 100%)",
                    }}
                  >
                    <th
                      style={{
                        padding: "12px 14px",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#475467",
                        borderBottom: "1px solid #e8ecf4",
                        verticalAlign: "middle",
                        whiteSpace: "nowrap",
                      }}
                    >
                      오더관리번호
                    </th>
                    <th
                      style={{
                        padding: "12px 14px",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#475467",
                        borderBottom: "1px solid #e8ecf4",
                        verticalAlign: "middle",
                        whiteSpace: "nowrap",
                      }}
                    >
                      오더관리명
                    </th>
                    <th
                      style={{
                        padding: "12px 14px",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#475467",
                        borderBottom: "1px solid #e8ecf4",
                        verticalAlign: "middle",
                      }}
                    >
                      진행단계
                    </th>
                    <th
                      style={{
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
                      상세
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          textAlign: "center",
                          padding: "34px 14px",
                          color: "#98a2b3",
                          fontSize: "13px",
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
                            padding: "12px 14px",
                            color: "#111827",
                            fontWeight: 600,
                            borderBottom: "1px solid #eef2f7",
                            verticalAlign: "middle",
                            fontSize: "13px",
                            wordBreak: "break-word",
                          }}
                        >
                          {r.orderNo}
                        </td>

                        <td
                          style={{
                            padding: "12px 14px",
                            color: "#374151",
                            borderBottom: "1px solid #eef2f7",
                            verticalAlign: "middle",
                            fontSize: "13px",
                            wordBreak: "break-word",
                          }}
                        >
                          {r.orderName}
                        </td>

                        <td
                          style={{
                            padding: "12px 14px",
                            color: "#374151",
                            borderBottom: "1px solid #eef2f7",
                            verticalAlign: "middle",
                            wordBreak: "break-word",
                            fontSize: "13px",
                            lineHeight: 1.5,
                          }}
                        >
                          {r.progressText}
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
                            onClick={() => openModalForEdit(r.id)}
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
              gap: "8px",
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

            <button
              type="button"
              onClick={openModalForNew}
              style={{
                backgroundColor: "#6b7280",
                color: "#ffffff",
                border: "1px solid #6b7280",
                borderRadius: "8px",
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: 600,
                boxShadow: "0 4px 10px rgba(107, 114, 128, 0.16)",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              신규
            </button>
          </div>
        </div>
      </div>

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