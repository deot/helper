# AGENTS.md

## Cursor Cloud specific instructions

This is a **pnpm monorepo** (`@deot/helper`) containing 16 TypeScript utility packages under `packages/`. It is a library, not an application — there is no server to start.

### Quick reference

| Task | Command |
|---|---|
| Install deps | `pnpm install` |
| Lint | `npm run lint` |
| Typecheck | `npm run typecheck` |
| Test all packages | `npm run test -- --package-name '*'` |
| Test single package | `npm run test -- --package-name '<name>'` |
| Build | `npm run build` |
| Dev (watch) | `npm run dev -- --package-name '<name>'` |

All commands are documented in the root `package.json` and `README.md`.

### Non-obvious notes

- **Puppeteer/Chromium**: Browser-environment tests (cache, dom, device, load, resize, wheel) require Chromium. It is downloaded automatically during `pnpm install` via the `puppeteer` postinstall hook (allowed in `pnpm-workspace.yaml` `allowBuilds`). If Chromium is missing, run `node node_modules/puppeteer/install.mjs`.
- **Flaky test**: `packages/utils/__tests__/random.spec.ts` (the `weight` test) is statistically flaky — it occasionally fails because a random distribution can exceed the `0.001` error tolerance. This is a pre-existing issue, not a regression.
- **Pre-commit hooks**: Husky runs `lint-staged` on commit and `dd-commitlint` on commit-msg. If you need to bypass hooks during automated work, use `git commit --no-verify`.
- **`ddc` CLI**: All dev/test/build commands use `ddc` from `@deot/dev`. It is installed as a dev dependency and available after `pnpm install`.
- **`packageManager` field**: `package.json` declares `"packageManager": "pnpm@latest"`. The installed pnpm v10 works fine; the warning about "latest" not being a valid version can be ignored.
