import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
  Button,
  CircularProgress
} from "@mui/material";

export default function DeletePostDialog({ open, onClose, onPostDelete, isPending }) {

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{ "& .MuiPaper-root": { px: 1.5, py: 0.5, borderRadius: 2 } }}
      maxWidth="sm"
    >
      <DialogTitle variant="h6">آیا از حذف این پست اطمینان دارید ؟</DialogTitle>
      <Box
        sx={{
          borderBottom: ".5px solid rgba(255,255,255,.4)",
          width: "100%",
          height: ".5px",
        }}
      />
      <DialogContent>
        <DialogContentText>با حذف این پست دیگر به آن دسترسی نخواهید داشت.</DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button disabled={isPending} color="error" variant="outlined" onClick={onClose}>
          انصراف
        </Button>
        <Button disabled={isPending} color="error" variant="contained" onClick={onPostDelete}>
          {isPending && <CircularProgress
              sx={{
                position: "absolute",
                inset: 0,
                m: "auto",
                display: "block",
              }}
              size={24}
            />}
          حذف
        </Button>
      </DialogActions>
    </Dialog>
  );
}
