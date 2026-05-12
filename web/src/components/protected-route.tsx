import type { ReactElement, ReactNode } from "react";
import { useAuth } from "./auth-provider";
import { Navigate, Outlet } from "react-router";
import Loading from "./loading";

type AllowedRole = "institution_admin" | "platform_admin";

interface ProtectedRouteProps {
	role: AllowedRole;
	layout?: ReactElement;
}

const ProtectedRoute = ({ role, layout }: ProtectedRouteProps): ReactNode => {
	const { user, loading } = useAuth();

	if (loading) {
		// Avoid flashing the login page while session is being resolved
		return <Loading />; // or a <Spinner /> component
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	if (user.role !== role) {
		// Authenticated but wrong role — send to an unauthorized page
		return <Navigate to="/unauthorized" replace />;
	}

	return layout ?? <Outlet />;
};

export default ProtectedRoute;
