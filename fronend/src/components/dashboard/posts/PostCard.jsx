import { Box, Typography, Chip } from "@mui/material";
import { formatDate } from "../../../utils/helper";

export default function Post(props) {
  const { Component = "div", title, status, published_at } = props
    
  return (
    <Component>
      <Box
        sx={(theme) => ({
          border: `1px solid ${theme.palette.grey[700]}`,
          borderRadius: 1,
          p: 2,
          display:'flex',
          justifyContent:'space-between'
        })}
      >
        <Box>
          <Typography
            color="primary"
            variant="h5"
            component={"h5"}
            fontWeight="bold"
          >
            {title}
          </Typography>
          {status === 'published' && <Typography>منتشر شده در: {formatDate(published_at)}</Typography>}
        </Box>
        <Box>
            <Chip label={status === 'published' ? 'منتشر شده' : 'پیش نویس'} color={status === "published" ? "success" : "warning"}  />
        </Box>
      </Box>
    </Component>
  );
}
