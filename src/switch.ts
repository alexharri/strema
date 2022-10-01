/**
 * Use to enforce that every case in a switch has been matched:
 *
 * ```tsx
 * switch (value) {
 *    case A:
 *      // Do something
 *      break;
 *    case B:
 *      // Do something else
 *    default:
 *      enforceExhaustive(value);
 * }
 * ```
 *
 * If there are cases to be matched, the type of `value` will not
 * be assignable to `never` and a type error will be emitted.
 */
export function enforceExhaustive(
  value: never,
  message = "Unexpected value"
): never {
  throw new Error(`${message} '${value}'`);
}
