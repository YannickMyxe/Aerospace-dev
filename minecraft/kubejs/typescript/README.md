# TypeScript KubeJS scripts

KubeJS runs JavaScript, so TypeScript files in this folder must be compiled before
they can be loaded. The build compiles both script types into separate KubeJS
directories:

- `scripts/` emits to `../server_scripts/compiled`
- `startup/` emits to `../startup_scripts/compiled`

Install the local TypeScript compiler once:

```sh
bun install
```

Build both script types once before loading or reloading them:

```sh
bun run build
```

To recompile automatically while editing either source folder, keep this running:

```sh
bun run watch
```

Run `bun run check` to type-check without emitting files. KubeJS typings are read
from the generated declarations in `../../.probe`. The build bundles all `.ts`
entry points under `scripts/` and `startup/`, along with their relative utility
imports, into standalone IIFEs. This keeps utility modules from being loaded as
separate KubeJS scripts. Add server scripts under `scripts/` and startup
registration scripts under `startup/`; shared utilities can stay in `utils/`.
`bun run watch` watches and rebuilds both entry-point folders, including new
files; run `bun run check` separately for type errors. Keep scripts in the
appropriate global KubeJS style, such as `ServerEvents.recipes(...)` or
`StartupEvents.registry(...)`. Type-only imports are erased during bundling.

The current generated declarations contain a tuple label named `with`, which
TypeScript cannot parse. In `../../.probe/@package/ca/teamdman/sfml/ast/index.d.ts`,
rename that tuple label to `withValue` if the declarations are regenerated.
