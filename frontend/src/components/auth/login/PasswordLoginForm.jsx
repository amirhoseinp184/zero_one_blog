import { TextField, Box, Typography, Button, ButtonBase } from "@mui/material";
import { useNavigate } from "react-router";

import { useForm } from "react-hook-form";
import { useState } from "react";

import { api } from "../../../services/api";
import { useAlert } from "../../../providers/AlertProvider";
import { useMultiStep } from "../../../providers/MultiStepProvider";
import { useAuth } from "../../../providers/AuthProvider";
import { handleRequestError } from "../../../utils/handleRequestError";

export default function PasswordLoginForm() {
  const navigator = useNavigate();
  const { setAuthToken } = useAuth();
  const { step, setStep, setStepData, getStepData } = useMultiStep();
  const { showAlert, closeAlert } = useAlert();

  const [disabled, setDisabled] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: { password: "" },
    disabled: disabled,
  });
  const { identifier, verifyOptions: otherOptions } = getStepData("checkUser");

  const isThereOtherOptions =
    Boolean(otherOptions["email"]) || Boolean(otherOptions["phone"]);

  async function onSubmit(data) {
    setDisabled(true);

    const password = data["password"];
    const payload = {
      identifier,
      password,
    };

    try {
      const res = await api.post("auth/login/password/", payload);
      setAuthToken(res.data["token"]);
      navigator("/");
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
          textAlign="center"
        >
          رمز عبور را وارد نمایید
        </Typography>

        <TextField
          {...register("password")}
          sx={{ my: 3 }}
          fullWidth
          variant="outlined"
          error={!!errors.password}
          helperText={errors.password?.message}
          label="رمز عبور"
        />

        <Button disabled={disabled} type="submit" variant="contained" fullWidth>
          ورود به حساب کاربری
        </Button>

        {isThereOtherOptions && (
          <ButtonBase
            onClick={() => setStep("otherLoginOptions")}
            sx={{
              width: "fit-content",
              mx: "auto",
              mt: 5,
              fontSize: 15,
              p: 0.5,
              borderRadius: "4px",
            }}
          >
            ورود با سایر روش ها
          </ButtonBase>
        )}
      </Box>
    </>
  );
}
