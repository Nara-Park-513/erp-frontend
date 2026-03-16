import axios from "axios";
import { Container, Row, Col, Table, Button, Modal } from "react-bootstrap";
import Top from "../include/Top";
import Header from "../include/Header";
// import SideBar from "../include/SideBar";
import { Left, Right, Flex, TopWrap } from "../stylesjs/Content.styles";
import { useState, useEffect, useMemo } from "react";
import { TableTitle } from "../stylesjs/Text.styles";
import { InputGroup, Search, Select } from "../stylesjs/Input.styles";
import { BtnRight } from "../stylesjs/Button.styles";
// import Lnb from "../include/Lnb";

import InventoryModal, { ItemForm } from "../component/inventory/InventoryModal";
import InventoryDetailModal, {
  InventoryDetailForm,
} from "../component/inventory/InventoryDetailModal";
import "../Auth.css";

type SortDirection = "asc" | "desc";
type SortState = { key: string | null; direction: SortDirection };
type ColumnDef = { key: string; label: string };

const API_ITEMS = "http://localhost:8888/api/inv/items";

const Inventory = () => {
  const [show, setShow] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savingDetail, setSavingDetail] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryDetailForm | null>(null);

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error" | "warning">("warning");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const openAlertModal = (
    type: "success" | "error" | "warning",
    title: string,
    message: string
  ) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlertModal(true);
  };

  const closeAlertModal = () => {
    setShowAlertModal(false);
  };

  const columns: ColumnDef[] = [
    { key: "itemCode", label: "품목 코드" },
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
    useYn: true,
  });

  const [item, setItem] = useState<ItemForm>(emptyItem());
  const [sort, setSort] = useState<SortState>({ key: null, direction: "asc" });
  const [itemList, setItemList] = useState<any[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");

  const fetchItems = async () => {
    try {
      const res = await axios.get(API_ITEMS, {
        params: {
          page: 0,
          size: 2000,
          includeStopped: true,
          sortKey: "id",
          dir: "desc",
        },
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

  const toItemRequest = (src: ItemForm | InventoryDetailForm) => ({
    itemCode: src.itemCode,
    itemName: src.itemName,
    itemGroup: src.itemGroup,
    spec: src.spec,
    specMode: src.specMode,
    unit: src.unit,
    barcode: src.barcode,
    process: src.process,
    itemType: src.itemType,
    set: src.isSetYn === "Y",
    inPrice: src.inPrice,
    inVatIncluded: src.inVatIncludedYn === "Y",
    outPrice: src.outPrice,
    outVatIncluded: src.outVatIncludedYn === "Y",
    imageUrl: src.image,
    useYn: src.useYn,
    extraFields: {},
  });

  const saveItem = async () => {
    try {
      const payload = toItemRequest({
        ...item,
        useYn: true,
      });

      await axios.post(API_ITEMS, payload);

      await fetchItems();
      setShow(false);
      setItem(emptyItem());
    } catch (err: any) {
      console.error("저장 실패", err);
      console.error("❌ 응답:", err?.response?.data);
      openAlertModal("error", "저장 실패", "저장에 실패했습니다. 콘솔을 확인해 주세요.");
    }
  };

  const openDetailModal = (row: any) => {
    setSelectedItem({
      id: row?.id,
      itemCode: row?.itemCode ?? "",
      itemName: row?.itemName ?? "",
      itemGroup: row?.itemGroup ?? "",
      spec: row?.spec ?? "",
      barcode: row?.barcode ?? "",
      specMode: row?.specMode ?? "NAME",
      unit: row?.unit ?? "",
      process: row?.process ?? "",
      itemType: row?.itemType ?? "RAW_MATERIAL",
      isSetYn: row?.isSet ? "Y" : "N",
      inPrice: Number(row?.inPrice ?? 0),
      inVatIncludedYn: row?.inVatIncluded ? "Y" : "N",
      outPrice: Number(row?.outPrice ?? 0),
      outVatIncludedYn: row?.outVatIncluded ? "Y" : "N",
      image: row?.imageUrl ?? "",
      useYn: !!row?.useYn,
    });
    setShowDetail(true);
  };

  const closeDetailModal = () => {
    setShowDetail(false);
    setSelectedItem(null);
  };

  const handleUpdate = async () => {
    if (!selectedItem?.id) {
      openAlertModal("warning", "수정 불가", "수정할 품목 정보가 없습니다.");
      return;
    }

    try {
      setSavingDetail(true);

      const payload = toItemRequest(selectedItem);

      await axios.put(`${API_ITEMS}/${selectedItem.id}`, payload);

      await fetchItems();
      closeDetailModal();
    } catch (err: any) {
      console.error("수정 실패", err);
      console.error("❌ 응답:", err?.response?.data);
      openAlertModal("error", "수정 실패", "수정에 실패했습니다. 콘솔을 확인해 주세요.");
    } finally {
      setSavingDetail(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem?.id) {
      openAlertModal("warning", "삭제 불가", "삭제할 품목 정보가 없습니다.");
      return;
    }

    try {
      setDeleting(true);
      await axios.delete(`${API_ITEMS}/${selectedItem.id}`);
      await fetchItems();
      closeDetailModal();
    } catch (err: any) {
      console.error("삭제 실패", err);
      console.error("❌ 응답:", err?.response?.data);
      openAlertModal("error", "삭제 실패", "삭제에 실패했습니다. 콘솔을 확인해 주세요.");
    } finally {
      setDeleting(false);
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

  const filteredAndSortedList = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    const filtered = itemList.filter((it) => {
      if (!keyword) return true;

      return columns.some((col) => {
        const value = String(it?.[col.key] ?? "").toLowerCase();
        return value.includes(keyword);
      });
    });

    if (!sort.key) return filtered;

    return [...filtered].sort((a, b) => {
      const aValue = a?.[sort.key!];
      const bValue = b?.[sort.key!];

      const aNum = Number(aValue);
      const bNum = Number(bValue);

      if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
        return sort.direction === "asc" ? aNum - bNum : bNum - aNum;
      }

      const aStr = String(aValue ?? "").toLowerCase();
      const bStr = String(bValue ?? "").toLowerCase();

      if (aStr < bStr) return sort.direction === "asc" ? -1 : 1;
      if (aStr > bStr) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [itemList, sort, searchKeyword]);

  return (
    <>
      <div className="fixed-top">
        <Header />
        <Top />
      </div>

      <div
        style={{
          backgroundColor: "#ffffff",
          minHeight: "100vh",
          paddingTop: "120px",
        }}
      >
        <Container fluid>
          <Row>
            <Col>
              <Flex>
                <Left>{/* <Lnb menuList={stockMenu} title="구매조회" /> */}</Left>

                <Right style={{ marginTop: "-20px" }}>
                  <TopWrap />

                  <div
                    style={{
                      marginBottom: "14px",
                      display: "flex",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ lineHeight: 1.2 }}>
                      <TableTitle
                        style={{
                          margin: 0,
                          padding: 0,
                          color: "#1f2937",
                          fontWeight: 700,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        품목등록리스트
                      </TableTitle>

                      <div
                        style={{
                          marginTop: "6px",
                          fontSize: "14px",
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
                      backgroundColor: "#ffffff",
                      border: "1px solid #e8ecf4",
                      borderRadius: "16px",
                      padding: "16px",
                      boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
                      marginBottom: "14px",
                    }}
                  >
                    <InputGroup
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          type="button"
                          onClick={fetchItems}
                          style={{
                            backgroundColor: "#ffffff",
                            color: "#475569",
                            border: "1px solid #dbe2ea",
                            borderRadius: "10px",
                            padding: "10px 14px",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          사용중단포함
                        </button>

                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <Search
                            type="search"
                            placeholder="검색"
                            value={searchKeyword}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setSearchKeyword(e.target.value)
                            }
                            style={{
                              minWidth: "220px",
                              borderRadius: "10px",
                              border: "1px solid #dbe2ea",
                              padding: "10px 12px",
                            }}
                          />
                          <button
                            type="button"
                            style={{
                              backgroundColor: "#6b7280",
                              color: "#ffffff",
                              border: "1px solid #6b7280",
                              borderRadius: "10px",
                              padding: "10px 14px",
                              fontSize: "14px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Search(F3)
                          </button>
                        </div>
                      </div>

                      <Select
                        className="mx-2"
                        style={{
                          minWidth: "180px",
                          borderRadius: "10px",
                          border: "1px solid #dbe2ea",
                          padding: "10px 12px",
                        }}
                      >
                        <option>품목계정추가</option>
                        <option>다공정품목설정</option>
                        <option>다규격품목설정</option>
                        <option>양식설정</option>
                        <option>조건양식설정</option>
                        <option>검색항목설정</option>
                        <option>기능설정</option>
                      </Select>
                    </InputGroup>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e8ecf4",
                      borderRadius: "16px",
                      overflow: "hidden",
                      boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
                    }}
                  >
                    <Table responsive className="mb-0 align-middle">
                      <thead>
                        <tr
                          style={{
                            background: "linear-gradient(180deg, #fbfcfe 0%, #f4f7fb 100%)",
                          }}
                        >
                          {columns.map((c) => {
                            const isActive = sort.key === c.key;
                            const dir = sort.direction;

                            return (
                              <th
                                key={c.key}
                                style={{
                                  padding: "15px 18px",
                                  fontSize: "14px",
                                  fontWeight: 700,
                                  color: "#475467",
                                  borderBottom: "1px solid #e8ecf4",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                  }}
                                >
                                  <span>{c.label}</span>
                                  <Button
                                    size="sm"
                                    variant="light"
                                    onClick={() => toggleSort(c.key)}
                                    style={{
                                      fontSize: "12px",
                                      borderRadius: "8px",
                                      border: "1px solid #dbe2ea",
                                      backgroundColor: isActive ? "#eef4fb" : "#ffffff",
                                      color: "#475569",
                                      padding: "2px 8px",
                                    }}
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
                        {filteredAndSortedList.length === 0 ? (
                          <tr>
                            <td
                              colSpan={columns.length}
                              style={{
                                textAlign: "center",
                                padding: "44px 16px",
                                color: "#98a2b3",
                                fontSize: "14px",
                              }}
                            >
                              등록된 품목이 없습니다.
                            </td>
                          </tr>
                        ) : (
                          filteredAndSortedList.map((it, idx) => (
                            <tr
                              key={it?.id ?? idx}
                              style={{
                                backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fcfdff",
                              }}
                            >
                              {columns.map((c) => (
                                <td
                                  key={c.key}
                                  style={{
                                    padding: "14px 18px",
                                    verticalAlign: "middle",
                                    color: "#374151",
                                    borderBottom: "1px solid #eef2f7",
                                  }}
                                >
                                  {c.key === "itemCode" || c.key === "itemName" ? (
                                    <button
                                      type="button"
                                      onClick={() => openDetailModal(it)}
                                      style={{
                                        background: "none",
                                        border: "none",
                                        padding: 0,
                                        margin: 0,
                                        color: c.key === "itemCode" ? "#111827" : "#374151",
                                        fontWeight: c.key === "itemCode" ? 600 : 500,
                                        cursor: "pointer",
                                        textDecoration: "none",
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.color = "#111827";
                                        e.currentTarget.style.textDecoration = "underline";
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.color =
                                          c.key === "itemCode" ? "#111827" : "#374151";
                                        e.currentTarget.style.textDecoration = "none";
                                      }}
                                    >
                                      {it?.[c.key] ?? "-"}
                                    </button>
                                  ) : (
                                    <>{it?.[c.key] ?? "-"}</>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>

                  <BtnRight style={{ marginTop: "14px" }}>
                    <button
                      type="button"
                      onClick={() => setShow(true)}
                      style={{
                        backgroundColor: "#6b7280",
                        color: "#ffffff",
                        border: "1px solid #6b7280",
                        borderRadius: "10px",
                        padding: "10px 18px",
                        fontSize: "14px",
                        fontWeight: 600,
                        boxShadow: "0 4px 10px rgba(107, 114, 128, 0.16)",
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#5b6472";
                        e.currentTarget.style.borderColor = "#5b6472";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#6b7280";
                        e.currentTarget.style.borderColor = "#6b7280";
                      }}
                    >
                      신규(F2)
                    </button>
                  </BtnRight>
                </Right>
              </Flex>
            </Col>
          </Row>
        </Container>
      </div>

      <InventoryModal
        show={show}
        onClose={() => setShow(false)}
        onSave={saveItem}
        item={item}
        setItem={setItem}
      />

      <InventoryDetailModal
        show={showDetail}
        onClose={closeDetailModal}
        onDelete={handleDelete}
        onSave={handleUpdate}
        item={selectedItem}
        setItem={setSelectedItem}
        saving={savingDetail}
        deleting={deleting}
      />

      <Modal
        show={showAlertModal}
        onHide={() => {}}
        centered={false}
        backdrop={true}
        keyboard={false}
        dialogClassName="top-alert-modal"
        contentClassName="top-alert-content"
      >
        <Modal.Body className={`top-alert-body ${alertType}`}>
          <div className="top-alert-left">
            <div className={`top-alert-icon ${alertType}`}>
              {alertType === "success" ? "✓" : alertType === "error" ? "✕" : "!"}
            </div>
          </div>

          <div className="top-alert-center">
            <h3 className="top-alert-title">{alertTitle}</h3>
            <p className="top-alert-text">{alertMessage}</p>
          </div>

          <div className="top-alert-right">
            <button
              type="button"
              onClick={closeAlertModal}
              className={`top-alert-button ${alertType}`}
            >
              확인
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Inventory;