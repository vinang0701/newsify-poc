import { Routes, Route } from "react-router";
import InstitutionAdminHomePage from "./institution_admin/home";

function App() {
    return (
        <Routes>
            <Route path="/" element={<InstitutionAdminHomePage />} />
        </Routes>
    );
}

export default App;
