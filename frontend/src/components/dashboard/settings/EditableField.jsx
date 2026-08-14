import { Typography, Box, Button, Input } from "@mui/material";

import { useForm, FormProvider } from "react-hook-form";
import EditIcon from "@mui/icons-material/Edit";
import { useEffect, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { handleRequestError } from "../../../utils/handleRequestError";

import RHFTextField from "../../ui/RHFTextField";
import { useAlert } from "../../../providers/AlertProvider";
import { api } from "../../../services/api";

import FormDialog from "../../ui/FormDialog";
import SettingPlaceHolder from "./SettingPlaceholder";

export default function EditableField({
  fieldKey,
  label,
  helper,
  defaultValue = "",
  InputComponent,
  SettingControl,
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { showAlert, closeAlert } = useAlert();
  const formMethods = useForm({
    defaultValues: { [fieldKey]: "" },
  });
  const { handleSubmit, reset, setError, formState: {isDirty} } = formMethods;

  useEffect(() => {
    reset({ [fieldKey]: defaultValue });
  }, [reset, fieldKey, defaultValue]);

  async function onValid(data) {
    closeAlert();
    try {
      const res = await api.post("auth/settings/", data);
      queryClient.setQueryData(["user"], res.data);
      showAlert({ message: "اطلاعات با موقیت دخیره شد.", severity: "success" });
      setOpen(false)
    } catch (error) {
      handleRequestError(error, showAlert, setError);
    }
  }

  return (
    <>
      <FormDialog
        onSubmit={handleSubmit(onValid)}
        open={open}
        handleClose={() => setOpen(false)}
        title={label}
        canSave={isDirty}
      >
        <FormProvider {...formMethods}>
          <InputComponent />
        </FormProvider>
      </FormDialog>

      <SettingPlaceHolder
        onClick = {() => setOpen(true)}
        label={label}
        helper={helper}
        SettingControl={SettingControl}
      />

      {/* <Box
        onClick={() => setOpen(true)}
        sx={{ display: "flex", justifyContent: "space-between" }}
      >
        <Box>
          <Typography variant="h6">{label}</Typography>
          <Typography color="textDisabled">{helper}</Typography>
        </Box>

        <EditComponent />
      </Box> */}
    </>
  );
}
