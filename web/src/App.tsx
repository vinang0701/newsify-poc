import { Routes, Route } from "react-router";
import InstitutionAdminHome from "./institution_admin/home";

function App() {
	return (
		<Routes>
			<Route path="/" element={<InstitutionAdminHome />} />
		</Routes>
	);
}

export default App;
