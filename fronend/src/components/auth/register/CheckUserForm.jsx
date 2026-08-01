import { TextField, Box, Typography, Button } from "@mui/material";

import { useForm } from "react-hook-form";
import { useState } from "react";

import { api } from "../../../services/api";
import { useAlert } from "../../../providers/AlertProvider";
import { useMultiStep } from "../../../providers/MultiStepProvider";

export default function CheckUserForm() {
  const { step, setStep, setStepData } = useMultiStep();
  const { showAlert, closeAlert } = useAlert();
  const [disabled, setDisabled] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: { identifier: "" },
    disabled: disabled,
  });

  async function onSubmit(data) {
    setDisabled(true);

    const payload = {
      identifier: data.identifier,
      intent: "register",
    };

    try {
      const checkUserResponse = await api.post("auth/check-user/", payload);

      const res = await api.post("auth/otp/send/", payload);
      setStepData("checkUser", {
        identifier: data.identifier,
        identifier_type: checkUserResponse.data.identifier_type,
        ttl: res.data["ttl"],
      });
      setStep("verifyCode");
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
          flex: 1,
          flexBasis: "50%",
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          fontSize={27}
          fontWeight="bold"
          color="primary"
        >
          ایجاد حساب کاربری
        </Typography>
        <Typography sx={{ mt: 2 }}>
          لطفا شماره موبایل یا ایمیل خود را وارد کنید.
        </Typography>

        <TextField
          {...register("identifier")}
          sx={{ my: 3 }}
          fullWidth
          variant="outlined"
          error={!!errors.identifier}
          helperText={errors.identifier?.message}
        />

        <Button disabled={disabled} type="submit" variant="contained" fullWidth>
          ایجاد حساب کاربری
        </Button>
      </Box>
    </>
  );
}
