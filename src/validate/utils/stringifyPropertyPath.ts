export function stringifyPropertyPath(path: string[]) {
  let out = "";
  for (const part of path) {
    if (out && !part.startsWith("[")) {
      out += ".";
    }
    out += part;
  }
  return out;
}
