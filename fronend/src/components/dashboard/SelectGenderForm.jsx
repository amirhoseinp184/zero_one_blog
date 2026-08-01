import {
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
} from "@mui/material";
import { useState } from "react";
import { useUpdateSettingsMutations } from "../../services/mutations";
import { useAlert } from "../../providers/AlertProvider";

export default function SelectGenderForm({ defaultGender = "" }) {
  const [value, setValue] = useState(defaultGender);
  const mutation = useUpdateSettingsMutations()
  const { showAlert } = useAlert()

  function handleChange(e) {
    const newGender = e.target.value 
    setValue(newGender);
    mutation.mutate({gender:newGender})
    showAlert({message: 'اطلاعات با موفقیت ذخیره شد.', severity:'success'})
  }

  return (
    <FormControl>
      <RadioGroup value={value} onChange={handleChange} row>
        <FormControlLabel value="male" label="مرد" control={<Radio />} />
        <FormControlLabel value="female" label="زن" control={<Radio />} />
        <FormControlLabel value="other" label="سایر" control={<Radio />} />
      </RadioGroup>
    </FormControl>
  );
}
