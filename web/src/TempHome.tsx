import { Link } from "react-router";
import { Button } from "./components/ui/button";

const TempHome = () => {
	return (
		<div className="flex flex-col mt-[10%] items-center gap-6 h-screen">
			<h1 className="text-3xl font-bold">
				Hello welcome to Newsify Admin Dashboard!
			</h1>
			<h3>Please click on any of the buttons to navigate.</h3>
			<div className="flex gap-4">
				<Button>
					<Link to={"/admin"}>Institution Admin</Link>
				</Button>
				<Button disabled>
					<Link to={"/platform"}>Platform Admin</Link>
				</Button>
				<Button className="bg-amber-800">
					<Link to={"/login"}>Log In</Link>
				</Button>
			</div>
		</div>
	);
};

export default TempHome;
