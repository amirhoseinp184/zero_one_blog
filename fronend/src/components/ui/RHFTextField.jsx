import { Fragment } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { TextField, Box } from "@mui/material";


export default function RHFTextField({ name, label, showLength, helperText, ...otheProps }) {
  const { control } = useFormContext();
  let renderedHelperText = Array.isArray(helperText)
    ? helperText.map((text, index) => (
        <Fragment key={index}>
          {text}
          {index < helperText.length - 1 && <br />}
        </Fragment>
      ))
    : helperText;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => {
        return (
          <Box sx={{ position: "relative" }}>
            <TextField
              {...field}
              value={field.value ?? ""}
              fullWidth
              label={label}
              variant="standard"
              {...otheProps}
              error={!!error}
              helperText={error?.message ?? renderedHelperText}
            />
            {showLength && (
              <Box
                component="span"
                sx={{
                  position: "absolute",
                  top: "18px",
                  right: "8px",
                  color: "grey.500",
                  fontSize: 14,
                  pointerEvents: false
                }}
              >
                {field.value.length}
              </Box>
            )}
          </Box>
        );
      }}
    />
  );
}
