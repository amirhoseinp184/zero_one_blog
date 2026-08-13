import { Button, CircularProgress } from "@mui/material";

export default function LoadingButton({ loading = false, disabled, children, ...props }) {
  const { sx } = props;

  return (
    <Button
      type="submit"
      variant="contained"
      disabled={disabled || loading}
      sx={{ position: "relative", ...sx }}
      {...props}
    >
      {children}
      {loading && (
        <CircularProgress
          sx={{
            position: "absolute",
            inset: 0,
            m: "auto",
            display: "block",
          }}
          size={24}
        />
      )}
    </Button>
  );
}
