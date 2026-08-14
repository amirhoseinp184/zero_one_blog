import { Box, TextField, Typography, Button } from "@mui/material";

import { useMultiStep } from "../../../providers/MultiStepProvider";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useAlert } from "../../../providers/AlertProvider";
import { api } from "../../../services/api";
import { useAuth } from "../../../providers/AuthProvider";

export default function VerifyCodeForm() {
  const { setAuthToken } = useAuth();
  const { showAlert, closeAlert } = useAlert();
  const { step, setStep, getStepData } = useMultiStep();
  const { identifier_type, identifier } = getStepData("checkUser");
  const [disabled, setDisabled] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ code: "" });

  async function onSubmit(data) {
    setDisabled(true);

    try {
      const payload = { identifier, intent: "register", code: data["code"] };
      const res = await api.post("auth/otp/verify/", payload);
      setAuthToken(res.data["token"]);
      setStep("completeProfile");
    } catch (err) {
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
    } finally {
      setDisabled(false);
    }
  }

  let message = null;
  if (identifier_type === "email") {
    message = `یک کد تایید برای آدرس ایمیل ${identifier} ارسال شد.`;
  } else if (identifier_type === "phone") {
    message = `یک کد تایید برای شماره موبایل ${identifier} ارسال شد.`;
  }

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          width: "80%",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 3,
          flex: 1,
          flexBasis: "60%",
        }}
      >
        <Typography
          variant="h4"
          component="h4"
          fontWeight="bold"
          color="primary"
          textAlign="center"
        >
          کد تائید را وارد کنید
        </Typography>
        <Typography variant="body1">{message}</Typography>
        <TextField
          {...register("code")}
          error={!!errors.code}
          helperText={errors.code?.message}
          sx={{ mt: 0 }}
        />
        <Button disabled={disabled} type="submit" variant="contained" fullWidth>
          تایید و ادامه
        </Button>
      </Box>
    </>
  );
}
