import RHFTextField from "../RHFTextField";
import { grey } from "@mui/material/colors";

export default function DashboardTextField({ name, label, ...props }) {
  return (
    <RHFTextField
      name={name}
      label={label}
      {...props}
      slotProps={{
        input: {
          sx: {
            "&&:not(.Mui-error):before": {
              borderBottom: `1.5px solid ${grey[700]}`,
            },
            "&&:not(.Mui-error):hover:before": {
              borderBottom: `1.5px solid ${grey[700]}`,
            },
            "&&:after": {
              borderBottomWidth: "1.5px",
            },
          },
        },
        formHelperText: {
          sx: {
            mt: 1.5,
          },
        },
      }}
    />
  );
}
