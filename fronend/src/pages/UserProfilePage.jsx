import { Link, useParams, useLocation } from "react-router";
import NotFoundPage from "./NotFoundPage";
import { usePublicPostListQuery, useUserProfileQuery, useUserQuery } from "../services/queries";
import { Avatar, Box, Typography, Button, CircularProgress, Grid } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useAuth } from "../providers/AuthProvider";

import { useFollowMutation, useUnfollowMutation } from "../services/mutations";

import ProfilePostCard from "../components/ProfilePostCard";
import LoadingButton from '../components/ui/LoadingButton'

export default function UserProfilePage() {
  const params = useParams();
  const username = params["username"];

  const followMutation = useFollowMutation({username})
  const unfollowMutation = useUnfollowMutation({username})

  const location = useLocation();
  const currentUrl = `${location.pathname}${location.search}`;

  const { isAuthenticated, isAuthLoading } = useAuth();
  const { data: userData, isLoading: isUserLoading } = useUserQuery({
    enabled: isAuthenticated,
  });

  const { data, isLoading, error, isEnabled } = useUserProfileQuery({
    username: username, enabled:!isAuthLoading
  });
  
  const {
    data: postsData,
    isLoading: isLoadingPosts,
    error: postsError,
  } = usePublicPostListQuery({ username });

  if (error) {
    if (error?.response?.status === 404) return <NotFoundPage />;
  }

  const isCentered = isLoading || isUserLoading || error || !isEnabled;

  const isCurrentUserProfile = isAuthenticated && userData?.username === data?.username;

  const toggleFollowing = () => {
    if (data.is_following) unfollowMutation.mutate()
    else followMutation.mutate()
  }


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
        {isCentered && (isLoading || isUserLoading || !isEnabled) ? (
          <Typography>
            <CircularProgress />
          </Typography>
        ) : null}

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
                  توسط {data.followers_count} نفر دنبال میشود
                </Typography>
                <Typography fontSize={14} color={grey[500]}>
                  {data.following_count}  نفر را دنبال میکنید
                </Typography>
              </Box>

              {(isAuthenticated && !isCurrentUserProfile) &&
                <LoadingButton
                  variant="outlined"
                  sx={{borderRadius:4}}
                  color={data.is_following ? 'error' : 'success'}
                  onClick={toggleFollowing}
                >
                  {data.is_following ? 'لفو دنبال کردن' : 'دنبال کردن'}
                </LoadingButton>
              }
            
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
            <Grid
              container
              spacing={3}
              justifyContent="center"
              sx={(theme) => ({
                mx: 1,
                py: 4,
                borderTop: `.5px solid ${grey[300]}`,
                flex: 1,
                textAlign: isLoadingPosts || postsError ? "center" : "inherit",
              })}
            >
              {isLoadingPosts && <CircularProgress sx={{ mt: 5 }} />}
              {postsError && (
                <Typography sx={{ mt: 5 }} color="error">
                  مشکلی در هنگام بارگذاری پست ها پیش آمد.
                </Typography>
              )}

              {!isLoadingPosts && !postsError && postsData?.length === 0 && (
                <Typography textAlign="center" fontWeight="600" my={6}>
                  {data.name} هنوز پستی در صفر و یک ننوشته است. پس از انتشار اولین پست, آن را در
                  اینجا نمایش میدهیم.
                </Typography>
              )}
              {!isLoadingPosts &&
                !postsError &&
                postsData?.length !== 0 &&
                postsData.map((post, i) => (
                  <Grid key={i} size={9}>
                    <ProfilePostCard
                      component={Link}
                      to={`/u/${post.author.username}/posts/${post.slug}`}
                      state={{ from: currentUrl }}
                      style={{ textDecoration: "none" }}
                      {...post}
                    />
                  </Grid>
                ))}
            </Grid>
          </>
        )}
      </Box>
    </>
  );
}
