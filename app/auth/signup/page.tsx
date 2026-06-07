'use client'
import AnimatedButton from "@/components/ui/AnimatedButton";
import FallingGridBackground from "@/components/layout/FallingGridBackground";
import { ChangeEvent, FocusEvent, SubmitEvent, useState } from "react";

type SignupFormData = {
    username: string;
    email: string;
    firstname: string;
    lastname: string;
    password: string;
    confirmPassword: string;
    terms: boolean;
};

export default function Signup() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState<SignupFormData>({
        username: "",
        email: "",
        firstname: "",
        lastname: "",
        password: "",
        confirmPassword: "",
        terms: false,
    });
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [submitted, setSubmitted] = useState(false);

    const capitalizeFirst = (value: string) => {
        if (!value) return "";
        return value.charAt(0).toUpperCase() + value.slice(1);
    };

    const getErrors = (values: SignupFormData) => {
        const errors: Record<string, string> = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;
        const nameRegex = /^[\p{L}][\p{L}\s'.-]*$/u;

        if (values.username.length < 8 || values.username.length > 16) {
            errors.username = "Username must be 8 to 16 characters.";
        }

        if (!emailRegex.test(values.email)) {
            errors.email = "Please enter a valid email address.";
        }

        if (!values.firstname.trim()) {
            errors.firstname = "First name is required.";
        } else if (!nameRegex.test(values.firstname.trim())) {
            errors.firstname = "First name can only contain letters, spaces, apostrophes, hyphens, and periods.";
        }

        if (!values.lastname.trim()) {
            errors.lastname = "Last name is required.";
        } else if (!nameRegex.test(values.lastname.trim())) {
            errors.lastname = "Last name can only contain letters, spaces, apostrophes, hyphens, and periods.";
        }

        if (!passwordRegex.test(values.password)) {
            errors.password = "Password must be 8-16 chars, include 1 capital letter and 1 special character.";
        }

        if (values.confirmPassword !== values.password) {
            errors.confirmPassword = "Passwords do not match.";
        }

        if (!values.terms) {
            errors.terms = "You must agree to the terms and privacy policy.";
        }

        return errors;
    };

    const errors = getErrors(formData);

    const shouldShowError = (field: string) => (touched[field] || submitted) && errors[field];

    const inputClassName = (field: string, withPaddingRight = false) =>
        `block w-full min-h-9 rounded-md p-2 shadow-sm sm:text-sm ${withPaddingRight ? "pr-10" : ""} ${
            shouldShowError(field)
                ? "border border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border border-black focus:border-black focus:ring-black"
        }`;

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = event.target;

        setFormData((prev) => {
            if (name === "firstname" || name === "lastname") {
                const cleanedValue = value.replace(/[^\p{L}\s'.-]/gu, "");
                return {
                    ...prev,
                    [name]: capitalizeFirst(cleanedValue),
                };
            }

            return {
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            };
        });
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
        setTouched((prev) => ({
            ...prev,
            [event.target.name]: true,
        }));
    };

    const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitted(true);

        if (Object.keys(errors).length > 0) {
            return;
        }

        // Submit integration goes here.
        console.log("Signup form is valid", formData);
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-zinc-100">
            <FallingGridBackground />
            <div className="relative mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-2xl border border-black/15 bg-white/88 p-10 backdrop-blur-[1.5px]">
                        <a href="/" className="no-underline"><h1 className="text-3xl font-bold">TeamSync</h1></a>
                        <br></br>
                        <p>Create a new account</p>
                        <p className="text-sm text-gray">Already have an account? <a href="/auth/login" className="text-gray-500">Sign in here</a>.</p>
                            <form className="mt-6" onSubmit={handleSubmit} noValidate>
                                 <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                                    <input type="text" id="username" name="username" required minLength={8} maxLength={16} value={formData.username} onChange={handleChange} onBlur={handleBlur} className={`mt-1 ${inputClassName("username")}`} />
                                    {shouldShowError("username") && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
                                </div>
                                <div>
                                    <label htmlFor="email" className="mt-2 block text-sm font-medium text-gray-700">Email</label>
                                    <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} onBlur={handleBlur} className={`mt-1 ${inputClassName("email")}`} />
                                    {shouldShowError("email") && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="firstname" className="mt-2 block text-sm font-medium text-gray-700">Firstname</label>
                                        <input type="text" id="firstname" name="firstname" required pattern="[A-Za-zÀ-ÿ' .-]+" title="Letters, spaces, apostrophes, hyphens, and periods only" value={formData.firstname} onChange={handleChange} onBlur={handleBlur} className={`mt-1 ${inputClassName("firstname")}`} />
                                        {shouldShowError("firstname") && <p className="mt-1 text-sm text-red-600">{errors.firstname}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="lastname" className="mt-2 block text-sm font-medium text-gray-700">Lastname</label>
                                        <input type="text" id="lastname" name="lastname" required pattern="[A-Za-zÀ-ÿ' .-]+" title="Letters, spaces, apostrophes, hyphens, and periods only" value={formData.lastname} onChange={handleChange} onBlur={handleBlur} className={`mt-1 ${inputClassName("lastname")}`} />
                                        {shouldShowError("lastname") && <p className="mt-1 text-sm text-red-600">{errors.lastname}</p>}
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                    <div className="relative mt-1">
                                        <input type={showPassword ? "text" : "password"} id="password" name="password" required minLength={8} maxLength={16} value={formData.password} onChange={handleChange} onBlur={handleBlur} className={inputClassName("password", true)} />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            className="absolute inset-y-0 right-0 inline-flex items-center px-3 text-black/60 transition hover:text-black"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? (
                                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                                    <path d="M3 3l18 18" />
                                                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                                                    <path d="M9.9 5.1A10.5 10.5 0 0 1 12 5c5.2 0 9.3 4.4 10 7-.2.9-.9 2.3-2 3.7" />
                                                    <path d="M6.2 6.2C3.9 7.8 2.4 10.1 2 12c.7 2.6 4.8 7 10 7 1.3 0 2.5-.3 3.6-.8" />
                                                </svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                                    <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {shouldShowError("password") && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                                </div>
                                <div className="mt-2">
                                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                    <div className="relative mt-1">
                                        <input type={showConfirmPassword ? "text" : "password"} id="confirm-password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur} className={inputClassName("confirmPassword", true)} />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                                            className="absolute inset-y-0 right-0 inline-flex items-center px-3 text-black/60 transition hover:text-black"
                                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        >
                                            {showConfirmPassword ? (
                                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                                    <path d="M3 3l18 18" />
                                                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                                                    <path d="M9.9 5.1A10.5 10.5 0 0 1 12 5c5.2 0 9.3 4.4 10 7-.2.9-.9 2.3-2 3.7" />
                                                    <path d="M6.2 6.2C3.9 7.8 2.4 10.1 2 12c.7 2.6 4.8 7 10 7 1.3 0 2.5-.3 3.6-.8" />
                                                </svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                                    <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {shouldShowError("confirmPassword") && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                                </div>
                                <div className="mt-4 flex items-start gap-2 text-sm text-gray-600">
                                    <input type="checkbox" id="terms" name="terms" required checked={formData.terms} onChange={handleChange} onBlur={handleBlur} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
                                    <label htmlFor="terms">I agree to the <a href="/terms" className="text-gray-500">Terms of Service</a> and <a href="/privacy" className="text-gray-500">Privacy Policy</a>.</label>
                                </div>
                                {shouldShowError("terms") && <p className="mt-1 text-sm text-red-600">{errors.terms}</p>}
                                <AnimatedButton className="mx-auto mt-4 w-full h-11 py-0 normal-case" type="submit">
                                    Create Account
                                </AnimatedButton>
                            </form>
                    </div>
                </div>
        </div>
    )
}