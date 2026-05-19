// Type declarations for the lint module consumed by the test suite.
declare module '*/content-lints.mjs' {
  export const LINT_CODES: Readonly<Record<string, string>>;

  export interface LintFinding {
    code: string;
    severity: 'block';
    message: string;
    where: string;
  }

  export function lintQuestion(q: unknown): LintFinding[];
}
