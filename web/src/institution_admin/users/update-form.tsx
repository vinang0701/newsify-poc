import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Controller } from "react-hook-form";
import * as z from "zod";

const createUserSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters long").trim(),

	email: z.email("Please enter a valid email address").toLowerCase().trim(),

	password: z.string().min(8, "Password must be at least 8 characters long"),

	role: z.enum(
		["student", "staff", "admin"],
		Error("Please select a valid user role."),
	),
});

const UpdateUserForm = () => {
	return (
		<Dialog
			open={dialogOpen}
			onOpenChange={() => {
				dialogOpen ? handleDialogClose() : setDialogOpen(true);
			}}
		>
			<form id="create-user-form" onSubmit={form.handleSubmit(onSubmit)}>
				<DialogTrigger asChild>
					<Button
						className="rounded-sm font-semibold border border-border"
						type="button"
					>
						Add
						<Plus strokeWidth={3} />
					</Button>
				</DialogTrigger>
				<DialogContent className="py-6 px-8">
					<DialogHeader>
						<DialogTitle className="text-2xl">Add User</DialogTitle>
						<DialogDescription>
							Please fill in user account details and click add to
							create a new account.
						</DialogDescription>
					</DialogHeader>
					<FieldGroup>
						<Controller
							name="name"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field
									data-invalid={fieldState.invalid}
									className="flex flex-col items-center"
								>
									<Label htmlFor="name-1" className="w-xs">
										Name{" "}
										<span className="text-destructive">
											*
										</span>
									</Label>
									<Input
										required
										{...field}
										aria-invalid={fieldState.invalid}
										type="text"
										className=""
										id="name-1"
										name="name"
										placeholder="Enter a name"
										autoComplete="off"
									/>
									{fieldState.invalid && (
										<FieldError
											errors={[fieldState.error]}
										/>
									)}
								</Field>
							)}
						/>
						<Controller
							name="email"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field className="flex flex-col items-center">
									<Label htmlFor="email-1" className="w-xs">
										Email{" "}
										<span className="text-destructive">
											*
										</span>
									</Label>
									<Input
										{...field}
										required
										aria-invalid={fieldState.invalid}
										type="text"
										className="w-xs"
										id="email-1"
										name="email"
										placeholder="Enter an email"
										autoComplete="off"
									/>
									{fieldState.invalid && (
										<FieldError
											errors={[fieldState.error]}
										/>
									)}
								</Field>
							)}
						/>
						<Controller
							name="password"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field
									data-invalid={fieldState.invalid}
									className="flex flex-col items-center"
								>
									<Label
										htmlFor="password-1"
										className="w-xs"
									>
										Password{" "}
										<span className="text-destructive">
											*
										</span>
									</Label>

									<div className="flex flex-row items-center gap-2">
										<div className="relative">
											<Input
												{...field}
												type={
													showPassword
														? "text"
														: "password"
												}
												id="password-1"
												name="password-1"
												autoComplete="off"
												className="pr-10"
												placeholder="Enter a strong password"
												required
												aria-invalid={
													fieldState.invalid
												}
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
												onClick={() =>
													setShowPassword(
														(prev) => !prev,
													)
												}
											>
												{showPassword ? (
													<EyeOffIcon className="h-4 w-4 text-muted-foreground" />
												) : (
													<EyeIcon className="h-4 w-4 text-muted-foreground" />
												)}
												<span className="sr-only">
													{showPassword
														? "Hide password"
														: "Show password"}
												</span>
											</Button>
										</div>

										<Button
											variant="ghost"
											className="cursor-pointer font-normal"
											onClick={() => {
												const newPassword =
													generateStrongPassword();

												form.setValue(
													"password",
													newPassword,
													{
														shouldValidate: true,
														shouldDirty: true,
													},
												);
											}}
										>
											Generate
										</Button>
									</div>
									{fieldState.invalid && (
										<FieldError
											errors={[fieldState.error]}
										/>
									)}
								</Field>
							)}
						/>
						<Controller
							name="role"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field
									data-invalid={fieldState.invalid}
									className="flex flex-col items-center"
								>
									<Label htmlFor="pu-1" className="w-xs">
										Role{" "}
										<span className="text-destructive">
											*
										</span>
									</Label>
									<Select
										required
										value={field.value}
										onValueChange={field.onChange}
									>
										<SelectTrigger
											className="w-full grow-2"
											aria-invalid={fieldState.invalid}
										>
											<SelectValue
												placeholder="Select a role"
												{...field}
												aria-invalid={
													fieldState.invalid
												}
											/>
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectItem value="student">
													Student
												</SelectItem>
												<SelectItem value="staff">
													Staff
												</SelectItem>
												<SelectItem value="admin">
													Admin
												</SelectItem>
											</SelectGroup>
										</SelectContent>
									</Select>
								</Field>
							)}
						/>
					</FieldGroup>
					<DialogFooter className="bg-transparent border-0">
						<DialogClose
							asChild
							onClick={() => handleDialogClose()}
						>
							<Button
								variant="default"
								className="bg-foreground rounded-sm justify-self-end"
							>
								Cancel
							</Button>
						</DialogClose>
						<Button
							variant="outline"
							type="submit"
							form="create-user-form"
							className="rounded-sm justify-self-end"
						>
							Add
						</Button>
					</DialogFooter>
				</DialogContent>
			</form>
		</Dialog>
	);
};

export default UpdateUserForm;
