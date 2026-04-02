import { Routes, Route } from "react-router";
import InstitutionAdminHome from "./institution_admin/home";
import UsersDashboard from "./institution_admin/users";

function App() {
    return (
        <Routes>
            <Route path="/" element={<InstitutionAdminHome />} />
            <Route path="/users" element={<UsersDashboard />} />
        </Routes>
    );
}

export default App;
