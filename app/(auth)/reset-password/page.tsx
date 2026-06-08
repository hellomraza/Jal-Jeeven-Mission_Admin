"use client";

import { resetPasswordAction } from "@/actions/authAction";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ActionState } from "@/utils/action-helper";
import { Loader2, ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useState, useEffect, Suspense } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [clientError, setClientError] = useState("");
  const [successRedirect, setSuccessRedirect] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (_: ActionState, formData: FormData) => {
      setClientError("");

      if (otp.length !== 6) {
        setClientError("Please enter a valid 6-digit OTP.");
        return { error: "", success: "", data: null };
      }

      if (newPassword !== confirmPassword) {
        setClientError("Passwords do not match.");
        return { error: "", success: "", data: null };
      }

      const response = await resetPasswordAction(formData);
      if (response.error) {
        return { error: response.error, success: "", data: null };
      }

      setSuccessRedirect(true);
      return { error: "", success: response.success, data: null };
    },
    { error: "", success: "", data: null }
  );

  // Redirect to login after 3 seconds on success
  useEffect(() => {
    if (successRedirect) {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successRedirect, router]);

  return (
    <div className="min-h-screen relative bg-white overflow-hidden flex w-full">
      {/* Background shape */}
      <div
        className="absolute inset-0 z-0 bg-[#136FB6]"
        style={{ clipPath: "polygon(0 0, 62% 0, 40% 100%, 0% 100%)" }}
      ></div>

      {/* Main Container */}
      <div className="flex w-full mx-auto">
        {/* Left Side: Reset Password Form */}
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

            {successRedirect ? (
              <div className="flex flex-col items-center text-center py-6">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4 animate-bounce" />
                <h1 className="text-[22px] font-extrabold text-gray-900 mb-2">
                  Password Reset!
                </h1>
                <p className="text-[12px] text-gray-500 font-medium max-w-xs leading-relaxed">
                  Your password has been successfully reset. We are redirecting you to the login page...
                </p>
              </div>
            ) : (
              <>
                <h1 className="text-[22px] font-extrabold text-gray-900 mb-2">
                  Reset Password
                </h1>
                <p className="text-[12px] text-gray-500 mb-4 font-medium leading-relaxed">
                  Please enter the OTP and your new password.
                </p>

                {(state.error || clientError) && (
                  <div className="bg-red-50 text-red-500 text-[11px] p-2 rounded mb-3 border border-red-100 font-medium">
                    {state.error || clientError}
                  </div>
                )}

                <form action={formAction} className="space-y-3">
                  {/* Hidden inputs to send to Server Action */}
                  <input type="hidden" name="email" value={email} />
                  <input type="hidden" name="otp" value={otp} />

                  <div>
                    <Field>
                      <FieldLabel className="text-xs text-gray-400 font-semibold">
                        Email or User Code
                      </FieldLabel>
                      <Input
                        type="text"
                        disabled
                        value={email}
                        className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed text-[12px]"
                      />
                    </Field>
                  </div>

                  <div>
                    <Field>
                      <FieldLabel className="text-xs text-gray-500 font-semibold mb-1">
                        Enter 6-Digit OTP
                      </FieldLabel>
                      <div className="flex justify-center py-1">
                        <InputOTP
                          maxLength={6}
                          value={otp}
                          onChange={(val) => setOtp(val)}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </Field>
                  </div>

                  <div>
                    <Field>
                      <FieldLabel className="text-xs text-gray-500 font-semibold">
                        New Password
                      </FieldLabel>
                      <div className="relative">
                        <Input
                          placeholder="Enter new password"
                          type={showNewPassword ? "text" : "password"}
                          name="newPassword"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <Button
                          className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </Field>
                  </div>

                  <div>
                    <Field>
                      <FieldLabel className="text-xs text-gray-500 font-semibold">
                        Confirm New Password
                      </FieldLabel>
                      <div className="relative">
                        <Input
                          placeholder="Confirm new password"
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <Button
                          className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </Field>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" disabled={isPending}>
                      {isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Resetting Password...
                        </>
                      ) : (
                        "Reset Password"
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
              </>
            )}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#136FB6] text-white font-medium">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Loading...
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
