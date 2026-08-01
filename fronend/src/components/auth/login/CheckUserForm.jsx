import { TextField, Box, Typography, Button } from "@mui/material";

import { useForm } from "react-hook-form";
import { useState } from "react";

import { api } from "../../../services/api";
import { useAlert } from "../../../providers/AlertProvider";
import { handleRequestError } from "../../../utils/handleRequestError";
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
    closeAlert();
    const identifier = data.identifier;
    const payload = {
      identifier,
      intent: "login",
    };

    try {
      const checkRes = await api.post("auth/check-user/", payload);
      const { verify_options: verifyOptions, identifier_type } = checkRes.data;
      const baseStepData = {
        identifier,
        identifier_type,
        verifyOptions,
      };

      setStepData("checkUser", baseStepData);
      if (verifyOptions["password"]) {
        setStep("passwordLogin");
        return;
      }

      let ttl = null;
      let channel = null;
      let stepData = { ...baseStepData };

      if (identifier_type === "username") {

        if (verifyOptions["email"]) {
          stepData["codeTarget"] = verifyOptions["email"];
          stepData["codeTargetType"] = "email";
          channel = "email";
        } else {
          stepData["codeTarget"] = verifyOptions["phone"];
          stepData["codeTargetType"] = "phone";
          channel = "phone";
        }
        const res = await api.post("auth/otp/send/", {
          identifier: data.identifier,
          intent: "login",
          channel,
        });
        ttl = res.data.ttl;
      } else {
        stepData["codeTarget"] = identifier;
        stepData["codeTargetType"] = identifier_type;
        const res = await api.post("auth/otp/send/", payload);
        ttl = res.data.ttl;
      }

      setStepData("checkUser", {
        ...stepData,
        ttl,
        channel
      });
      setStep("codeLogin");
    } catch (err) {
      handleRequestError(err, showAlert, setError);
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
          ورود به حساب کاربری
        </Typography>
        <Typography sx={{ mt: 2 }}>
          نام کاربری یا شماره موبایل یا ایمیل خود را وارد کنید.
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
          ورود به حساب کاربری
        </Button>
      </Box>
    </>
  );
}
