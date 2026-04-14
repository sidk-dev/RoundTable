# Contributing to RoundTable

Thank you for contributing to RoundTable.

This document defines a production-oriented workflow so changes remain reliable, reviewable, and aligned with architecture decisions.

## Guiding Principles

- Keep changes focused and easy to review.
- Prefer clarity and maintainability over clever shortcuts.
- Treat security and authorization changes as high-impact.
- Preserve existing behavior unless the change explicitly targets it.

## Development Setup

1. Install dependencies.

```bash
npm install
```

2. Start the app in development mode.

```bash
npm run dev
```

3. Validate quality gates before opening a pull request.

```bash
npm run lint
npm run build
```

## Branching and Commit Conventions

- Use one branch per feature or fix.
- Keep commits atomic and descriptive.
- Use imperative commit messages.

Examples:

- `fix post visibility filter on feed`
- `refactor auth service error mapping`
- `add profile image fallback handling`

## Pull Request Requirements

Each pull request should include:

- concise summary of the change
- rationale and impact
- testing notes (what was verified)
- screenshots or recordings for UI changes
- explicit notes for schema/auth/storage changes

## Review Checklist

Before requesting review, confirm:

- lint and build pass locally
- user-facing errors are handled with safe messages
- no unrelated refactors are mixed into the branch
- route guards and auth behavior still work
- pagination or caching behavior remains stable

## Frontend Standards

- Keep components cohesive and focused.
- Reuse existing UI and utility patterns where possible.
- Preserve React Query key consistency and pagination semantics.
- Maintain Redux auth state integrity across login/logout/session-restore flows.
- Ensure responsive behavior across mobile and desktop breakpoints.

## Backend Standards (Amplify Gen 2)

For any change inside `amplify/`:

- document authorization changes clearly
- describe schema impact and migration expectations
- keep frontend service updates in sync (`src/roundtable/`)
- validate generated backend outputs are up to date

## Manual Testing Expectations

Automated tests are not yet enforced, so contributors should run a practical manual checklist:

- signup, verify email, login, logout
- forgot/reset password
- protected route redirects
- community create/edit/browse/join paths
- post create/edit/read paths
- feed pagination and empty/error states
- profile edit and image handling

Include the checklist in your pull request body.

## Reporting Issues

When filing bugs, include:

- expected vs actual behavior
- clear reproduction steps
- browser and OS details
- relevant logs or screenshots

## Security Notes

Do not post credentials, tokens, secrets, or private user data in issues, pull requests, or screenshots.

## Code of Conduct

Participation in this project requires following `CODE_OF_CONDUCT.md`.
