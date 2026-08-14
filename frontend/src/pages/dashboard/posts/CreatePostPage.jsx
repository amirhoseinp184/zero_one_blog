import { Box, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { NavLink } from "react-router";

import CreatePostForm from "../../../components/dashboard/posts/CreatePostForm";



export default function DashboardCreatePostPage() {

  return (
    <Box
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        maxHeight: "100vh",
        height: "100vh",
      }}
    >
      <Box sx={{ my: 2, display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h5" component="h5" fontWeight={600} color="primary">نوشتن پست جدید</Typography>
        <IconButton
          component={NavLink}
          to="/dashboard/posts/"
          aria-label="close"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <CreatePostForm />
      
    </Box>
  );
}
