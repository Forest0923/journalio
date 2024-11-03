import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface CalendarPanelProps {
  onDateSelect: (date: Date) => void;
  onWeekSelect: (week: number, date: Date) => void;
}

const CalendarPanel: React.FC<CalendarPanelProps> = ({ onDateSelect, onWeekSelect }) => {
  const [value, setValue] = useState<Date>(new Date());

  const handleClickDay = (date: Date) => {
    setValue(date);
    onDateSelect(date);
  };
  
  const handleClickWeekNumber = (weekNumber: number, date: Date) => {
    onWeekSelect(weekNumber, date);
  }

  return (
    <div style={{}}>
      <Calendar onChange={handleClickDay} value={value} tileContent="" showWeekNumbers={true} onClickWeekNumber={handleClickWeekNumber} />
    </div>
  );
};

export default CalendarPanel;
