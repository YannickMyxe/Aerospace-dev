# TypeScript server scripts

KubeJS runs JavaScript, so TypeScript files in this folder must be compiled before
they can be loaded. The build emits JavaScript into `../server_scripts/compiled`,
which KubeJS loads with the other server scripts.

Install the local TypeScript compiler once:

```sh
bun install
```

Bundle once before loading or reloading server scripts:

```sh
bun run build
```

To recompile automatically while editing, keep this running:

```sh
bun run watch
```

Run `bun run check` to type-check without emitting files. KubeJS typings are read
from the generated declarations in `../../.probe`. The build bundles each
all `.ts` scripts under `scripts/` and their relative utility imports into
standalone IIFEs, so KubeJS never loads TypeScript's CommonJS `exports` code or
utility modules as separate scripts. Add new KubeJS scripts anywhere under
`scripts/`; shared utilities can stay in `utils/` or another folder outside
`scripts/`. `bun run watch` watches and rebuilds entry points, including new
files; run `bun run check` separately for type errors. Keep scripts in the global
KubeJS style (for example, `ServerEvents.recipes(...)`). Type-only imports are
erased during bundling.

The current generated declarations contain a tuple label named `with`, which
TypeScript cannot parse. In `../../.probe/@package/ca/teamdman/sfml/ast/index.d.ts`,
rename that tuple label to `withValue` if the declarations are regenerated.
