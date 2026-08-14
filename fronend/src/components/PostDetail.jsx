import {Link} from 'react-router'
import {
  Box,
  Container,
  Typography,
  Chip,
  Stack,
  IconButton,
  Divider,
  Paper,
  Tooltip,
  Avatar,
} from "@mui/material";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

// Helper to format ISO date strings into Persian Date format
const formatPersianDate = (isoString) => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch (e) {
    return isoString;
  }
};

const PostDetail = ({ post }) => {
  if (!post) return null;

  const { title, content, reading_time_minutes, updated_at, author } = post;

  return (
    <Container>
      <Stack direction="row" justifyContent="end" alignItems="center" sx={{ mb: 4 }}>
        <Tooltip title="ذخیره مقاله">
          <IconButton size="small">
            <BookmarkBorderOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="اشتراک‌گذاری">
          <IconButton size="small">
            <ShareOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 800,
            fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.5rem" },
            lineHeight: 1.5,
            mb: 3,
            color: "text.primary",
          }}
        >
          {title}
        </Typography>

        <Stack
          direction="row"
          spacing={{ xs: 2, sm: 3 }}
          alignItems="center"
          flexWrap="wrap"
          sx={{ color: "text.secondary", fontSize: "0.875rem" }}
        >
          <Stack sx={{textDecoration:'none'}} component={Link} to={`/u/${author.username}`} direction="row" spacing={1.2} alignItems="center">
            <Avatar src={author.avatar} alt={author.name} sx={{ width: 36, height: 36 }} />
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                {author.name}
              </Typography>
              {author.role && (
                <Typography variant="caption" color="text.secondary" display="block">
                  {author.role}
                </Typography>
              )}
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.8} alignItems="center">
            <CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption" fontWeight={500}>
              آخرین بروزرسانی: {formatPersianDate(updated_at)}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.8} alignItems="center">
            <AccessTimeOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption" fontWeight={500}>
              زمان مطالعه: {reading_time_minutes} دقیقه
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <Divider sx={{ mb: 4 }} />

      <Paper
        elevation={0}
        sx={(theme) => ({
          p: { xs: 2.5, sm: 4 },
          borderRadius: 3,
        })}
      >
        <Box
          dangerouslySetInnerHTML={{ __html: content }}
          sx={(theme) => ({
            fontFamily: "inherit",
            color: theme.palette.text.primary,
            fontSize: { xs: "1rem", sm: "1.1rem" },
            lineHeight: 2.0,

            "& p": {
              mb: 2.5,
              textAlign: "justify",
            },

            "& h1, & h2, & h3, & h4, & h5, & h6": {
              fontWeight: 700,
              mt: 4,
              mb: 2,
              lineHeight: 1.6,
              color: theme.palette.text.primary,
            },

            "& a": {
              color: theme.palette.primary.main,
              textDecoration: "underline",
              transition: "color 0.2s",
              "&:hover": {
                color: theme.palette.primary.dark,
              },
            },

            "& blockquote": {
              my: 3,
              mx: 0,
              p: 2,
              pr: 3,
              borderRight: `4px solid ${theme.palette.primary.main}`,
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(144, 202, 249, 0.05)"
                  : "rgba(25, 118, 210, 0.04)",
              borderRadius: "0 8px 8px 0",
              fontStyle: "italic",
            },

            "& pre": {
              p: 2,
              borderRadius: 2,
              bgcolor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5",
              overflowX: "auto",
              direction: "ltr",
            },
          })}
        />
      </Paper>
    </Container>
  );
};

export default PostDetail;
