import { Link, useParams } from "react-router";
import NotFoundPage from "./NotFoundPage";
import { useUserProfileQuery, useUserQuery } from "../services/queries";
import { Avatar, Box, Typography, Button, CircularProgress } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useAuth } from "../providers/AuthProvider";

export default function UserProfilePage() {
  const params = useParams();
  const username = params["username"];

  const { data, isLoading, error } = useUserProfileQuery({
    username: username,
  });

  const { isAuthenticated } = useAuth();
  const { data: userData, isLoading: isUserLoading } = useUserQuery({
    enabled: isAuthenticated,
  });

  if (error) {
    if (error?.response?.status === 404) return <NotFoundPage />;
  }

  const isCentered = isLoading || isUserLoading || error;

  const isCurrentUserProfile = isAuthenticated && userData?.username === data?.username;

  return (
    <>
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: isCentered ? "center" : null,
          alignItems: isCentered ? "center" : null,
        }}
      >
        {isCentered && error ? (
          <Typography variant="body1" color="error">
            مشکلی در بارگذاری صفحه رخ داد، لطفا صفحه را رفرش کنید
          </Typography>
        ) : null}
        {isCentered && (isLoading || isUserLoading) ? <Typography><CircularProgress /></Typography> : null}

        {!isCentered && (
          <>
            <Box
              sx={(theme) => ({
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 3,
                gap: 2,
              })}
            >
              <Avatar src={data.avatar} sx={{ width: "85px", height: "85px" }} />
              <Typography variant="h6" fontWeight={900}>
                {data.name}
              </Typography>
              {data.about_me && (
                <Typography variant="body1" sx={{ color: grey[400] }}>
                  {data.about_me}
                </Typography>
              )}
              <Box sx={{ display: "flex", gap: 5, ml: -2 }}>
                <Typography fontSize={14} color={grey[500]}>
                  توسط {data.numberOfFollowers || 0} نفر دنبال میشود
                </Typography>
                <Typography fontSize={14} color={grey[500]}>
                  {data.numberOfFollowing || 0} را دنبال میکنید
                </Typography>
              </Box>
              {isCurrentUserProfile && (
                <Button
                  component={Link}
                  to="/dashboard/settings/profile/"
                  variant="outlined"
                  sx={{ px: 4, py: 1, borderRadius: "20px" }}
                >
                  تنظیمات حساب کاربری
                </Button>
              )}
            </Box>
            <Box
              sx={(theme) => ({
                mx: 1,
                borderTop: `.5px solid ${grey[300]}`,
                flex: 1,
              })}
            >
              <Typography textAlign="center" fontWeight="600" my={6}>
                {data.name} هنوز پستی در صفر و یک ننوشته است. پس از انتشار اولین پست, آن را در اینجا
                نمایش میدهیم.
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </>
  );
}
