import {useState} from "react";
import axios from "axios";

const ResetPassword = () => {

    const query = new URLSearchParams(window.location.search);
    const token = query.get("token");
    /*
window.location.search → URL의 query string (예: ?token=abc123)
URLSearchParams → 쿼리 값들을 다룰 수 있는 API
query.get("token") → token 값을 읽어옴

➡️ 즉, 사용자가 이메일 링크에서 받은 토큰을 프론트에서 추출하는 부분입니다.   
    */
   const [password, setPassword] =useState("");
const [repeat, setRepeat] =useState("");

const handleSubmit = async(e:React.FormEvent) => {
    e.preventDefault();

    if(password !== repeat){
        alert("비밀번호가 일치하지 않습니다");
        return;
    }try{
        await axios.post("http://localhost:8888/auth/reset-password",{
           token, password, 
        });
        alert("비밀번호가 변경되었습니다");
        window.location.href ="/login";
    }catch (err){
        alert("토큰이 만료 되었거나 잘못되었습니다")
    }
}
    return(
<>
<div className="container mt-5">
<h3>비밀번호 재설정</h3>
</div>
</>
    );
}
export default ResetPassword;