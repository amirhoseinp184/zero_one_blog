import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useState } from "react";
import { useUpdateSettingsMutations } from "../../../services/mutations";

export default function DateOfBirthForm({ defaultDate }) {
  const [value, setValue] = useState(() => {
    if (!defaultDate) return;
    return new Date(defaultDate);
    
  });
  const mutation = useUpdateSettingsMutations();

  function handleDateChange(newDate) {
    setValue(newDate);
    const birthDate = `${newDate.getFullYear()}-${
      newDate.getMonth() + 1
    }-${newDate.getDate()}`;

    mutation.mutate({ birthdate: birthDate });
  }

  return (
    <DatePicker
      value={value}
      onChange={handleDateChange}
      label="تاریخ تولد خود را وارد کنید."
    />
  );
}
