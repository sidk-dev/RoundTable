import type { PostConfirmationTriggerHandler } from "aws-lambda";
import { type Schema } from "../../data/resource";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { env } from "$amplify/env/post-confirmation";

const { resourceConfig, libraryOptions } =
  await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: PostConfirmationTriggerHandler = async (event) => {
  if (event.triggerSource === "PostConfirmation_ConfirmSignUp") {
    await client.models.User.create({
      firstName: event.request.userAttributes.given_name,
      lastName: event.request.userAttributes.family_name,
      email: event.request.userAttributes.email,
      owner: event.request.userAttributes.sub,
    });
  }

  return event;
};
