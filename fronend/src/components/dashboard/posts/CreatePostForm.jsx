import { Box, TextField } from "@mui/material";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { handleRequestError } from "../../../utils/handleRequestError";

import { useCreatePostMutations } from "../../../services/mutations";
import { useAlert } from "../../../providers/AlertProvider";
import { useNavigate } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import postSchema from "../../../schemas/postSchema";

import RHFTextField from "../../ui/RHFTextField";
import RHFTextEditor from "../../ui/RHFTextEditor";
import LoadingButton from "../../ui/LoadingButton";

export default function CreatePostForm() {
  const mutation = useCreatePostMutations();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const methods = useForm({
    defaultValues: {
      title: "",
      content: "",
      status: "published",
    },
    resolver: zodResolver(postSchema),
    disabled: mutation.isPending,
  });

  const {
    register,
    handleSubmit,
    control,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid, disabled },
  } = methods;

  const onValid = async (data) => {
    try {
      const payload = {
        ...data,
      };

      const res = await mutation.mutateAsync(payload);
      showAlert({ message: "پست با موفقیت ایجاد شد", severity: "success" });
      navigate(`/dashboard/posts/${res.data.slug}`);
    } catch (err) {
      handleRequestError(err, showAlert, setError);
    }
  };

  const status = watch("status");

  return (
    <FormProvider {...methods}>
      <Box
        onSubmit={handleSubmit(onValid)}
        component="form"
        sx={{ display: "flex", flex: 1, flexDirection: "column", gap: 2 }}
      >
        <RHFTextField
          label="عنوان پست"
          name="title"
          variant="outlined"
          helperText={["باید حداقل 10 کاراکتر باشد.", "باید حداکثر 100 کاراکتر باشد."]}
          disabled={disabled}
          showLength={true}
        />

        <RHFTextEditor
          name="content"
          disabled={disabled}
          helperText={"باید حداقل 300 کاراکتر باشد."}
        />

        <Box sx={{ display: "flex", gap: 1.5, my: 1, alignSelf: "flex-end" }}>
          <LoadingButton
            type="submit"
            variant="outlined"
            onClick={() => setValue("status", "draft", { shouldValidate: true })}
            disabled={disabled || !isValid}
            loading={isSubmitting && status == "draft"}
          >
            ذخیره به عنوان پیش نویس
          </LoadingButton>
          <LoadingButton
            type="submit"
            variant="contained"
            onClick={() => setValue("status", "published", { shouldValidate: true })}
            disabled={disabled || !isValid}
            loading={isSubmitting && status == "published"}
          >
            انتشار
          </LoadingButton>
        </Box>
      </Box>
    </FormProvider>
  );
}
