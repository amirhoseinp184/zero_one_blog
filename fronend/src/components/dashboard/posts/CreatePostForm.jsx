import { Box, Button, FormHelperText, TextField, CircularProgress } from "@mui/material";
import StarterKit from "@tiptap/starter-kit";
import {
  MenuButtonBold,
  MenuButtonItalic,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  RichTextEditor,
} from "mui-tiptap";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { useCreatePostMutations } from "../../../services/mutations";
import { useAlert } from "../../../providers/AlertProvider";

const EDITOR_EXTENTIONS = [StarterKit]

export default function CreatePostForm() {
  const rteRef = useRef(null);
  const mutation = useCreatePostMutations();
  const { showAlert } = useAlert();
  const [submittingStatus, setSubmittingStatus] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const onSubmitWithStatus = (status) => {
    return handleSubmit(async (data) => {
      try {
        setSubmittingStatus(status);
        const payload = {
          ...data,
          status,
        };

        await mutation.mutateAsync(payload)
        showAlert({ message: "پست با موفقیت ایجاد شد", severity: "success" });
      } catch (err) {
        showAlert({ message: "خظایی در ثبت پست وجود داشت، لطفا صفحه را رفرش کنید." });
      } finally {
        setSubmittingStatus(null);
      }
    });
  };

  const isPending = mutation.isPending || mutation.isLoading;

  return (
    <Box component="form" sx={{ display: "flex", flex: 1, flexDirection: "column", gap: 2 }}>
      {/* Title Field */}
      <TextField
        label="عنوان پست"
        {...register("title", { required: "لطفا عنوان پست را وارد کنید" })}
        error={!!errors.title}
        helperText={errors.title?.message}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 1,
            "& fieldset": {
              borderWidth: 1,
            },
            "&.Mui-focused fieldset": {
              borderWidth: 2,
            },
          },
        }}
      />

      {/* Rich Text Editor Field */}
      <Controller
        name="content"
        control={control}
        rules={{
          required: "محتوای پست نمی‌تواند خالی باشد",
          validate: (value) => value !== "<p></p>" || "لطفا محتوای پست را وارد کنید",
        }}
        render={({ field }) => (
          <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <RichTextEditor
              ref={rteRef}
              extensions={EDITOR_EXTENTIONS}
              content={field.value}
              onUpdate={({ editor }) => {
                field.onChange(editor.getHTML());
              }}
              sx={(theme) => ({
                borderRadius: 1,
                "& .MuiTiptap-FieldContainer-notchedOutline, &:hover .MuiTiptap-FieldContainer-notchedOutline":
                  {
                    borderColor: errors.content ? theme.palette.error.main : theme.palette.primary,
                    borderWidth: 1,
                  },

                "& .MuiTiptap-FieldContainer-root.Mui-focused .MuiTiptap-FieldContainer-notchedOutline, &:focus-within .MuiTiptap-FieldContainer-notchedOutline":
                  {
                    borderWidth: 2,
                  },
                overflow: "hidden",
                display: "flex",
                flex: 1,
                flexDirection: "column",
                borderColor: errors.content ? "error.main" : "divider",
                "& .MuiTiptap-RichTextContent-root": {
                  flex: 1,
                  minHeight: 200,
                  overflowY: "auto",
                  overflowX: "hidden",
                },
              })}
              renderControls={() => (
                <MenuControlsContainer>
                  <MenuSelectHeading />
                  <MenuDivider />
                  <MenuButtonBold />
                  <MenuButtonItalic />
                </MenuControlsContainer>
              )}
            />
            {errors.content && (
              <FormHelperText error sx={{ mx: 1.5, mt: 0.5 }}>
                {errors.content.message}
              </FormHelperText>
            )}
          </Box>
        )}
      />

      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 1.5, my: 1, alignSelf: "flex-end" }}>
        <Button
          type="submit"
          variant="outlined"
          disabled={isPending}
          onClick={onSubmitWithStatus("draft")}
          sx={{ height: "100%" }}
        >
          ذخیره به عنوان پیش نویس
          {submittingStatus === "draft" && (
            <CircularProgress
              sx={{
                position: "absolute",
                inset: 0,
                m: "auto",
                display: "block",
              }}
              size={24}
            />
          )}
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isPending}
          onClick={onSubmitWithStatus("published")}
          sx={{ position: "relative" }}
        >
          انتشار
          {submittingStatus === "published" && (
            <CircularProgress
              sx={{
                position: "absolute",
                inset: 0,
                m: "auto",
                display: "block",
              }}
              size={24}
            />
          )}
        </Button>
      </Box>
    </Box>
  );
}
