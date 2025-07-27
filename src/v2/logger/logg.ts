import * as vscode from "vscode";

export function showMessage(message: string) {
  vscode.window.showInformationMessage(message);
}

export function logg({
  prefix = "color comment",
  message,
}: {
  prefix?: string;
  message: string;
}) {
  console.log(`${prefix}:-> ${message}`);
}

export function loggJson({
  prefix = "color comment",
  message,
}: {
  prefix?: string;
  message: string;
}) {
  console.log(`${prefix}:-> ${JSON.stringify(message, null, 2)}`);
}

export function loggError({
  prefix = "color comment",
  message,
}: {
  prefix?: string;
  message: string;
}) {
  console.error(`${prefix}:-> ${message}`);
}

// Option 1: Make it a true invariant assertion
export function invariantAssert(
  message: string,
  condition: boolean,
  prefix = "invariantAssert"
): asserts condition {
  if (!condition) {
    const errorMessage = `${prefix}:-> ${message}`;
    loggError({ message, prefix });
    throw new Error(errorMessage);
  }
}

// Option 2: Rename to better reflect its behavior
export function logIfFalse(
  message: string,
  condition: boolean,
  prefix = "logIfFalse",
  returnOnError = false
): boolean {
  if (!condition) {
    loggError({ message, prefix });
    if (returnOnError) {
      return false;
    }
  }
  return true;
}

// Option 3: Make it more explicit about its behavior
export function validateCondition(
  message: string,
  condition: boolean,
  prefix = "validateCondition",
  options: {
    throwOnError?: boolean;
    returnOnError?: boolean;
  } = {}
): boolean {
  if (!condition) {
    loggError({ message, prefix });

    if (options.throwOnError) {
      throw new Error(`${prefix}:-> ${message}`);
    }

    if (options.returnOnError) {
      return false;
    }
  }
  return true;
}
