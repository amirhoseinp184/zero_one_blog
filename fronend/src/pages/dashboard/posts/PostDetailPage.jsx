import { useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router";
import { useMePostDetailQuery } from "../../../services/queries";
import { Typography, Box, IconButton, Button } from "@mui/material";
import { useDeletePostMutations } from "../../../services/mutations";
import { useAlert } from "../../../providers/AlertProvider";

import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

import PostDetail from "../../../components/dashboard/posts/PostDetail";
import DeletePostDialog from "../../../components/dashboard/posts/DeletePostDialog";


export default function PostDetailPage() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { postSlug } = useParams();
  const { isPending, error, data } = useMePostDetailQuery({ slug: postSlug });
  const navigate = useNavigate();
  const location = useLocation();
  const currentUrl = `${location.pathname}${location.search}`;
  const mutation = useDeletePostMutations()
  const { showAlert } = useAlert()

  const handleBack = () => {
    const canGoBack = location.state?.from;
    if (canGoBack) navigate(-1);
    else navigate("/dashboard/posts");
  };

  const isCenteredState = isPending || error;

  const closeDeleteDialog = () => setShowDeleteDialog(false);
  const openDeleteDialog = () => setShowDeleteDialog(true);

  const handlePostDelete = () => {
    console.log('runned');
    
    mutation.mutate(postSlug, {
      onSuccess: (data) =>{
        setShowDeleteDialog(false)
        showAlert({message:'پست مورد نظر با موفقیت حذف شد.', severity:'success'})
        navigate('/dashboard/posts/')
      },
      onError: (error) => {
        setShowDeleteDialog(false)
        showAlert({message: 'مشکلی در اجرای درخواست بوجود آمد.', serverity: 'error'})
      },
    })
  }

  return (
    <>
      <DeletePostDialog isPending={mutation.isPending} onPostDelete={handlePostDelete} open={showDeleteDialog} onClose={closeDeleteDialog} />
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

          <Box>
            <Button
              sx={{ mr: 1.5 }}
              variant="outlined"
              color="error"
              disabled={isPending || error}
              onClick={openDeleteDialog}
            >
              حذف
            </Button>

            <Button
              component={Link}
              state={{ from: currentUrl }}
              to={`/dashboard/posts/${postSlug}/edit`}
              disabled={isPending || error}
              variant="outlined"
              color="warning"
            >
              ویرایش
            </Button>
          </Box>
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
            <PostDetail {...data} />
          )}
        </Box>
      </Box>
    </>
  );
}
