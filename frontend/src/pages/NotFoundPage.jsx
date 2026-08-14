import { Typography, Box } from "@mui/material";

export default function NotFoundPage() {
  return (
    <Box textAlign="center" mt={20}>
        <Typography variant="h1" component="h1" fontWeight={900}>
          404
        </Typography>
        <Typography variant="h3">صفحه مورد نظر یافت نشد.</Typography>
    </Box>
  );
}
