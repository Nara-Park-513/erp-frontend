// ✅ StockStatus.tsx (전체 복붙용) — "리스트 안나옴" 구조 수정 버전
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Table } from "react-bootstrap";
import Top from "../include/Top";
import Header from "../include/Header";
import SideBar from "../include/SideBar";
import { Left, Right, Flex, TopWrap } from "../stylesjs/Content.styles";
import { JustifyContent } from "../stylesjs/Util.styles";
import { TableTitle } from "../stylesjs/Text.styles";
import { InputGroup, Search } from "../stylesjs/Input.styles";
import { WhiteBtn, MainSubmitBtn, BtnRight } from "../stylesjs/Button.styles";
import Lnb from "../include/Lnb";

import StockModal, { StockForm } from "../component/stock/StockModal";

/* =========================
   타입 정의
========================= */
type StockItem = {
  id: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  stockQty: number;
  unitPrice: number;
  totalAmount: number;
};

type Item = {
  id: number;
  itemCode: string;
  itemName: string;
  unitPrice?: number;
};

/* =========================
   API 설정
========================= */
const API_STOCK = "http://localhost:8888/api/stock";
const API_ITEM = "http://localhost:8888/api/inv/items";

// ✅ 숫자 안전
const n = (v: any) => Number(v ?? 0) || 0;

const StockStatus = () => {
  const [keyword, setKeyword] = useState("");
  const [stockList, setStockList] = useState<StockItem[]>([]);
  const [itemList, setItemList] = useState<Item[]>([]);

  // ✅ 모달 상태
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const emptyForm = (): StockForm => ({
    id: undefined,
    itemId: null,
    itemCode: "",
    itemName: "",
    stockQty: 0,
    unitPrice: 0,
  });

  const [form, setForm] = useState<StockForm>(emptyForm());

  /* ===== 합계 ===== */
  const totals = useMemo(() => {
    const totalQty = stockList.reduce((s, i) => s + n(i.stockQty), 0);
    const totalAmount = stockList.reduce((s, i) => s + n(i.totalAmount), 0);
    return { totalQty, totalAmount };
  }, [stockList]);

  /* =========================
     품목 조회
     ========================= */
  const fetchItems = async () => {
    try {
      const res = await axios.get(API_ITEM, {
        params: {
          includeStopped: true,
          page: 0,
          size: 2000,
          sortKey: "id",
          dir: "desc",
        },
      });

      const rows = Array.isArray(res.data) ? res.data : res.data?.content ?? [];
      console.log("✅ items raw sample =", rows?.[0]);

      const normalized: Item[] = rows.map((x: any) => ({
        id: n(x.id ?? x.itemId ?? x.item_id),
        itemCode: String(x.itemCode ?? x.code ?? x.item_code ?? ""),
        itemName: String(x.itemName ?? x.name ?? x.item_name ?? ""),
        unitPrice: n(x.outPrice ?? x.unitPrice ?? 0),
      }));

      console.log("✅ items normalized sample =", normalized?.[0]);
      setItemList(normalized);
    } catch (e: any) {
      console.error("❌ 품목 목록 조회 실패", e?.response?.status, e?.response?.data);
      // ✅ 품목 실패해도 재고조회는 돌아야 하므로 itemList는 비워두되 진행
      setItemList([]);
    }
  };

  /* =========================
     재고 조회 (품목 없어도 표시되게)
     ========================= */
  const fetchStock = async () => {
    try {
      const res = await axios.get(API_STOCK, {
        params: { q: keyword?.trim() ? keyword.trim() : undefined, page: 0, size: 2000, sort: "id,desc" },
      });

      const rows = Array.isArray(res.data) ? res.data : res.data?.content ?? [];
      console.log("✅ stock raw sample =", rows?.[0]);

      // ✅ itemList 기반 단가 매칭(없으면 0으로)
      const itemMap = new Map<number, Item>();
      itemList.forEach((it) => itemMap.set(it.id, it));

      const list: StockItem[] = rows.map((i: any) => {
        const itemId = n(i.itemId ?? i.item_id ?? i.item?.id ?? 0);
        const it = itemMap.get(itemId);

        const stockQty = n(i.onHandQty ?? i.stockQty ?? 0);
        const unitPrice = n(i.unitPrice ?? it?.unitPrice ?? 0);

        return {
          id: n(i.id),
          itemId,
          itemCode: String(i.itemCode ?? it?.itemCode ?? ""),
          itemName: String(i.itemName ?? it?.itemName ?? ""),
          stockQty,
          unitPrice,
          totalAmount: stockQty * unitPrice,
        };
      });

      console.log("✅ stock normalized sample =", list?.[0]);
      setStockList(list);
    } catch (e: any) {
      console.error("❌ 재고조회 실패", e?.response?.status, e?.response?.data);
      alert(`재고조회 실패: ${e?.response?.status ?? ""} (콘솔 확인)`);
      setStockList([]);
    }
  };

  /* =========================
     최초 로딩: "품목, 재고" 둘 다 무조건 호출
     ========================= */
  useEffect(() => {
    fetchItems();   // 품목은 실패해도 됨
    fetchStock();   // ✅ 재고는 무조건 떠야 함
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================
     itemList가 들어오면 단가/코드 매칭 위해 재고 재조회(옵션)
     ========================= */
  useEffect(() => {
    if (itemList.length > 0) {
      fetchStock();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemList.length]);

  const stockMenu = [{ key: "status", label: "재고현황", path: "/stock" }];

  /* =========================
     모달 열기/닫기
     ========================= */
  const openCreate = async () => {
    await fetchItems();
    setMode("create");
    setSelectedId(null);
    setForm(emptyForm());
    setShow(true);
  };

  const openEdit = async (row: StockItem) => {
    await fetchItems();
    setMode("edit");
    setSelectedId(row.id);
    setForm({
      id: row.id,
      itemId: row.itemId,
      itemCode: row.itemCode,
      itemName: row.itemName,
      stockQty: row.stockQty,
      unitPrice: row.unitPrice,
    });
    setShow(true);
  };

  const closeModal = () => {
    setShow(false);
    setSelectedId(null);
    setMode("create");
    setForm(emptyForm());
  };

  /* =========================
     저장/수정
     ========================= */
  const saveStock = async () => {
    const payload = {
      itemId: form.itemId,
      onHandQty: n(form.stockQty),
      reservedQty: 0,
      safetyQty: 0,
    };

    if (!payload.itemId) return alert("품목을 선택해 주세요 (itemId 필수)");

    if (mode === "create") {
      const exists = stockList.some((s) => s.itemId === payload.itemId);
      if (exists) return alert("이미 재고가 등록된 품목입니다. 수정으로 처리하세요.");
    }

    try {
      if (mode === "edit" && selectedId) await axios.put(`${API_STOCK}/${selectedId}`, payload);
      else await axios.post(API_STOCK, payload);

      await fetchStock();
      closeModal();
    } catch (e: any) {
      console.error("❌ 재고 저장 실패", e?.response?.status, e?.response?.data);
      alert("저장 실패(콘솔확인)");
    }
  };

  /* =========================
     삭제
     ========================= */
  const deleteStock = async () => {
    if (!selectedId) return;
    if (!window.confirm("정말 삭제 하시겠습니까")) return;

    try {
      await axios.delete(`${API_STOCK}/${selectedId}`);
      await fetchStock();
      closeModal();
    } catch (e: any) {
      console.error("❌ 재고 삭제 실패", e?.response?.status, e?.response?.data);
      alert("삭제 실패(콘솔 확인)");
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
                <Lnb menuList={stockMenu} title="재고현황" />
              </Left>

              <Right>
                <TopWrap />

                <JustifyContent>
                  <TableTitle>재고현황</TableTitle>

                  <InputGroup>
                    <Search
                      type="search"
                      placeholder="품목코드/품목명 검색"
                      value={keyword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === "Enter") fetchStock();
                      }}
                    />
                    <WhiteBtn className="mx-2" onClick={fetchStock}>
                      조회
                    </WhiteBtn>
                  </InputGroup>
                </JustifyContent>

                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>품목코드</th>
                      <th>품목명</th>
                      <th className="text-end">재고수량</th>
                      <th className="text-end">단가</th>
                      <th className="text-end">재고금액</th>
                    </tr>
                  </thead>

                  <tbody>
                    {stockList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center">
                          조회된 재고가 없습니다.
                        </td>
                      </tr>
                    )}

                    {stockList.map((i) => (
                      <tr key={i.id} onClick={() => openEdit(i)} style={{ cursor: "pointer" }}>
                        <td>{i.itemCode}</td>
                        <td>{i.itemName}</td>
                        <td className="text-end">{n(i.stockQty).toLocaleString()}</td>
                        <td className="text-end">{n(i.unitPrice).toLocaleString()}</td>
                        <td className="text-end">{n(i.totalAmount).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>

                  {stockList.length > 0 && (
                    <tfoot>
                      <tr style={{ fontWeight: 700 }}>
                        <td colSpan={2} className="text-center">
                          합계
                        </td>
                        <td className="text-end">{totals.totalQty.toLocaleString()}</td>
                        <td></td>
                        <td className="text-end">{totals.totalAmount.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  )}
                </Table>

                <BtnRight>
                  <MainSubmitBtn onClick={openCreate}>재고등록</MainSubmitBtn>
                </BtnRight>
              </Right>
            </Flex>
          </Col>
        </Row>
      </Container>

      <StockModal
        show={show}
        mode={mode}
        form={form}
        itemList={itemList.map((x) => ({
          id: x.id,
          itemCode: x.itemCode,
          itemName: x.itemName,
          unitPrice: x.unitPrice ?? 0,
        }))}
        onClose={closeModal}
        onChange={(patch) => setForm((p) => ({ ...p, ...patch }))}
        onSave={saveStock}
        onDelete={mode === "edit" ? deleteStock : undefined}
      />
    </>
  );
};

export default StockStatus;