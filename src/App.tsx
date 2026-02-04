import {useEffect, useState} from 'react';
import axios from 'axios';
import ProtectedRoute from './routes/ProtectedRoute';

/*
React : 리액트 라이브러리 자체를 가져 옵니다
useState : 리액트 훅(Hook)으로 컴포넌트 내부에서 상태(state)를 관리할때 사용합니다
리액트훅은 함수형 컴포넌트에서 상태(state)나 생명주기(lifecycle) 같은 기능을 
사용할수
있게 해주는 특별한 함수

useEffect : 컴포넌트가 렌더링 될때나 특정 값이 바뀔때 실행되는 사이드 이펙트
함수를 등록할때 사용합니다 여기서는 API요청을 보낼때 사용합니다
*/
import Header from './include/Header';
import Top from './include/Top';
import SideBar from './include/SideBar';
import Member from './1_member/Member';
import Home from './sub/Home';
import Admin from './sub/Admin';
import About from './sub/About';
import Contact from './sub/Contact';
import Login from './1_member/Login';
import Forgot from './1_member/Forgot';
import InstagramRedirect from './1_member/InstargramRedirect';
import KakaoRedirect from './1_member/KakaoRedirect';
import Inventory from './4_inventory/Inventory';
import MyPage from './2_mypage/MyPage';
import Customer from './5_customer/Costomer';
import GeneralJournal from './14_gene/GeneralJounrnal';
import SalesPurchaseTrade from './15_sales/SalesPurchaseTrade';
import FundStatus from './6_fund/FundStatus';
import PayableNoteStatus from './7_pay/PayableNoteStatus';
import EstimateInput from "./8_est/EstimateInput"
import ProfitLoss from './9_profit/ProfitLoss';
import SalesInput from './10_sale/SalesInput';
import SalesInput2 from './11_sale2/SalesInput2';
import StockStatus from './12_stock/StockStatus';
import StockMovement from './13_stockmove/StockMovement';
//react나 vue에서 링크연결을 라우팅이라 합니다 npm install react-router-dom
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";


//부트스트랩 cdn
import 'bootstrap/dist/css/bootstrap.min.css';
//sass  연결
import './assets/scss/style.scss';//리액트 에서는 sass컴파일 없이 사용



//백앤드에서 받아올 데이터 타입정의
interface HelloResponse{
  data: string;
}

function App() {
/*const [hello, setHello] = useState<string>('');
//[현재 상태 값(state)값, 상태를 바꾸는 함수] = useState('')초기상태값을 빈문자열로 설정
//즉 처음 렌더링 될때 hello는 빈문자열 '' 입니다

useEffect(() => {
  const fetchHello = async () => {
    try{
      const response = await axios.get<{data:string}>('http://localhost:8888/api/hello');
      setHello(response.data.data);
    }catch(error){
      console.error(error);
    }
  };
  fetchHello();
}, [])//컴포넌트 최조 렌더링시 1회만 실행

/*useEffect(() => {//useEffect로 API요청 보내기
axios.get('http://localhost:8383/api/hello')//스프링에서 만들 주소
.then(response => setHello(response.data))
//자바스크립트는 equal 비동기 백앤드가 보낸 응답(response)을 받으면
//response.data(실제데이터 내용)을 hello상태에 저장됩니다
.catch(error => console.log(error))
//요청 중 에러가 나면 콘솔에 로그를 출력합니다..
}, []);
/*
이 함수는 컴포넌트가 처음 화면에 렌더링 된후에 한번만 실행됩니다
[](빈배열)두번째 인자로 주었기 때문에 '한번만 실행' 됩니다
if  배열에 값이 있다면 그 값이 바뀔때 마다 실행된다
*/

  return (
<>
<BrowserRouter>

  {/*<div>
  스프링 부트에서 가져온 데이터 입니다 : {hello}
  </div>*/}

  <Routes>
    <Route path="/" element={<Login/>}/>
    <Route path="/admin" element={<ProtectedRoute><Admin/></ProtectedRoute>}/>
    <Route path="/mypage" element={<ProtectedRoute><MyPage/></ProtectedRoute>}/>
    <Route path="/fund" element={<FundStatus/>}/>
    <Route path="/pay" element={<PayableNoteStatus/>}/>
    <Route path="/est" element={<EstimateInput/>}/>
    <Route path="/profit" element={<ProfitLoss/>}/>
    <Route path="/inventory" element={<Inventory/>}/>
    <Route path="/sale" element={<SalesInput/>}/>
    <Route path="/sale2" element={<SalesInput2/>}/>
    <Route path="/stock" element={<StockStatus/>}/>
    <Route path="/stockmove" element={<StockMovement/>}/>
    <Route path="/custom" element={<Customer/>}/>
    <Route path="/general" element={<GeneralJournal/>}/>
    <Route path="/trade" element={<SalesPurchaseTrade/>}/>
    <Route path="/about" element={<About/>}/>
    <Route path="/contact" element={<Contact/>}/>
    <Route path="/member" element={<Member/>}/>
   <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/forgot" element={<Forgot/>}/>
    <Route path="/auth/instagram" element={<InstagramRedirect />} />
<Route path="/auth/kakao" element={<KakaoRedirect />} />
  </Routes>
</BrowserRouter>
</>
  );
}

export default App;

/*
Cross Origin Resource Sharing :
서버와 클라이언트가 동일한 IP주소에서 동작하고 있다면
리소스에 제약이 없지만..리액트는 localhost:3000,
스프링부트는 localhost:8000,

이문제가 생기지 않게 미들웨어 라는걸 설치합니다
미들웨어(Middleware)**는 간단히 말해 운영체제(OS)와 응용프로그램(애플리케이션) 
사이에서 중간 역할을 하는 소프트웨어를 말합니다.

예를 들어 보면

웹 서버 ↔ 데이터베이스 서버가 있을 때,
두 서버 간에 데이터를 주고받는 과정을 도와주는 JDBC, ODBC, ORM 같은 연결 계층이 미들웨어 역할을 합니다.

웹 애플리케이션 서버(WAS) — 예를 들어 Tomcat, JBoss, WebLogic 등도 
미들웨어입니다.
이들은 웹 요청을 받아 애플리케이션 로직을 실행하고, DB와 통신하며, 
결과를 사용자에게 돌려주는 중간 다리 역할을 합니다.

간단히 요약하면

미들웨어 = 운영체제 위에서, 애플리케이션이 
쉽게 동작하도록 도와주는 "중간 관리자"
(네트워크 통신, 데이터 연결, 보안, 트랜잭션 등 공통 기능을 제공)

npm install http-proxy-middleware --save

프록시(proxy)란 무엇인가?

프록시는 **클라이언트(사용자)**와 서버(목적지) 사이에 서서,
요청과 응답을 **중계(대리)**하는 중간 서버를 말합니다.

리액트에서 api나 db를 컨트롤 할때는 axios를 사용합니다
Axios는 백앤드와 프론트앤드 사이의 통신을 쉽게하기 위해 사용하는 라이브러리

npm install axios --save

Node Package Manager

yarn (npm이 불안정하여 안정적으로 만든 도구[메타])
yarn add
*/
