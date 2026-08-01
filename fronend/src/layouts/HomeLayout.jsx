import { Outlet } from "react-router";
import { Box } from '@mui/material'

import Header from "../components/Header";

export default function HomeLayout({}) {
  return (
    <>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header />

        <Box sx={{flexGrow:1}}>
          <Outlet />
        </Box>
      </Box>
      {/* <Footer /> */}
    </>
  );
}
