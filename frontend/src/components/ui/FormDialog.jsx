import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { grey } from "@mui/material/colors";


export default function FormDialog({ children, open, handleClose, title, onSubmit, canSave }) {
  return (
    <Dialog
      component="form"
      onSubmit={onSubmit}
      open={open}
      onClose={handleClose}
      sx={{
        "& .MuiPaper-root": {
          width: "90%",
          maxWidth: "550px",
          p: 3,
          gap: 4,
          backgroundColor: "dark.dark",
        },
      }}
    >
      <DialogTitle
        sx={{ borderBottom: `1.5px solid ${grey[800]}`, p: 0, pb: 1 }}
      >
        {title}
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>{children}</DialogContent>

      <DialogActions sx={{ p: 0 }}>
        <Button onClick={handleClose} variant="outlined" color="inherit">
          منصرف شدم
        </Button>
        <Button disabled={!canSave} sx={{'&.Mui-disabled': {opacity: '.6', color:'primary.contrastText', bgcolor:'primary.light'}}} type="submit" variant="contained">
          ذخیره
        </Button>
      </DialogActions>
    </Dialog>
  );
}