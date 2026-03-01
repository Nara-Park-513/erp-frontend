import{useState} from "react";
import {
    CalTopMargin,
  CalendarRow2,
  CalendarWrapper2,
  SideButton,
  Month,
  Days,
  Day,
  Dates2,
  DateCell2,
} from "../stylesjs/Content.styles";
const SmallCalendar = () => {

const [open,setOpen] = useState(false); 
const [currentDate, setCurrentDate] = useState(new Date());

const year = currentDate.getFullYear();
const month = currentDate.getMonth();



const days = ["일","월","화","수","목","금","토"];

//const dates = Array.from({length:30},(_, i) => i +1 );
const firstDay = new Date(year, month, 1).getDay(); //0~6
const lastDate = new Date(year, month +1, 0).getDate();

const today = new Date();
const isThisMonth =
today.getFullYear() === year && today.getMonth() === month;

    return(
        <>
        <CalTopMargin>
<CalendarRow2>
<CalendarWrapper2 $open={open}>
<Month>
{year}년 {month + 1}월
</Month>
<Days>
{days.map((d) => (<Day key={d}>{d}</Day>))}
</Days>
<Dates2>
{/*첫 요일까지 빈칸 */}
{Array.from({length: firstDay}).map((_, idx) => (
    <DateCell2 key={`empty-${idx}`}/>
))}
{/* 실제 날짜 */}
{Array.from({length:lastDate},(_, idx) => {
const date = idx + 1;
const isToday = isThisMonth && date === today.getDate();

return(
    <DateCell2
    key={date}
    style={{
fontWeight:isToday ? "bold":"normal",
border:isToday ? "2px solid #1976d2" : "none",
borderRadius:6,
    }}
    >
        {date}
    </DateCell2>
);
})}
</Dates2>
</CalendarWrapper2>

{/*열기 닫기 버튼 */}
<SideButton onClick={() => setOpen((prev) => !prev)}>
    {open ? "◀" : "▶"}
</SideButton>
</CalendarRow2>
</CalTopMargin>
        </>
    )
}
export default SmallCalendar