import { useParams } from "react-router";
import NotFoundPage from "./NotFoundPage";
import { useUserProfileQuery, useUserQuery } from "../services/queries";
import { Avatar, Box, Typography, Button } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useAuth } from "../providers/AuthProvider";

export default function UserProfilePage() {
  const params = useParams();
  const username = params["username"];
  const isValidUsername =
    typeof username === "string" &&
    !username.includes(" ") &&
    username.startsWith("@");

  const {
    data: profileData,
    isLoading: isProfileLoading,
    error,
  } = useUserProfileQuery({
    username: isValidUsername ? username.slice(1) : "",
    enabled: isValidUsername,
  });

  const { isAuthenticated } = useAuth();
  const { data: userData, isLoading: isUserLoading } = useUserQuery({
    enabled: isAuthenticated,
  });

  if (!isValidUsername) return <NotFoundPage />;
  if (error) return "error";

  if (isProfileLoading || isUserLoading) return null

  const isLoggedInUserProfile =
    isAuthenticated && userData.username === profileData.username;

  const hasPosts = Array.isArray(profileData.posts) && profileData.posts.length != 0
  

  return (
    <>
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Box
          sx={(theme) => ({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 5,
            gap: 2,
          })}
        >
          <Avatar
            src={profileData.avatar}
            sx={{ width: "85px", height: "85px" }}
          />
          <Typography variant="h6" fontWeight={900}>
            {profileData.name}
          </Typography>
          {profileData.about_me && (
            <Typography variant="body1" sx={{ color: grey[400] }}>
              {profileData.about_me}
            </Typography>
          )}
          <Box sx={{ display: "flex", gap: 5, ml: -2 }}>
            <Typography fontSize={14} color={grey[500]}>
              توسط {profileData.numberOfFollowers || 0} نفر دنبال میشود
            </Typography>
            <Typography fontSize={14} color={grey[500]}>
              {profileData.numberOfFollowing || 0} را دنبال میکنید
            </Typography>
          </Box>
          {isLoggedInUserProfile && (
            <Button
              variant="outlined"
              sx={{ px: 4, py: 1, borderRadius: "20px" }}
            >
              تنظیمات حساب کاربری
            </Button>
          )}
        </Box>
        <Box
          sx={(theme) => ({
            bgcolor: theme.palette.dark.light,
            borderTop: `.5px solid ${grey[300]}`,
            flex: 1,
          })}
        >
          {!hasPosts && (
            <Typography textAlign="center" fontWeight="600" my={6}>
              {profileData.name} هنوز پستی در صفر و یک ننوشته. بعد از انتشار از
              اولین پست, آن را در اینجا نمایش میدهیم.
            </Typography>
          )}
        </Box>
      </Box>
    </>
  );
}
