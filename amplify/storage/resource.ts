import { defineStorage } from "@aws-amplify/backend";

// by using the "entity_id" to represent the user which scopes files to individual users. Means only the "identity" user can read/write/delete, other can only read.
export const storage = defineStorage({
  name: "amplify-round-table-files",
  access: (allow) => ({
    "post-images/{entity_id}/*": [
      allow.authenticated.to(["read"]),
      allow.entity("identity").to(["read", "write", "delete"]),
    ],
    "profile-pictures/{entity_id}/*": [
      allow.entity("identity").to(["read", "write", "delete"]),
      allow.authenticated.to(["read"]),
    ],
  }),
  versioned: true,
});
