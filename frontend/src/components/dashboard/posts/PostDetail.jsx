import { Stack, Typography } from "@mui/material";
import DOMPurify from "dompurify";

export default function PostDetail({ title, content }) {
  const cleanHtml = DOMPurify.sanitize(content);

  return (
    <Stack gap={5}>
      <Typography variant="h3" component="h3" fontWeight="bold">
        {title}
      </Typography>
      <Typography
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
        variant="body1"
        component="div"
        lineHeight={2}
      ></Typography>
    </Stack>
  );
}
