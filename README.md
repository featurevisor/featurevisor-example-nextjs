# Featurevisor with Next.js

This example connects the [Featurevisor JavaScript SDK](https://featurevisor.com/docs/sdks/javascript/) to the [`flags`](https://www.npmjs.com/package/flags) package in a Next.js application. It supports flags, variations, and variables through a small adapter in `src/featurevisor.ts`.

## Setup

```sh
npm ci
```

Start the development server:

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Checks

```sh
npm run lint
npm run typecheck
npm run build
```

The adapter can create its own Featurevisor instance or receive an existing one through the `instance` option.
