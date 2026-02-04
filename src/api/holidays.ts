import {Holiday} from "../types/holiday";


export const fetchHolidays = async(
/*
export : → 다른 파일에서도 이 함수를 쓸 수 있게 함
fetchHolidays : → “공휴일을 가져오는 함수”라는 의미의 이름
year:number : → 연도를 숫자로 받음
async : 서버에서 데이터를 가져오기 때문에 시간이 걸림
awiat 을 쓰기 위해 필요
Promise<Holiday[]> : → “이 함수는 나중에 Holiday 배열을 돌려준다”는 뜻
fetch : 서버에 요청을 보내는 함수
await : 응답이 올때 까지 기다림

동기에 대해서 알아야함 : 한줄이 끝나야 다음에 실행

1) 송원지
2) 이기창
3) 이기찬

동기 1 -> 2  -> 3

기다리지 않고 (다음 코드)실행 

1) 송원지
(lv3)
2) 이기창 (lv99)
3) 이기찬
(lv5)

자바스크립트는 한번에 한 작업만 처리한 (싱글 스레드)
비동기가 없으면 

오래 걸리는 작업 예시

서버에서 데이터 가져오기 (API)
파일 읽기
타이머
사용자 입력 대기

비동기가 없으면 화면이 멈춤, 버튼 클릭 안됨

자바스크립트의 비동기 처리의 진화 단계

callback(콜백 함수)
이거 그만 얘기해요 () => { 콜백함수 지옥
   쌤 모르겠어요{
        쌤 모르겠어요{
        쌤 모르겠어요{
        쌤 모르겠어요{
        }
    }
    }
   }
}

setTimeout(() => {
  console.log("1");
  setTimeout(() => {
    console.log("2");
    setTimeout(() => {
      console.log("3");
    }, 1000);
  }, 1000);

  2단계 : Promise : 미래에 성공하거나 실패할 작업
  pending : 대기
fulfilled : 성공
rejected : 실패

fetchData()
  .then(data => processData(data))
  .then(result => saveData(result))
  .then(() => console.log("완료"))
  .catch(err => console.error(err));
  콜백보다는 낫지만 여전히 길어짐

3단계 async / await ⭐ (가장 중요)
비동기 코드를 동기처럼 보이게 작성
async → 함수에 붙임
await → Promise가 끝날 때까지 기다림
*/

    year:number
):Promise<Holiday[]> => {
    const res = await fetch(
`https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo
    ?serviceKey=${process.env.REACT_APP_HOLIDAY_API_KEY}
    &solYear=${year}
    &numOfRows=100 
    &_type=json`//요청할 연도//한번에 최대 100개 가져오기//응답을 json형식으로 받기
    );

    const data = await res.json();
    //서버에서 받은 문자 데이터 .json()으로 자바스크립트 객체로 바꿈
    const items = data.response.body.items?.item ??[];
//data.response.body.items.item 공휴일 데이터가 들어 있는 위치 ?옵셔널 체이닝[데이터가 없으면 에러를 안생기게 함] 
//??[] 값이 없으면 빈 배열을 사용    
return items
    .filter((item:any) => item.locdate.toString().slice(4, 6) === "12")
    .map((item:any) => ({
date:Number(item.locdate.toString().slice(6, 8)),
name:item.dateName
    }));
    //12월 공휴일만 걸러내기
    /*
    20251229
    2025년 12월 29일

    YYYY[년도]MM[월]DD[날]를 toString()

    2025 12 29

    0123 4 5 6 7
    */
}