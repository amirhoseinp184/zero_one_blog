import WhiteBgLogo from "/src/assets/images/zero_one_white_background.png";

import { Container, Box, Typography, Button } from "@mui/material";

import { useMultiStep } from "../../providers/MultiStepProvider";

import CheckUserForm from "../../components/auth/login/CheckUserForm";
import PasswordLoginForm from '../../components/auth/login/PasswordLoginForm'
import CodeLoginForm from "../../components/auth/login/CodeLoginForm";
import OtherLoginOptions from "../../components/auth/login/OtherLoginOptions";
// import VerifyCodeForm from "../components/auth/register/VerifyCodeForm";
// import CompleteProfileForm from "../components/auth/register/CompleteProfileForm";

export default function RegisterPage() {
  const { step } = useMultiStep();
  // const step = 'otherLoginOptions'
  
  return (
    <>
      <Box
        sx={(theme) => ({
          display: "flex",
          flexDirection: "column",
          [theme.breakpoints.up("md")]: {
            flexDirection: "row",
          },
          height: "100vh",
        })}
      >
        <Box
          sx={(theme) => ({
            backgroundColor: theme.palette.primary.main,
            // flex: step === 'completeProfile' ? 0 : 1,
            flexBasis:
              step === "completeProfile"
                ? "0%"
                : step === "checkUser" || step === null
                ? "50%"
                : "40%",
            opacity: step === "completeProfile" ? 0 : 100,
            transition: "all .3s",
            minWidth: 0,
            overflow: "hidden",
            py: 5,
            [theme.breakpoints.up("md")]: {
              py: 0,
            },
          })}
        >
          <Container
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 3,
              height: "100%",
            }}
          >
            <img
              src={WhiteBgLogo}
              style={{ width: "110px" }}
              alt="website logo"
            />
            <Typography align="center" variant="h4" fontWeight="700">
              اینجا هر کسی میتونه بنویسه!
            </Typography>
            <Typography variant="h5" align="center" color="#222222" fontWeight="500">
              صدای تو مهم است — آن را همین‌جا منتشر کن.
            </Typography>
          </Container>
        </Box>

        <Box
          sx={(theme) => ({
            flex: 1,
          })}
        >
          <Container
            sx={(theme) => ({
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "center",
              height: "100%",
              py: 5,
              [theme.breakpoints.up("md")]: {
                py: 0,
              },
            })}
          >
            {step === null || step === "checkUser" ? <CheckUserForm /> : null}
            {step === 'passwordLogin' ? <PasswordLoginForm/> : null}
            {step === 'codeLogin' ? <CodeLoginForm/> : null}
            {step === 'otherLoginOptions' ? <OtherLoginOptions/> : null }
            {/* {step === "verifyCode" && <VerifyCodeForm />} */}
            {/* {step === "completeProfile" && <CompleteProfileForm />} */}

            {(step === "checkUser" || step === null) && (              
              <p>
                عضو نیستید ؟
                <Button
                  sx={(theme) => ({
                    transition: "all 0.3s",
                    ":hover": {
                      background: "transparent",
                      color: theme.palette.primary.dark,
                    },
                  })}
                  disableRipple
                >
                  ثبت نام کنید
                </Button>
              </p>
            )}
          </Container>
        </Box>
      </Box>
    </>
  );
}
