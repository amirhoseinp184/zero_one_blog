import { Stack, Button, Typography, Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import EditableField from "../../../components/dashboard/EditableField";
import DashboardTextField from "../../../components/dashboard/DashboardTextField";
import { useUserQuery } from "../../../services/queries";

export default function AccountSettingsPage() {
  const { data: user } = useUserQuery();

  return (
    <Stack gap={5}>
      <EditableField
        fieldKey="username"
        label="نام کاربری"
        InputComponent={() => (
          <Box sx={{ display: "flex", gap: 2, overflowY:'hidden' }}>
            <DashboardTextField dir="ltr" name="username" label="نام کاربری" />
            <Typography dir="ltr" sx={{ whiteSpace: "nowrap"  }}>
              https://
              <br />
              zeroone.com/@
            </Typography>
          </Box>
        )}
        defaultValue={user?.username}
        SettingControl={() => (
          <Button
            endIcon={<EditIcon />}
            variant="text"
            color="inherit"
            disableRipple
            sx={{ ":hover": { bgcolor: "initial" } }}
          >
            <Typography variant="body1">{user?.username}</Typography>
          </Button>
        )}
      />
    </Stack>
  );
}
