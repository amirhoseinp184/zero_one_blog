import { Box, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router";

export default function DashboardSettingsLayout() {
  const location = useLocation()
  
  const [value, setValue] = useState(() => location.pathname);

  function handleTabChagne(e, newValue) {
    setValue(newValue);
  }

  return (
    <Box sx={{p:5}}>
        <Tabs
        variant="fullWidth"
        value={value}
        onChange={handleTabChagne}
        >
        <Tab component={Link} value="/dashboard/settings/profile/" to="/dashboard/settings/profile/" disableRipple label="درباره شما" />
        <Tab component={Link} value="/dashboard/settings/account/" to="/dashboard/settings/account/" disableRipple label="حساب کاربری" />
        <Tab component={Link} disabled sx={theme => ({'&.Mui-disabled': {color:theme.palette.grey[700]}})} disableRipple label="اطلاعیه ها" />
        <Tab component={Link} disabled sx={theme => ({'&.Mui-disabled': {color:theme.palette.grey[700]}})} disableRipple label="تنظیمات پیشرفته" />
        </Tabs>
        <Box sx={{my:4}}>
          <Outlet/>
        </Box>
    </Box>
  );
}
