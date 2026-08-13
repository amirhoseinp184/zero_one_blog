import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";

const SectionHeader = () => {
  return (
    <Box
      sx={{
        textAlign: "center",
        mt: 6,
        mb: 5,
        px: 2,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* 1. Subtle Ambient Radial Glow */}
      <Box
        sx={(theme) => ({
          position: "absolute",
          top: "-50%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "320px",
          height: "180px",
          background: `radial-gradient(circle, ${
            theme.palette.mode === "dark"
              ? "rgba(144, 202, 249, 0.18)"
              : "rgba(25, 118, 210, 0.12)"
          } 0%, rgba(0,0,0,0) 70%)`,
          filter: "blur(40px)",
          zIndex: -1,
          pointerEvents: "none",
        })}
      />

      {/* 2. Top Pill / Badge */}
      <Chip
        icon={<CodeRoundedIcon sx={{ fontSize: "16px !important" }} />}
        label="وبلاگ و آموزش"
        size="small"
        sx={(theme) => ({
          mb: 2,
          fontWeight: 700,
          fontSize: "0.78rem",
          borderRadius: "20px",
          px: 1,
          py: 0.5,
          bgcolor:
            theme.palette.mode === "dark"
              ? "rgba(144, 202, 249, 0.1)"
              : "rgba(25, 118, 210, 0.08)",
          color: "primary.main",
          border: `1px solid ${
            theme.palette.mode === "dark"
              ? "rgba(144, 202, 249, 0.2)"
              : "rgba(25, 118, 210, 0.18)"
          }`,
        })}
      />

      {/* 3. Main Title with Gradient Text */}
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontWeight: 900,
          fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.75rem" },
          lineHeight: 1.4,
          mb: 1.5,
          letterSpacing: "-0.5px",
        }}
      >
        دانش برنامه‌نویسی،{" "}
        <Typography
          variant="inherit"
          component="span"
          sx={(theme) => ({
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(135deg, #90caf9 0%, #42a5f5 100%)"
                : "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            display: "inline-block",
          })}
        >
          تجربه واقعی
        </Typography>
      </Typography>

      {/* 4. Subtitle with Constraints & Line Height */}
      <Typography
        color="text.secondary"
        sx={{
          maxWidth: "580px",
          fontSize: { xs: "0.95rem", sm: "1.05rem" },
          lineHeight: 1.8,
          fontWeight: 500,
        }}
      >
        مطالب کاربردی درباره Django، معماری نرم‌افزار، و مسیر رشد برنامه‌نویسی
      </Typography>

      {/* 5. Sleek Centered Accent Line */}
      <Box
        sx={(theme) => ({
          width: "48px",
          height: "4px",
          borderRadius: "2px",
          mt: 2.5,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${
            theme.palette.mode === "dark" ? "#64b5f6" : "#42a5f5"
          })`,
        })}
      />
    </Box>
  );
};

export default SectionHeader;