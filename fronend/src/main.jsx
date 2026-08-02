import { createRoot } from "react-dom/client";
import "./index.css";
import "react-image-crop/dist/ReactCrop.css";

import { ThemeProvider } from "./providers/ThemeProvider.jsx";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFnsJalali } from "@mui/x-date-pickers/AdapterDateFnsJalali";

import { MultiStepProvider } from "./providers/MultiStepProvider.jsx";
import { AuthContextProvider } from "./providers/AuthProvider.jsx";
import { AlertProvider } from "./providers/AlertProvider.jsx";

import { BrowserRouter, Routes, Route } from "react-router";

import HomeLayout from "./layouts/HomeLayout.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import DashboardSettingsLayout from "./layouts/DashboardSettingsLayout.jsx";

import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import UserProfilePage from "./pages/UserProfilePage.jsx";
import NotFoundPage from "./pages/404NotFound.jsx";

// dashboard pages

//settings pages
import UserSettingsPage from "./pages/dashboard/settings/UserSettingsPage.jsx";
import AccountSettingsPage from "./pages/dashboard/settings/AccountSettingsPage";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } },
});

//posts pages
import DashboardPostsPage from "./pages/dashboard/posts/DashboardPostsPage.jsx";
import DashboardCreatePostPage from "./pages/dashboard/posts/DashboardCreatePostPage.jsx";

createRoot(document.getElementById("root")).render(
  <LocalizationProvider dateAdapter={AdapterDateFnsJalali}>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools />

      <AuthContextProvider>
        <AlertProvider>
          <ThemeProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<HomeLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="/:username" element={<UserProfilePage />} />

                  <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route
                      path="settings/"
                      element={<DashboardSettingsLayout />}
                    >
                      <Route index element={<UserSettingsPage />} />
                      <Route
                        path="account/"
                        element={<AccountSettingsPage />}
                      />
                      {/* <Route index element={<UserSettingsPage />} /> */}
                      {/* <Route index element={<UserSettingsPage />} /> */}
                    </Route>
                    <Route path="posts/">
                      <Route index element={<DashboardPostsPage />} />
                      <Route
                        path="create"
                        element={<DashboardCreatePostPage />}
                      />
                    </Route>
                  </Route>
                </Route>

                <Route
                  path="/register"
                  element={
                    <MultiStepProvider>
                      <RegisterPage />
                    </MultiStepProvider>
                  }
                />

                <Route
                  path="/login"
                  element={
                    <MultiStepProvider>
                      <LoginPage />
                    </MultiStepProvider>
                  }
                />

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </ThemeProvider>
        </AlertProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  </LocalizationProvider>,
);
