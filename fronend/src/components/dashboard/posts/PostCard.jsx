import { Box, Typography, Chip } from "@mui/material";
import { formatDate } from "../../../utils/helper";

export default function Post(props) {
  const { Component = "div", title, status, published_at, excerpt, ...rest } = props;

  return (
    <Component {...rest}>
      <Box
        sx={(theme) => ({
          border: `1px solid ${theme.palette.grey[700]}`,
          borderRadius: 2,
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          transition: "all 0.2s",
          cursor: "pointer",
          "&:hover": {
            transform: "translateY(-2px)",
            borderColor: "primary.main",
          },
        })}
      >
        <Box sx={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
          <Typography variant="h5" component={"h5"} fontWeight="bold">
            {title}
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 0.5, mt: 2 }}>
            {excerpt}
          </Typography>
          {status === "published" && (
            <Typography variant="caption" color="textSecondary">
              منتشر شده در: {formatDate(published_at)}
            </Typography>
          )}
        </Box>
        <Box sx={{ alignSelf: "center" }}>
          <Chip
            label={status === "published" ? "منتشر شده" : "پیش نویس"}
            color={status === "published" ? "primary" : "default"}
          />
        </Box>
      </Box>
    </Component>
  );
}
