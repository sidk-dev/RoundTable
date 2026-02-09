import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";

import AuthMainLayout from "../../layouts/Form/AuthMainLayout";
import { userEmailAdded } from "../../features/auth/authSlice";
import FormMessage from "../../components/Form/FormMessage";
import {
  FIRST_NAME_RULES,
  LAST_NAME_RULES,
  EMAIL_RULES,
  PASSWORD_RULES,
} from "../../constants/HookFormValidatonRules";
import { FormStyle } from "../../constants/Styles";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import PasswordInput from "../../components/Input/PasswordInput";
import FormBottomLink from "../../components/Form/BottomLink";
import Checkbox from "../../components/Input/CheckboxInput";
import { authService } from "../../roundtable";
import { useNavigate } from "react-router";

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onBlur" });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async ({ email, password, firstName, lastName }) => {
    clearErrors("root");

    try {
      const response = await authService.userSignup({
        email,
        password,
        firstName,
        lastName,
      });
      dispatch(userEmailAdded(email));
      // Navigate user to confirmation page
      navigate(response.page);
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
      title="Create your account"
      description="Join us to access powerful tools, insights, and a personalized dashboard."
      headerText={"Sign up"}
      headerContent={"Create an account to get started"}
    >
      <>
        <FormMessage type="error" message={errors.root?.message} />

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className={FormStyle}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First name"
              placeholder="Siddharth"
              autoComplete="given-name"
              {...register("firstName", FIRST_NAME_RULES)}
              error={errors.firstName?.message}
            />

            <Input
              label="Last name"
              placeholder="Kumar"
              autoComplete="family-name"
              {...register("lastName", LAST_NAME_RULES)}
              error={errors.lastName?.message}
            />
          </div>

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

          {/* <Checkbox
            label="I agree to the"
            link={{ href: "/terms", text: "Terms & Conditions" }}
            error={errors.terms?.message}
            {...register("terms", {
              required: "You must accept the terms and conditions",
            })}
          /> */}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <FormBottomLink
          className="py-4"
          text="Already have an account?"
          linkTextOrComp="Log In"
          to={"/login"}
        />
      </>
    </AuthMainLayout>
  );
}
