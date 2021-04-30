export const NOOP = () => {};

export function throwError(message: string) {
  throw new Error(message);
}
