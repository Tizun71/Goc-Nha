# Security policy

## Supported versions

Góc Nhà is in early development. Only the latest commit on `main` gets security fixes.

## Report a vulnerability

Do not open a public issue for a security problem.

Report it privately through [GitHub private vulnerability reporting](https://github.com/Tizun71/Goc-Nha/security/advisories/new). Include:

- What the problem is and what an attacker can do with it.
- Steps to reproduce it, or a proof of concept.
- The affected commit or version.

You will get an answer within 7 days. When a fix is ready, we publish an advisory and credit you, unless you ask us not to.

## Scope

- The WebSocket hub at `/__dmr` and the MCP server are development tools. The hub runs only in the Vite dev server (`pnpm dev`) and is not part of the production build. Do not expose the dev server to an untrusted network.
- Room data stays in the browser (localStorage) unless you export it.
