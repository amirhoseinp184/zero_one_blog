import { Box, List, ListItem, ListItemButton } from "@mui/material";
import { useMultiStep } from "../../../providers/MultiStepProvider";
import { api } from "../../../services/api";

export default function OtherLoginOptions() {
  const { setStep, getStepData, setStepData } = useMultiStep();
  const { verifyOptions: loginOptions, identifier } = getStepData("checkUser");

  function handlePasswordClick() {
    setStep("passwordLogin");
  }

  async function handleCodeLoginClick(channel) {
    const BaseStepData = getStepData("checkUser");
    const payload = {
      identifier,
      intent: "login",
      channel: channel,
    };

    const res = await api.post("auth/otp/send/", payload);

    setStepData("checkUser", {
      ...BaseStepData,
      codeTarget: BaseStepData.verifyOptions[channel],
      codeTargetType: channel,
      channel,
      ttl: res.data.ttl,
    });
    setStep("codeLogin");
  }

  return (
    <>
      <Box
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
        <Box>
          <List>
            {loginOptions.password && (
              <ListItem>
                <ListItemButton
                  onClick={handlePasswordClick}
                  sx={(theme) => ({
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    p: 2,
                    justifyContent: "center",
                    "&.Mui-focusVisible": {
                      borderColor: "primary.main",
                      background: "initial",
                    },
                  })}
                >
                  ورود با رمز عبور
                </ListItemButton>
              </ListItem>
            )}

            {loginOptions.email && (
              <ListItem>
                <ListItemButton
                  onClick={() => handleCodeLoginClick("email")}
                  sx={(theme) => ({
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    p: 1.5,
                    justifyContent: "center",
                    "&.Mui-focusVisible": {
                      borderColor: "primary.main",
                      background: "initial",
                    },
                    fontSize: 14,
                  })}
                >
                  <span style={{ textAlign: "center" }}>
                    ارسال رمز یکبار مصرف به آدرس ایمیل {loginOptions.email}
                  </span>
                </ListItemButton>
              </ListItem>
            )}

            {loginOptions.phone && (
              <ListItem>
                <ListItemButton
                  onClick={() => handleCodeLoginClick("phone")}
                  sx={(theme) => ({
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    p: 1.5,
                    justifyContent: "center",
                    "&.Mui-focusVisible": {
                      borderColor: "primary.main",
                      background: "initial",
                    },
                  })}
                >
                  ارسال رمز یکبار مصرف به شماره موبایل 
                  {' '}<span dir="ltr">{loginOptions.phone}</span>
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Box>
      </Box>
    </>
  );
}
