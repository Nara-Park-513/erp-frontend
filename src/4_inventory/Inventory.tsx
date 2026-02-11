import axios from "axios";
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import Top from "../include/Top";
import Header from "../include/Header";
import SideBar from "../include/SideBar";
import { Left, Right, Flex, TopWrap, TableWrap } from "../stylesjs/Content.styles";
import { useState, useEffect } from "react";
import { JustifyContent } from "../stylesjs/Util.styles";
import { TableTitle } from "../stylesjs/Text.styles";
import { InputGroup, Search, Select } from "../stylesjs/Input.styles";
import { WhiteBtn, MainSubmitBtn, BtnRight } from "../stylesjs/Button.styles";
import Lnb from "../include/Lnb";

import InventoryModal, { ItemForm } from "../component/inventory/InventoryModal";

type SortDirection = "asc" | "desc";
type SortState = { key: string | null; direction: SortDirection };
type ColumnDef = { key: string; label: string };

const API_ITEMS = "http://localhost:8888/api/inv/items";

const Inventory = () => {
  const [show, setShow] = useState(false);

  const columns: ColumnDef[] = [
    { key: "itemCode", label: "품목코드" },
    { key: "itemName", label: "품목명" },
    { key: "itemGroup", label: "품목그룹" },
    { key: "spec", label: "규격" },
    { key: "barcode", label: "바코드" },
    { key: "inPrice", label: "입고단가" },
    { key: "outPrice", label: "출고단가" },
    { key: "itemType", label: "품목구분" },
    { key: "imageUrl", label: "이미지" },
  ];

  const emptyItem = (): ItemForm => ({
    itemCode: "",
    itemName: "",
    itemGroup: "",
    spec: "",
    barcode: "",
    specMode: "NAME",
    unit: "",
    process: "",
    itemType: "RAW_MATERIAL",
    isSetYn: "N",
    inPrice: 0,
    inVatIncludedYn: "N",
    outPrice: 0,
    outVatIncludedYn: "N",
    image: "",
    useYn: true, // ✅ 기본 사용
  });

  const [item, setItem] = useState<ItemForm>(emptyItem());
  const [sort, setSort] = useState<SortState>({ key: null, direction: "asc" });

  // 리스트 상태
  const [itemList, setItemList] = useState<any[]>([]);

  // 목록 조회
  const fetchItems = async () => {
    try {
      const res = await axios.get(API_ITEMS, {
        params: { page: 0, size: 2000, includeStopped: true, sortKey: "id", dir: "desc" },
      });

      const rows = Array.isArray(res.data) ? res.data : res.data?.content ?? [];
      console.log("✅ 목록 응답 rows =", rows);

      setItemList(rows);
    } catch (err) {
      console.error("목록 조회 실패", err);
      setItemList([]);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const saveItem = async () => {
    try {
      const payload = { ...item, useYn: true }; // ✅ useYn 강제 포함
      await axios.post(API_ITEMS, payload);

      await fetchItems();
      setShow(false);
      setItem(emptyItem());
    } catch (err: any) {
      console.error("저장 실패", err);
      console.error("❌ 응답:", err?.response?.data);
      alert("저장 실패(콘솔 확인)");
    }
  };

  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const stockMenu = [{ key: "status", label: "구매조회", path: "/inventory" }];

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
                <Lnb menuList={stockMenu} title="구매조회" />
              </Left>

              <Right>
                <TopWrap />
                <JustifyContent>
                  <TableTitle>품목등록리스트</TableTitle>
                  <InputGroup>
                    <WhiteBtn className="mx-2" onClick={fetchItems}>
                      사용중단포함
                    </WhiteBtn>

                    <Flex>
                      <Search type="search" placeholder="검색" />
                      <MainSubmitBtn className="mx-2">Search(F3)</MainSubmitBtn>
                    </Flex>

                    <Select className="mx-2">
                      <option>품목계정추가</option>
                      <option>다공정품목설정</option>
                      <option>다규격품목설정</option>
                      <option>양식설정</option>
                      <option>조건양식설정</option>
                      <option>검색항목설정</option>
                      <option>기능설정</option>
                    </Select>
                  </InputGroup>
                </JustifyContent>

                <TableWrap>
                  <Table responsive>
                    <thead>
                      <tr>
                        {columns.map((c) => {
                          const isActive = sort.key === c.key;
                          const dir = sort.direction;
                          return (
                            <th key={c.key}>
                              <div>
                                <span>{c.label}</span>
                                <Button
                                  size="sm"
                                  variant="light"
                                  onClick={() => toggleSort(c.key)}
                                  className="mx-2"
                                >
                                  {!isActive && "정렬"}
                                  {isActive && dir === "asc" && "▲"}
                                  {isActive && dir === "desc" && "▼"}
                                </Button>
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>

                    <tbody>
                      {itemList.length === 0 && (
                        <tr>
                          <td colSpan={columns.length} className="text-center">
                            등록된 품목이 없습니다
                          </td>
                        </tr>
                      )}

                      {itemList.map((it, idx) => (
                        <tr key={it?.id ?? idx}>
                          {columns.map((c) => (
                            <td key={c.key}>{it?.[c.key] ?? "-"}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  <BtnRight>
                    <MainSubmitBtn onClick={() => setShow(true)}>신규(F2)</MainSubmitBtn>
                  </BtnRight>
                </TableWrap>
              </Right>
            </Flex>
          </Col>
        </Row>
      </Container>

      {/* ✅ 분리된 모달 */}
      <InventoryModal
        show={show}
        onClose={() => setShow(false)}
        onSave={saveItem}
        item={item}
        setItem={setItem}
      />
    </>
  );
};

export default Inventory;