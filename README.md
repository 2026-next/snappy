# Snappy

Starter React application built with Vite, TypeScript, Tailwind CSS, React Router, ESLint, Prettier, and Vitest.

## Scripts

- `pnpm dev` starts the Vite development server
- `pnpm build` creates a production build
- `pnpm preview` serves the production build locally
- `pnpm lint` runs ESLint
- `pnpm test` runs Vitest in watch mode
- `pnpm test:run` runs Vitest once
- `pnpm format` formats the repository with Prettier
- `pnpm format:check` checks formatting without writing changes

## Deployment

- `.github/workflows/deploy.yml` deploys the built frontend on every push to `main` and can also be run manually.
- `scripts/deploy-static.sh` pushes `dist/` to the production server over SSH with `rsync --delete`.
- Required GitHub repository variables:
  - `SNAPPY_SSH_HOST`
  - `SNAPPY_SSH_USER`
  - `SNAPPY_SSH_PORT`
  - `SNAPPY_DEPLOY_PATH`
- Required GitHub repository secrets:
  - `SNAPPY_DEPLOY_KEY`
  - `SNAPPY_SSH_KNOWN_HOSTS`

## Source layout

- `src/app` app composition, providers, router, and global styles
- `src/pages` route-level screens
- `src/features` feature-focused UI and local data
- `src/widgets` larger composed sections
- `src/shared` reusable config, UI, and utilities
- `src/test` test setup and helpers
