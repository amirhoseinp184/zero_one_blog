import {
  ButtonBase,
  Avatar,
  Badge,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { useState } from "react";
import { useUpdateSettingsMutations } from "../../services/mutations";
import { dataURLtoBlob } from "../../utils/helper";

import ImageCropperModal from "../ImageCropperModel";

const defaultRootSx = {
  "&.MuiBadge-root": { borderRadius: "60px", width: "fit-content" },
  "& .MuiBadge-badge": {
    top: "50%",
    left: "-70px",
    right: "initial",
  },
};
const defaultAvatarSx = {
  width: 60,
  height: 60,
  position: "relative",
  "::before": {
    content: '""',
    position: "absolute",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    transition: "all .3s",
  },
  ":hover::before": {
    backgroundColor: "rgba(0,0,0,.3)",
  },
};

function DeleteImageModal({ open, onClose, onDelete }) {
  return (
    <Dialog
      fullWidth
      sx={(theme) => {
        return {
          ".MuiPaper-root": {
            background: theme.palette.dark?.light,
            borderRadius: 2,
            p: 0.5,
          },
        };
      }}
      open={open}
      onClose={onClose}
    >
      <DialogTitle>حذف عکس</DialogTitle>
      <DialogContent>آیا از حذف عکس مطمئن هستید؟</DialogContent>
      <DialogActions>
        <Button
          sx={{
            borderColor: "common.white", // theme.palette.common.black
            color: "common.white", // theme.palette.common.white,
            transition: "all .3s",
            "&:hover": { bgcolor: "common.white", color: "common.black" },
          }}
          onClick={onClose}
          variant="outlined"
        >
          لغو
        </Button>
        <Button variant="contained" color="error" onClick={onDelete}>
          حذف عکس
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function mergeSx(base, extra) {
  if (!extra) return base;
  if (Array.isArray(extra)) return [base, ...extra];
  return [base, extra];
}

export default function UploadAvatar({
  rootProps = {},
  avatarProps = {},
  inputProps = {},
  defaultAvatarUrl = null,
}) {
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [image, setImage] = useState(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [deleteImageOpen, setDeleteImageOpen] = useState(false);
  const mutation = useUpdateSettingsMutations();

  const { sx: rootSx, ...rootOther } = rootProps;
  const hasProfile = Boolean(avatarSrc || defaultAvatarUrl);

  const {
    sx: avatarSx,
    alt = "Upload new avatar",
    ...avatarOther
  } = avatarProps;
  const { onChange: inputOnChange, inputOther } = inputProps;

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setCropperOpen(true);
  }

  function handleImageCrop(imageDataUrl) {
    setImage(null);
    setAvatarSrc(imageDataUrl);
    setCropperOpen(false);

    const blob = dataURLtoBlob(imageDataUrl);
    const formData = new FormData();
    formData.append("avatar", blob, image.name);

    mutation.mutate(formData);
  }

  function handleDeleteAvatar(e) {
    mutation.mutate({ avatar: null });
  }

  return (
    <>
      <ImageCropperModal
        image={image}
        open={cropperOpen}
        onClose={() => setCropperOpen(false)}
        onImageCrop={handleImageCrop}
      />

      <DeleteImageModal
        open={deleteImageOpen}
        onClose={() => setDeleteImageOpen(false)}
        onDelete={() => {
          handleDeleteAvatar();
          setDeleteImageOpen(false);
        }}
      />

      <Badge
        badgeContent={
          <ButtonBase onClick={() => setDeleteImageOpen(true)}>
            <Typography color="error" fontSize={13}>
              حذف
            </Typography>
          </ButtonBase>
        }
        invisible={!hasProfile}
        {...rootOther}
        sx={mergeSx(defaultRootSx, rootSx)}
      >
        <ButtonBase
          disableRipple
          component="label"
          sx={{ borderRadius: "100%" }}
        >
          <Avatar
            src={avatarSrc || defaultAvatarUrl}
            {...avatarOther}
            alt={alt}
            sx={mergeSx(defaultAvatarSx, avatarSx)}
          />
          <input
            {...inputOther}
            onChange={handleFileUpload}
            type="file"
            style={visuallyHidden}
          />
        </ButtonBase>
      </Badge>
    </>
  );
}
