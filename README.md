# RoundTable

<img src="public/logo.png" alt="RoundTable Logo" width="100">

RoundTable is a role-aware knowledge platform designed for people who want focused discussions instead of noisy social feeds.

Users sign up, verify email, join or create communities, and contribute through clear membership roles (`VIEWER`, `WRITER`, `ADMIN`) with controlled visibility.

Built as a production-style full-stack app, it combines a modern React frontend with an AWS Amplify Gen 2 backend for authentication, data authorization, and cloud storage.

## Project Summary

RoundTable demonstrates practical engineering across frontend, backend, data modeling, and access control.

- Designed a role-based content system with scoped permissions (`VIEWER`, `WRITER`, `ADMIN`).
- Built secure authentication and email verification flows with AWS Cognito via Amplify Auth.
- Modeled relational community data (`User`, `Community`, `Membership`, `Post`) with authorization-aware schema rules.
- Implemented scalable feed behavior using React Query infinite pagination and cache management.
- Added object storage workflows for profile and post assets with identity-scoped S3 paths.

## Product Concept

The platform prioritizes signal over noise:

- Community-centric structure instead of a flat social feed.
- Moderated participation with explicit membership roles.
- Public and private community visibility.
- Public and community-only post visibility.
- Authenticated data access with owner and role-based controls.

## Key Features

- Email/password auth, verification, login, logout, password reset
- Protected routing for authenticated experiences
- Community lifecycle: create, browse, edit, join, leave
- Post lifecycle: create, view, edit, filter by visibility
- Joined-community feed with infinite scrolling
- Profile management including image support
- Counter synchronization for posts and memberships

## Technology Stack

### Frontend

- React 19
- Vite 7
- React Router 7
- Redux Toolkit + React Redux
- TanStack React Query
- React Hook Form
- Tailwind CSS 4

### Backend and Cloud

- AWS Amplify Gen 2
- Amazon Cognito (auth)
- Amplify Data model API with authorization rules
- Amazon S3 (storage) via Amplify Storage
- AWS Lambda trigger (post-confirmation user provisioning)

### Tooling

- ESLint 9
- Modern ESM JavaScript project setup

## Architecture Highlights

Frontend responsibilities:

- `src/main.jsx`: Amplify configuration and app providers
- `src/layouts/Layout.jsx`: auth session restore and auth event handling
- `src/components/Routes/ProtectedRoute.jsx`: route-level access guard
- `src/roundtable/*`: service layer for auth, community, post, storage operations

Backend responsibilities:

- `amplify/backend.ts`: backend composition and user-pool policy customization
- `amplify/data/resource.ts`: schema + auth rules + index/query definitions
- `amplify/auth/post-confirmation/handler.ts`: create user profile after signup confirmation
- `amplify/storage/resource.ts`: identity-scoped storage access rules

## Data Model Overview

- `User`: identity-linked profile, counters, authored posts, memberships
- `Community`: ownership, visibility, post/member counters
- `Membership`: user-community relationship with role
- `Post`: author-linked content with optional community and visibility controls

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- AWS account access for Amplify backend development

### Installation

```bash
npm install
```

### Run In Development

```bash
npm run dev
```

### Lint

```bash
npm run lint
```

### Build

```bash
npm run build
```

## Environment and Backend Notes

- `amplify_outputs.json` must exist at the project root for frontend-to-backend integration.
- Backend changes under `amplify/` should include corresponding frontend service updates under `src/roundtable/` when needed.
- Keep schema and authorization updates documented in pull requests.

## Repository Layout

```text
amplify/      Amplify Gen 2 auth, data, and storage resources
src/          React frontend app source
public/       Static assets
```

## Quality and Security

- User pool authentication is enforced for data access.
- Model-level owner/authenticated rules control read/write operations.
- S3 write access is scoped to the signed-in identity path.

## Contributing

Contribution workflow, coding standards, and review expectations are documented in `CONTRIBUTING.md`.

## Code of Conduct

Community standards and enforcement are documented in `CODE_OF_CONDUCT.md`.

## License

Licensed under the GPL-3.0 License. See `LICENSE`.
