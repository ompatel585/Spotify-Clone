"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRegisterMutation } from "@/api/endpoints/auth-api";
import { FormAlert } from "@/components/auth/form-alert";
import { GoogleButton } from "@/components/auth/google-button";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { type RegisterValues, registerSchema } from "@/schemas/auth-schemas";
import { PASSWORD_MIN_LENGTH } from "@/types/contracts";
import { applyAuthError } from "@/utils/auth-errors";

export function RegisterForm({ next }: { next: string }) {
	const router = useRouter();
	const [registerUser] = useRegisterMutation();
	const [formError, setFormError] = useState<string | null>(null);
	const {
		register,
		handleSubmit,
		setError,
		setFocus,
		formState: { errors, isSubmitting, isSubmitSuccessful },
	} = useForm<RegisterValues>({
		resolver: zodResolver(registerSchema),
		defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
	});

	useEffect(() => {
		setFocus("name");
	}, [setFocus]);

	const onSubmit = handleSubmit(async ({ name, email, password }) => {
		setFormError(null);
		try {
			await registerUser({ name, email, password }).unwrap();
			router.replace(next);
			router.refresh();
		} catch (error) {
			setFormError(applyAuthError(error, ["name", "email", "password"], setError));
		}
	});

	return (
		<form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
			<FormAlert message={formError} />
			<FormField label="Name" error={errors.name?.message}>
				<Input autoComplete="name" placeholder="What should we call you?" {...register("name")} />
			</FormField>
			<FormField label="Email" error={errors.email?.message}>
				<Input
					type="email"
					inputMode="email"
					autoComplete="email"
					autoCapitalize="none"
					spellCheck={false}
					placeholder="name@example.com"
					{...register("email")}
				/>
			</FormField>
			<FormField
				label="Password"
				hint={`Use at least ${PASSWORD_MIN_LENGTH} characters.`}
				error={errors.password?.message}
			>
				<PasswordInput autoComplete="new-password" placeholder="Password" {...register("password")} />
			</FormField>
			<FormField label="Confirm password" error={errors.confirmPassword?.message}>
				<PasswordInput
					autoComplete="new-password"
					placeholder="Repeat your password"
					{...register("confirmPassword")}
				/>
			</FormField>
			<Button type="submit" size="lg" loading={isSubmitting || isSubmitSuccessful} className="mt-2 w-full">
				Sign up
			</Button>
			<GoogleButton />
		</form>
	);
}
