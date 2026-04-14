import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import FormMessage from "../../components/Form/FormMessage";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import PasswordInput from "../../components/Input/PasswordInput";
import {
  PASSWORD_RULES,
  VERIFICATION_CODE_RULES,
} from "../../constants/HookFormValidatonRules";
import { FormStyle } from "../../constants/Styles";
import FormBottomLink from "../../components/Form/BottomLink";
import AuthRecoveryLayout from "../../layouts/Form/AuthRecoveryLayout";
import { authService } from "../../roundtable";
import useResendCooldown from "../../hooks/useResendCoolDownTime";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";

export default function ResetPassword() {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onBlur" });
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);

  const { formattedTime, isCooldownActive, startCooldown } =
    useResendCooldown(120); // 2 minutes

  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!auth.user?.email) {
      // runs when user refreshes the page.
      navigate("/login");
    }
  }, [auth.user?.email, navigate]);

  useEffect(() => {
    startCooldown();
  }, []);

  const newPassword = watch("newPassword", "");

  // Submit new password
  const onSubmit = async ({ code, newPassword }) => {
    clearErrors("root");
    setSuccess(false);
    setResendSuccess(false);

    try {
      await authService.resetPassword({
        email: auth.user.email,
        code,
        newPassword: newPassword,
      });
      setSuccess(true);
    } catch (error) {
      setError(error.field, {
        type: "server",
        message: error.message,
      });
    }
  };

  const handleResend = async () => {
    clearErrors("root");
    setResendSuccess(false);
    setResendLoading(true);

    try {
      await authService.resendResetPasswordCode({ email: auth.user.email });
      startCooldown();
      setResendSuccess(true);
      setTimeout(() => {
        setResendSuccess(false);
      }, 5000);
    } catch (error) {
      setError("root", {
        type: "server",
        message: error.message,
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthRecoveryLayout
      imageSrc="https://picsum.photos/seed/picsum/800/600"
      title="Reset your password"
      description="Enter the verification code sent to your email and choose a new password."
      headerText="Reset Password"
      headerContent="Check your inbox for the verification code, then set a new password to secure your account."
    >
      <>
        <FormMessage type="error" message={errors.root?.message} />

        {success && (
          <FormMessage
            message={
              <>
                Your password has been reset successfully. You can now{" "}
                <Link to="/login" className="font-bold">
                  Log In
                </Link>
                .
              </>
            }
          />
        )}

        {resendSuccess && (
          <FormMessage
            type="success"
            message="A new verification code has been sent to your email."
          />
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className={FormStyle}
        >
          <Input
            label="Verification code"
            type="text"
            inputMode="numeric"
            placeholder="Enter 6-digit code"
            {...register("code", VERIFICATION_CODE_RULES)}
            error={errors.code?.message}
          />

          <PasswordInput
            label="New password"
            placeholder="Enter new password"
            {...register("newPassword", PASSWORD_RULES)}
            error={errors.newPassword?.message}
          />

          <PasswordInput
            label="Confirm password"
            placeholder="Re-enter new password"
            {...register("confirmPassword", {
              validate: (value) =>
                value === newPassword || "Passwords do not match",
            })}
            error={errors.confirmPassword?.message}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Resetting…" : "Reset Password"}
          </Button>
        </form>

        <div className="flex flex-col items-center gap-2 py-4">
          <FormBottomLink
            text="Didn’t receive the code?"
            linkTextOrComp={
              <button
                type="button"
                disabled={
                  resendLoading ||
                  isCooldownActive ||
                  isSubmitting || // ❌ Disable resend while submitting password reset
                  success // ❌ Disable resend after success
                }
                onClick={handleResend}
                className="disabled:opacity-50"
              >
                {resendLoading
                  ? "Resending…"
                  : isCooldownActive
                    ? `Resend in ${formattedTime}`
                    : "Resend"}
              </button>
            }
          />
        </div>
      </>
    </AuthRecoveryLayout>
  );
}
