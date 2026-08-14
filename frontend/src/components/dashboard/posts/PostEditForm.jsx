import { useRef, useState } from "react";
import { useEditPostMutations } from "../../../services/mutations";
import { useNavigate } from "react-router";

import { useForm, Controller, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useAlert } from "../../../providers/AlertProvider";
import LoadingButton from "../../ui/LoadingButton";
import RHFTextField from "../../ui/RHFTextField";
import RHFTextEditor from "../../ui/RHFTextEditor";
import postSchema from "../../../schemas/postSchema";

export default function PostEditForm(props) {
  const { title, content, status, slug } = props;
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const mutation = useEditPostMutations();
  const defaultValues = { title, content, status };
  const methods = useForm({ defaultValues, resolver: zodResolver(postSchema), mode: "onChange" });
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isSubmitting, isValid },
  } = methods;

  const onValid = async (data) => {
    try {
      await mutation.mutateAsync({ slug, data });
      showAlert({ message: "پست با موفقیت ذخیره شد.", severity: "success" });
      navigate(`/dashboard/posts/${slug}`);
    } catch (err) {
      showAlert({ message: "خظایی در ذخیره پست وجود داشت، لطفا صفحه را رفرش کنید." });
    }
  };

  return (
    <FormProvider {...methods}>
      <Box
        sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}
        component="form"
        onSubmit={handleSubmit(onValid)}
      >
        <RHFTextField
          label="عنوان پست"
          name="title"
          variant="outlined"
          helperText={["باید حداقل 10 کاراکتر باشد.", "باید حداکثر 100 کاراکتر باشد."]}
          showLength={true}
          disabled={isSubmitting}
        />

        <RHFTextEditor
          name="content"
          helperText={"باید حداقل 300 کاراکتر باشد."}
          disabled={isSubmitting}
        />

        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <FormControl disabled={isSubmitting} fullWidth>
              <InputLabel id="status">وضعیت</InputLabel>
              <Select {...field} labelId="status" label="وضعیت">
                <MenuItem value="draft">پیش نویش</MenuItem>
                <MenuItem value="published">انتشار</MenuItem>
              </Select>
            </FormControl>
          )}
        />

        <LoadingButton
          type="submit"
          color="warning"
          variant="outlined"
          disabled={!isDirty || isSubmitting || !isValid}
          sx={{ ml: "auto", display: "block" }}
          loading={isSubmitting}
        >
          ذخیره
        </LoadingButton>
      </Box>
    </FormProvider>
  );
}
