import {Table} from "react-bootstrap";

const Pay = () => {
    return(
        <>
<div className="pay mt-5">
<div className="d-flex justify-content-between align-items-center">
<h4 className="fs-16-600-black">공지사항</h4>
<div className=""></div>
</div>
<h5 className="my-2 fs-14-400-gray ">내 기안문서</h5>
<div className="table-wrap">
<Table variant="table-bordered " className="draft" responsive>
<thead className="">
    <tr className="text-center">
        <th>기안일자</th><th>제목</th><th>기안자</th><th>결재자</th><th>진행상태</th><th>결재</th><th>기안서복사</th>
    </tr>
</thead>
<tbody>
    <tr className="text-center">
        <td>2025/12/04-1</td>
        <td>인사팀 박나라 대리 경조금 신청서</td>
        <td>guest</td>
        <td>대표이사</td>
        <td>진행중</td>
        <td>보기</td>
        <td>복사</td>
    </tr>
        <tr className="text-center">
        <td>2025/12/04-1</td>
        <td>인사팀 박나라 대리 경조금 신청서</td>
        <td>guest</td>
        <td>대표이사</td>
        <td>진행중</td>
        <td>보기</td>
        <td>복사</td>
    </tr>
        <tr className="text-center">
        <td>2025/12/04-1</td>
        <td>인사팀 박나라 대리 경조금 신청서</td>
        <td>guest</td>
        <td>대표이사</td>
        <td>진행중</td>
        <td>보기</td>
        <td>복사</td>
    </tr>
        <tr className="text-center">
        <td>2025/12/04-1</td>
        <td>인사팀 박나라 대리 경조금 신청서</td>
        <td>guest</td>
        <td>대표이사</td>
        <td>진행중</td>
        <td>보기</td>
        <td>복사</td>
    </tr>
        <tr className="text-center">
        <td>2025/12/04-1</td>
        <td>인사팀 박나라 대리 경조금 신청서</td>
        <td>guest</td>
        <td>대표이사</td>
        <td>진행중</td>
        <td>보기</td>
        <td>복사</td>
    </tr>
</tbody>
</Table>
</div>
</div>

        </>
    )
}
export default Pay;