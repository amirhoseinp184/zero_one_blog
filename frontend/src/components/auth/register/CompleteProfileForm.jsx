import { useAlert } from "../../../providers/AlertProvider";
import { Box, TextField, Button } from "@mui/material";
import UploadAvatar from "../../dashboard/settings/UploadAvatar";
import { useNavigate } from "react-router";

import { useForm, Controller } from "react-hook-form";

import { api } from "../../../services/api";

export default function CompleteProfileForm() {
  const navigator = useNavigate();
  const { showAlert, closeAlert } = useAlert();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setError,
  } = useForm({ defaultValues: { username: "", name: "" } });

  async function onSubmit(data) {
    try {
      const payload = {};
      for (let [item, value] of Object.entries(data)) {
        if (value) {
          payload[item] = value;
        }
      }
      await api.post("auth/settings/", payload);
      navigator("/");
    } catch (err) {
      if (!err.response) {
        showAlert({ message: "مشکلی در انجام درخواست پیش آمد." });
      } else {
        const response = err.response.data;

        if (response.type === "client_error") {
          showAlert({ message: response.message, severity: "error" });
        } else if (response.type === "validation_error") {
          for (let error of response.errors) {
            setError(error["field_name"], { message: error["message"] });
          }
        }
      }
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
          gap: 5,
          flex: 1,
        }}
      >
        {/* <Avatar src="" sx={{ width: 90, height: 90 }} /> */}
        <Controller
          control={control}
          name="image"
          render={({ field: { ref, name, onBlur, onChange } }) => {
            return (
              <UploadAvatar
                inputProps={{
                  name,
                  ref,
                  onBlur,
                  onChange,
                }}
                avatarProps={{ sx: { width: 120, height: 120 } }}
                rootProps={{ sx: { mx: "auto" } }}
              />
            );
          }}
        />
        <TextField
          {...register("username")}
          error={!!errors.username}
          helperText={errors.username?.message}
          label="نام کاربری"
          sx={{ mt: 0 }}
        />
        <TextField
          {...register("name")}
          error={!!errors.name}
          helperText={errors.name?.message}
          label="نام و نام خانوادگی"
          sx={{ mt: 0 }}
        />
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Button
            sx={{ flex: 1, bgcolor: "#757575" }}
            type="button"
            variant="contained"
          >
            رد کردن
          </Button>
          <Button sx={{ flex: 1 }} type="submit" variant="contained">
            تایید و ادامه
          </Button>
        </Box>
      </Box>
    </>
  );
}
