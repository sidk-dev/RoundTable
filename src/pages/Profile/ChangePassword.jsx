import { useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../../components/Button/Button";
import FormMessage from "../../components/Form/FormMessage";
import PasswordInput from "../../components/Input/PasswordInput";
import { PASSWORD_RULES } from "../../constants/HookFormValidatonRules";
import { authService } from "../../roundtable";

function ChangePasswordPage() {
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async ({ currentPassword, newPassword }) => {
    clearErrors("root");
    setSuccessMessage("");

    try {
      await authService.changePassword({
        oldPassword: currentPassword,
        newPassword,
      });

      setSuccessMessage("Password updated successfully.");
    } catch (error) {
      setError(error.field || "root", {
        type: "server",
        message: error.message || "Unable to change password.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-bg px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-t-primary">
            Change password
          </h1>
          <p className="mt-2 max-w-xl text-sm text-t-muted">
            Use a strong password you have not used before.
          </p>
        </header>

        <div className="overflow-hidden rounded-2xl bg-surface shadow-lg">
          <div className="h-1 bg-primary" />

          <div className="p-6 sm:p-8">
            <FormMessage
              type="error"
              message={errors.root?.message}
              className="mb-6"
            />
            <FormMessage
              type="success"
              message={successMessage}
              className="mb-6"
            />

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-4"
            >
              <PasswordInput
                label="Current password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("currentPassword", {
                  required: "Current password is required",
                })}
                error={errors.currentPassword?.message}
              />

              <PasswordInput
                label="New password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register("newPassword", {
                  ...PASSWORD_RULES,
                  validate: {
                    ...PASSWORD_RULES.validate,
                    notSameAsCurrent: (value) =>
                      value !== getValues("currentPassword") ||
                      "New password must be different from current password",
                  },
                })}
                error={errors.newPassword?.message}
              />

              <PasswordInput
                label="Confirm new password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register("confirmNewPassword", {
                  required: "Please confirm your new password",
                  validate: (value) =>
                    value === getValues("newPassword") ||
                    "Passwords do not match",
                })}
                error={errors.confirmNewPassword?.message}
              />

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating password…" : "Update password"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordPage;
