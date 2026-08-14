import { useState, memo, createContext, useContext } from "react";
import { Snackbar, Slide, Alert } from "@mui/material";


const alertContext = createContext()


const SlideTransition = memo(function SlideTransition(props) {
  return <Slide {...props} direction="down" />;
})


export function useAlert() {
  const ctx = useContext(alertContext)

  if(!ctx){
    throw Error('useAlert must be used inside an AlertProvider.')
  }
  return ctx
}


export function AlertProvider({children}){
  const [show, setShow] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [severity, setSeverity] = useState(null)
  const [autoHideDuration, setAutoHideDuration] = useState(2000) 

  function showAlert({message, severity="error", autoHideDuration=2000}){
    setAlertMessage(message)
    setSeverity(severity)
    setShow(true)
    setAutoHideDuration(autoHideDuration)
  }

  function closeAlert(){
    setAlertMessage(null)
    setSeverity(null)
    setShow(false)
  }


  function AuthAlert() {
    return (
      <Snackbar
        autoHideDuration={autoHideDuration}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={show}
        onClose={closeAlert}
        slots={{ transition: SlideTransition }}
      >
        <Alert
          icon={null}
          severity={severity}
          onClose={closeAlert}
          variant="filled"
          sx={{
            justifyContent:'space-between',
            alignItems: 'center',
            gap:'10px',
            px: 2,
            py: 1.5,
            '.MuiAlert-icon, .MuiAlert-message, .MuiAlert-action, .MuiAlert-action .MuiButtonBase-root': {
              p:0,
              m:0
            }

          }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    );
  }

  const context =  { showAlert, closeAlert, AuthAlert };

  return (
    <alertContext.Provider value={context}>
      <AuthAlert/>
      {children}
    </alertContext.Provider>
  )
}