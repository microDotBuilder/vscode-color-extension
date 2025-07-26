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

export function loggError({
  prefix = "color comment",
  message,
}: {
  prefix?: string;
  message: string;
}) {
  console.error(`${prefix}:-> ${message}`);
}
