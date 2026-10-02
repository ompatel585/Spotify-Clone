"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLoginMutation } from "@/api/endpoints/auth-api";
import { FormAlert } from "@/components/auth/form-alert";
import { GoogleButton } from "@/components/auth/google-button";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { type LoginValues, loginSchema } from "@/schemas/auth-schemas";
import { applyAuthError } from "@/utils/auth-errors";

interface LoginFormProps {
	/** Already validated same-origin path. */
	next: string;
	/** Message shown before the user does anything (OAuth failure, expired session). */
	initialError?: string | null;
}

export function LoginForm({ next, initialError = null }: LoginFormProps) {
	const router = useRouter();
	const [login] = useLoginMutation();
	const [formError, setFormError] = useState<string | null>(initialError);
	const {
		register,
		handleSubmit,
		setError,
		setFocus,
		formState: { errors, isSubmitting, isSubmitSuccessful },
	} = useForm<LoginValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: "", password: "" },
	});

	useEffect(() => {
		setFocus("email");
	}, [setFocus]);

	const onSubmit = handleSubmit(async (values) => {
		setFormError(null);
		try {
			await login(values).unwrap();
			router.replace(next);
			router.refresh();
		} catch (error) {
			setFormError(applyAuthError(error, ["email", "password"], setError));
		}
	});

	return (
		<form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
			<FormAlert message={formError} />
			<FormField label="Email" error={errors.email?.message}>
				<Input
					type="email"
					inputMode="email"
					autoComplete="username"
					autoCapitalize="none"
					spellCheck={false}
					placeholder="name@example.com"
					{...register("email")}
				/>
			</FormField>
			<FormField label="Password" error={errors.password?.message}>
				<PasswordInput autoComplete="current-password" placeholder="Password" {...register("password")} />
			</FormField>
			<Button type="submit" size="lg" loading={isSubmitting || isSubmitSuccessful} className="mt-2 w-full">
				Log in
			</Button>
			<GoogleButton />
		</form>
	);
}
