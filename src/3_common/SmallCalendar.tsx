import { useState } from "react";
import {
  CalTopMargin,
  CalendarRow2,
  CalendarWrapper2,
  SideButton,
  Month,
  Days2,
  Day2,
  Dates2,
  DateCell2,
} from "../stylesjs/Content.styles";

const SmallCalendar = () => {
  const [open, setOpen] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = ["일", "월", "화", "수", "목", "금", "토"];

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const isThisMonth =
    today.getFullYear() === year && today.getMonth() === month;

  const moveMonth = (diff: number) => {
    setCurrentDate(new Date(year, month + diff, 1));
  };

  return (
    <CalTopMargin>
      <CalendarRow2>
        <CalendarWrapper2 $open={open}>
          <div
  style={{
    display: "grid",
    gridTemplateColumns: "32px 1fr 32px",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  }}
>
  <button
    type="button"
    onClick={() => moveMonth(-1)}
    style={{
      width: "32px",
      height: "32px",
      border: "1px solid #dbe2ea",
      backgroundColor: "#ffffff",
      color: "#475569",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: "16px",
      lineHeight: 1,
      padding: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    ‹
  </button>

  <Month>
    {year}년 {month + 1}월
  </Month>

  <button
    type="button"
    onClick={() => moveMonth(1)}
    style={{
      width: "32px",
      height: "32px",
      border: "1px solid #dbe2ea",
      backgroundColor: "#ffffff",
      color: "#475569",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: "16px",
      lineHeight: 1,
      padding: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    ›
  </button>
</div>

          <Days2>
            {days.map((d) => (
              <Day2
                key={d}
                style={{
                  color: d === "일" ? "#dc2626" : d === "토" ? "#2563eb" : "#6b7280",
                  fontWeight: 700,
                }}
              >
                {d}
              </Day2>
            ))}
          </Days2>

          <Dates2>
            {Array.from({ length: firstDay }).map((_, idx) => (
              <DateCell2 key={`empty-${idx}`} />
            ))}

            {Array.from({ length: lastDate }, (_, idx) => {
              const date = idx + 1;
              const isToday = isThisMonth && date === today.getDate();
              const weekDay = (firstDay + idx) % 7;

              return (
                <DateCell2
                  key={date}
                  $today={isToday}
                  style={{
                    color:
                      weekDay === 0
                        ? "#dc2626"
                        : weekDay === 6
                        ? "#2563eb"
                        : "#374151",
                    cursor: "pointer",
                  }}
                >
                  {date}
                </DateCell2>
              );
            })}
          </Dates2>
        </CalendarWrapper2>

        <SideButton onClick={() => setOpen((prev) => !prev)}>
          {open ? "◀" : "▶"}
        </SideButton>
      </CalendarRow2>
    </CalTopMargin>
  );
};

export default SmallCalendar;