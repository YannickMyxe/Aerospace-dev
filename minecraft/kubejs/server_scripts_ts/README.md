# TypeScript server scripts

KubeJS runs JavaScript, so TypeScript files in this folder must be compiled before
they can be loaded. The build emits JavaScript into `../server_scripts/compiled`,
which KubeJS loads with the other server scripts.

Install the local TypeScript compiler once:

```sh
bun install
```

Compile once before loading or reloading server scripts:

```sh
bun run build
```

To recompile automatically while editing, keep this running:

```sh
bun run watch
```

Run `bun run check` to type-check without emitting files. KubeJS typings are read
from the generated declarations in `../../.probe`. Keep scripts in the global
KubeJS style (for example, `ServerEvents.recipes(...)`). Type-only imports are
not needed in scripts: shared type aliases such as `KubeJSItemId` are declared
in `references.d.ts`. Runtime imports and exports are not supported by this
non-module script output.

The current generated declarations contain a tuple label named `with`, which
TypeScript cannot parse. In `../../.probe/@package/ca/teamdman/sfml/ast/index.d.ts`,
rename that tuple label to `withValue` if the declarations are regenerated.
