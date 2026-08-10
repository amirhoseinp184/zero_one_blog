import { useRef, useState } from "react";
import { useEditPostMutations } from "../../../services/mutations";
import { useNavigate } from "react-router";

import { useForm, Controller } from "react-hook-form";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useAlert } from "../../../providers/AlertProvider";

import StarterKit from "@tiptap/starter-kit";
import {
  MenuButtonBold,
  MenuButtonItalic,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  RichTextEditor,
} from "mui-tiptap";

export default function PostEditForm(props) {
  const [editable, setEditable] = useState(true);
  const { title, content, status, slug } = props;
  const rteRef = useRef(null);
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const mutation = useEditPostMutations();
  const defaultValues = { title, content, status };
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({ defaultValues });

  const onValid = async (data) => {
    try {
      setEditable(false);
      await mutation.mutateAsync({ slug, data });
      showAlert({ message: "پست با موفقیت ذخیره شد.", severity: "success" });
      setTimeout(() => {
        navigate(`/dashboard/posts/${slug}`);
      }, 2500);
    } catch (err) {
      showAlert({ message: "خظایی در ذخیره پست وجود داشت، لطفا صفحه را رفرش کنید." });
    }
  };

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}
      component="form"
      onSubmit={handleSubmit(onValid)}
    >
      <TextField
        disabled={!editable}
        label="عنوان پست"
        {...register("title")}
        sx={{
          width: "100%",
        }}
      />

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
              extensions={[StarterKit]}
              editable={editable}
              content={field.value}
              onUpdate={({ editor }) => {
                field.onChange(editor.getHTML());
              }}
              sx={(theme) => ({
                ".MuiTiptap-RichTextContent-root": {
                  transition: "all 0.2s",
                  opacity: editable ? 1 : 0.5,
                },
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

      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth>
            <InputLabel id="status">وضعیت</InputLabel>
            <Select {...field} labelId="status" label="وضعیت">
              <MenuItem value="draft">پیش نویش</MenuItem>
              <MenuItem value="published">انتشار</MenuItem>
            </Select>
          </FormControl>
        )}
      />

      <Box>
        <Button
          type="submit"
          color="warning"
          variant="outlined"
          disabled={!isDirty || isSubmitting || !editable}
          sx={{ ml: "auto", display: "block" }}
        >
          {isSubmitting && (
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
          ذخیره
        </Button>
      </Box>
    </Box>
  );
}
