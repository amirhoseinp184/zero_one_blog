import { formatDate } from "../utils/helper";
import { Box, Typography, Chip, Card, Stack } from "@mui/material";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'

export default function FeedPostCard(props) {
  const {
    Component = "div",
    title,
    category = "مقاله",
    reading_time_minutes = 5,
    published_at,
    excerpt,
    author,
    ...rest
  } = props;
  
  return (
    <Component {...rest}>
      <Card
        {...rest}
        elevation={0}
        sx={(theme) => ({
          p: 2.5,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRadius: 3,
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(145deg, rgba(21, 75, 184, 0.23), rgba(25, 26, 28, 0.47))"
              : "linear-gradient(145deg, #ffffff, #f8fafc)",
          border: `1px solid ${
            theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)"
          }`,
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 4px 20px rgba(0,0,0,0.4)"
              : "0 4px 20px rgba(0,0,0,0.03)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",

          "&:hover": {
            transform: "translateY(-4px)",
            borderColor: theme.palette.primary.main,
            boxShadow: `0 12px 30px ${
              theme.palette.mode === "dark" ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.08)"
            }`,

            "& .cta-arrow": {
              transform: "translateX(-4px)",
            },
            "& .card-title": {
              color: "primary.main",
            },
          },
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        })}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Chip
            label={category}
            size="small"
            sx={(theme) => ({
              fontWeight: 600,
              fontSize: "0.75rem",
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(144, 202, 249, 0.12)"
                  : "rgba(25, 118, 210, 0.08)",
              color: "primary.common.white",
              borderRadius: 1.5,
            })}
          />

          <Stack direction="row" spacing={0.5} alignItems="center">
            <AccessTimeOutlinedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              {reading_time_minutes} دقیقه
            </Typography>
          </Stack>
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          <Typography
            className="card-title"
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 700,
              fontSize: "1.1rem",
              lineHeight: 1.6,
              transition: "color 0.2s ease",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              mb: 1,
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              lineHeight: 1.7,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              mb: 2,
            }}
          >
            {excerpt}
          </Typography>

          <Box
            sx={(theme) => ({
              height: "1px",
              bgcolor:
                theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
              my: 1.5,
            })}
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <CalendarTodayOutlinedIcon sx={{ fontSize: 13, color: "text.disabled" }} />
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              {formatDate(published_at)}
            </Typography>
          </Stack>

          <Typography
            variant="caption"
            color="primary"
            fontWeight={700}
            sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
          >
            ادامه مطلب
            <ArrowBackIcon
              className="cta-arrow"
              fontSize="small"
              sx={{ transition: "transform 0.2s ease" }}
            />
          </Typography>
        </Box>
      </Card>
    </Component>
  );
}
