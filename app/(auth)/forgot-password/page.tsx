"use client";

import { forgotPasswordAction } from "@/actions/authAction";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ActionState } from "@/utils/action-helper";
import { Loader2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const [state, formAction, isPending] = useActionState(
    async (_: ActionState, formData: FormData) => {
      const response = await forgotPasswordAction(formData);
      if (response.error) {
        return { error: response.error, success: "", data: null };
      }
      
      // Redirect to reset-password with email prefilled
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      return { error: "", success: response.success, data: null };
    },
    { error: "", success: "", data: null }
  );

  return (
    <div className="min-h-screen relative bg-white overflow-hidden flex w-full">
      {/* Background shape */}
      <div
        className="absolute inset-0 z-0 bg-[#136FB6]"
        style={{ clipPath: "polygon(0 0, 62% 0, 40% 100%, 0% 100%)" }}
      ></div>

      {/* Main Container */}
      <div className="flex w-full mx-auto">
        {/* Left Side: Forgot Password Form */}
        <div className="w-full max-h-50 h-full max-w-106 flex items-center justify-center p-8 mx-auto my-auto relative z-20">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-100 xl:max-w-105 flex flex-col">
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

            <h1 className="text-[22px] font-extrabold text-gray-900 mb-2">
              Forgot Password
            </h1>
            <p className="text-[12px] text-gray-500 mb-4 font-medium leading-relaxed">
              Enter your registered email address or user code below. We'll send you an OTP to reset your password.
            </p>

            {state.error && (
              <div className="bg-red-50 text-red-500 text-[11px] p-2 rounded mb-3 border border-red-100 font-medium">
                {state.error}
              </div>
            )}

            {state.success && (
              <div className="bg-green-50 text-green-600 text-[11px] p-2 rounded mb-3 border border-green-100 font-medium">
                {state.success}
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <div>
                <Field>
                  <FieldLabel
                    htmlFor="email"
                    className="text-xs text-gray-500 font-semibold"
                  >
                    Email or User Code
                  </FieldLabel>
                  <Input
                    type="text"
                    required
                    name="email"
                    placeholder="Enter email or user code"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-5 mb-1 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-[11px] text-[#136FB6] font-semibold hover:underline decoration-[1.5px] underline-offset-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Visuals */}
        <div className="lg:flex md:w-[65%] relative z-10 items-center justify-center pointer-events-none">
          <div className="absolute bottom-[0] right-[26.5%] w-full max-w-[625px] h-full max-h-[260px] opacity-[0.85]">
            <Image
              src="/login-logo.png"
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
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
