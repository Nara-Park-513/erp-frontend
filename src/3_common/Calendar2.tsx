import { useMemo, useState, useEffect, useRef } from "react";
import { holidays as holidayData } from "@kyungseopk1m/holidays-kr";
import {
  Wrapper,
  Header,
  Grid,
  DayName,
  CalTopMargin,
  PrevBtn,
  NextBtn,
  TodayBtn,
  DayClick,
  CalBg,
} from "../stylesjs/Content.styles";
import { Fixed, Modal, ModalTitle, ModalDate } from "../stylesjs/Modal.styles";
import { BtnGroup, MainBtn, GrayBtn, DelBtn } from "../stylesjs/Button.styles";
import api from "../api";
import { JustifyContent, W49 } from "../stylesjs/Util.styles";
import { InsertTitle, InsertMemo, TimeInput, Select } from "../stylesjs/Input.styles";

interface RawHoliday {
  date: number;
  name: string;
}

type EventCategory = "MEETING" | "TASK" | "PERSONAL" | "ETC";
type EventCalendar = "DEFAULT" | "WORK" | "FAMILY";

type CalEvent = {
  id: number;
  date: string;
  title: string;
  category?: EventCategory;
  calendar?: EventCalendar;
  location?: string;
  label?: string;
  startAt?: string;
  endAt?: string;
  attendees?: string[];
  sharers?: string[];
  memo?: string;
};

const ANIMATION_TIME = 300;
const FIXED_HEIGHT = 360;

const pad2 = (n: number) => String(n).padStart(2, "0");
const toISODate = (y: number, m1to12: number, d: number) =>
  `${y}-${pad2(m1to12)}-${pad2(d)}`;

const Calendar2 = () => {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [mode, setMode] = useState<"view" | "edit">("view");

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDir, setSlideDir] = useState<"prev" | "next">("next");
  const [isMobile, setIsMobile] = useState(false);

  const [events, setEvents] = useState<CalEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "MEETING",
    calendar: "DEFAULT",
    location: "",
    label: "",
    date: "",
    startTime: "",
    endTime: "",
    attendeesText: "",
    sharersText: "",
    memo: "",
  });

  const fillFormFromEvent = (isoDate: string, ev?: CalEvent) => {
    if (!ev) {
      setForm({
        title: "",
        category: "MEETING",
        calendar: "DEFAULT",
        location: "",
        label: "",
        date: isoDate,
        startTime: "",
        endTime: "",
        attendeesText: "",
        sharersText: "",
        memo: "",
      });
      return;
    }

    const date = ev.startAt?.slice(0, 10) ?? ev.date ?? isoDate;
    const startTime = ev.startAt?.slice(11, 16) ?? "";
    const endTime = ev.endAt?.slice(11, 16) ?? "";

    setForm({
      title: ev.title ?? "",
      category: ev.category ?? "MEETING",
      calendar: ev.calendar ?? "DEFAULT",
      location: ev.location ?? "",
      label: ev.label ?? "",
      date,
      startTime,
      endTime,
      attendeesText: (ev.attendees ?? []).join(","),
      sharersText: (ev.sharers ?? []).join(","),
      memo: ev.memo ?? "",
    });
  };

  const startX = useRef<number | null>(null);
  const todayRef = useRef<HTMLDivElement | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  useEffect(() => {
    const mq = window.matchMedia("(max-width:480px)");
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (year === todayYear && month === todayMonth && todayRef.current) {
      todayRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [year, month, todayYear, todayMonth]);

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

  const reloadMonthEvents = async () => {
    const from = `${year}-${pad2(month + 1)}-01`;
    const last = new Date(year, month + 1, 0).getDate();
    const to = `${year}-${pad2(month + 1)}-${pad2(last)}`;
    try {
      const res = await api.get("/api/events", { params: { from, to } });
      setEvents(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        alert("로그인이 필요합니다");
      } else if (err.response?.status === 403) {
        alert("권한이 없습니다");
      } else {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    reloadMonthEvents().catch((e) => {
      console.error(e);
    });
  }, [year, month]);

  const buildISO = (date: string, time: string): string | null => {
    if (!date || !time) return null;
    return `${date}T${time}`;
  };

  const splitCsv = (s: string) =>
    s.split(",").map((v) => v.trim()).filter(Boolean);

  const saveEvent = async () => {
    if (!form.date) return;
    if (!form.title.trim()) {
      alert("제목을 입력하세요");
      return;
    }

    const payload = {
      date: form.date,
      title: form.title,
      memo: form.memo,
      calendar: form.calendar,
      location: form.location,
      label: form.label,
      startAt: buildISO(form.date, form.startTime),
      endAt: buildISO(form.date, form.endTime),
      attendees: splitCsv(form.attendeesText),
      sharers: splitCsv(form.sharersText),
    };

    try {
      if (selectedEventId) {
        await api.put(`/api/events/${selectedEventId}`, payload);
      } else {
        await api.post("/api/events", payload);
      }
      await reloadMonthEvents();
      setMode("view");
      setIsModalOpen(false);
    } catch (err: any) {
      if (err.response?.status === 401) alert("로그인이 필요합니다");
      else if (err.response?.status === 403) alert("권한이 없습니다");
      else console.error(err);
    }
  };

  const deleteEvent = async (id: number) => {
    if (!confirm("이 일정을 삭제할까요?")) return;
    try {
      await api.delete(`/api/events/${id}`);
      await reloadMonthEvents();
    } catch (err: any) {
      if (err.response?.status === 401) alert("로그인이 필요합니다");
      else if (err.response?.status === 403) alert("권한이 없습니다");
      else console.error(err);
    }
  };

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
          <DayName
            key={day}
            style={{
              padding: "10px 0 14px",
              fontSize: isMobile ? 12 : 14,
              fontWeight: 700,
              color:
                day.startsWith("일")
                  ? "#dc2626"
                  : day.startsWith("토")
                  ? "#2563eb"
                  : "#475467",
            }}
          >
            {day}
          </DayName>
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
          const iso = toISODate(y, m + 1, day);
          const dayEvents = events.filter((e) => e.date === iso);

          return (
            <div key={day} ref={isToday ? todayRef : null}>
              <DayClick
                weekday={weekday}
                isToday={isToday}
                holiday={!!holiday}
                onClick={() => {
                  setSelectedDate(iso);
                  setSelectedEventId(null);
                  setMode("edit");
                  fillFormFromEvent(iso);
                  setIsModalOpen(true);
                }}
                title={holiday?.name}
                style={{
                  boxShadow: isToday ? "0 8px 18px rgba(59, 130, 246, 0.14)" : "none",
                  background: isToday ? "#eef4ff" : holiday ? "#fff3dd" : "#f8fafc",
                  border: isToday ? "1px solid #93c5fd" : "1px solid #eef2f7",
                  height: isMobile ? "64px" : "74px",
                  padding: "8px 4px",
                }}
              >
                <div style={{ fontWeight: isToday ? 800 : 600 }}>{day}</div>

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
                      maxWidth: "90%",
                      fontSize: 10,
                      padding: "3px 7px",
                      borderRadius: 999,
                      background: "#dbeafe",
                      color: "#1e40af",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontWeight: 600,
                    }}
                  >
                    {dayEvents[0].title}
                  </div>
                )}
              </DayClick>
            </div>
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
      ? [currentMonthDate, slideMonthDate]
      : [slideMonthDate, currentMonthDate];

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
        <Wrapper
          style={{
            width: "100%",
            //background: "#ffffff",
            //border: "1px solid #e8ecf4",
            //borderRadius: "20px",
            //boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
            padding: "22px 20px 18px",
          }}
        >
          <Header
            style={{
              width: "100%",
              marginBottom: "18px",
              display: "grid",
              gridTemplateColumns: "56px 1fr 56px",
              alignItems: "center",
              columnGap: "12px",
            }}
          >
            <PrevBtn
              onClick={goPrevMonth}
              disabled={isAnimating}
              style={{
                width: 56,
                height: 48,
                borderRadius: 14,
                border: "1px solid #dbe2ea",
                background: "#ffffff",
                color: "#475569",
                padding: 0,
                lineHeight: 1,
                fontSize: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                justifySelf: "start",
              }}
            >
              ◀
            </PrevBtn>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                minWidth: 0,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#1f2937",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                }}
              >
                {year}년 {month + 1}월
              </h3>

              <TodayBtn
                onClick={goToday}
                disabled={year === todayYear && month === todayMonth}
                style={{
                  border: "1px solid #dbe2ea",
                  background:
                    year === todayYear && month === todayMonth ? "#f3f4f6" : "#ffffff",
                  color: "#475569",
                  borderRadius: 12,
                  padding: "8px 14px",
                  fontSize: 14,
                  fontWeight: 700,
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                오늘
              </TodayBtn>
            </div>

            <NextBtn
              onClick={goNextMonth}
              disabled={isAnimating}
              style={{
                width: 56,
                height: 48,
                borderRadius: 14,
                border: "1px solid #dbe2ea",
                background: "#ffffff",
                color: "#475569",
                padding: 0,
                lineHeight: 1,
                fontSize: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                justifySelf: "end",
              }}
            >
              ▶
            </NextBtn>
          </Header>

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

        {isModalOpen && (
          <Fixed onClick={() => setIsModalOpen(false)}>
            <Modal onClick={(e: any) => e.stopPropagation()}>
              <div
                style={{
                  padding: "22px 22px 16px",
                  borderBottom: "1px solid #eef2f7",
                  background: "linear-gradient(180deg, #fbfcfe 0%, #f8fafc 100%)",
                  flex: "0 0 auto",
                }}
              >
                <ModalTitle style={{ marginBottom: 8 }}>일정상세</ModalTitle>
                <ModalDate>{form.date || selectedDate}</ModalDate>
              </div>

              <div
                style={{
                  padding: "20px 22px",
                  display: "grid",
                  gap: 16,
                  overflowY: "auto",
                  minHeight: 0,
                  flex: "1 1 auto",
                }}
              >
                <div>
                  <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>제목</div>
                  {mode === "view" ? (
                    <div style={{ fontWeight: 700, color: "#111827" }}>{form.title || "-"}</div>
                  ) : (
                    <InsertTitle
                      placeholder="제목"
                      value={form.title}
                      onChange={(e: any) =>
                        setForm((p) => ({ ...p, title: e.target.value }))
                      }
                    />
                  )}
                </div>

                <JustifyContent>
                  <W49>
                    <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>일정구분</div>
                    {mode === "view" ? (
                      <div>{form.category}</div>
                    ) : (
                      <Select
                        value={form.category}
                        onChange={(e: any) =>
                          setForm((p) => ({ ...p, category: e.target.value as any }))
                        }
                      >
                        <option value="MEETING">MEETING</option>
                        <option value="TASK">TASK</option>
                        <option value="PERSONAL">PERSONAL</option>
                        <option value="ETC">ETC</option>
                      </Select>
                    )}
                  </W49>

                  <W49>
                    <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>캘린더</div>
                    {mode === "view" ? (
                      <div>{form.calendar}</div>
                    ) : (
                      <Select
                        value={form.calendar}
                        onChange={(e: any) =>
                          setForm((p) => ({ ...p, calendar: e.target.value as any }))
                        }
                      >
                        <option value="DEFAULT">DEFAULT</option>
                        <option value="WORK">WORK</option>
                        <option value="FAMILY">FAMILY</option>
                      </Select>
                    )}
                  </W49>
                </JustifyContent>

                <JustifyContent>
                  <W49>
                    <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>장소</div>
                    {mode === "view" ? (
                      <div>{form.location || "-"}</div>
                    ) : (
                      <InsertTitle
                        placeholder="장소"
                        value={form.location}
                        onChange={(e: any) =>
                          setForm((p) => ({ ...p, location: e.target.value }))
                        }
                      />
                    )}
                  </W49>

                  <W49>
                    <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>라벨</div>
                    {mode === "view" ? (
                      <div>{form.label || "-"}</div>
                    ) : (
                      <InsertTitle
                        placeholder="라벨"
                        value={form.label}
                        onChange={(e: any) =>
                          setForm((p) => ({ ...p, label: e.target.value }))
                        }
                      />
                    )}
                  </W49>
                </JustifyContent>

                <div>
                  <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>날짜/시간</div>
                  {mode === "view" ? (
                    <div>
                      {form.date || "-"}{" "}
                      {(form.startTime || form.endTime) &&
                        `${form.startTime || ""}${form.endTime ? ` ~ ${form.endTime}` : ""}`}
                    </div>
                  ) : (
                    <JustifyContent>
                      <W49>
                        <TimeInput
                          type="date"
                          value={form.date}
                          onChange={(e: any) =>
                            setForm((p) => ({ ...p, date: e.target.value }))
                          }
                        />
                      </W49>
                      <W49>
                        <div style={{ display: "flex", gap: 8 }}>
                          <TimeInput
                            type="time"
                            value={form.startTime}
                            onChange={(e: any) =>
                              setForm((p) => ({ ...p, startTime: e.target.value }))
                            }
                          />
                          <TimeInput
                            type="time"
                            value={form.endTime}
                            onChange={(e: any) =>
                              setForm((p) => ({ ...p, endTime: e.target.value }))
                            }
                          />
                        </div>
                      </W49>
                    </JustifyContent>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>참석자</div>
                  {mode === "view" ? (
                    <div>{form.attendeesText || "-"}</div>
                  ) : (
                    <InsertTitle
                      placeholder="참석자"
                      value={form.attendeesText}
                      onChange={(e: any) =>
                        setForm((p) => ({ ...p, attendeesText: e.target.value }))
                      }
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
                      onChange={(e: any) =>
                        setForm((p) => ({ ...p, sharersText: e.target.value }))
                      }
                    />
                  )}
                </div>

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
                  <BtnGroup style={{ justifyContent: "flex-end", flexWrap: "wrap", gap: 8 }}>
                    <GrayBtn onClick={() => setMode("edit")}>수정</GrayBtn>
                    <GrayBtn onClick={() => window.print()} className="mx-2">
                      인쇄
                    </GrayBtn>
                    <GrayBtn
                      onClick={() => {
                        const txt = JSON.stringify(form, null, 2);
                        navigator.clipboard?.writeText(txt);
                        alert("복사 했습니다");
                      }}
                    >
                      복사
                    </GrayBtn>
                    <GrayBtn onClick={() => alert("enote연결 부비 콘티뉴드")} className="mx-2">
                      enote
                    </GrayBtn>
                    <GrayBtn onClick={() => setIsModalOpen(false)}>닫기</GrayBtn>

                    {selectedEventId && (
                      <DelBtn
                        onClick={() => {
                          deleteEvent(selectedEventId);
                          setIsModalOpen(false);
                        }}
                        className="mx-2"
                      >
                        삭제
                      </DelBtn>
                    )}
                  </BtnGroup>
                )}

                {mode === "edit" && (
                  <JustifyContent>
                    <W49>
                      <GrayBtn onClick={() => setIsModalOpen(false)}>취소</GrayBtn>
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