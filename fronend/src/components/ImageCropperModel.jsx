import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Skeleton,
  Button,
} from "@mui/material";

import ReactCrop, {
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
} from "react-image-crop";
import { setCanvasPreview } from "../utils/setCanvasPreview";


const MIN_DIMENTION = 150;
const MAX_DIMENTION = 300;
const ASPECT_RATIO = 1;


export default function ImageCropperModal({
  image,
  onImageCrop,
  open,
  onClose,
}) {
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [crop, setCrop] = useState();
  const [imageDataUrl, SetimageDataUrl] = useState(null);
  const isImageLoading = !Boolean(imageDataUrl);

  useEffect(() => {
    if (!image) return;

    const reader = new FileReader();
    reader.onload = async () => {
      SetimageDataUrl(reader.result);
    };
    reader.readAsDataURL(image);
  }, [image]);

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    const cropWidthInPercent = (MIN_DIMENTION / width) * 100;

    const crop = makeAspectCrop(
      {
        unit: "%",
        width: cropWidthInPercent,
      },
      ASPECT_RATIO,
      width,
      height
    );
    const centeredCrop = centerCrop(crop, width, height);
    setCrop(centeredCrop);
  }

  return (
    <Dialog
      sx={(theme) => {
        return {
          ".MuiPaper-root": {
            background: theme.palette.dark?.light,
            borderRadius: 2,
          },
        };
      }}
      open={open}
      onClose={onClose}
    >
      <DialogContent sx={{ p: 2, pb: 1 }}>
        {!isImageLoading ? (
          <ReactCrop
            crop={crop}
            minWidth={MIN_DIMENTION}
            maxWidth={MAX_DIMENTION}
            aspect={ASPECT_RATIO}
            circularCrop={true}
            keepSelection={true}
            onChange={(pixelCrop, percentCrop) => {
              setCrop(percentCrop);
            }}
          >
            <img src={imageDataUrl} onLoad={onImageLoad} ref={imgRef} />
          </ReactCrop>
        ) : (
          <Skeleton
            width={552}
            height={368}
            sx={{ borderRadius: 2 }}
            variant="rounded"
          />
        )}

        {crop ? (
          <canvas
            style={{ display: "none", width: "150px", height: "150px" }}
            ref={previewCanvasRef}
          ></canvas>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", mb: 1 }}>
        <Button disabled={isImageLoading} variant="outlined" color="primary">
          لغو
        </Button>
        <Button
          onClick={() => {
            setCanvasPreview(
              imgRef.current,
              previewCanvasRef.current,
              convertToPixelCrop(
                crop,
                imgRef.current.width,
                imgRef.current.height
              )
            );
            onImageCrop?.(previewCanvasRef.current.toDataURL());
          }}
          disabled={isImageLoading}
          variant="contained"
          color="primary"
        >
          ذخیره
        </Button>
      </DialogActions>
    </Dialog>
  );
}
