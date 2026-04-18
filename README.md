# RoundTable

<p align="center">
	<img src="public/logo.png" alt="RoundTable Logo" width="110" />
</p>

<p align="center">
	A role-aware community platform for focused knowledge sharing.
</p>

<p align="center">
	<a href="#overview">Overview</a> •
	<a href="#features">Features</a> •
	<a href="#architecture">Architecture</a> •
	<a href="#quick-start">Quick Start</a> •
	<a href="#security-model">Security Model</a>
</p>

## Overview

RoundTable is a full-stack social knowledge platform built to emphasize structured collaboration over noisy timelines.

Users can:

- sign up and verify identity,
- join or create communities,
- publish posts globally or within communities,
- participate through explicit membership roles: `VIEWER`, `WRITER`, `ADMIN`.

This project is designed to showcase production-oriented engineering choices across frontend UX, backend authorization, and cloud-native data/storage design.

## Why This Project Stands Out

- Clear role-based access model with practical permissions.
- End-to-end auth lifecycle with Cognito and route protection.
- Scalable feed experience using infinite pagination and client caching.
- Authorization-aware domain modeling in Amplify Data.
- Identity-scoped media storage with S3 access controls.
- Post-confirmation Lambda that provisions profile data automatically.

## Features

### Authentication

- Email/password signup and login
- Email verification flow
- Forgot/reset password flow
- Protected and public route segmentation

### Communities

- Create and edit communities
- Public/private visibility model
- Join/leave public communities
- Membership roles (`VIEWER`, `WRITER`, `ADMIN`)

### Posts And Feed

- Create, edit, and read posts
- Public and community-only visibility behavior
- Joined-community feed
- Infinite scrolling with React Query

### Profile And Media

- Editable profile details
- Profile picture support
- Counter tracking (posts, communities, memberships)

## Tech Stack

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
- Amazon Cognito for authentication
- Amplify Data for typed models and auth rules
- Amazon S3 (Amplify Storage) for user media
- AWS Lambda post-confirmation trigger

### Tooling

- ESLint 9
- ESM-based JavaScript project structure

## Architecture

### Frontend Structure

- `src/main.jsx`: app bootstrap, providers, Amplify wiring
- `src/layouts/Layout.jsx`: session restoration and auth event handling
- `src/components/Routes/ProtectedRoute.jsx`: authenticated route gate
- `src/roundtable/`: service layer (`auth`, `community`, `post`, `s3Bucket`)

### Backend Structure

- `amplify/backend.ts`: backend composition and Cognito password policy
- `amplify/data/resource.ts`: schema, relationships, indexes, auth rules
- `amplify/auth/post-confirmation/handler.ts`: creates user profile record on signup confirmation
- `amplify/storage/resource.ts`: identity-scoped profile/post image storage rules

### Domain Model

- `User`: profile data, ownership metadata, counters, relations
- `Community`: owner, visibility, counters, post/member relations
- `Membership`: role-based user-to-community link
- `Post`: author-linked content with optional community and visibility scope

## Security Model

RoundTable applies defense-in-depth with both auth and model-level authorization:

- Default data authorization mode uses Cognito user pool tokens.
- Owner-based permissions are enforced on sensitive operations.
- Authenticated read access is scoped by model rules.
- S3 access is path-scoped by signed-in identity (`{entity_id}`).

## Quick Start

### Prerequisites

- Node.js 20+
- npm
- AWS account with permissions for Amplify resources

### 1) Install Dependencies

```bash
npm install
```

### 2) Prepare Backend Outputs

This frontend expects `amplify_outputs.json` in the repository root.

For local backend development, run Amplify sandbox in a separate terminal:

```bash
npx ampx sandbox
```

After sandbox deployment, confirm `amplify_outputs.json` is generated.

### 3) Run Frontend

```bash
npm run dev
```

### 4) Quality Checks

```bash
npm run lint
npm run build
```

## Repository Layout

```text
amplify/                 Amplify Gen 2 backend resources (auth, data, storage)
	auth/                  Auth resources + post-confirmation trigger
	data/                  Data schema and authorization rules
	storage/               S3 storage definitions and access policies
src/                     React application source
	components/            Reusable UI and route guards
	layouts/               Auth-aware layout orchestration
	pages/                 Route-level screens
	roundtable/            Service layer for backend operations
public/                  Static assets and web app icons
```

## Deployment

This repository includes Amplify Hosting build config in `amplify.yml`.

Pipeline backend deploy command:

```bash
npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID
```

Frontend build command:

```bash
npm run build
```

## Roadmap Ideas

- Moderation workflows for private community approvals
- Rich text editor for posts
- Notifications for membership and post activity
- Role management UI enhancements for admins

## Contributing

Read `CONTRIBUTING.md` for contribution workflow, coding standards, and pull request expectations.

## Code of Conduct

Read `CODE_OF_CONDUCT.md` for community guidelines and enforcement details.

## License

This project is licensed under GPL-3.0. See `LICENSE`.
