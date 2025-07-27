import * as vscode from "vscode";
import { logg, loggError, showMessage } from "../logger/logg";

import { ColorConfig } from "../config/color-config";
import { LanguageService } from "../main/language-service";

export async function openColorSettingsForEditing(): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    showMessage("No workspace folder found. Please open a folder first.");
    return;
  }
  // For simplicity, we open the settings of the first workspace.
  const workspaceFolder = workspaceFolders[0];
  const settingsJsonPath = vscode.Uri.joinPath(
    workspaceFolder.uri,
    ".vscode",
    "settings.json"
  );

  try {
    // Ensure the default settings are provisioned (written to settings.json)
    // before attempting to open the file. ColorConfig handles the logic now.
    await ColorConfig.provisionDefaultsIfMissing(workspaceFolder.uri);

    const document = await vscode.workspace.openTextDocument(settingsJsonPath);
    await vscode.window.showTextDocument(document);

    showMessage(
      "You can now customize your comment colors. Changes will be applied on save."
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    loggError({
      message: `Failed to open settings for editing: ${errorMessage}`,
    });
    showMessage("Failed to open settings file for editing.");
  }
}

/**
 * Main entry point to set up the extension's default configuration.
 * This function is idempotent and safe to call multiple times.
 */
export async function setUpDefaultFolder(): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    logg({ message: "No workspace folder found, skipping setup." });
    return;
  }

  try {
    // Apply settings to all open workspace folders.
    for (const workspaceFolder of workspaceFolders) {
      // ColorConfig now handles checking and writing defaults if missing.
      await ColorConfig.provisionDefaultsIfMissing(workspaceFolder.uri);
    }
    logg({ message: "Default folder setup completed successfully." });
    showMessage(
      "Color Comment: Default settings initialized for your workspace(s)."
    );
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const result = LanguageService.getLanguageInfo(editor.document);
      logg({ message: `Supported languages: ${result}` });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    loggError({ message: `setUpDefaultFolder failed: ${errorMessage}` });
    showMessage(
      "Color Comment setup failed. Please check the logs for details."
    );
  }
}

// The 'initializeDefaultColors' function is now moved into the ColorConfig class
// and renamed to `provisionDefaultsIfMissing`. So, it's removed from here.
