import { Controller } from "react-hook-form";
import { TextField } from "@mui/material";
import { useFormContext } from "react-hook-form";


export default function RHFTextField({ name, label, ...props }) {
  const { control } = useFormContext()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => {

        return (
          <TextField
            {...field}
            fullWidth
            label={label}
            variant="standard"
            {...props}
            error={!!error}
            helperText={error?.message}
          />
        );
      }}
    />
  );
}
