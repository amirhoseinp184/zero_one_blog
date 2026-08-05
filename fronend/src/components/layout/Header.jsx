import { useState } from "react";

import {
  Button,
  Container,
  Typography,
  Avatar,
  Skeleton,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Fade,
} from "@mui/material";
import Settings from '@mui/icons-material/Settings'
import ZeroOne from "/src/assets/images//zero_one.png";
import { grey } from "@mui/material/colors";
import { Link } from "react-router";

import UserProfileMenu from "../dashboard/user/UserProfileMenu";

import { useAuth } from "../../providers/AuthProvider";
import { useUserQuery } from "../../services/queries";


function AuthButtons() {
  return (
    <div>
      <Button
        component={Link}
        to="/login"
        sx={{
          mr: 1,
          "&:hover": {
            textDecoration: "underline",
            textUnderlineOffset: 6,
          },
        }}
      >
        ورود
      </Button>
      <Button
        component={Link}
        to="/register"
        sx={{
          "&:hover": {
            textDecoration: "underline",
            textUnderlineOffset: 6,
          },
        }}
        variant="contained"
      >
        ثبت نام
      </Button>
    </div>
  );
}

export default function Header() {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { data, isLoading } = useUserQuery({
    enabled: !isAuthLoading && isAuthenticated,
  });
  const authReady = !isAuthLoading;

  return (
    <Container
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: "12px",
        borderBottom: `.5px solid ${grey[700]}`,
      }}
    >
      <Link to="/">
        <Typography variant="h1" sx={{ height: "40px", display: "flex" }}>
          <img src={ZeroOne} />
        </Typography>
      </Link>

      {authReady ? (
        isAuthenticated ? (
          <>
            {" "}
            {isLoading && !data ? (
              <Skeleton width="150px" height="35px" variant="rounded" />
            ) : (
              <UserProfileMenu user={data} />
            )}{" "}
          </>
        ) : (
          <AuthButtons />
        )
      ) : null}

      {!authReady && <Skeleton width="150px" height="35px" variant="rounded" />}
    </Container>
  );
}
