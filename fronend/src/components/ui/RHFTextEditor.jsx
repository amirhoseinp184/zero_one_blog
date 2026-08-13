import { useRef } from "react";
import { Controller } from "react-hook-form";
import { Box, FormHelperText } from "@mui/material";

import StarterKit from "@tiptap/starter-kit";
import {
  MenuButtonBold,
  MenuButtonItalic,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  RichTextEditor,
} from "mui-tiptap";
import { useEditor } from "@tiptap/react";

export default function RHFTextEditor({
  name,
  helperText,
  disabled = false,
  minHeight = 200,
  sx,
  control,
  ...otherProps
}) {
  const rteRef = useRef(null);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const isError = !!error;
        const activeHelperText = error?.message ?? helperText;

        return (
          <Box sx={{ display: "flex", flexDirection: "column", flex: 1, ...sx }}>
            <RichTextEditor
              ref={rteRef}
              extensions={[StarterKit]}
              content={field.value ?? ""}
              editable={!disabled}
              onUpdate={({ editor }) => {
                const html = editor.isEmpty ? "" : editor.getHTML();
                field.onChange(html);
              }}
              sx={(theme) => ({
                display: "flex",
                flex: 1,
                flexDirection: "column",
                overflow: "hidden",
                "& .MuiTiptap-FieldContainer-notchedOutline": {
                  borderColor: isError ? "error.main" : "devider",
                },
                "&:hover .MuiTiptap-FieldContainer-notchedOutline": {
                  borderColor: isError ? theme.palette.error.main : null,
                  borderWidth: 1,
                },
                "& .MuiTiptap-FieldContainer-root.Mui-focused .MuiTiptap-FieldContainer-notchedOutline, &:focus-within .MuiTiptap-FieldContainer-notchedOutline":
                  {
                    borderWidth: 2,
                  },
                "& .MuiTiptap-RichTextContent-root": {
                  flex: 1,
                  minHeight,
                  overflowY: "auto",
                  overflowX: "hidden",
                  transition: "opacity 0.2s",
                  opacity: disabled ? 0.5 : 1,
                  "& .ProseMirror": {
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  },
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

            {activeHelperText && (
              <FormHelperText error={isError} sx={{ mx: 1.5, mt: 0.5 }}>
                {activeHelperText}
              </FormHelperText>
            )}
          </Box>
        );
      }}
    />
  );
}
