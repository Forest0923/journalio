import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";

interface CalendarPanelProps {
  onDateSelect: (date: string) => void;
}

const CalendarPanel: React.FC<CalendarPanelProps> = ({ onDateSelect }) => {
  const [value, setValue] = useState<Date>(new Date());

  const handleChange = (date: Date) => {
    console.log("date:", date);
    setValue(date);
    const formattedDate = format(date, "yyyy-MM-dd");
    onDateSelect(formattedDate);
  };

  return (
    <div>
      <Calendar onChange={handleChange} value={value} />
    </div>
  );
};

export default CalendarPanel;
