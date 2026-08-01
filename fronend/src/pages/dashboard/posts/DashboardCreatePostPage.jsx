import { Box, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import {NavLink} from 'react-router'

import StarterKit from "@tiptap/starter-kit";
import {
  MenuButtonBold,
  MenuButtonItalic,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  RichTextEditor,
} from "mui-tiptap";
import { useRef } from "react";

export default function DashboardCreatePostPage() {
  const rteRef = useRef(null);

  return (
    <Box
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        maxHeight: "100vh",
        height: "100vh",
      }}
    >
      <Box sx={{ my: 2, display: "flex", justifyContent: "flex-end" }}>
        <IconButton component={NavLink} to="/dashboard/posts/" aria-label="close" size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <RichTextEditor
        sx={{
          borderRadius: 1,
          overflow: "hidden",
          display: "flex",
          flex: 1,
          flexDirection: "column",
          "& .MuiTiptap-RichTextContent-root": {
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
          },
        }}
        ref={rteRef}
        extensions={[StarterKit]} // Or any Tiptap extensions you wish!
        // Optionally include `renderControls` for a menu-bar atop the editor:
        renderControls={() => (
          <MenuControlsContainer>
            <MenuSelectHeading />
            <MenuDivider />
            <MenuButtonBold />
            <MenuButtonItalic />
            {/* Add more controls of your choosing here */}
          </MenuControlsContainer>
        )}
      />
      <Box sx={{ my: 4, alignSelf: "flex-end" }}>
        <Button onClick={() => console.log(rteRef.current?.editor?.getHTML())} variant="contained" sx={{ fontWeight: "bold", fontSize:17 }}>انتشار</Button>
      </Box>
    </Box>
  );
}
