import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

import { profileUpdated } from "../../features/auth/authSlice";
import { authService } from "../../roundtable";

import FormMessage from "../../components/Form/FormMessage";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";

import {
  FIRST_NAME_RULES,
  LAST_NAME_RULES,
} from "../../constants/HookFormValidatonRules";
import SelectInput from "../../components/Input/SelectInput";
import { useNavigate } from "react-router";
import FileInput from "../../components/Input/FileInput";
import TextareaInput from "../../components/Input/TextareaInput";

export default function EditProfilePage() {
  return <EditProfilePage_Fun />;
}

function EditProfilePage_Fun() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    control,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      gender: user.gender,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      dateOfBirth: user.dateOfBirth,
      bio: user.bio,
      profileImage: user.profileImage,
    },
  });

  const today = new Date();
  today.setFullYear(today.getFullYear() - 18);
  const maxDate = today.toISOString().split("T")[0];

  const onSubmit = async (data) => {
    console.log("data", data);
    clearErrors("root");

    try {
      let userModelObject = {};
      let userCognitoObject = {};

      if (data.gender != user.gender) {
        userModelObject.gender = data.gender;
      } else if (data.firstName != user.firstName) {
        userCognitoObject.given_name = data.firstName;
        userModelObject.firstName = data.firstName;
      } else if (data.lastName != user.lastName) {
        userCognitoObject.family_name = data.lastName;
        userModelObject.lastName = data.lastName;
      } else if (data.dateOfBirth != user.dateOfBirth) {
        userModelObject.dateOfBirth = data.dateOfBirth;
      } else if (data.bio != user.bio) {
        userModelObject.bio = data.bio;
      } else if (data.profileImage != user.profileImage) {
        userModelObject.profileImage = data.profileImage;
      }

      let totalLength = Object.keys(userModelObject).length;

      if (totalLength > 0) {
        const response = await authService.updateUserProfile(
          userModelObject,
          userCognitoObject,
          user.userId,
          user.profileImage,
        );

        // console.log("response", response);
        dispatch(profileUpdated({ ...response }));
        navigate("/profile");
      } else {
        setError("root", {
          type: "server",
          message: "No edits in profile.",
        });
        window.scrollTo({
          top: 0,
          behavior: "smooth", // Smooth animation
        });
        // We can also use "isDirty" from formState
      }
    } catch (error) {
      setError(error.field, {
        type: "server",
        message: error.message || "Unable to update profile",
      });
    }
  };

  return (
    <div className="min-h-screen bg-bg px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Page header */}
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-t-primary">
            Edit profile
          </h1>
          <p className="mt-2 max-w-xl text-sm text-t-muted">
            Update your personal details and how others see you.
          </p>
        </header>

        {/* Surface */}
        <div className="overflow-hidden rounded-2xl bg-surface shadow-lg">
          {/* Accent line */}
          <div className="h-1 bg-primary" />

          <div className="p-6 sm:p-8">
            <FormMessage
              type="error"
              message={errors.root?.message}
              className="mb-6"
            />

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-8"
            >
              {/* Basic information */}
              <section>
                <h2 className="mb-4 text-lg font-medium text-t-primary">
                  Basic information
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

                <div className="mt-4">
                  <Input
                    label="Email address"
                    type="email"
                    disabled
                    autoComplete="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    error={errors.email?.message}
                  />
                </div>
              </section>

              {/* Personal details */}
              <section>
                <h2 className="mb-4 text-lg font-medium text-t-primary">
                  Personal details
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Date of birth"
                    max={maxDate}
                    type="date"
                    {...register("dateOfBirth", {
                      validate: (value) => {
                        if (value && new Date(value) > new Date(maxDate)) {
                          return "You must be at least 18 years old";
                        }
                      },
                    })}
                    error={errors.dateOfBirth?.message}
                  />

                  <SelectInput
                    label="Gender"
                    autoComplete="off"
                    {...register("gender")}
                    error={errors.gender?.message}
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </SelectInput>
                </div>

                <div className="mt-4">
                  <Controller
                    name="profileImage"
                    control={control}
                    rules={{
                      validate: {
                        isImage: (file) =>
                          !file ||
                          [
                            "image/png",
                            "image/jpeg",
                            "image/jpg",
                            "image/webp",
                          ].includes(file.type) ||
                          "Only PNG, JPG, JPEG, or WEBP files are allowed",

                        fileSize: (file) =>
                          !file ||
                          file.size <= 2 * 1024 * 1024 || // 2MB limit
                          "Image must be smaller than 2MB",
                      },
                    }}
                    render={({ field }) => (
                      <FileInput
                        label="Profile Image"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.profileImage?.message}
                      />
                    )}
                  />
                </div>

                <div className="mt-4">
                  <TextareaInput
                    label={"Bio"}
                    placeholder="Tell us a little about yourself"
                    error={errors.bio?.message}
                    {...register("bio", {
                      maxLength: {
                        value: 300,
                        message: "Bio is too long.",
                      },
                    })}
                  />
                </div>
              </section>

              {/* Actions */}
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving changes…" : "Save changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
