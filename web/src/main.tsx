import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import UsersDashboard from "./institution_admin/users";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import App from "./App";
import InstitutionAdminHomePage from "@/institution_admin/home";
import TempHome from "./TempHome";
import PlatformAdminDashboardPage from "./platform_admin/dashboard";
import InstitutionsMgmtPage from "./platform_admin/institutions";
import LoginPage from "./login";

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
		element: <App />,
		children: [
			{ index: true, element: <InstitutionAdminHomePage /> },
			{ path: "users", element: <UsersDashboard /> },
			{ path: "communities", element: <div>comm</div> },
			{ path: "roles", element: <div>roles</div> },
		],
	},
	{
		path: "/platform",
		element: <App />,
		children: [
			{ index: true, element: <PlatformAdminDashboardPage /> },
			{ path: "institutions", element: <InstitutionsMgmtPage /> },
		],
	},
]);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>,
);
