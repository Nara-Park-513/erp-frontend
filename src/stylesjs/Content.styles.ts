import styled from "styled-components";

interface DayCellProps {
  isToday?: boolean;
  isEmpty?: boolean;
  isHoliday?: boolean;
}

export const Flex = styled.div`
  display: inline-flex;
  align-items: center;
  width: 100%;
  justify-content: flex-start;
`;

export const Left = styled.div`
  width: 20%;
  height: 100vh;
  background-color: #fff;
`;

export const Right = styled.div`
  width: 80%;
  height: 100vh;
  background-color: #fff;
  padding: 20px 80px 0px 0px;
`;

export const TableWrap = styled.div`
  padding: 30px 0px;
`;

// 캘린더
export const CalendarWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: sans-serif;
  padding: 10px 0px;
`;

export const CalHeader = styled.h2`
  text-align: center;
  margin-bottom: 10px;
`;

export const Grid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
`;

export const DayName = styled.div`
  font-weight: bold;
  text-align: center;
`;

export const DayCell = styled.div<DayCellProps>`
  height: 50px;
  border-radius: 8px;
  background: ${({ isToday }) => (isToday ? "#ffefc3" : "#f4f4f4")};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ isEmpty, isHoliday }) =>
    isEmpty ? "transparent" : isHoliday ? "#d32f2f" : "#333"};
  font-weight: ${({ isHoliday }) => (isHoliday ? "bold" : "normal")};
  cursor: ${({ isEmpty }) => (isEmpty ? "default" : "pointer")};

  &:hover span {
    opacity: 1;
    transform: translateY(-4px);
  }
`;

export const CalTopMargin = styled.div`
  margin-top: 150px;
  position: relative;
  z-index: 1;
`;

export const Tooltip = styled.span`
  position: absolute;
  background: #333;
  color: #fff;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  transition: 0.2s;
  pointer-events: none;
`;

// api용
export const Wrapper = styled.div`
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  font-family: sans-serif;
  padding: 10px 0px;
`;

export const Header = styled.div`
  width: 90%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

export const PrevBtn = styled.button`
  cursor: pointer;
  font-size: 18px;
  background: transparent;
  border: none;

  &:hover {
    font-size: 19px;
  }
`;

export const NextBtn = styled.button`
  cursor: pointer;
  font-size: 18px;
  background: transparent;
  border: none;

  &:hover {
    font-size: 19px;
  }
`;

export const TodayBtn = styled.button`
  cursor: pointer;
  font-size: 18px;
  background: transparent;
  border: none;

  &:hover {
    font-size: 19px;
  }
`;

export const CalendarRow = styled.div`
  display: flex;
  align-items: stretch;
  font-family: sans-serif;
`;

export const CalendarSmall = styled.div`
  width: 0;
  overflow: hidden;
  border: 1px solid #ccc;
  transition: width 0.4s ease;
`;

export const CalendarSmallOpen = styled.div`
  width: 200px;
`;

// 미니캘린더
interface CalendarProps {
  $open: boolean;
}

export const CalendarRow2 = styled.div`
  display: flex;
  align-items: stretch;
  font-family: sans-serif;
  gap: 8px;
`;

export const CalendarWrapper2 = styled.div<CalendarProps>`
  width: ${({ $open }) => ($open ? "240px" : "0")};
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background-color: #ffffff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  transition: width 0.35s ease;
  transform-origin: right center;
  padding: ${({ $open }) => ($open ? "12px" : "0")};
`;

export const SideButton = styled.button`
  width: 42px;
  min-width: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  border: 1px solid #dbe2ea;
  background: #ffffff;
  color: #475569;
  cursor: pointer;
  border-radius: 14px;
  font-weight: 700;
  font-size: 18px;
  line-height: 1;
  padding: 0;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.05);

  &:hover {
    background: #f8fafc;
  }
`;

export const Days = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
`;

export const Day = styled.div`
  font-size: 12px;
  font-weight: bold;
`;

export const Dates = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
`;

export const DateCell = styled.div`
  font-size: 11px;
  padding: 2px 0;
`;

export const Month = styled.div`
  flex: 1;
  text-align: center;
  font-weight: 800;
  padding: 8px 6px;
  background: #f8fafc;
  border-radius: 10px;
  color: #1f2937;
  font-size: 15px;
  line-height: 1.2;
  letter-spacing: -0.02em;
  white-space: nowrap;
`;

export const Days2 = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 6px;
  gap: 4px;
`;

export const Day2 = styled.div`
  text-align: center;
  font-size: 12px;
  color: #6b7280;
  padding: 4px 0;
`;

export const Dates2 = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: 34px;
  gap: 4px;
`;

export const DateCell2 = styled.div<{ $today?: boolean }>`
  min-height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #f8fafc;
  font-size: 12px;
  transition: all 0.15s ease;

  &:hover {
    background: #eef4fb;
  }

  ${({ $today }) =>
    $today &&
    `
      border: 1.5px solid #94a3b8;
      font-weight: 700;
      background: #eef4fb;
    `}
`;

interface DayClickProps {
  holiday?: boolean;
  weekday: number;
  isToday?: boolean;
}

export const DayClick = styled.div<DayClickProps>`
  margin: 2px;
  border-radius: 8px;
  background: ${({ holiday }) => (holiday ? "#ffefc3" : "#f4f4f4")};
  color: ${({ weekday }) =>
    weekday === 0 ? "red" : weekday === 6 ? "blue" : "#333"};

  border: ${({ isToday }) => (isToday ? "2px solid #1976d2" : "none")};
  font-weight: ${({ isToday }) => (isToday ? "bold" : "normal")};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  gap: 4px;
  padding: 10px 0px;
  height: 70px;
`;

export const IconWrap = styled.div`
  height: 40px;
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0px 0px 10px;
`;

export const CalBg = styled.div`
  width: 1580px;
  max-width: 100%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0px;
`;

export const TopWrap = styled.div`
  width: 100%;
  height: 120px;
`;

export const RoundRect = styled.div`
  width: 750px;
  min-width: 100%;
  padding: 15px;
  background-color: white;
  border-radius: 16px;
  border: 1px solid #ccc;
`;