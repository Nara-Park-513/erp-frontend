import axios from "axios";
import { useEffect, useMemo, useState } from "react";
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
type StockItem = {
  id: number;
  itemCode: string;
  itemName: string;
  stockQty: number;
  unitPrice: number;
  totalAmount: number;
};

/* =========================
   API 설정
========================= */
const API_BASE = "http://localhost:8888/api/stock";

/* =========================
   컴포넌트
========================= */
const StockStatus = () => {
  const [keyword, setKeyword] = useState(""); // 검색
  const [stockList, setStockList] = useState<StockItem[]>([]);

  /* ===== 합계 계산 ===== */
  const totals = useMemo(() => {
    const totalQty = stockList.reduce((s, i) => s + i.stockQty, 0);
    const totalAmount = stockList.reduce((s, i) => s + i.totalAmount, 0);
    return { totalQty, totalAmount };
  }, [stockList]);

  /* ===== 재고 조회 ===== */
  const fetchStock = async () => {
    try {
      const res = await axios.get(API_BASE, {
        params: { q: keyword || undefined },
      });
      const list: StockItem[] = res.data?.map((i: any) => ({
        id: i.id,
        itemCode: i.itemCode,
        itemName: i.itemName,
        stockQty: i.stockQty,
        unitPrice: i.unitPrice,
        totalAmount: i.stockQty * i.unitPrice,
      })) ?? [];
      setStockList(list);
    } catch (e) {
      console.error("재고조회 실패", e);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const stockMenu = [
  { key: "status", label: "재고현황", path: "/stock" },
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
<Lnb menuList={stockMenu} title="재고현황"/>                
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
                      <tr key={i.id}>
                        <td>{i.itemCode}</td>
                        <td>{i.itemName}</td>
                        <td className="text-end">{i.stockQty}</td>
                        <td className="text-end">{i.unitPrice.toLocaleString()}</td>
                        <td className="text-end">{i.totalAmount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  {stockList.length > 0 && (
                    <tfoot>
                      <tr style={{ fontWeight: 700 }}>
                        <td colSpan={2} className="text-center">
                          합계
                        </td>
                        <td className="text-end">{totals.totalQty}</td>
                        <td></td>
                        <td className="text-end">{totals.totalAmount.toLocaleString()}</td>
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

export default StockStatus;
