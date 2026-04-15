import { useForm } from "react-hook-form";
import AuthRecoveryLayout from "../../layouts/Form/AuthRecoveryLayout";
import FormMessage from "../../components/Form/FormMessage";
import { EMAIL_RULES } from "../../constants/HookFormValidatonRules";
import { FormStyle } from "../../constants/Styles";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import { authService } from "../../roundtable";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { userEmailAdded } from "../../features/auth/authSlice";

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onBlur" });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onSubmit = async ({ email }) => {
    clearErrors("root");
    try {
      await authService.forgotPassword({
        email,
      });
      dispatch(userEmailAdded(email));
      navigate("/reset-password");
    } catch (error) {
      setError(error.field, {
        type: "server",
        message: error.message,
      });
    }
  };

  return (
    <AuthRecoveryLayout
      imageSrc="/auth-image.jpg"
      title="Forgot your password?"
      description="No worries! Enter your email and we'll send you instructions to reset it."
      headerText="Forgot Password"
      headerContent="Enter the email associated with your account to receive a reset code."
    >
      <>
        <FormMessage type="error" message={errors.root?.message} />

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className={FormStyle}
        >
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register("email", EMAIL_RULES)}
            error={errors.email?.message}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending reset link…" : "Send reset link"}
          </Button>
        </form>
      </>
    </AuthRecoveryLayout>
  );
}
