import {
  autoSignIn,
  confirmResetPassword,
  confirmSignUp,
  getCurrentUser,
  resendSignUpCode,
  resetPassword,
  signIn,
  signOut,
  signUp,
  updatePassword,
  updateUserAttributes,
} from "aws-amplify/auth";
import { AUTH_ERROR } from "../constants/Messages";
import { generateClient } from "aws-amplify/data";
import { remove, uploadData } from "aws-amplify/storage";

// import { Amplify } from "aws-amplify";
// import outputs from "../../amplify_outputs.json";
import s3BucketService from "./s3Bucket";

/*
  This is implemented to: Amplify has not been configured. Please call Amplify.configure() before using this service.
*/
// Amplify.configure(outputs);

class AuthService {
  constructor() {
    /**
     * @type {import('aws-amplify/data').Client<import('../../amplify/data/resource').Schema>}
     */
    this.client = generateClient();
  }

  async _getUser() {
    // It's getting called 2 times, rectify. (May be because of <React.StrictMode>)
    const { userId: currentUserId } = await getCurrentUser();
    const { data } = await this.client.models.User.list({
      filter: {
        owner: {
          eq: currentUserId,
        },
      },
    });

    const userData = data[0];
    if (!userData) {
      throw new Error("User profile not found.");
    }

    let image;
    try {
      image = await s3BucketService.getImageUrl(userData.profileImage);
    } catch {
      image = null;
    }
    // console.log(image);

    return {
      userId: userData.id,
      currentUserId: currentUserId,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImage: image,
      profileImagePath: userData.profileImage || null,
      gender: userData.gender,
      dateOfBirth: userData.dateOfBirth,
      bio: userData.bio,
      postsCount: userData.postsCount,
      communitiesCount: userData.communitiesCount,
      membershipsCount: userData.membershipsCount,
    };
  }

  async _getUserById(userId, currentUserId = null) {
    if (!userId) {
      throw new Error("User id is required.");
    }

    const { data: userData, errors } = await this.client.models.User.get(
      { id: userId },
      {
        selectionSet: [
          "id",
          "email",
          "firstName",
          "lastName",
          "profileImage",
          "gender",
          "dateOfBirth",
          "bio",
          "postsCount",
          "communitiesCount",
          "membershipsCount",
        ],
      },
    );

    if (errors?.length) {
      throw errors;
    }

    if (!userData) {
      throw new Error("User profile not found.");
    }

    let image;
    try {
      image = await s3BucketService.getImageUrl(userData.profileImage);
    } catch {
      image = null;
    }

    return {
      userId: userData.id,
      currentUserId: currentUserId,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImage: image,
      profileImagePath: userData.profileImage || null,
      gender: userData.gender,
      dateOfBirth: userData.dateOfBirth,
      bio: userData.bio,
      postsCount: userData.postsCount,
      communitiesCount: userData.communitiesCount,
      membershipsCount: userData.membershipsCount,
    };
  }

  async userLogin(data) {
    try {
      const { nextStep } = await signIn({
        username: data.email,
        password: data.password,
      });
      const response = {
        page: null,
        userData: null,
      };

      switch (nextStep.signInStep) {
        case "DONE": {
          // Case 1: Verified user, successful login
          const userData = await this._getUser();
          response.userData = { ...userData };
          break;
        }

        case "CONFIRM_SIGN_UP":
          // Case 2: User signed up but didn't verify email
          response.page = "/verify-email";
          break;

        // Future Addon.
        // case "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED":
        //   // Case 3: Admin-created user (FORCE_CHANGE_PASSWORD) + Also create User Model for this model.
        //   response.page = "/set-new-password";
        //   break;

        default:
          throw new Error(AUTH_ERROR);
      }

      return response;
    } catch (error) {
      let field = "root"; // field/input on which the error should be shown.
      let safeMessage = "Log-In failed. Please try again."; // Default Message
      const errorName = error?.name || error?.code; // Use Amplify Error "name" or fallback to "code" for low-level SDK

      switch (errorName) {
        case "NotAuthorizedException":
          safeMessage = "Incorrect email or password.";
          break;

        case "EmptySignInUsername":
          safeMessage = "Email is required to LogIn.";
          field = "email";
          break;

        case "EmptySignInPassword":
          safeMessage = "Password is required to LogIn.";
          field = "password";
          break;

        case "UserAlreadyAuthenticatedException":
          safeMessage =
            "Something went wrong. Kindly empty your browser cache and try again.";
          break;
      }

      const err = new Error(safeMessage);
      err.name = errorName;
      err.field = field;
      throw err;
    }
  }

  async userLogout() {
    try {
      await signOut();
    } catch (error) {
      let field = "root";
      let safeMessage = "Log-Out failed. Please try again.";
      const errorName = error?.name || error?.code;

      const err = new Error(safeMessage);
      err.name = errorName;
      err.field = field;
      throw err;
    }
  }

  async userSignup(data) {
    try {
      const { nextStep } = await signUp({
        username: data.email,
        password: data.password,
        options: {
          userAttributes: {
            email: data.email,
            family_name: data.lastName,
            given_name: data.firstName,
          },
          autoSignIn: true,
        },
      });
      const response = {
        page: null,
      };

      switch (nextStep.signUpStep) {
        case "CONFIRM_SIGN_UP":
          // Case 1: User created, email verification required
          response.page = "/verify-email";
          break;

        // Future Addon.
        // case "DONE":
        //   // Rare, but possible if auto-confirm is enabled (OR done manually by admin pannel).
        //   response.page = "/feed";
        //   break;

        default:
          throw new Error(AUTH_ERROR);
      }

      return response;
    } catch (error) {
      let field = "root";
      let safeMessage = "Sign-Up failed. Please try again.";
      const errorName = error?.name || error?.code;

      switch (errorName) {
        case "UsernameExistsException":
          safeMessage = "User already exists.";
          break;

        case "EmptySignUpUsername":
          safeMessage = "Email is required to SignUp.";
          field = "email";
          break;

        case "EmptySignUpPassword":
          safeMessage = "Password is required to SignUp.";
          field = "password";
          break;

        case "InvalidParameterException":
          safeMessage = "Please provide valid values for other fields.";
          break;
      }

      const err = new Error(safeMessage);
      err.name = errorName;
      err.field = field;
      throw err;
    }
  }

  async confirmUserSignup({ email, code, password = null }) {
    try {
      const { nextStep } = await confirmSignUp({
        username: email,
        confirmationCode: code,
      });
      const response = {
        userData: null,
      };

      switch (nextStep.signUpStep) {
        case "DONE": {
          // User will reach here...
          // After doing signup (but not confirming the email).
          // Then the user tries to login.
          // Then user gets redirected to this screen.

          // await fetchAuthSession(); // blocks until tokens exist, thus prevents -> UserUnAuthenticatedException: User needs to be authenticated to call this API.
          // await autoSignIn(); // can't call this here. -> AutoSignInException: The autoSignIn flow has not started, or has been cancelled/completed.
          if (password) {
            await signIn({
              username: email,
              password: password,
            });
            const userData = await this._getUser();
            response.userData = { ...userData };
          } else {
            throw new Error(AUTH_ERROR);
          }
          break;
        }

        case "COMPLETE_AUTO_SIGN_IN": {
          await autoSignIn();
          let userData = await this._getUser();
          response.userData = { ...userData };
          break;
        }

        default:
          throw new Error(AUTH_ERROR);
      }

      return response;
    } catch (error) {
      let field = "code";
      let safeMessage = "Email verification failed. Please try again.";
      const errorName = error?.name || error?.code;

      switch (errorName) {
        case "EmptyConfirmSignUpUsername":
          safeMessage = "Email is required to confirm SignUp.";
          break;

        case "EmptyConfirmSignUpCode":
          safeMessage = "Code is required to confirm SignUp.";
          break;

        case "CodeMismatchException":
        case "ExpiredCodeException":
          safeMessage = "Invalid verification code provided, please try again.";
          break;

        case "LimitExceededException":
          safeMessage = "Attempt limit exceeded, please try after some time.";
          break;

        case "UserAlreadyAuthenticatedException":
          safeMessage = AUTH_ERROR;
          break;
      }

      const err = new Error(safeMessage);
      err.name = errorName;
      err.field = field;
      throw err;
    }
  }

  async resendUserSignUpCode({ email }) {
    try {
      await resendSignUpCode({
        username: email,
      });
    } catch (error) {
      let field = "root";
      let safeMessage = "Request failed. Please try again.";
      const errorName = error?.name || error?.code;

      const err = new Error(safeMessage);
      err.name = errorName;
      err.field = field;
      throw err;
    }
  }

  async forgotPassword({ email }) {
    try {
      const { nextStep } = await resetPassword({
        username: email,
      });

      switch (nextStep.resetPasswordStep) {
        case "CONFIRM_RESET_PASSWORD_WITH_CODE":
          // console.log(`Confirmation code was sent to ${codeDeliveryDetails.deliveryMedium}`);
          break;

        default:
          throw new Error(AUTH_ERROR);
      }
    } catch (error) {
      let field = "email";
      let safeMessage = "Request failed. Please try again.";
      const errorName = error?.name || error?.code;

      switch (errorName) {
        case "EmptyResetPasswordUsername":
          safeMessage = "Email is required to get code for password reset";
          break;
      }

      const err = new Error(safeMessage);
      err.name = errorName;
      err.field = field;
      throw err;
    }
  }

  async resetPassword({ email, code, newPassword }) {
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword: newPassword,
      });
    } catch (error) {
      let field = "root";
      let safeMessage = "Request failed. Please try again.";
      const errorName = error?.name || error?.code;

      switch (errorName) {
        case "EmptyConfirmResetPasswordUsername":
          safeMessage = "Email is required to confirm ResetPassword";
          field = "email";
          break;

        case "EmptyConfirmResetPasswordConfirmationCode":
          safeMessage = "ConfirmationCode is required to confirm ResetPassword";
          field = "code";
          break;

        case "EmptyConfirmResetPasswordNewPassword":
          safeMessage = "NewPassword is required to confirm ResetPassword";
          field = "newPassword";
          break;
      }

      const err = new Error(safeMessage);
      err.name = errorName;
      err.field = field;
      throw err;
    }
  }

  async resendResetPasswordCode({ email }) {
    try {
      await this.forgotPassword({ email });
    } catch (error) {
      let field = "root";
      let safeMessage = "Request failed. Please try again.";
      const errorName = error?.name || error?.code;

      const err = new Error(safeMessage);
      err.name = errorName;
      err.field = field;
      throw err;
    }
  }

  // Profile

  async updateUserProfile(
    data,
    userCognitoObject,
    userId,
    currentProfileImagePath,
  ) {
    const { userId: currentUserId } = await getCurrentUser();
    const { profileImage, ...otherData } = data;

    if (profileImage instanceof File) {
      const uniqueFileName = `${Date.now()}-${profileImage.name}`;
      const result = await uploadData({
        path: ({ identityId }) => {
          return `profile-pictures/${identityId}/${uniqueFileName}`;
        },
        data: profileImage,
        options: {
          preventOverwrite: false,
        },
      }).result;

      otherData.profileImage = result.path;

      if (currentProfileImagePath) {
        try {
          await remove({
            path: currentProfileImagePath,
          }).result;
        } catch {
          // continue profile update even if old image is already missing
        }
      }
    } else if (profileImage === null) {
      if (currentProfileImagePath) {
        try {
          await remove({
            path: currentProfileImagePath,
          }).result;
        } catch {
          // continue profile update even if old image is already missing
        }
      }

      otherData.profileImage = null;
    }

    if (Object.keys(userCognitoObject).length > 0) {
      await updateUserAttributes({
        userAttributes: {
          ...userCognitoObject,
        },
      });
    }

    if (Object.keys(otherData).length > 0) {
      const updateResult = await this.client.models.User.update({
        id: userId,
        ...otherData,
      });

      if (updateResult?.errors?.length) {
        throw updateResult.errors;
      }
    }

    return await this._getUserById(userId, currentUserId);

    // // Upload the Storage file:
    // const result = await uploadData({
    //   path: `images/${song.id}-${file.name}`,
    //   data: file,
    //   options: {
    //     contentType: "image/png", // contentType is optional
    //   },
    // }).result;
    // // Add the file association to the record:
    // const updateResponse = await client.models.User.update({
    //   id: song.id,
    //   coverArtPath: result?.path,
    // });
    //
    // Retrieve the file's signed URL:
    // const signedURL = await getUrl({ path: updatedSong.coverArtPath });  // I need to use getUrl() since i am relying on authenticated and entity() users only.
    // *************OR******************
    // const linkToStorageFile = await getUrl({
    //   path: "album/2024/1.jpg",
    //   options: {
    //     // ensure object exists before getting url
    //     validateObjectExistence: true,
    //     // url expiration time in seconds.
    //     expiresIn: 300,
    //   },
    // });
    // *************OR******************
    // setCurrentImageUrl(signedURL.url.toString());
    //
    // Example
    // https://docs.amplify.aws/react/build-a-backend/data/working-with-files/#complete-examples
    //
    //
    // import { uploadData } from "aws-amplify/storage";
    //
    // try {
    //   const result = await uploadData({
    //     path: ({ identityId }) => `profile-pictures/${identityId}/1.jpg`,
    //     data: file,
    //     options: {
    //       // content-type header to be used when downloading
    //       contentType: "image/jpeg",
    //       // whether to check if an object with the same key already exists before completing the upload
    //       preventOverwrite: true,
    //       onProgress: ({ transferredBytes, totalBytes }) => {
    //         if (totalBytes) {
    //           console.log(
    //             `Upload progress ${Math.round(
    //               (transferredBytes / totalBytes) * 100,
    //             )} %`,
    //           );
    //         }
    //       },
    //     },
    //   }).result;
    //   console.log("Path from Response: ", result.path);
    // } catch (error) {
    //   console.log("Error : ", error);
    // }
  }

  async changePassword({ oldPassword, newPassword }) {
    try {
      await updatePassword({
        oldPassword,
        newPassword,
      });
    } catch (error) {
      let field = "root";
      let safeMessage = "Unable to change password. Please try again.";
      const errorName = error?.name || error?.code;

      switch (errorName) {
        case "EmptyUpdatePasswordOldPassword":
          safeMessage = "Current password is required.";
          field = "currentPassword";
          break;

        case "EmptyUpdatePasswordNewPassword":
          safeMessage = "New password is required.";
          field = "newPassword";
          break;

        case "NotAuthorizedException":
          safeMessage = "Current password is incorrect.";
          field = "currentPassword";
          break;

        case "InvalidPasswordException":
          safeMessage =
            "New password does not meet password policy requirements.";
          field = "newPassword";
          break;

        case "LimitExceededException":
          safeMessage = "Too many attempts. Please try again later.";
          break;
      }

      const err = new Error(safeMessage);
      err.name = errorName;
      err.field = field;
      throw err;
    }
  }
}

const authService = new AuthService();
export default authService;
