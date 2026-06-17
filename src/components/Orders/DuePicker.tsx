import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface props {
  currentDate: any;
  updateDate: any;
  isEditable: boolean;
}

function toLocalDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const [year, month, day] = value.split("T")[0].split("-").map(Number);
  return new Date(year, month - 1, day); // local midnight, no UTC shift
}

const DuePicker = ({ currentDate, updateDate, isEditable }: props) => {
  const [dueDate, setDueDate] = useState(toLocalDate(currentDate));

  return (
    <div className="due-picker-wrapper">
      <DatePicker
        selected={toLocalDate(dueDate)}
        isClearable={isEditable}
        disabled={!isEditable}
        closeOnScroll
        onChange={(date: any) => {
          setDueDate(date?.toISOString() ?? null);
          updateDate("dueDate", date);
        }}
        showMonthYearPicker
        dateFormat={"MM/yyyy"}
      />
    </div>
  );
};
export default DuePicker;
