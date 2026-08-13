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
  Box,
  Link,
} from "@mui/material";
import Settings from "@mui/icons-material/Settings";
import ZeroOne from "/src/assets/images//zero_one.png";
import { grey } from "@mui/material/colors";
import { Link as RouterLink } from "react-router";

import UserProfileMenu from "../dashboard/user/UserProfileMenu";

import { useAuth } from "../../providers/AuthProvider";
import { useUserQuery } from "../../services/queries";

function AuthButtons() {
  return (
    <div>
      <Button
        component={RouterLink}
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
        component={RouterLink}
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
      <Link
        component={RouterLink}
        to="/"
        underline="none"
        color="inherit"
        sx={{ display: "inline-flex", alignItems: "center", gap: 1.5 }}
      >
        <Box sx={{ display: "flex", alignItems:'center', gap:1.5 }}>
          <Box component="img" src={ZeroOne} alt="صفر و یک" sx={{height:40, width:'auto'}} />
          
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" component="span" sx={{ lineHeight: 1.2}}>
              صفر و یک
            </Typography>
            <Typography variant="caption" color="textSecondary">
              دانش تجربه رشد
            </Typography>
          </Box>
        </Box>
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
