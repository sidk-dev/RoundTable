import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";

import AuthMainLayout from "../../layouts/Form/AuthMainLayout";
import {
  userEmailAdded,
  userLoggedIn,
  userPasswordTempAdded,
} from "../../features/auth/authSlice";
import { authService } from "../../roundtable";
import FormMessage from "../../components/Form/FormMessage";
import {
  EMAIL_RULES,
  PASSWORD_RULES,
} from "../../constants/HookFormValidatonRules";
import { FormStyle } from "../../constants/Styles";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import PasswordInput from "../../components/Input/PasswordInput";
import FormBottomLink from "../../components/Form/BottomLink";
import { useNavigate } from "react-router";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async ({ email, password }) => {
    clearErrors("root");

    try {
      const response = await authService.userLogin({
        email,
        password,
      });

      if (response.page == "/verify-email") {
        // Verify the email first.
        dispatch(userEmailAdded(email));
        dispatch(userPasswordTempAdded(password));
        // resend verify code.
        authService.resendUserSignUpCode({
          email: email,
        });
        navigate(response.page);
      } else {
        // Normal login
        dispatch(
          userLoggedIn({
            ...response.userData,
          }),
        );
      }
    } catch (error) {
      setError(error.field, {
        type: "server",
        message: error.message,
      });
    }
  };

  return (
    <AuthMainLayout
      imageSrc="https://picsum.photos/seed/picsum/800/600"
      title="Welcome back"
      description="Secure access to your dashboard, insights, and tools — all in one place."
      headerText={"Log In"}
      headerContent={"Log In to you account"}
    >
      <>
        <FormMessage type="error" message={errors.root?.message} />

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className={`${FormStyle}`}
        >
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email", EMAIL_RULES)}
            error={errors.email?.message}
          />

          <PasswordInput
            label="Password"
            placeholder="••••••••"
            {...register("password", PASSWORD_RULES)}
            error={errors.password?.message}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in…" : "Log in"}
          </Button>
        </form>

        <div className="flex flex-col items-center gap-2 py-4">
          <FormBottomLink
            text="Don’t have an account?"
            linkTextOrComp="Sign Up"
            to={"/signup"}
          />
          <FormBottomLink
            text="Forgot your password?"
            linkTextOrComp="Reset it here"
            to={"/forgot-password"}
          />
        </div>
      </>
    </AuthMainLayout>
  );
}
