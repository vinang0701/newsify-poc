import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import StudentUsersMgmtPage from "@/institution_admin/users/student-users-page";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import App from "./App";
import InstitutionAdminHomePage from "@/institution_admin/home";
import TempHome from "./TempHome";
import PlatformAdminDashboardPage from "./platform_admin/dashboard";
import InstitutionsMgmtPage from "./platform_admin/institutions";
import LoginPage from "./login";
import StaffUsersMgmtPage from "./institution_admin/users/staff-users-page";
import { AuthProvider } from "./components/auth-provider";
import ProtectedRoute from "./components/protected-route";
import CommunitiesMgmtPage from "./institution_admin/communities/page";
import RolesMgmtPage from "./institution_admin/roles/page";
import CategoriesMgmtPage from "./institution_admin/categories/page";
import AchievementsMgmtPage from "./institution_admin/achievements/page";
import ContentModerationPage from "./institution_admin/moderation/page";

const router = createBrowserRouter([
	{
		path: "/",
		element: <TempHome />,
	},
	{
		path: "/login",
		element: <LoginPage />,
	},
	{
		path: "/admin",
		element: <ProtectedRoute role="institution_admin" layout={<App />} />,

		children: [
			{ index: true, element: <InstitutionAdminHomePage /> },
			{
				path: "users/students",
				element: <StudentUsersMgmtPage />,
			},
			{ path: "users/staff", element: <StaffUsersMgmtPage /> },
			{ path: "communities", element: <CommunitiesMgmtPage /> },
			{ path: "roles", element: <RolesMgmtPage /> },
			{ path: "achievements", element: <AchievementsMgmtPage /> },
			{ path: "categories", element: <CategoriesMgmtPage /> },
			{ path: "moderation", element: <ContentModerationPage /> },
		],
	},
	{
		path: "/platform",
		element: <ProtectedRoute role="platform_admin" layout={<App />} />,
		children: [
			{ index: true, element: <PlatformAdminDashboardPage /> },
			{ path: "institutions", element: <InstitutionsMgmtPage /> },
		],
	},
]);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<AuthProvider>
			<RouterProvider router={router} />
		</AuthProvider>
	</StrictMode>,
);
