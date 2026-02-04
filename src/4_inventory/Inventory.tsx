import axios from "axios";
import {Container, Row, Col, Table, Button, Modal, Tab, Tabs, Form,} from "react-bootstrap";
import Top from "../include/Top";
import Header from "../include/Header";
import SideBar from "../include/SideBar";
import {Left, Right, Flex, TopWrap, RoundRect, TableWrap} from "../stylesjs/Content.styles";
import {useState, useEffect} from "react";
import { JustifyContent, W70, W30,} from "../stylesjs/Util.styles";
import { TableTitle, TabTitle } from "../stylesjs/Text.styles";
import { InputGroup, Search, Select, Radio, Label, MidLabel, CheckGroup, Check } from "../stylesjs/Input.styles";
import { WhiteBtn, MainSubmitBtn, BtnRight, SmallBadge } from "../stylesjs/Button.styles";
import Lnb from "../include/Lnb";

type SortDirection = "asc" | "desc";
type SortState = {key: string | null; direction:SortDirection;}
type ColumnDef = { key:string; label:string; }



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
  { key: "imageUrl", label: "이미지" }, // ✅
];

  const [item, setItem] = useState({
    itemCode:"",
    itemName:"",
    itemGroup:"",//
    spec:"",
    barcode:"",//
    specMode:"NAME",
    unit:"",
    process:"",
    itemType:"RAW_MATERIAL",
    isSetYn:"N",
    inPrice:0,
    inVatIncludedYn : "N",
    outPrice:0,
    outVatIncludedYn: "N",
    image:"",//
  });

  const [sort, setSort] = useState<SortState>({ key: null, direction:"asc", });

   //추가:리스트 상태
  const[itemList, setItemList] = useState<any[]>([]); //테이블에 표시할 푸목 리스트

  //목록 조회 함수 추가
// fetchItems 임시 수정
const fetchItems = async () => {
  try {
const res = await axios.get("http://localhost:8888/api/inv/items", {
  params: { page: 0, size: 20, includeStopped: true },
});
    console.log("목록 응답", res.data);
    setItemList(res.data.content.length > 0 ? res.data.content : [ /* 더미 데이터 */ ]);
  } catch (err) {
    console.error("목록 조회 실패", err);
  }
};

// ✅ 컴포넌트 마운트 시 실행
useEffect(() => {
  fetchItems();
}, []);


  const saveItem = async () => {
    try{
      await axios.post(
        "http://localhost:8888/api/inv/items", item
      );
fetchItems();
setShow(false);
      //추가 로컬리스트에도 저장
//setItemList(prev => [...prev, item]);
//추가 : 입력폼 초기화
setItem({
  itemCode:"",
  itemName:"",
  itemGroup:"",//
  spec:"",
  barcode:"",//
  specMode:"NAME",
  unit:"",
  process:"",
  itemType:"RAW_MATERIAL",
  isSetYn:"N",
  inPrice:0,
  inVatIncludedYn:"N",
  outPrice:0,
  outVatIncludedYn:"N",
  image:"",//
});
}catch(err){
console.error("저장 실패", err)
}
};


  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);







  //const [columns] = useState<ColumnDef[]>([...initialColumns]);
 
  


 

  const toggleSort = (key: string) => {
    setSort((prev:any) => {
      if(prev.key === key) {
        return { key, direction:prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction:"asc" };
    })
  }



  const stockMenu = [
  { key: "status", label: "구매조회", path: "/inventory" },
];

  return(
  <>
    <div className="fixed-top">
      <Top/>
      <Header/>
    </div>
    <SideBar/>
    <Container fluid>
      <Row>
        <Col>
          <Flex>
            <Left>
              <Lnb menuList={stockMenu} title="구매조회"/>
            </Left>
            <Right>
              <TopWrap/>
              <JustifyContent>
                <TableTitle>품목등록리스트</TableTitle> 
                <InputGroup>
                  <WhiteBtn className="mx-2">사용중단포함</WhiteBtn>
                  <Flex>
                  <Search type="search" placeholder="검색"/>
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
                      return(
                        <th key={c.key}>
                          <div>
                            <span>{c.label}</span>
                            <Button size="sm" variant="light" onClick={()=> toggleSort(c.key)} className="mx-2">
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
{itemList.map((it, idx) => {
  console.log("row", it);

  return (
    <tr key={idx}>
      {columns.map(c => (
        <td key={c.key}>
          {it[c.key] ?? "-"}
        </td>
      ))}
    </tr>
  );
})}
                </tbody>
                <tfoot>
                  <tr>
                    {columns.map((c) => {
                      const isActive = sort.key === c.key;
                      const dir = sort.direction;
                      return(
                        <th key={c.key}>
                          <div>
                            <span>{c.label}</span>
                            <Button size="sm" variant="light" onClick={()=> toggleSort(c.key)} className="mx-2">
                              {!isActive && "정렬"}
                              {isActive && dir === "asc" && "▲"}
                              {isActive && dir === "desc" && "▼"}
                            </Button>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </tfoot>
              </Table> 
              <BtnRight>
                <MainSubmitBtn onClick={handleShow}>신규(F2)</MainSubmitBtn>
              </BtnRight> 
              </TableWrap>         
            </Right>
          </Flex>
        </Col>
      </Row>
    </Container>

    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>품목등록</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <TabTitle>품목등록</TabTitle>
        <Tabs defaultActiveKey="basic" justify>
          <Tab eventKey="basic" title="기본">
            <RoundRect>
              {/* 품목코드 */}
              <InputGroup>
                <W30><MidLabel>품목코드</MidLabel></W30>
                <W70>
                  <Form.Control 
                    type="text" 
                    placeholder="예시 Z00021" 
                    value={item.itemCode}  
                    onChange={e => setItem({...item, itemCode: e.target.value})}  
                  />
                </W70>
              </InputGroup>

              {/* 품목명 */}
              <InputGroup className="my-3">
                <W30><MidLabel>품목명</MidLabel></W30>
                <W70>
                  <Form.Control 
                    type="text" 
                    placeholder="품목명" 
                    value={item.itemName}
                    onChange={e => setItem({...item, itemName: e.target.value})}  
                  />
                </W70>
              </InputGroup>

              {/* 규격 */}
              <Flex>
                <W30><MidLabel>규격</MidLabel></W30>
                <W70>
                  <Flex className="my-2">
                    <Radio type="radio" checked={item.specMode === "NAME"} onChange={() => setItem({...item, specMode:"NAME"})}/>
                    <Label className="mx-2">규격명</Label>
                    <Radio type="radio" checked={item.specMode === "GROUP"} onChange={() => setItem({...item, specMode:"GROUP"})}/>
                    <Label className="mx-2">규격그룹</Label>
                    <Radio type="radio" checked={item.specMode === "CALC"} onChange={() => setItem({...item, specMode:"CALC"})}/>
                    <Label className="mx-2">규격계산</Label>
                    <Radio type="radio" checked={item.specMode === "CALC_GROUP"} onChange={() => setItem({...item, specMode:"CALC_GROUP"})}/>
                    <Label className="mx-2">규격계산그룹</Label>
                  </Flex>
                  <Form.Control type="text" placeholder="단위"/>
                </W70>
              </Flex>

              {/* 단위 */}
              <InputGroup className="my-3">
                <W30><MidLabel>단위</MidLabel></W30>
                <W70>
                  <Form.Control 
                    type="text" 
                    placeholder="단위" 
                    className="w-75"
                    value={item.unit}
                    onChange={e => setItem({...item, unit: e.target.value })}
                  />
                </W70>
              </InputGroup>

              {/* 품목구분 */}
              <Flex>
                <W30><MidLabel>품목구분</MidLabel></W30>
                <W70>
                  <Flex className="my-2">
                    {[
                      ["RAW_MATERIAL","원재료"],   
                      ["SUB_MATERIAL","부재료"],
                      ["PRODUCT","제품"],
                      ["SEMI_PRODUCT","반제품"],
                      ["GOODS","상품"],
                      ["INTANGIBLE","무형상품"],
                    ].map(([v,l]) => (
                      <span key={v}>
                        <Radio type="radio" checked={item.itemType === v} onChange={() => setItem({...item, itemType: v})}/>
                        <Label className="mx-2">{l}</Label>
                      </span>
                    ))}
                  </Flex>

                  <Flex className="my-2">
                    <SmallBadge className="mx-5">세트여부</SmallBadge>
                    <Radio type="radio" checked={item.isSetYn ==="Y"} onChange={() => setItem({...item, isSetYn: "Y"})}/>
                    <Label className="mx-2">사용</Label>
                    <Radio type="radio" checked={item.isSetYn ==="N"} onChange={() => setItem({...item, isSetYn: "N"})}/>
                    <Label className="mx-2">사용안함</Label>
                  </Flex>     
                </W70>
              </Flex>

              {/* 생산공정 */}
              <InputGroup className="my-3">
                <W30><MidLabel>생산공정</MidLabel></W30>
                <W70>
                  <Form.Control type="text" placeholder="생산공정" value={item.process} onChange={e => setItem({...item, process:e.target.value})}/>
                </W70>
              </InputGroup>

              {/* 입고단가 */}
              <InputGroup>
                <W30><MidLabel>입고단가</MidLabel></W30>
                <W70>
                  <Flex>
                    <Form.Control type="number" value={item.inPrice} onChange={e => setItem({...item, inPrice: Number(e.target.value)})}/>
                    <CheckGroup>
                      <Check type="checkbox" className="mx-2" checked={item.inVatIncludedYn === "Y"} onChange={(e:any) => setItem({...item, inVatIncludedYn: e.target.checked ? "Y":"N"})}/>
                      <Label>VAT 포함</Label>
                    </CheckGroup>
                  </Flex>
                </W70>
              </InputGroup>

              {/* 출고단가 */}
              <InputGroup className="my-3">
                <W30><MidLabel>출고단가</MidLabel></W30>
                <W70>
                  <Flex>
                    <Form.Control type="number" value={item.outPrice} onChange={e => setItem({...item, outPrice: Number(e.target.value)})} placeholder="입고단가"/>            
                    <CheckGroup>
                      <Check type="checkbox" className="mx-2" checked={item.outVatIncludedYn === "Y"} onChange={(e:any) => setItem({...item, outVatIncludedYn: e.target.checked ? "Y" :"N"})}/>
                      <Label>VAT 포함</Label>
                    </CheckGroup>
                  </Flex>
                </W70>
              </InputGroup>

            </RoundRect>
          </Tab>

          <Tab eventKey="" title="품목정보"></Tab>
          <Tab eventKey="" title="수량"></Tab>
          <Tab eventKey="" title="단가"></Tab>
          <Tab eventKey="" title="원가"></Tab>
          <Tab eventKey="" title="부가정보"></Tab>
          <Tab eventKey="" title="관리대상"></Tab>
        </Tabs>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Close</Button>
        <Button variant="primary" onClick={saveItem}>Save Change</Button>
      </Modal.Footer>
    </Modal>
  </>
  );
}

export default Inventory;
