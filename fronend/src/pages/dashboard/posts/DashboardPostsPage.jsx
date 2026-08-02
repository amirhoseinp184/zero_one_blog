import { Typography, Box, Stack, Button } from "@mui/material";
import { NavLink } from "react-router";
import { useMePostsQuery } from "../../../services/queries";
import Post from "../../../components/dashboard/Post";

export default function DashboardPostsPage() {
  const { data, isLoading } = useMePostsQuery();

  return (
    <Box sx={{ p: 5 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #cccccc94",
          pb: 2,
        }}
      >
        <Typography variant="h4" fontWeight="bold" component="h1" gutterBottom>
          پست های من
        </Typography>
        <Button
          variant="outlined"
          sx={(theme) => ({
            fontSize: 16,
            "&:hover": {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              border: null,
              outline: null,
            },
          })}
          color="primary"
          component={NavLink}
          to="/dashboard/posts/create"
        >
          ایجاد پست جدید
        </Button>
      </Box>
      <Stack sx={{ ml: 2, gap: 2 }} component={"ul"}>
        {isLoading && <p>is Loading...</p>}
        {/* {data?.map(({ status, title, published_at }, index) => (
          <Post key={index} title={title} status={status} />
        ))} */}
        {data?.map((post, index) => {
          const { status, title, published_at } = post
          return <Post key={index} title={title} status={status} published_at={published_at} />;
        })}
      </Stack>
    </Box>
  );
}
