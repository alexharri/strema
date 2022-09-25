import typescript from "@rollup/plugin-typescript";

const items = [];
const modules = [
  // Modules exported from `index.ts` can be imported directly:
  //
  //    ```tsx
  //    // index.ts
  //    export { utils } from "./utils";
  //
  //    // userland code
  //    import { utils } from "package-name";
  //    ```
  //
  "index",

  // Modules added here can be imported directory.
  //
  // E.g. adding "utils" would allow imports like so:
  //
  //    ```tsx
  //    import utils from "package-name/utils";
  //    ```
  //
];

for (const module of modules) {
  const input =
    module === "index" ? `src/${module}.ts` : `src/${module}/index.ts`;
  const output = module === "index" ? `dist/${module}` : `dist/${module}/index`;
  items.push({
    input,
    external: [],
    output: [
      { file: `${output}.js`, format: "cjs", exports: "auto" },
      { file: `${output}.esm.js`, format: "es" },
    ],
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json",

        // Only generate declarations once
        declaration: module === "index",
        declarationDir: module === "index" ? "." : undefined,
      }),
    ],
  });
}

export default items;
