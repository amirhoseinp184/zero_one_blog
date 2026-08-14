import { useParams, useLocation, useNavigate, Link } from "react-router";
import { usePublicPostDetailQuery } from "../services/queries";
import { Typography, Box, IconButton, Button } from "@mui/material";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

import PostDetail from "../components/PostDetail";

export default function PostDetailPage({}) {
  const { username, postSlug } = useParams();

  const { isPending, error, data } = usePublicPostDetailQuery({ username, postSlug });

  const navigate = useNavigate();
  const location = useLocation();
  const currentUrl = `${location.pathname}${location.search}`;

  const handleBack = () => {
    const canGoBack = location.state?.from;
    if (canGoBack) navigate(-1);
    else navigate("/");
  };

  const isCenteredState = isPending || error;

  return (
    <>
      <Box
        sx={{
          width: "100%",
          minHeight: "100%",
          p: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <IconButton sx={{ my: 2 }} onClick={handleBack}>
            <ArrowForwardOutlinedIcon />
          </IconButton>

        </Box>

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
            <PostDetail post={data} />
          )}
        </Box>
      </Box>
    </>
  );
}
