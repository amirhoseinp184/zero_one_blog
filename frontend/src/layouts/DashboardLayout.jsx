import { Outlet } from "react-router";
import { Box } from "@mui/material";
import DashboardMenu from "../components/layout/DashboardMenu";
import { grey } from "@mui/material/colors";

export default function DashboardLayout() {
  return (
    <Box
      sx={(theme) => ({
        display: "flex",
        width: "100%",
        height: "100%",
        flexDirection: "column",
        [theme.breakpoints.up("sm")]: { flexDirection: "row" },
      })}
    >
      <Box
        sx={(theme) => ({
          flex: 1,
          height: "100%",
          [theme.breakpoints.up("sm")]: {
            maxWidth: "20%",
            borderRight:`.5px solid ${grey[700]}`
          },
        })}
      >
        <DashboardMenu />
      </Box>

      <Box sx={{ flex: 1, height: "100%" }}>
        <Outlet />
      </Box>
    </Box>
  );
}
