import {Table} from "react-bootstrap";

const OrderState = () => {
    return(
        <>
<div className="order-wrap">
<h5 className="my-2 fs-14-400-gray">오더관리진행단계</h5>
<div className="table-wrap">
<Table responsive className="order">
<colgroup>
<col style={{width:"10%"}}/>
<col style={{width:"15%"}}/>
<col style={{width:"70%"}}/>
<col style={{width:"5%"}}/>
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
    <tr>
        <td>00024_202512</td>
        <td>기본유통흐름</td>
        <td></td>
        <td><a href="">보기</a></td>
    </tr>
</tbody>
<tfoot></tfoot>
</Table>
</div>
</div>
        </>
    )
}
export default OrderState;