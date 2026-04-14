const TRIM_RULE = {
  setValueAs: (value) => (typeof value === "string" ? value.trim() : value),
};

export const EMAIL_RULES = {
  required: "Email is required",
  setValueAs: (value) =>
    typeof value === "string" ? value.trim().toLowerCase() : value, // Normalize email before returning to onSubmitHandler.
  pattern: {
    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: "Enter a valid email address",
  },
  maxLength: {
    value: 254,
    message: "Email is too long",
  },
};

export const PASSWORD_RULES = {
  required: "Password is required",
  minLength: {
    value: 8,
    message: "Password must be at least 6 characters",
  },
  maxLength: {
    value: 128,
    message: "Password is too long",
  },
  validate: {
    // Prevent whitespace-only passwords
    notEmpty: (value) => value.trim().length > 0 || "Password cannot be empty",
    strongPassword: (value) =>
      (/[A-Z]/.test(value) &&
        /[a-z]/.test(value) &&
        /[^\w\s]/.test(value) &&
        /\d/.test(value)) ||
      "Password must include lowercase and uppercase letters, special character and a number",
  },
};

export const FIRST_NAME_RULES = {
  ...TRIM_RULE,
  required: "First name is required",
  minLength: {
    value: 2,
    message: "First name is too short",
  },
  maxLength: {
    value: 50,
    message: "First name is too long",
  },
};

export const LAST_NAME_RULES = {
  ...TRIM_RULE,
  required: "Last name is required",
  minLength: {
    value: 2,
    message: "Last name is too short",
  },
  maxLength: {
    value: 50,
    message: "Last name is too long",
  },
};

export const VERIFICATION_CODE_RULES = {
  required: "Verification code is required",
  minLength: {
    value: 6,
    message: "Code must be 6 digits",
  },
  maxLength: {
    value: 6,
    message: "Code must be 6 digits",
  },
};

export const COMMUNITY_NAME_RULES = {
  ...TRIM_RULE,
  required: "Community name is required",
  minLength: {
    value: 3,
    message: "Community name is too short",
  },
  maxLength: {
    value: 80,
    message: "Community name is too long",
  },
};

export const COMMUNITY_DESCRIPTION_RULES = {
  ...TRIM_RULE,
  required: "Community description is required",
  minLength: {
    value: 10,
    message: "Community description is too short",
  },
  maxLength: {
    value: 1200,
    message: "Community description is too long",
  },
};
