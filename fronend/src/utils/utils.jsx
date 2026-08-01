export function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];

  const decodedStr = atob(arr[1]);
  const u8arr = new Uint8Array(decodedStr.length);

  let i = decodedStr.length;
  while (i--) {
    u8arr[i] = decodedStr.charCodeAt(i);
  }  
  return new Blob([u8arr], {type:mime})
}
