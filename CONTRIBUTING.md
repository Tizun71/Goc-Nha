# Contributing to Góc Nhà

Thank you for helping. This guide explains how to set up the project, how we work, and what a pull request needs.

By taking part, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to help

- Report a bug or suggest a feature in [GitHub Issues](https://github.com/Tizun71/Goc-Nha/issues). Search first, to avoid duplicates.
- Add furniture to the catalog. See [docs/adding-furniture.md](docs/adding-furniture.md).
- Improve the docs, the Vietnamese or English text, or the tests.
- Pick an issue labelled `good first issue` or `help wanted`.

For a large change, open an issue first, so that we can agree on the approach before you write the code.

## Development setup

You need Node.js 22.6 or newer (see `.nvmrc`) and pnpm 10.

```bash
pnpm install
pnpm dev
```

Before you push, run the same checks as CI:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Read [docs/architecture.md](docs/architecture.md) to learn where code belongs. In short: logic that does not need a browser goes in `packages/core`, with tests next to the source file (`foo.ts` and `foo.test.ts`).

## Code style

- TypeScript in strict mode. Avoid `any`.
- All lengths are in centimetres.
- Match the style of the code around your change: naming, comment density and idioms.
- The UI text is in Vietnamese. Code, comments and docs are in English.
- Every source file starts with `// SPDX-License-Identifier: AGPL-3.0-or-later`.

## Commits and pull requests

- Create a branch from `main`, for example `feat/rope-shelf` or `fix/door-swing`.
- Use [Conventional Commits](https://www.conventionalcommits.org): `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `ci:`.
- Keep each pull request to one topic. Add or update tests for changed behaviour.
- For UI changes, add a screenshot or a short recording to the pull request.
- Add a line to the `Unreleased` section of [CHANGELOG.md](CHANGELOG.md) for changes that users can see.

## License of contributions

Góc Nhà is licensed under the [GNU Affero General Public License v3.0 or later](LICENSE). When you submit a contribution, you agree that it is licensed under the same terms (inbound = outbound), and you confirm that you have the right to submit it.

You can add a `Signed-off-by` line to your commits (`git commit -s`) to certify the [Developer Certificate of Origin](https://developercertificate.org). This is optional.
