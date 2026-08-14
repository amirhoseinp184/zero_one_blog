import { Typography, Box, Stack, Button } from "@mui/material";
import { NavLink, Link, useLocation } from "react-router";
import { useMePostsQuery } from "../../../services/queries";
import PostCard from "../../../components/dashboard/posts/PostCard";

export default function DashboardPostsPage() {
  const { data, isLoading } = useMePostsQuery();
  const location = useLocation()
  const currentUrl = `${location.pathname}${location.search}`
  
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
        {data?.map((post, index) => {
          const { status, title, published_at, excerpt, slug } = post;
          
          return (
            <PostCard
              Component={Link}
              to={`/dashboard/posts/${slug}`}
              state={{ from: currentUrl }}
              style={{textDecoration:'none', color:'inherit'}}
              key={slug}
              title={title}
              status={status}
              published_at={published_at}
              excerpt={excerpt}
            />
          );
        })}
      </Stack>
    </Box>
  );
}
