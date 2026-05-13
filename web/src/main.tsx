import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import StudentUsersMgmtPage from "@/institution_admin/users/student-users-page";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import App from "./App";
import InstitutionAdminHomePage from "@/institution_admin/home";
import LandingPage from "./Landingpage";
import PlatformAdminDashboardPage from "./platform_admin/dashboard";
import InstitutionsMgmtPage from "./platform_admin/institutions";
import LoginPage from "./login";
import StaffUsersMgmtPage from "./institution_admin/users/staff-users-page";
import { AuthProvider } from "./components/auth-provider";
import ProtectedRoute from "./components/protected-route";
import CommunitiesMgmtPage from "./institution_admin/communities/page";
import CategoriesMgmtPage from "./institution_admin/categories/page";
import AchievementsMgmtPage from "./institution_admin/achievements/page";
import ContentModerationPage from "./institution_admin/moderation/page";
import RequestsMgmtPage from "./institution_admin/communities/requests/page";
import CommunityDetailPage from "./institution_admin/communities/community-detail";
import AdminUsersMgmtPage from "./institution_admin/users/admin-users-page";
import BillingPage from "./institution_admin/billing/page";
import AboutPage from "./AboutPage";
import PrivacyPolicyPage from "./PrivacyPolicyPage";
import TermsOfServicePage from "./TermsOfServicePage";
import FeaturesPage from "./FeaturesPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <LandingPage />,
    },

    { path: "/about", element: <AboutPage /> },

    { path: "/privacy-policy", element: <PrivacyPolicyPage /> },

    { path: "/terms-of-service", element: <TermsOfServicePage /> },

    { path: "/features", element: <FeaturesPage /> },

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

            { path: "users/admins", element: <AdminUsersMgmtPage /> },

            {
                path: "communities",
                children: [
                    { index: true, element: <CommunitiesMgmtPage /> },
                    { path: "requests", element: <RequestsMgmtPage /> },
                    { path: ":community_id", element: <CommunityDetailPage /> },
                ],
            },

            { path: "achievements", element: <AchievementsMgmtPage /> },
            { path: "categories", element: <CategoriesMgmtPage /> },
            { path: "moderation", element: <ContentModerationPage /> },
            { path: "billing", element: <BillingPage /> },
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
