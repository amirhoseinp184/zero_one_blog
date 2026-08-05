import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
} from "@mui/material";
import { useAuth } from '../../../providers/AuthProvider'
import { useAlert } from "../../../providers/AlertProvider";
import { api } from "../../../services/api";

export default function LogoutDialog({ open, onClose }) {
  const { logout } = useAuth()
  const { showAlert } = useAlert()

  function handleLogout(){
    try{
      api.post('auth/logout/')
      logout()
    }catch{
      showAlert({message: 'مشکلی در انجام درخواست پیش امده است.', severity:'error'})
    }
  }

  return (
    <>
      <Dialog
        open={open}
        sx={{ "& .MuiPaper-root": { px: 1.5, py:.5, borderRadius: 2 } }}
        maxWidth="sm"
      >
        <DialogTitle variant="h6">از حساب کاربری خارج میشوید؟</DialogTitle>

        <Box
          sx={{
            mt: 1,
            borderBottom: ".5px solid rgba(255,255,255,.4)",
            width: "100%",
            height: ".5px",
          }}
        />

        <DialogContent>
          <DialogContentText>
            با خروج از حساب کاربری به مقالات خود دسترسی نخواهید داشت. هر وقت
           وارد بخواهید میتوانید مجددا وارد شوید و به نوشتن ادامه دهید.
          </DialogContentText>
        </DialogContent>

        <DialogActions >
          <Button color="error" variant="outlined" onClick={onClose}>
            انصراف
          </Button>
          <Button color="error" variant="contained" onClick={handleLogout}>
            خروج از حساب
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
