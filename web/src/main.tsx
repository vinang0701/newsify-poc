import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import StudentUsersMgmtPage from "@/institution_admin/student-users-page";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import App from "./App";
import InstitutionAdminHomePage from "@/institution_admin/home";
import TempHome from "./TempHome";
import PlatformAdminDashboardPage from "./platform_admin/dashboard";
import InstitutionsMgmtPage from "./platform_admin/institutions";
import LoginPage from "./login";
import StaffUsersMgmtPage from "./institution_admin/staff-users-page";
import { requireAuth, requireGuest, requireInstitutionAdmin } from "@/lib/auth";

const router = createBrowserRouter([
    {
        path: "/",
        element: <TempHome />,
    },
    {
        path: "/login",
        element: <LoginPage />,
        loader: requireGuest,
    },
    {
        id: "auth",
        loader: requireInstitutionAdmin,
        children: [
            {
                path: "/admin",
                element: <App />,
                children: [
                    { index: true, element: <InstitutionAdminHomePage /> },
                    {
                        path: "users/students",
                        element: <StudentUsersMgmtPage />,
                    },
                    { path: "users/staff", element: <StaffUsersMgmtPage /> },
                    { path: "communities", element: <div>comm</div> },
                    { path: "roles", element: <div>roles</div> },
                ],
            },
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
