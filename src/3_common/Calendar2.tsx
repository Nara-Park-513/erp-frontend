import { useMemo, useState, useEffect, useRef } from "react";
/*
재료 가져오기
useState : 값 저장
useEffect : 화면 그려진 후 실행
useMemo : 계산 결과 저장
useRef : Dom 직접접근
*/

import { holidays as holidayData } from "@kyungseopk1m/holidays-kr";
//한국 공휴일 데이터 가져오기
import {
  Wrapper,
  Header,
  Grid,
  DayName,
  CalTopMargin,
  PrevBtn,
  NextBtn,
  TodayBtn,
  Flex,
} from "../stylesjs/Content.styles";
import{
Fixed, Modal,  ModalTitle, ModalDate
} from "../stylesjs/Modal.styles";
import {
  BtnGroup,
  MainBtn,
  GrayBtn,DelBtn
} from "../stylesjs/Button.styles";
import api from "../api";//axios로 만든 API통신도구
import { JustifyContent, W49 } from "../stylesjs/Util.styles";
import { InsertTitle, InsertMemo, TimeInput, Select } from "../stylesjs/Input.styles";
import { DayClick, CalBg } from "../stylesjs/Content.styles";

interface RawHoliday {
  date: number; // YYYYMMDD
  name: string;
}
type EventCategory = "MEETING" | "TASK" | "PERSONAL" | "ETC";
type EventCalendar = "DEFAULT" | "WORK" | "FAMILY";


type CalEvent = { //타입 정의 [데이터 모양설명서]
  id: number;
  date: string; // "YYYY-MM-DD"
  title: string;

  category?:EventCategory;
  calendar?:EventCalendar;
  location?:string;
  label?:string;
  startAt?:string;
  endAt?:string;
  attendees?:string[];
  sharers?:string[];
  memo?:string;
};

/*type EventForm = {
title: string;
category: EventCategory;
calendar: EventCalendar;
location:string;
label:string;
date:string;
startTime:string;
endTime:string;
attendeesText:string;
sharersText:string;
memo:string;
}*/

/*type EventPayload = {
    date: string;
  title: string;
  memo?: string;

  category?: EventCategory;
  calendar?: EventCalendar;
  location?: string;
  label?: string;

  startAt: string | null;
  endAt: string | null;

  attendees: string[];
  sharers: string[];
}*/



// 상수들 (고정값)
const ANIMATION_TIME = 300; // 애니메이션 시간
const FIXED_HEIGHT = 360; // 달력 높이

const pad2 = (n: number) => String(n).padStart(2, "0");
const toISODate = (y: number, m1to12: number, d: number) =>
  `${y}-${pad2(m1to12)}-${pad2(d)}`;

const Calendar2 = () => {
const[selectedEventId, setSelectedEventId] =useState<number | null>(null);
const[mode, setMode] = useState<"view" | "edit">("view"); //상세 보기 수정


// 아래가 상태들이다 화면 기억장치
  const [currentDate, setCurrentDate] = useState(new Date());//현재 보고 있는 달
  // 애니메이션 중인지 (연타방지)
  const [isAnimating, setIsAnimating] = useState(false);//이번달에 일정 목록
  // 왼쪽으로 가는지 / 오른쪽으로 가는지
  const [slideDir, setSlideDir] = useState<"prev" | "next">("next");//이전 이후 상태창
  // 모바일 인지 아닌지
  const [isMobile, setIsMobile] = useState(false);

  // ✅ 일정 상태 초기상태
  const [events, setEvents] = useState<CalEvent[]>([]);
const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);//일정 입력/조회 모달 열림 여부

  const [form, setForm] = useState({ //폼 상태 입력창들
    title: "",
    category:"MEETING",
    calendar:"DEFAULT",
    location:"",
    label:"",
    date:"",
    startTime: "",
    endTime: "",
    attendeesText:"",
    sharersText:"",
    memo: "",
  });

//유틸함수
const fillFormFromEvent = (isoDate: string, ev?:CalEvent) => {
  if(!ev){
    setForm({
      title:"",
      category:"MEETING",
      calendar:"DEFAULT",
      location:"",
      label:"",
      date:isoDate,
      startTime:"",
      endTime:"",
      attendeesText:"",
      sharersText:"",
      memo:"",
    });
    return;
  }
//기존일정 편집보기
const date = ev.startAt?.slice(0, 10) ?? ev.date ?? isoDate;
const startTime = ev.startAt?.slice(11, 16) ?? "";
const endTime = ev.endAt?.slice(11, 16) ?? "";

setForm({
title:ev.title ?? "",
category:ev.category ?? "MEETING",
calendar:ev.calendar ?? "DEFAULT",
location:ev.location ?? "",
label:ev.label ?? "",
date,
startTime,
endTime,
attendeesText:(ev.attendees ?? []).join(","),
sharersText:(ev.sharers ?? []).join(","),
memo: ev.memo ?? "",
})

}





  const startX = useRef<number | null>(null);
  // dom 직접 접근 (오늘 칸 자동 스크롤)
  const todayRef = useRef<HTMLDivElement | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0~11

  // 오늘 날짜 미리 저장
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  /* 모바일 감지 480이하이면 모바일로 판단 */
  useEffect(() => {
    const mq = window.matchMedia("(max-width:480px)");
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* 오늘 날짜 자동 스크롤 */
  useEffect(() => {
    if (year === todayYear && month === todayMonth && todayRef.current) {
      todayRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [year, month, todayYear, todayMonth]);

  /* 월 변경 함수 (연타 방지) */
  const changeMonth = (dir: "prev" | "next") => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSlideDir(dir);

    setTimeout(() => {
      setCurrentDate((prev) =>
        new Date(
          prev.getFullYear(),
          prev.getMonth() + (dir === "next" ? 1 : -1),
          1
        )
      );
      setIsAnimating(false);
    }, ANIMATION_TIME);
  };

  const goPrevMonth = () => changeMonth("prev");
  const goNextMonth = () => changeMonth("next");
  const goToday = () => setCurrentDate(new Date(todayYear, todayMonth, 1));

  /* 스와이프 */
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    const diff = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goPrevMonth() : goNextMonth();
    }
    startX.current = null;
  };

  /* 연도별 공휴일 + 성탄절 */
  const rawHolidays = useMemo<RawHoliday[]>(() => {
    let holidays: RawHoliday[] = [];
    if (Array.isArray(holidayData)) {
      holidays = holidayData
        .filter((h: any) => String(h.date).startsWith(String(year)))
        .map((h: any) => ({
          date: Number(h.date),
          name: String(h.name),
        }));
    }

    if (
      month === 11 &&
      !holidays.some((h) => String(h.date) === `${year}1225`)
    ) {
      holidays.push({ date: Number(`${year}1225`), name: "성탄절" });
    }

    return holidays;
  }, [year, month]);

  const weekNames = isMobile
    ? ["일", "월", "화", "수", "목", "금", "토"]
    : ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

  // ✅ 이번 달 일정 로딩 이번달 일정에 목록 불러오기
  const reloadMonthEvents = async () => {
    const from = `${year}-${pad2(month + 1)}-01`;
    const last = new Date(year, month + 1, 0).getDate();
    const to = `${year}-${pad2(month + 1)}-${pad2(last)}`;
    try{
    const res = await api.get("/api/events", { params: { from, to } });
    setEvents(res.data);
    } catch (err:any) {
      if(err.response?.status === 401) {
        alert("로그인이 필요합니다");
      } else if(err.response?.status === 403){
        alert("권한이 없습니다");
      } else{
        console.error(err);
      }
    }

  };

  useEffect(() => {
    reloadMonthEvents().catch((e) => {
      // 토큰이 없거나 만료면 여기서 401 날 수 있음(ProtectedRoute가 보통 막아줌)
      console.error(e);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

const buildISO = (date: string, time: string): string | null => {
  if (!date || !time) return null;
  return `${date}T${time}`;
};

const splitCsv = (s: string) =>
  s.split(",").map(v => v.trim()).filter(Boolean);



  // ✅ 일정 저장
  const saveEvent = async () => {
    if(!form.date) return; //if (!selectedDate) return;
    if (!form.title.trim()) {
      alert("제목을 입력하세요");
      return;
    }


    const payload = {
      date: form.date, 
      title:form.title, 
      memo:form.memo, 
      calendar:form.calendar,
      location:form.location, 
      label:form.label, 
      startAt:buildISO(form.date, form.startTime),
      endAt:buildISO(form.date, form.endTime), 
      attendees : splitCsv(form.attendeesText),
      sharers:splitCsv(form.sharersText),
    };

   try{
if(selectedEventId) {
  await api.put(`/api/events/${selectedEventId}`, payload);
} else {
    await api.post("/api/events", payload);

    }await reloadMonthEvents();
        setMode("view");
        setIsModalOpen(false);
      } catch (err:any) {
        if(err.response?.status === 401) alert ("로그인이 필요합니다");
        else if(err.response?.status === 403 ) alert ("관한이 없습니다");
        else console.error(err);
      }
  };

  // ✅ 일정 삭제
  const deleteEvent = async (id: number) => {
    if (!confirm("이 일정을 삭제할까요?")) return;
    try{
        await api.delete(`/api/events/${id}`);
        await reloadMonthEvents();
    } catch (err:any){
      if(err.response?.status === 401 ) alert ("로그인이 필요합니다");
      else if(err.response?.status === 403) alert("권한이 없습니다");
      else console.error(err);
    }


  };

  /*const selectedDayEvents = selectedDate
    ? events.filter((e) => e.date === selectedDate)
    : [];*/

  /* 달력 렌더 함수 */
  const renderCalendar = (baseDate: Date) => {
    const y = baseDate.getFullYear();
    const m = baseDate.getMonth();

    const firstDay = new Date(y, m, 1).getDay();
    const lastDate = new Date(y, m + 1, 0).getDate();

    const holidays = rawHolidays.filter(
      (h) => Number(String(h.date).slice(4, 6)) === m + 1
    );

    return (
      <Grid style={{ width: "100%" }}>
        {weekNames.map((day) => (
          <DayName key={day}>{day}</DayName>
        ))}

        {Array.from({ length: firstDay }).map((_, idx) => (
          <div key={`e-${idx}`} />
        ))}

        {Array.from({ length: lastDate }, (_, idx) => {
          const day = idx + 1;
          const weekday = (firstDay + idx) % 7;

          const holiday = holidays.find(
            (h) => Number(String(h.date).slice(6, 8)) === day
          );

          const isToday = y === todayYear && m === todayMonth && day === todayDate;

          // ✅ 이 날짜(칸)의 ISO 날짜
          const iso = toISODate(y, m + 1, day);
          const dayEvents = events.filter((e) => e.date === iso);

          return (
            <DayClick
            key={day}
            weekday={weekday}
            isToday={isToday}
            holiday={!!holiday}
            onClick={() => {
              const iso = toISODate(y, m+1, day);

              setSelectedDate(iso);
              setSelectedEventId(null);
              setMode("edit");
              fillFormFromEvent(iso);
              setIsModalOpen(true);
            }}
            title={holiday?.name}
            >
              <div>{day}</div>

              {/* ✅ 일정 1개 미리보기(있으면 보여주기) */}
              {dayEvents.length > 0 && (
                <div
                onClick={(e) => {
                  e.stopPropagation();
                  const ev = dayEvents[0];
                  setSelectedDate(iso);
                  setSelectedEventId(ev.id);
                  setMode("view");
                  fillFormFromEvent(iso, ev);
                  setIsModalOpen(true);
                }}
                  style={{
                    fontSize: 10,
                    padding: "2px 6px",
                    borderRadius: 6,
                    background: "#ddd",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {dayEvents[0].title}
                </div>
              )}
            </DayClick>
          );
        })}
      </Grid>
    );
  };

  const currentMonthDate = new Date(year, month, 1);
  const slideMonthDate =
    slideDir === "next"
      ? new Date(year, month + 1, 1)
      : new Date(year, month - 1, 1);

  const renderMonths = () => {
    const isNext = slideDir === "next";

    const monthsArr = isNext
      ? [currentMonthDate, slideMonthDate] // next
      : [slideMonthDate, currentMonthDate]; // prev

    return (
      <div
        style={{
          display: "flex",
          width: "200%",
          transform: isAnimating
            ? isNext
              ? "translateX(-50%)"
              : "translateX(0%)"
            : isNext
            ? "translateX(0%)"
            : "translateX(-50%)",
          transition: isAnimating ? `transform ${ANIMATION_TIME}ms ease` : "none",
        }}
      >
        {monthsArr.map((date, idx) => (
          <div key={idx} style={{ width: "50%" }}>
            {renderCalendar(date)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <CalBg>
    <CalTopMargin>
      <Wrapper style={{ width: "100%" }}>
        {/* HEADER */}
        <Header>
          <PrevBtn onClick={goPrevMonth} disabled={isAnimating}>
            ◀
          </PrevBtn>

          <h3 style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {year}년 {month + 1}월
            <TodayBtn
              onClick={goToday}
              disabled={year === todayYear && month === todayMonth}
            >
              오늘
            </TodayBtn>
          </h3>

          <NextBtn onClick={goNextMonth} disabled={isAnimating}>
            ▶
          </NextBtn>
        </Header>

        {/* 슬라이드 뷰포트 */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            minHeight: FIXED_HEIGHT,
            width: "100%",
          }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {renderMonths()}
        </div>
      </Wrapper>

      {/* ✅ 일정 입력/조회 모달 */}
      {isModalOpen && (
<Fixed onClick={() => setIsModalOpen(false)}>
<Modal onClick={(e: any) => e.stopPropagation()}>
<div className="">
<ModalTitle>
일정상세
</ModalTitle>

</div>

<ModalDate>{form.date || selectedDate}</ModalDate>

<div className="">
  <div className="">
    <div className="">제목</div>

      {mode === "view" ? (
      <div className="">{form.title || "-"}</div>
      ):(
        <InsertTitle placeholder="제목" value={form.title} 
onChange={(e:any) => setForm ((p) => ({...p, title:e.target.value}))}        
        />
  )}
  </div>

  {/*일정 구분 캘린더 */}
  <JustifyContent>
    <W49>
      <div className="">일정구분</div>
      {mode === "view" ? (
        <div className="">{form.category}</div>
      ):(
        <Select
value={form.category}
onChange={(e:any) => setForm((p) => ({...p, category:e.target.value as any}))}        
        >
<option value="MEETING">MEETING</option>
<option value="TASK">TASK</option>
<option value="PERSONAL">PERSONAL</option>
<option value="ETC">ETC</option>
        </Select>
      )}
    </W49>
    <W49>
      <div className="">캘린더</div>
      {mode === "view" ? (
<div className="">{form.calendar}</div>
      ):(
<Select
value={form.calendar}
onChange={(e:any) => setForm((p) => ({...p, calendar:e.target.value as any}))}        
        >
<option value="DEFAULT">DEFAULT</option>
<option value="WORK">WORK</option>
<option value="FAMILY">FAMILY</option>
</Select>
      )}
    </W49>
  </JustifyContent>

{/*장소 라벨 */}
<JustifyContent>
  <W49>
    <div className="">장소</div>
    {mode === "view" ? (
      <div className="">{form.location || "-"}</div>
    ):(
      <InsertTitle
      placeholder="장소" value={form.location}
      onChange={(e:any) => setForm((p) => ({...p, location:e.target.value}))}
      />
    )}
  </W49>

<W49>
  <div className="">라벨</div>
  { mode === "view" ? (
<div className="">{form.label || "-"}</div>
  ):(
<InsertTitle
placeholder="라벨" value={form.label}
onChange={(e:any) => setForm((p) => ({...p, label:e.target.value}))}
/>
  )}
</W49>
</JustifyContent>

{/*날짜 시간 */}
<div className="">
  <div className="">날짜/시간</div>
  {mode === "view" ?(
<div className="">
  {form.date || "-"}{""}
  {(form.startTime || form.endTime) ? 
  `${form.startTime || ""} ~ ${form.endTime ? 
  `~ ${form.endTime}`:""}`:""}
</div>
  ):(
<JustifyContent>
  <W49>
    <TimeInput
    type="date" value={form.date} onChange={(e:any) => setForm((p) => ({...p, date:e.target.value}))}
    />
  </W49>
  <W49>
    <div className="">
      <TimeInput
type="time" value={form.startTime} 
onChange={(e:any) => setForm((p) => ({...p, startTime:e.target.value}))}      
      />
      <TimeInput
type="time" value={form.endTime} 
onChange={(e:any) => setForm((p) => ({...p, endTime:e.target.value}))}         
      />
    </div>


  </W49>
</JustifyContent>
  )}
</div>

{/*참석자 / 공유자 */}
<div className="">
  <div className="">참석자</div>
  {mode === "view" ? (
<div className="">{form.attendeesText || "-"}</div>
  ):(
<InsertTitle
placeholder="참석자"
value={form.attendeesText}
onChange={(e:any) => setForm((p) => ({...p, attendeesText:e.target.value}))}
/>
  )}
</div>

<div>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>공유자</div>
          {mode === "view" ? (
            <div>{form.sharersText || "-"}</div>
          ) : (
            <InsertTitle
              placeholder="공유자 (예: manager@a.com)"
              value={form.sharersText}
              onChange={(e: any) => setForm((p) => ({ ...p, sharersText: e.target.value }))}
            />
          )}
        </div>

        {/* 메모 */}
        <div>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>전체(메모)</div>
          {mode === "view" ? (
            <div style={{ whiteSpace: "pre-wrap" }}>{form.memo || "-"}</div>
          ) : (
            <InsertMemo
              placeholder="메모"
              value={form.memo}
              onChange={(e: any) => setForm((p) => ({ ...p, memo: e.target.value }))}
            />
          )}
        </div>
{mode === "view" && (
<BtnGroup>
<GrayBtn onClick={() => setMode("edit")}>
수정
</GrayBtn>
<GrayBtn onClick={() => window.print()} className="mx-2">
인쇄
</GrayBtn>
<GrayBtn onClick={() =>{
const txt = JSON.stringify(form, null, 2);
navigator.clipboard?.writeText(txt);
alert("복사 했습니다")  
}}>
복사
</GrayBtn>
<GrayBtn onClick={() => alert("enote연결 부비 콘티뉴드")} className="mx-2">
enote
</GrayBtn>
<GrayBtn onClick={() => setIsModalOpen(false)}>
닫기
</GrayBtn>

{selectedEventId && (
  <DelBtn
    onClick = {() => {
      deleteEvent(selectedEventId);
      setIsModalOpen(false);
    }} className="mx-2"
      >
    삭제
  </DelBtn>
)}
</BtnGroup>
)}
        {/* 하단 버튼 */}
        {mode === "edit" && (
          <JustifyContent>
            <W49>
              <GrayBtn onClick={() => {setIsModalOpen(false); }}>
               취소
              </GrayBtn>
            </W49>
            <W49>
              <MainBtn onClick={saveEvent}>저장</MainBtn>
            </W49>
          </JustifyContent>
        )}
      </div>
</Modal>
</Fixed>      
      )}
    </CalTopMargin>
    </CalBg>
  );
};

export default Calendar2;

/*
초기 모달
<Fixed onClick={() => setIsModalOpen(false)}>
          <Modal onClick={(e:any) => e.stopPropagation()}>
            <ModalTitle>일정 상세</ModalTitle>
            <ModalDate>{selectedDate}</ModalDate>

            {/* ✅ 선택한 날짜의 기존 일정 목록 
            {selectedDayEvents.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                {selectedDayEvents.map((ev) => (
                  <div
                    key={ev.id}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <b style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {ev.title}
                      </b>
                      <DelBtn onClick={() => deleteEvent(ev.id)}>삭제</DelBtn>
                    </div>
                    {ev.memo && (
                      <div style={{ fontSize: 12, marginTop: 6, whiteSpace: "pre-wrap" }}>
                        {ev.memo}
                      </div>
                    )}
                    {(ev.startTime || ev.endTime) && (
                      <div style={{ fontSize: 12, marginTop: 6 }}>
                        {ev.startTime ?? ""} {ev.endTime ? `~ ${ev.endTime}` : ""}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ✅ 새 일정 추가 
            <InsertTitle
              placeholder="제목"
              value={form.title}
              onChange={(e:any) => setForm((p) => ({ ...p, title: e.target.value }))}
              
            />
            <InsertMemo
              placeholder="메모"
              value={form.memo}
              onChange={(e:any) => setForm((p) => ({ ...p, memo: e.target.value }))}
              
            />
            <JustifyContent>
              <W49>
              <TimeInput
                type="time"
                value={form.startTime}
                onChange={(e:any) => setForm((p) => ({ ...p, startTime: e.target.value }))}
                style={{ flex: 1, padding: 10 }}
              />
              </W49>
              <W49>
              <TimeInput
                type="time"
                value={form.endTime}
                onChange={(e:any) => setForm((p) => ({ ...p, endTime: e.target.value }))}
                style={{ flex: 1, padding: 10 }}
              />
              </W49>
            </JustifyContent>

          
              <JustifyContent>
               <W49><GrayBtn onClick={() => setIsModalOpen(false)}>닫기</GrayBtn></W49> 
               <W49><MainBtn onClick={saveEvent}>저장</MainBtn></W49>
              </JustifyContent>
              
              
          
          </Modal>
        </Fixed>
*/
