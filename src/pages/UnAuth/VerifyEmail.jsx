import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import FormMessage from "../../components/Form/FormMessage";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import { VERIFICATION_CODE_RULES } from "../../constants/HookFormValidatonRules";
import { FormStyle } from "../../constants/Styles";
import AuthRecoveryLayout from "../../layouts/Form/AuthRecoveryLayout";
import FormBottomLink from "../../components/Form/BottomLink";
import { authService } from "../../roundtable";
import {
  userPasswordTempAdded,
  userSignUp,
} from "../../features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import useResendCooldown from "../../hooks/useResendCoolDownTime";
import { useNavigate } from "react-router";

export default function VerifyEmailPage() {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onBlur" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);

  const { formattedTime, isCooldownActive, startCooldown } =
    useResendCooldown(120); // 2 minutes

  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    startCooldown();
  }, []);

  useEffect(() => {
    if (!auth.user?.email) {
      // runs when user refreshes the page.
      navigate("/login");
    }
  }, [auth.user?.email, navigate]);

  const onSubmit = async ({ code }) => {
    clearErrors("root");
    try {
      const response = await authService.confirmUserSignup({
        password: auth.user?.password,
        email: auth.user.email,
        code,
      });

      if (auth.user?.password) {
        dispatch(userPasswordTempAdded(null)); // setting pasword value to null. This will be overriden by the userData.
      }

      dispatch(
        userSignUp({
          ...response.userData,
        }),
      );
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
      await authService.resendUserSignUpCode({
        email: auth.user.email,
      });
      startCooldown();
      setResendSuccess(true);
      setTimeout(() => {
        setResendSuccess(false);
      }, 5000);
    } catch (error) {
      setError(error.field, {
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
      title="Verify your email"
      description="Enter the verification code we sent to your email address."
      headerText="Email Verification"
      headerContent="Check your inbox and enter the 6-digit code below to verify your email."
    >
      <>
        <FormMessage type="error" message={errors.root?.message} />
        {resendSuccess && (
          <FormMessage message="A new verification code has been sent to your email." />
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className={`${FormStyle}`}
        >
          <Input
            label="Verification code"
            type="text"
            inputMode="numeric"
            placeholder="Enter 6-digit code"
            {...register("code", VERIFICATION_CODE_RULES)}
            error={errors.code?.message}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Verifying…" : "Verify email"}
          </Button>
        </form>

        <div className="flex flex-col items-center gap-2 py-4">
          <FormBottomLink
            text="Didn’t receive the code?"
            linkTextOrComp={
              <button
                type="button"
                disabled={resendLoading || isCooldownActive || isSubmitting} // ❌ Disable resend while submitting password reset
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
