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
import { WhiteBtn } from "../stylesjs/Button.styles";
import Lnb from "../include/Lnb";

/* =========================
   타입 정의
========================= */
type StockMovementItem = {
  id: number;
  itemCode: string;
  itemName: string;
  startQty: number; // 기초재고
  inQty: number; // 입고
  outQty: number; // 출고
  endQty: number; // 기말재고
};

/* =========================
   API 설정
========================= */
const API_BASE = "http://localhost:8888/api/stock/movement";

// ✅ 숫자 안전 변환
const n = (v: any) => Number(v ?? 0) || 0;

/* =========================
   컴포넌트
========================= */
export default function StockMovement() {
  const [keyword, setKeyword] = useState("");
  const [stockList, setStockList] = useState<StockMovementItem[]>([]);

  /* ===== 합계 계산 ===== */
  const totals = useMemo(() => {
    const startQty = stockList.reduce((s, i) => s + n(i.startQty), 0);
    const inQty = stockList.reduce((s, i) => s + n(i.inQty), 0);
    const outQty = stockList.reduce((s, i) => s + n(i.outQty), 0);
    const endQty = stockList.reduce((s, i) => s + n(i.endQty), 0);
    return { startQty, inQty, outQty, endQty };
  }, [stockList]);

  /* ===== 데이터 조회 ===== */
  const fetchStockMovement = async () => {
    try {
      const res = await axios.get(API_BASE, {
        params: { q: keyword?.trim() ? keyword.trim() : undefined, page: 0, size: 2000 },
      });

      // ✅ Page/List 모두 대응
      const rows = Array.isArray(res.data) ? res.data : (res.data?.content ?? []);

      console.log("✅ movement raw rows sample:", rows?.[0]);

      const list: StockMovementItem[] = rows.map((i: any) => {
        // ✅ 필드명 후보 처리(서버 응답에 맞게 자동 대응)
        const startQty = n(i.startQty ?? i.beginQty ?? i.openingQty ?? i.start_qty ?? i.begin_qty);
        const inQty = n(i.inQty ?? i.inboundQty ?? i.in_qty ?? i.inbound_qty);
        const outQty = n(i.outQty ?? i.outboundQty ?? i.out_qty ?? i.outbound_qty);

        return {
          id: n(i.id),
          itemCode: String(i.itemCode ?? i.code ?? i.item_code ?? ""),
          itemName: String(i.itemName ?? i.name ?? i.item_name ?? ""),
          startQty,
          inQty,
          outQty,
          endQty: startQty + inQty - outQty,
        };
      });

      console.log("✅ movement normalized sample:", list?.[0]);
      setStockList(list);
    } catch (e: any) {
      console.error("재고변동 조회 실패", e);
      alert(`재고변동 조회 실패: ${e?.response?.status ?? ""} (콘솔 확인)`);
      setStockList([]);
    }
  };

  useEffect(() => {
    fetchStockMovement();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stockMenu = [{ key: "status", label: "재고변동표", path: "/stockmove" }];

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
                <Lnb menuList={stockMenu} title="재고변동표" />
              </Left>
              <Right>
                <TopWrap />

                <JustifyContent>
                  <TableTitle>재고변동표</TableTitle>
                  <InputGroup>
                    <Search
                      type="search"
                      placeholder="품목코드/품목명 검색"
                      value={keyword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === "Enter") fetchStockMovement();
                      }}
                    />
                    <WhiteBtn className="mx-2" onClick={fetchStockMovement}>
                      조회
                    </WhiteBtn>
                  </InputGroup>
                </JustifyContent>

                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>품목코드</th>
                      <th>품목명</th>
                      <th className="text-end">기초재고</th>
                      <th className="text-end">입고</th>
                      <th className="text-end">출고</th>
                      <th className="text-end">기말재고</th>
                    </tr>
                  </thead>

                  <tbody>
                    {stockList.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center">
                          조회된 데이터가 없습니다.
                        </td>
                      </tr>
                    )}

                    {stockList.map((i) => (
                      <tr key={i.id}>
                        <td>{i.itemCode}</td>
                        <td>{i.itemName}</td>
                        <td className="text-end">{n(i.startQty).toLocaleString()}</td>
                        <td className="text-end">{n(i.inQty).toLocaleString()}</td>
                        <td className="text-end">{n(i.outQty).toLocaleString()}</td>
                        <td className="text-end">{n(i.endQty).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>

                  {stockList.length > 0 && (
                    <tfoot>
                      <tr style={{ fontWeight: 700 }}>
                        <td colSpan={2} className="text-center">
                          합계
                        </td>
                        <td className="text-end">{totals.startQty.toLocaleString()}</td>
                        <td className="text-end">{totals.inQty.toLocaleString()}</td>
                        <td className="text-end">{totals.outQty.toLocaleString()}</td>
                        <td className="text-end">{totals.endQty.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  )}
                </Table>
              </Right>
            </Flex>
          </Col>
        </Row>
      </Container>
    </>
  );
}