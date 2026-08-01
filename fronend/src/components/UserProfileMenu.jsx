import { useState } from "react";

import {
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Fade,
  Divider,
  Box,
  Typography,
  ButtonBase,
} from "@mui/material";
import Logout from '@mui/icons-material/Logout'
import Settings from '@mui/icons-material/Settings'
import { grey } from "@mui/material/colors";
import { Link } from 'react-router'

import LogoutDialog from "./LogoutDialog";

export default function UserProfileMenu({ user }) {
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (e, reason) => {
    setAnchorEl(false);
  };

  function getProfileContent() {
    if (user.avatar) {
      return <Avatar src={user.avatar} alt={user.name} />;
    }
    return <Avatar>{user.name[0]}</Avatar>;
  }

  function closeLogoutDialog() {
    setLogoutDialog(false);
  }

  function openLogoutDialog() {
    setLogoutDialog(true);
  }

  return (
    <>
      <LogoutDialog open={logoutDialog} onClose={closeLogoutDialog} />
      <IconButton
        sx={{
          position: "relative",
          "&::before": {
            content: '""',
            display: "block",
            // bgcolor: 'white',
            width: 0,
            height: 0,
            position: "absolute",
            bottom: "5px",
            left: -15,
            borderTop: "7px solid #ffffff",
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
          },
        }}
        onClick={handleClick}
        size="small"
      >
        {getProfileContent()}
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        // onClick={handleClose}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slots={{ transition: Fade }}
        sx={{ "& .MuiPaper-root": { borderRadius: 2, minWidth: "270px" } }}
      >
        <MenuItem
          sx={{
            justifyContent: "space-between",
            py: 1,
            ":hover": { bgcolor: "initial" },
          }}
          disableRipple={true}
        >
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography color={{ color: grey[300] }} fontSize={15}>
              {user.name}
            </Typography>

            <ButtonBase
              component={Link}
              to={`/@${user.username}`}
              sx={{ color: "primary.main", fontSize: 15, borderRadius: 2 }}
            >
              مشاهده پروفایل
            </ButtonBase>
          </Box>
          <Box>{getProfileContent()}</Box>
        </MenuItem>

        <Divider />

        <MenuItem
          sx={{ py: 1.5, transition: "background .3s", color: grey[300] }}
          disableRipple={true}
          onClick={handleClose}
          to="/dashboard/settings"
          component={Link}
        >
            <ListItemIcon>
              <Settings fontSize="small" sx={{ color: grey[300] }} />
            </ListItemIcon>{" "}
            تنظیمات حساب کاربری
        </MenuItem>

        <MenuItem
          onClick={openLogoutDialog}
          sx={{ py: 1.5, color: "error.light", transition: "background .3s" }}
          disableRipple={true}
        >
          <ListItemIcon>
            <Logout fontSize="small" sx={{ color: "error.light" }} />
          </ListItemIcon>
          خروج از حساب کاربری
        </MenuItem>
      </Menu>
    </>
  );
}
