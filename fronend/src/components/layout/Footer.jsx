import { Box, Grid, Typography } from "@mui/material";
import CopyRight from "@mui/icons-material/Copyright";

import XIcon from "@mui/icons-material/X";
import InstagramIcon from "@mui/icons-material/Instagram";
import GitHubIcon from "@mui/icons-material/GitHub";

export default function Footer() {
  return (
    <Grid
      container
      sx={(theme) => ({
        py: 3,
        px: 5,
        borderTop: `.5px solid ${theme.palette.grey[700]}`,
      })}
    >
      <Grid size={4} sx={{ gap: 1.2, display: "flex" }}>
        <FooterIcon>
          <XIcon fontSize="15" />
        </FooterIcon>
        <FooterIcon>
          <InstagramIcon fontSize="15" />
        </FooterIcon>
        <FooterIcon>
          <GitHubIcon fontSize="15" />
        </FooterIcon>
      </Grid>

      <Grid size={4}>
        <Typography
          sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1, color:'grey.700' }}
        >
          <CopyRight />
          صفر و یک. تمامی حقوق محفوظ است
        </Typography>
      </Grid>

      <Grid size={4} />
    </Grid>
  );
}

function FooterIcon({ children }) {
  return (
    <Typography
      sx={(theme) => ({
        "&:hover": { background: "transparent", borderColor: theme.palette.primary.main },
        transition: "all 0.2s ease-in",
        cursor: "pointer",
        border: `1px solid #fff`,
        background: `rgba(21, 75, 184, 0.23)`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 1,
        borderRadius: 2,
      })}
    >
      {children}
    </Typography>
  );
}
