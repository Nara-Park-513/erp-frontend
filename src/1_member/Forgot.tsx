import {useState} from "react"; //리액트 전체 라이브러리에서 상태 관리를 위해 useState를 꺼내옴
import axios from "axios";
import { Container,Row, Col, Button, Form, Card } from "react-bootstrap";



const Forgot =()=> {

   let [email,setEmail] = useState("");//초기화
   
   //asynchronous
   /*
   동기 : 어떤 작업을 실행할때 그 작업을 기다리는 방식(순차적으로 기다림)
   비동기 : 어떤 작업을 실행할때 그작업이 완료되지 않더라도 결과를 기다리지 않고 다음코드를 실행
   비동기 방식으로 파일을 읽는다면 작업이 실행되는 동안 다른 작업을 수행할수 있다
   자바스크립트는 스레드가 하나밖에 없다 한번에 하나의 작업만 처리할수 있어서 
   이러한 문제점을 해결하기 위해 자바스크립트에서는 비동기가 필요합니다

   비동기를 사용하지 않으면
   function test() {
    for (let i = 0; i < 10000; i++) {
        console.log(1);
    }
    console.log(2);
}
   */
   let handleSubmit = async(e:React.FormEvent) => {
    e.preventDefault();//이벤트의 기본 동작을 막는 함수

    if(!email){
        alert("이메일을 입력해 주세요");
        return;
    }try{
        await axios.post("http://localhost:8888/auth/forgot-password",{email});
        alert("비밀번호 재설정 이메일이 전송되었습니다");
    }catch(err){
        console.error(err)
        alert("해당 이메일로 가입된 계정이 없습니다")
    }
   }



    return(
        <>
  <Container>

        {/*} Outer Row */}
        <div className="row justify-content-center mt-150">

            <div className="col-xl-10 col-lg-12 col-md-9">

                <div className="card o-hidden border-0 shadow-lg my-5">
                    <div className="card-body p-0">
                        {/*} Nested Row within Card Body */}
                        <div className="row">
                            <div className="col-lg-6 d-none d-lg-block bg-password-image"></div>
                            <div className="col-lg-6">
                                <div className="p-5">
                                    <div className="text-center">
                                        <h1 className="h4 text-gray-900 mb-2">Forgot Your Password?</h1>
                                        <p className="mb-4">We get it, stuff happens. Just enter your email address below
                                            and we'll send you a link to reset your password!</p>
                                    </div>
                                    <form className="user" >
                                        <div className="form-group" onSubmit={handleSubmit}>
                                            <input 
                                            type="email" className="form-control form-control-user"
                                                id="exampleInputEmail" aria-describedby="emailHelp"
                                                placeholder="Enter Email Address..."
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                />
                                        </div>
                                        <a href="login.html" className="btn btn-primary btn-user btn-block">
                                            Reset Password
                                        </a>
                                    </form>
                                    <hr/>
                                    <div className="text-center">
                                        <a className="small" href="/member">Create an Account!</a>
                                    </div>
                                    <div className="text-center">
                                        <a className="small" href="/login">Already have an account? Login!</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>

    </Container>
   
        </>
    )
}
export default Forgot;