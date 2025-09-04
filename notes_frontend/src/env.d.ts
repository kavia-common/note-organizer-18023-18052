declare global {
  interface Window {
    env?: Record<string, string>;
  }
  var env: Record<string, string> | undefined;
}
export {};
