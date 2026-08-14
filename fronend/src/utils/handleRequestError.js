import * as z from "zod";
import validator from "validator";


export function handleRequestError(err, showAlert, setError) {
  if (!err.response) {
    showAlert({ message: "مشکلی در انجام درخواست پیش آمد." });
  } else {
    const response = err.response.data;

    if (response.type === "client_error") {
      showAlert({ message: response.message, severity: "error" });
    } else if (response.type === "validation_error") {
      for (let error of response.errors) {
        setError(error.field_name, { message: error.message });
      }
    }
  }
}
