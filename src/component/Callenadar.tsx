// Calendar2.tsx
import { useState, useEffect } from "react";
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import api from "../api"; // axios 인스턴스

type MiniCalendarProps = {
  selectedDate?: Date | null;
  onChange?: (date: Date) => void;
};

type ScheduleEvent = {
  id: number;
  date: string; // "YYYY-MM-DD"
  tag: string;
  type: "meeting" | "off" | "etc";
  title: string;
};

const Calendar2: React.FC<MiniCalendarProps> = ({ selectedDate, onChange }) => {
  const initDate = selectedDate || new Date();
  const [currentDate, setCurrentDate] = useState<Date>(initDate);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0~11
  const today = new Date();

  // YYYY-MM-DD 형식
  const formatDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // 이벤트 Map
  const eventMap = new Map<string, ScheduleEvent[]>();
  events.forEach((e) => {
    const list = eventMap.get(e.date) || [];
    list.push(e);
    eventMap.set(e.date, list);
  });

  // 달력 계산
  const firstDay = new Date(year, month, 1);
  const firstDayWeek = firstDay.getDay();
  const lastDay = new Date(year, month + 1, 0);
  const lastDate = lastDay.getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayWeek; i++) days.push(null);
  for (let d = 1; d <= lastDate; d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const isSameDate = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleSelectDate = (date: Date) => onChange && onChange(date);

  /** 서버 호출 */
  const reloadMonthEvents = async (from: string, to: string) => {
    try {
      const res = await api.get("/events", { params: { from, to }, withCredentials: true });
      return res.data; // ScheduleEvent[]
    } catch (err) {
      console.error("이벤트 로딩 실패:", err);
      return [];
    }
  };

  // currentDate 바뀔 때마다 이벤트 로딩
  useEffect(() => {
    const fetchEvents = async () => {
      const y = currentDate.getFullYear();
      const m = (currentDate.getMonth() + 1).toString().padStart(2, "0");
      const from = `${y}-${m}-01`;
      const to = `${y}-${m}-31`;
      const data = await reloadMonthEvents(from, to);
      setEvents(data);
    };
    fetchEvents();
  }, [currentDate]);

  return (
    <Container className="schedule-container mt-120">
      <Row>
        <Col>
          <div className="schedule-header">
            <div className="schedule-title-left">
              <Button variant="link" className="p-0 me-2 schedule-arrow" onClick={handlePrevMonth}>
                &lt;
              </Button>
              <span className="schedule-month-text">{year}/{(month + 1).toString().padStart(2, "0")}</span>
              <span className="fs-16-600-black">일정관리</span>
            </div>
          </div>

          <Table bordered hover className="table schedule-table" responsive="sm">
            <colgroup>
              <col style={{width:"128px"}}/>
              <col style={{width:"128px"}}/>
              <col style={{width:"128px"}}/>
              <col style={{width:"128px"}}/>
              <col style={{width:"128px"}}/>
              <col style={{width:"128px"}}/>
              <col style={{width:"128px"}}/>
            </colgroup>
            <thead>
              <tr>
                <th>일</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th><th>토</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, wIdx) => (
                <tr key={wIdx}>
                  {week.map((day, dIdx) => {
                    if (!day) return <td key={dIdx} className="schedule-cell empty"></td>;
                    const cellDate = new Date(year, month, day);
                    const key = formatDateKey(cellDate);
                    const dayEvents = eventMap.get(key) || [];
                    const isToday = isSameDate(cellDate, today);

                    return (
                      <td key={dIdx} className={`schedule-cell ${isToday ? "today" : ""}`} onClick={() => handleSelectDate(cellDate)}>
                        <div className="day-number">{day}</div>
                        <div className="event-list">
                          {dayEvents.map((e) => (
                            <div className="event-row" key={e.id}>
                              <span className={`event-tag ${e.type}`}>{e.tag}</span>
                              <span className="event-title">{e.title}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default Calendar2;
