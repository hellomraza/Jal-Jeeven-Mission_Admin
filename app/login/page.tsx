"use client";

import { loginUserAction } from "@/actions/authAction";
import InputWithPassword from "@/components/InputWithPassword";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { useActionState, useState } from "react";

export default function LoginPage() {
  const { mutate: login } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [, formAction, isPending] = useActionState(
    async (_, formData: FormData) => {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const response = await loginUserAction({ email, password });
      localStorage.setItem("admin_token", response.access_token);
      redirect("/dashboard"); // Redirect to dashboard after successful login
    },
    null,
  );

  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    login({ email, password });
  };

  return (
    <div className="min-h-screen relative bg-white overflow-hidden flex">
      {/* Background shape */}
      <div
        className="absolute inset-0 z-0 bg-[#136FB6]"
        style={{ clipPath: "polygon(0 0, 62% 0, 40% 100%, 0% 100%)" }}
      ></div>

      {/* Main Container */}
      <div className="  flex w-full mx-auto">
        {/* Left Side: Login Form */}
        <div className="  w-full max-h-[200px] h-full max-w-[424px] flex items-center justify-center p-8 mx-auto my-auto relative z-20">
          <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-[400px] xl:max-w-[420px] flex flex-col">
            <div className="flex flex-col items-center mb-4">
              <Image
                src="/logo.png"
                alt="Logo"
                width={56}
                height={56}
                className="object-contain"
                priority
              />
              <h2 className="text-[10px] font-bold mt-1 text-[#1a2b3c] tracking-wide text-center uppercase">
                Jal Jeevan Mission
              </h2>
            </div>

            <h1 className="text-[22px] font-extrabold text-gray-900 mb-4">
              Sign In
            </h1>

            <button
              type="button"
              disabled={isPending}
              onClick={() => {}} // Google Sign In Not Implemented
              className="w-full bg-[#136FB6] hover:bg-[#105E9A] text-white py-2.5 rounded-[8px] font-medium transition flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(19,111,182,0.39)] mb-4 text-[12px] disabled:opacity-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                width="15px"
                height="15px"
              >
                <path
                  fill="#ffffff"
                  d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                />
              </svg>
              Sign In With Google
            </button>

            <div className="flex items-center mb-4">
              <div className="flex-1 h-[1px] bg-gray-200"></div>
              <span className="px-3 text-[11px] text-zinc-800 font-bold">
                Or
              </span>
              <div className="flex-1 h-[1px] bg-gray-200"></div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 text-[11px] p-2 rounded mb-3 border border-red-100 font-medium">
                {error}
              </div>
            )}

            <form action={formAction} className="space-y-3">
              <div>
                <Field>
                  <FieldLabel
                    htmlFor="email"
                    className="text-xs text-gray-500 font-semibold"
                  >
                    Email
                  </FieldLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    name="email"
                    placeholder="Enter email or mobile no."
                  />
                </Field>
              </div>

              <div>
                <InputWithPassword required name="password" />
                <div className="flex justify-end mt-1.5">
                  <a
                    href="#"
                    className="text-[10px] text-slate-700 font-bold hover:text-[#136FB6] transition decoration-[1.5px] border-b border-transparent hover:border-[#136FB6]"
                  >
                    Forgot Password?
                  </a>
                </div>
              </div>

              <div className="pt-1">
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-5 mb-1">
              <p className="text-center text-[11px] text-gray-800 font-medium">
                No Account ?{" "}
                <a
                  href="#"
                  className="text-[#136FB6] font-semibold hover:underline decoration-[1.5px] underline-offset-2"
                >
                  Sign Up
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Visuals */}
        <div className=" lg:flex w-[65%] relative z-10 items-center justify-center pointer-events-none">
          <div className="absolute bottom-[0] right-[26.5%] w-full max-w-[625px] h-full max-h-[260px] opacity-[0.85]">
            <Image
              src="/login logo.png"
              alt="Login Background Element"
              fill
              className="object-contain object-right-top"
            />
          </div>
          <div className="absolute right-[0] bottom-0 max-w-[524px] max-h-[524px] w-full h-full flex items-end opacity-[0.98]">
            <Image
              src="/tank.png"
              alt="Tank construction"
              fill
              className="object-contain object-right-bottom mix-blend-multiply"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
