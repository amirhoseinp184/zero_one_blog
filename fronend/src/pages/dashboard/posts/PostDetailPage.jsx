import { useParams, useLocation, useNavigate } from "react-router";
import { useMePostDetailQuery } from "../../../services/queries";
import { Typography, Box, IconButton } from "@mui/material";

import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

import PostDetail from "../../../components/dashboard/posts/PostDetail";

export default function PostDetailPage() {
  const { postSlug } = useParams();
  const { isPending, error, data } = useMePostDetailQuery({ slug: postSlug });
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    const canGoBack = location.state?.from;
    if (canGoBack) navigate(-1);
    else navigate("/dashboard/posts");
  };

  const isCenteredState = isPending || error;

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        p: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
      }}
    >
      <IconButton sx={{ my: 2 }} onClick={handleBack}>
        <ArrowForwardOutlinedIcon />
      </IconButton>

      <Box
        sx={{
          display: isCenteredState ? "flex" : "block",
          flexGrow: 1,
          width: "100%",
          alignItems: isCenteredState ? "center" : undefined,
          justifyContent: isCenteredState ? "center" : undefined,
        }}
      >
        {isPending ? (
          <Typography variant="body1" color="primary">
            در حال بارگذاری ...{" "}
          </Typography>
        ) : error ? (
          <Typography variant="body1" color="error">
            مشکلی در بارگذاری صفحه رخ داد، لطفا صفحه را رفرش کنید
          </Typography>
        ) : (
          <PostDetail {...data} />
        )}
      </Box>
    </Box>
  );
}
