import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { Container, Row, Col, Table, Form, Button } from "react-bootstrap";
import Top from "../include/Top";
import Header from "../include/Header";
import SideBar from "../include/SideBar";
import { Left, Right, Flex, TopWrap } from "../stylesjs/Content.styles";
import { JustifyContent, W30, W70 } from "../stylesjs/Util.styles";
import { TableTitle } from "../stylesjs/Text.styles";
import { InputGroup, Search, MidLabel } from "../stylesjs/Input.styles";
import { WhiteBtn, MainSubmitBtn } from "../stylesjs/Button.styles";
import Lnb from "../include/Lnb";

/* =========================
   타입 정의
========================= */
type StockMovementItem = {
  id: number;
  itemCode: string;
  itemName: string;
  startQty: number;    // 기초재고
  inQty: number;       // 입고
  outQty: number;      // 출고
  endQty: number;      // 기말재고
};

/* =========================
   API 설정
========================= */
const API_BASE = "http://localhost:8888/api/stock/movement";

/* =========================
   컴포넌트
========================= */
const StockMovement = () => {
  const [keyword, setKeyword] = useState("");
  const [stockList, setStockList] = useState<StockMovementItem[]>([]);

  /* ===== 합계 계산 ===== */
  const totals = useMemo(() => {
    const startQty = stockList.reduce((s, i) => s + i.startQty, 0);
    const inQty = stockList.reduce((s, i) => s + i.inQty, 0);
    const outQty = stockList.reduce((s, i) => s + i.outQty, 0);
    const endQty = stockList.reduce((s, i) => s + i.endQty, 0);
    return { startQty, inQty, outQty, endQty };
  }, [stockList]);

  /* ===== 데이터 조회 ===== */
  const fetchStockMovement = async () => {
    try {
      const res = await axios.get(API_BASE, {
        params: { q: keyword || undefined },
      });
      const list: StockMovementItem[] = res.data?.map((i: any) => ({
        id: i.id,
        itemCode: i.itemCode,
        itemName: i.itemName,
        startQty: i.startQty,
        inQty: i.inQty,
        outQty: i.outQty,
        endQty: i.startQty + i.inQty - i.outQty, // 기말재고 계산
      })) ?? [];
      setStockList(list);
    } catch (e) {
      console.error("재고변동 조회 실패", e);
    }
  };

  useEffect(() => {
    fetchStockMovement();
  }, []);
 const stockMenu = [
  { key: "status", label: "재고변동표", path: "/stockmove" },
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
<Lnb menuList={stockMenu} title="재고변동표"/>       
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
                        <td className="text-end">{i.startQty}</td>
                        <td className="text-end">{i.inQty}</td>
                        <td className="text-end">{i.outQty}</td>
                        <td className="text-end">{i.endQty}</td>
                      </tr>
                    ))}
                  </tbody>
                  {stockList.length > 0 && (
                    <tfoot>
                      <tr style={{ fontWeight: 700 }}>
                        <td colSpan={2} className="text-center">합계</td>
                        <td className="text-end">{totals.startQty}</td>
                        <td className="text-end">{totals.inQty}</td>
                        <td className="text-end">{totals.outQty}</td>
                        <td className="text-end">{totals.endQty}</td>
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
};

export default StockMovement;
