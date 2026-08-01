import { TextField, Box, Typography, Button, ButtonBase } from "@mui/material";
import { useNavigate } from "react-router";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";

import { api } from "../../../services/api";
import { useAlert } from "../../../providers/AlertProvider";
import { useMultiStep } from "../../../providers/MultiStepProvider";
import { useAuth } from "../../../providers/AuthProvider";
import { handleRequestError } from "../../../utils/handleRequestError";

export default function CodeLoginForm() {
  const navigator = useNavigate();
  const { setAuthToken } = useAuth();
  const { step, setStep, setStepData, getStepData } = useMultiStep();
  const { showAlert, closeAlert } = useAlert();

  const [disabled, setDisabled] = useState(false);
  const [ttl, setTtl] = useState(() => getStepData("checkUser")["ttl"]);
  const { identifier, codeTarget, codeTargetType, channel, verifyOptions:otherOptions } =
    getStepData("checkUser");

  const isThereOtherOptions =
    Boolean(otherOptions["email"]) || Boolean(otherOptions["phone"]);
  

  let message = "";
  if (codeTargetType == "email") {
    message = `یک کد تایید برای آدرس ایمیل ${codeTarget} ارسال شد.`;
  } else {
    // message = `یک کد تایید برای شماره موبایل ${codeTarget} ارسال شد.`;
    // message = `یک کد تایید برای شماره موبایل <span>${codeTarget}</span> ارسال شد.`
    message = <>
     یک کد تایید برای شماره موبایل 
      {' '}<span dir="ltr">{codeTarget}</span>{' '}
      ارسال شد.
    </>
  }

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: { code: "" },
    disabled: disabled,
  });

  async function onSubmit(data) {
    setDisabled(true);
    closeAlert();

    const code = data["code"];

    let payload = {
      identifier,
      intent: "login",
      code,
    };
    if (channel) {
      payload["channel"] = channel;
    }

    try {
      const res = await api.post("auth/otp/verify/", payload);
      setAuthToken(res.data["token"]);
      showAlert({ message: "با موفقیت وارد شدید.", severity: "success" });
      navigator("/");
    } catch (err) {
      handleRequestError(err, showAlert, setError);
    } finally {
      setDisabled(false);
    }
  }

  async function handleResendClick() {
    let payload = {
      identifier,
      intent: "login",
    };
    if (channel) {
      payload["channel"] = channel;
    }

    try {
      const res = await api.post("auth/otp/send/", payload);
      showAlert({ message: "کد با موفقیت ازسال شد.", severity: "success" });
      setTtl(res.data["ttl"]);
    } catch (err) {
      if (err.request) {
        showAlert({
          message: "مشکلی در انجام درخواست وجود دارد لطفا صقحه را رفرش کنید.",
          severity: "error",
        });
      }

      if (err.response.data.type === "client_error") {
        showAlert({ message: errors[0].message, severity: "error" });
      }
    } finally {
      setDisabled(false);
    }
  }

  useEffect(() => {
    if (ttl <= 0) return;
    const intervalId = setInterval(() => {
      setTtl(ttl - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [ttl]);

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
          کد تائید را وارد کنید
        </Typography>

        <Typography component="p" textAlign="center" sx={{ mt: 2 }}>
          {message}
        </Typography>

        <TextField
          {...register("code")}
          sx={{ my: 3 }}
          fullWidth
          variant="outlined"
          error={!!errors.code}
          helperText={errors.code?.message}
          label="کد تایید"
        />

        <Button disabled={disabled} type="submit" variant="contained" fullWidth>
          ورود به حساب کاربری
        </Button>
        <ButtonBase
          disabled={ttl > 0}
          onClick={() => !(ttl > 0) && handleResendClick()}
          disableRipple={true}
          sx={{
            width: "fit-content",
            mx: "auto",
            mt: 5,
            "&.Mui-disabled": { opacity: "60%" },
          }}
        >
          {ttl > 0 ? `${ttl} ثانیه تا` : " "} ارسال مجدد کد
        </ButtonBase>

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
