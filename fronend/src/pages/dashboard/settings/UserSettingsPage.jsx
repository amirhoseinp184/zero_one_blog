import { Stack, Typography, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useUserQuery } from "./../../../services/queries";
import RHFTextField from "../../../components/RHFTextField";

import EditableField from "../../../components/dashboard/EditableField";
import { grey } from "@mui/material/colors";
import SettingPlaceHolder from "../../../components/dashboard/SettingPlaceholder";
import UploadAvatar from "../../../components/ui/UploadAvatar";
import SelectGenderForm from "../../../components/dashboard/SelectGenderForm";
import DateOfBirthForm from "../../../components/dashboard/DateOfBirthForm";
import DashboardTextField from "../../../components/dashboard/DashboardTextField";


export default function UserSettingsPage() {
  const { data: user } = useUserQuery();

  return (
    <Stack gap={5}>
      <EditableField  
        fieldKey="name"
        label="نام نمایشی"
        helper="این نام در پروفایل شما نمایش داده میشود"
        defaultValue={user?.name}
        InputComponent={() => (
          <DashboardTextField name="name" label="نام نمایشی" />
        )}
        SettingControl={() => (
          <Button
            endIcon={<EditIcon />}
            variant="text"
            color="inherit"
            disableRipple
            sx={{ ":hover": { bgcolor: "initial" } }}
          >
            <Typography variant="h6" color="primary">
              {user?.name}
            </Typography>
          </Button>
        )}
      />

      <EditableField
        fieldKey="about_me"
        label="درباره شما"
        helper="بیوگرافی شما در صفحه پروفایل نمایش داده می شود."
        defaultValue=""
        InputComponent={() => (
          <DashboardTextField
            name="about_me"
            label="توضیحات خود را وارد نمایید"
            multiline
            rows={3}
          />
        )}
        SettingControl={() => (
          <Button
            endIcon={<EditIcon />}
            variant="text"
            color="inherit"
            disableRipple
            sx={{ ":hover": { bgcolor: "initial" } }}
          />
        )}
      />

      <SettingPlaceHolder
        label="عکس پروفایل"
        helper="عکس شما در صفحه پروفایل و پست‌ها نمایش داده می‌شود."
        SettingControl={() => <UploadAvatar defaultAvatarUrl={user?.avatar} />}
      />

      <SettingPlaceHolder
        label="جنسیت"
        SettingControl={() => <SelectGenderForm defaultGender={user?.gender} />}
      />

      <SettingPlaceHolder
        label="تاریخ تولد"
        helper="تاریخ تولد در پروفایل نمایش داده نمی‌شود."
        SettingControl={() => <DateOfBirthForm defaultDate={user?.birthdate} />}
      />

      
    </Stack>
  );
}
