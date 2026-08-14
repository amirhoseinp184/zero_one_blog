import { Box, Typography } from "@mui/material";

export default function SettingPlaceHolder({ label, helper, SettingControl, ...otherProps }) {
  return (
    <Box
      sx={{ display: "flex", justifyContent: "space-between" }}
      {...otherProps}
    >
      <Box>
        <Typography variant="h6">{label}</Typography>
        <Typography color="textDisabled">{helper}</Typography>
      </Box>

      {SettingControl ? <SettingControl /> : null}
    </Box>
  );
}
