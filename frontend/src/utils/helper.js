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


export function formatDate(date){  
  if (!(date instanceof Date)){
    if (typeof(date) === 'string' || typeof(date) === 'number'){
      date = new Date(date)
    }else {
      throw Error("Unsupported Date format, valid formats are Date object, iso string and timestamp")
    }
  }

  const diffInMs = new Date() - date

  const MINUTE_MS = 60 * 1000
  const HOUR_MS = 60 * MINUTE_MS
  const DAY_MS = 24 * HOUR_MS
  const MONTH_MS = 30 * DAY_MS
  const YEAR_MS = 365 * DAY_MS

  if (diffInMs <= MINUTE_MS) return 'کمتر از یک دقیقه پیش'
  if (diffInMs <= HOUR_MS) return `${Math.trunc(diffInMs / MINUTE_MS)} دقیقه پیش`
  if (diffInMs <= DAY_MS) return `${Math.trunc(diffInMs / HOUR_MS)} ساعت پیش`
  if (diffInMs <= MONTH_MS) return `${Math.trunc(diffInMs / DAY_MS)} ماه پیش`
  if (diffInMs <= YEAR_MS) return `${Math.trunc(diffInMs / MONTH_MS)} سال پیش`

}