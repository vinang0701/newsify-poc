import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import UsersDashboard from "./institution_admin/users";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import App from "./App";
import InstitutionAdminHomePage from "@/institution_admin/home";

const router = createBrowserRouter([
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
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
);
