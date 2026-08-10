import { useParams, useLocation, useNavigate } from "react-router";
import { Box, IconButton, Typography } from "@mui/material";
import { useMePostDetailQuery } from "../../../services/queries";

import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

import PostEditForm from "../../../components/dashboard/posts/PostEditForm";

export default function PostEditPage() {
  const { postSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { data, isPending, error } = useMePostDetailQuery({ slug: postSlug });

  const isCenteredState = isPending || error;

  const handleClick = () => {
    const canGoBack = location.state?.from;
    if (canGoBack) navigate(-1);
    else navigate(`/dashboard/posts/${postSlug}`);
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
        p: 2,
      }}
    >
      <IconButton sx={{ my: 2 }} onClick={handleClick}>
        <ArrowForwardOutlinedIcon />
      </IconButton>

      <Box
        sx={{
          // display: isCenteredState ? "flex" : "block",
          width:'100%',
          display:'flex',
          flexGrow: 1,
          flex:1,
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
          <PostEditForm {...data} slug={postSlug} />
        )}
      </Box>
    </Box>
  );
}
