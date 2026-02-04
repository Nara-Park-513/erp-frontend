import {useState, useEffect, useMemo} from "react";
import {CalendarWrapper, CalHeader, DayCell, Tooltip, Grid, DayName, CalTopMargin} from "../stylesjs/Content.styles";
import {Holiday} from "../types/holiday";
import { fetchHolidays } from "../api/holidays";
import {holidays as getHolidays} from "@kyungseopk1m/holidays-kr";

const Calendar=({year = new Date().getFullYear()})=> {
    
    const month = 11; //(0부터 시작)
    const firstDay = new Date(year, month, 1).getDay();
    //12월 1일이 무슨 요일 인지 알아내는 코드 0 =일, 1=월
    const lastDate = new Date(year, month + 1, 0).getDate();
    //month + 1 다음달 날짜를 0으로 주면 이전달의 마지막날
    //12월이 30일 인지 31일인지 자동으로 계산

//add
const [holidays, setHolidays] = useState<Holiday[]>([]);

useEffect(()=>{fetchHolidays(year).then(setHolidays);},[year]);

const today = new Date();//현재 날짜와 시간을 가져옵니다
const isThisMonth = today.getFullYear() === year && today.getMonth() === month;

//add
const getHoliday = (day:number) => holidays.find(h => h.date === day);

const days = [];//달력의 모든칸을 저장할 배열 나중에 {days}로 화면에 출력됨

//달력 앞부분에 빈칸 만들기
for (let i = 0; i < firstDay; i++){
days.push(<DayCell key={`empty-${i}`} isEmpty/>);
}
for(let d = 1; d <= lastDate; d++){
    const holiday = getHoliday(d);

    days.push(
<DayCell key={d} isToday={isThisMonth && today.getDate() === d} isHoliday={!!holiday}>
{d}   
{holiday && <Tooltip>{holiday.name}</Tooltip>}
{holiday?.name === "성탄절" && " 🎄"} 
</DayCell>
    )
}


/*실제 날짜 채우기
for(let d=1; d <= lastDate; d++){ //1일부터 30일 또는 31일까지 반복
const isToday = isThisMonth && today.getDate() === d;
//오늘 날짜인지 확인 = 이번달이고 날짜 숫자가 오늘과 같을때
    days.push(//날짜 하나를 데이셀 컴포넌트로 추가 key={d} 화면에 날짜 숫자 표시
        //isToday = {isToday} 오늘이면 강조표시 가능
        <DayCell key={d} isToday = {isToday}>
            {d}
        </DayCell>
    );
}*/

return(
    <>
<CalTopMargin/>
<CalendarWrapper>
<CalHeader>{year}년 12월</CalHeader>
<Grid>
{["일","월","화","수","목","금","토"].map(day =>(
<DayName key={day}>{day}</DayName>
))}
{days}
</Grid>
</CalendarWrapper>  
</> 
);

}

export default Calendar;