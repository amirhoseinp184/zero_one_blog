import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Link, NavLink, useLocation } from "react-router";

import ArticleOutlined from "@mui/icons-material/ArticleOutlined";
import Settings from "@mui/icons-material/Settings";

function DashboardMenuItem({ primary, icon, to }) {
  const location = useLocation();
  // let isActive = false;

  // if (to === "/dashboard/settings/") {
  //   const subRouteTest = /^\/dashboard\/settings(?:\/|$)/;
  //   isActive = subRouteTest.test(location.pathname);
  // } else {
  //   isActive = to === location.pathname;
  // }

  return (
    <ListItem
      disableGutters
      sx={{
        ":hover": {
          color: "primary.main",
          transition: "color .3s",
        },
        // color: isActive ? "primary.main" : false,
      }}
    >
      <ListItemButton
        component={NavLink}
        to={to}
        disableRipple
        sx={(theme) => ({
          ":hover": { bgcolor: "initial" },
          [theme.breakpoints.down("sm")]: { justifyContent: "center" },
          "&.active": {
            color: "primary.main",
          },
        })}
      >
        <ListItemIcon sx={{ color: "inherit", minWidth: "40px" }}>
          {icon}
        </ListItemIcon>
        <ListItemText
          sx={(theme) => ({
            [theme.breakpoints.down("sm")]: { flex: "initial" },
          })}
          primary={primary}
        ></ListItemText>
      </ListItemButton>
    </ListItem>
  );
}

export default function DashboardMenu() {
  return (
    <List sx={(theme) => ({ [theme.breakpoints.up("sm")]: { mt: 10 } })}>
      <DashboardMenuItem
        primary="حساب کاربری"
        icon={<Settings />}
        to="/dashboard/settings/"
      />
      <DashboardMenuItem
        primary="پست ها"
        icon={<ArticleOutlined />}
        to="/dashboard/posts/"
      />
    </List>
  );
}
