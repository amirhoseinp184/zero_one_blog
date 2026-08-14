import { Button, Stack, Typography, Box, Grid } from "@mui/material";
import { useFeedQuery } from "../services/queries";
import FeedPostCard from "../components/FeedPostCard";
import SectionHeader from "../components/SectionHeader";
import { Fragment } from "react";
import LoadingButton from "../components/ui/LoadingButton";
import { Link, useLocation } from "react-router";

export default function HomePages() {
  const { data, error, fetchNextPage, isFetchingNextPage, hasNextPage } = useFeedQuery();
  const location = useLocation()
  const currentUrl = `${location.pathname}${location.search}`

  return (
    <Box>
      <SectionHeader />

      {isFetchingNextPage && <p>Loading</p>}

      <Grid container spacing={2} sx={{ p: 5 }}>
        {data?.pages.map((group, i) => (
          <Fragment key={i}>
            {group.results.map((post, i) => (
              <Grid size={6}>
                <FeedPostCard
                  component={Link}
                  state={{ from: currentUrl }}
                  to={`/u/${post.author.username}/posts/${post.slug}`}
                  style={{ textDecoration: "none" }}
                  {...post}
                />
              </Grid>
            ))}
          </Fragment>
        ))}

        {hasNextPage && (
          <LoadingButton
            loading={isFetchingNextPage}
            sx={{ my: 6, mx: "auto" }}
            variant="text"
            onClick={fetchNextPage}
          >
            بارگذاری بیشتر
          </LoadingButton>
        )}
      </Grid>
    </Box>
  );
}
