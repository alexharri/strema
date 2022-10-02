import fs from "fs";
import path from "path";

const distDir = path.resolve(__dirname, "../dist");
const buildConfigDir = path.resolve(__dirname, "../build");

const exportedFunctionsString = fs.readFileSync(
  path.resolve(buildConfigDir, "./EXPORTED_FUNCTIONS"),
  "utf-8"
);
const exportedTypesString = fs.readFileSync(
  path.resolve(buildConfigDir, "./EXPORTED_TYPES"),
  "utf-8"
);

const exportedFunctions = exportedFunctionsString.split("\n").filter(Boolean);
const exportedTypes = exportedTypesString.split("\n").filter(Boolean);

const indexCjsFilePath = path.resolve(distDir, "./index.js");
const indexEsmFilePath = path.resolve(distDir, "./index.esm.js");
const indexDtsFilePath = path.resolve(distDir, "./index.d.ts");

const indexCjsContent = fs.readFileSync(indexCjsFilePath, "utf8");
const indexCjsExportStatementSet = new Set(
  indexCjsContent.split("\n").filter((line) => line.startsWith("exports."))
);
const indexEsmContent = fs.readFileSync(indexEsmFilePath, "utf8");

console.log("\nEnsuring that index.js exports every expected function.\n");

for (const functionName of exportedFunctions) {
  const exportsFunction = indexCjsExportStatementSet.has(
    `exports.${functionName} = ${functionName};`
  );
  if (!exportsFunction) {
    throw new Error(
      `Did not find export statement in index.js for '${functionName}'.`
    );
  }

  console.log(`\t✔ ${functionName}`);
}

console.log("\nEnsuring that index.esm.js exports every expected function.\n");

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

  for (const functionName of exportedFunctions) {
    const exportsFunction = exportedFunctionsSet.has(functionName);
    if (!exportsFunction) {
      throw new Error(
        `Did not find export statement in index.esm.js for '${functionName}'.`
      );
    }

    console.log(`\t✔ ${functionName}`);
  }
}

function collectExports(s: string, regex: RegExp, groupName: string) {
  const out: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(s))) {
    const value = match.groups![groupName];
    const parts = value
      .split("\n")
      .join("")
      .split(",")
      .map((s) => s.trim());
    out.push(...parts);
  }
  return out;
}

const exportRegex =
  /export\s*{\s*(?<exportsStr>([a-z]+(,\s*)?)+)\s*}\s*from\s*"[a-z0-9.\/]+";/gi;
const exportTypeRegex =
  /export\s*type\s*{\s*(?<exportsStr>([a-z]+(,\s*)?)+)\s*}\s*from\s*"[a-z0-9.\/]+";/gi;

const indexDtsContent = fs.readFileSync(indexDtsFilePath, "utf8");
const indexDtsExportStatementSet = new Set(
  indexDtsContent
    .split("\n")
    .filter((line) => line.startsWith("export { default as "))
);

const exportedFunctionSet = new Set(
  collectExports(indexDtsContent, exportRegex, "exportsStr")
);
const exportedTypeSet = new Set(
  collectExports(indexDtsContent, exportTypeRegex, "exportsStr")
);

console.log(`\nEnsuring that index.d.ts exports every expected function.\n`);

for (const functionName of exportedFunctions) {
  const isExported = exportedFunctionSet.has(functionName);
  if (!isExported) {
    throw new Error(
      `Did not find export statement in index.d.ts bundle for '${functionName}'.`
    );
  }

  console.log(`\t✔ ${functionName}`);
}

console.log(`\nEnsuring that index.d.ts exports every expected type.\n`);

for (const typeName of exportedTypes) {
  const isExported = exportedTypeSet.has(typeName);
  if (!isExported) {
    throw new Error(
      `Did not find export statement in index.d.ts bundle for type '${typeName}'.`
    );
  }

  console.log(`\t✔ ${typeName}`);
}
