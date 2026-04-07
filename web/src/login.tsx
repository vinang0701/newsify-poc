import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Label } from "./components/ui/label";
import {
	FieldSet,
	FieldGroup,
	Field,
	FieldLabel,
	FieldDescription,
} from "./components/ui/field";

const LoginPage = () => {
	return (
		<div className="flex flex-col mt-[10%] w-fit mx-auto gap-6">
			<h1 className="text-2xl font-bold">Log in</h1>
			<p className="text-gray-500">
				Enter your email and password to log in to your account.
			</p>
			<FieldSet className="flex w-full">
				<FieldGroup>
					<Field className="flex w-full">
						<FieldLabel htmlFor="email" className="w-full">
							Email
						</FieldLabel>
						<Input
							id="email"
							type="text"
							placeholder="youremail@mymail.edu.sg"
							className="w-full"
						/>
					</Field>
					<Field className="w-full">
						<FieldLabel htmlFor="password">Password</FieldLabel>

						<Input
							id="password"
							type="password"
							placeholder="••••••••"
						/>
					</Field>
				</FieldGroup>
			</FieldSet>
			<Button type="button">Log in</Button>
		</div>
	);
};

export default LoginPage;
