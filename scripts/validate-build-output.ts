import fs from "fs";
import path from "path";

const srcDir = path.resolve(__dirname, "../src");
const distDir = path.resolve(__dirname, "../dist");

const fnFileNames = fs
  .readdirSync(srcDir, { withFileTypes: true })
  .filter((item) => item.isDirectory())
  .map((item) => item.name);

if (fnFileNames.length === 0) {
  throw new Error(`Did not find any functions.`);
}

console.log("Found source .ts files for the following functions:\n");
console.log(
  fnFileNames.map((fileName) => `\t${fileName.split(".ts")[0]}`).join("\n")
);
console.log(
  "\nChecking that the appropriate .js, .esm.js and .d.ts files were emitted to ~/dist for each function.\n"
);

for (const fileName of fnFileNames) {
  const withoutDotTs = fileName.split(".ts")[0];
  const fnDirPath = path.resolve(distDir, `./${withoutDotTs}`);

  const filesThatShouldExist = [
    "index.js",
    "index.esm.js",
    "index.d.ts",
    `${withoutDotTs}.d.ts`,
  ];

  for (const file of filesThatShouldExist) {
    const filePath = path.resolve(fnDirPath, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(
        `Expected '${file}' file to exist for function '${withoutDotTs}'.`
      );
    }
  }

  console.log(`\t✔ ${withoutDotTs}`);
}

console.log("\nEnsuring that the index.js file exports every function.\n");

const indexCjsFilePath = path.resolve(distDir, "./index.js");
const indexEsmFilePath = path.resolve(distDir, "./index.esm.js");
const indexDtsFilePath = path.resolve(distDir, "./index.d.ts");

const indexCjsContent = fs.readFileSync(indexCjsFilePath, "utf8");
const indexCjsExportStatementSet = new Set(
  indexCjsContent.split("\n").filter((line) => line.startsWith("exports."))
);
const indexEsmContent = fs.readFileSync(indexEsmFilePath, "utf8");

for (const fileName of fnFileNames) {
  const withoutDotTs = fileName.split(".ts")[0];
  if (
    !indexCjsExportStatementSet.has(
      `exports.${withoutDotTs} = ${withoutDotTs};`
    )
  ) {
    throw new Error(
      `Did not find export statement in index.js bundle for '${withoutDotTs}'.`
    );
  }

  console.log(`\t✔ ${withoutDotTs}`);
}

console.log("\nEnsuring that the index.esm.js file exports every function.\n");

{
  // The end of index.esm.js should contain a line that exports every function:
  //
  //    export { fnA, fnB, fnC };
  //
  // This regex matches the function list "fnA, fnB, fnC".
  //
  const exportsRegex = /export { (?<exportsStr>([a-z]+(, )?)+) }/i;

  const { exportsStr } = indexEsmContent.match(exportsRegex)!.groups!;
  const exportedFunctionsSet = new Set(exportsStr.split(", ").filter(Boolean));

  for (const fileName of fnFileNames) {
    const withoutDotTs = fileName.split(".ts")[0];
    if (!exportedFunctionsSet.has(withoutDotTs)) {
      throw new Error(
        `Expected index.esm.js to export function '${withoutDotTs}'.`
      );
    }

    console.log(`\t✔ ${withoutDotTs}`);
  }
}

console.log("\nEnsuring that the index.d.ts file exports every function.\n");

const indexDtsContent = fs.readFileSync(indexDtsFilePath, "utf8");
const indexDtsExportStatementSet = new Set(
  indexDtsContent
    .split("\n")
    .filter((line) => line.startsWith("export { default as "))
);

for (const fileName of fnFileNames) {
  const withoutDotTs = fileName.split(".ts")[0];
  if (
    !indexDtsExportStatementSet.has(
      `export { default as ${withoutDotTs} } from "./${withoutDotTs}";`
    )
  ) {
    throw new Error(
      `Did not find export statement in index.d.ts bundle for '${withoutDotTs}'.`
    );
  }

  console.log(`\t✔ ${withoutDotTs}`);
}
