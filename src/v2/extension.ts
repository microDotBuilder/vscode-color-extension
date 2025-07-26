import * as vscode from "vscode";
import { logg, loggError } from "./logger/logg"; // Ensure correct path for your logger
import { ColorConfig } from "./config/color-config"; // Ensure correct path for ColorConfig
import {
  setUpDefaultFolder,
  openColorSettingsForEditing,
} from "./setupfolder/setup"; // Ensure correct path for setup functions

// Global variable to hold the first workspace folder.
// This is used for scoping configuration operations to the current workspace.
let _workspaceFolder: vscode.WorkspaceFolder | undefined;

/**
 * This function is called by `ColorConfig` whenever the tag colors configuration changes.
 * It is responsible for refreshing any active text editor decorations.
 * IMPORTANT: This function MUST be exported so `ColorConfig` can import and call it.
 */
export function refreshDecorations() {
  // TODO: Implement your actual decoration refresh logic here.
  // This typically involves:
  // 1. Getting the current tag colors using `ColorConfig.getColors()`.
  // 2. Creating or updating `vscode.TextEditorDecorationType` objects.
  // 3. Iterating through `vscode.window.visibleTextEditors` and applying
  //    or clearing decorations based on the current colors and file content.
  const currentColors = ColorConfig.getColors();
  logg({
    prefix: "Color Comment",
    message: `refreshDecorations(): Decorations triggered with ${
      Object.keys(currentColors).length
    } current colors.`,
  });
  // Example placeholder for actual decoration logic:
  // vscode.window.visibleTextEditors.forEach((editor) => {
  //   // Clear old decorations (if any were applied by this extension)
  //   // Apply new decorations based on `currentColors` to the editor's text
  // });
}

/**
 * Activates the Color Comment extension.
 * This function is called when your extension is activated by VS Code.
 */
export async function activate(context: vscode.ExtensionContext) {
  logg({
    prefix: "Color Comment",
    message: "Extension activated!",
  });

  // Get the first workspace folder if one is open.
  // We'll use this for workspace-scoped configuration.
  _workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  // 1. Initial load of the configuration into `ColorConfig`'s in-memory state.
  // This ensures `ColorConfig.getColors()` returns valid data immediately.
  // If no workspace folder is open, it will load global user settings.
  ColorConfig.updateColorsState(_workspaceFolder?.uri);

  // 2. Register a listener for configuration changes.
  // This ensures the in-memory state is always up-to-date when settings are changed.
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      // Only trigger an update if our specific configuration setting has changed.
      if (event.affectsConfiguration("colorComment.tagColors")) {
        logg({
          prefix: "Color Comment",
          message:
            "Configuration 'colorComment.tagColors' changed. Updating state via ColorConfig.",
        });
        // Delegate to ColorConfig to re-read and update its internal state.
        // `ColorConfig.updateColorsState` will also call `refreshDecorations()`.
        ColorConfig.updateColorsState(_workspaceFolder?.uri);
      }
    })
  );

  // 3. Provision default settings if they are missing from the workspace.
  // This ensures `settings.json` is pre-populated for new workspaces or users.
  if (_workspaceFolder) {
    try {
      // `provisionDefaultsIfMissing` is idempotent and safe to call multiple times.
      await ColorConfig.provisionDefaultsIfMissing(_workspaceFolder.uri);
    } catch (error) {
      loggError({
        message: `Error provisioning defaults on activation for workspace: ${error}`,
      });
      vscode.window.showErrorMessage(
        "Color Comment: Failed to provision default settings on activation. Check output logs."
      );
    }
  }

  // 4. Register commands as defined in your `package.json`.
  context.subscriptions.push(
    vscode.commands.registerCommand("colorComment.editSettings", () => {
      logg({
        message: "Opening color settings for editing...",
      });
      // Delegate to your setup function to handle opening the settings file.
      // This function internally ensures defaults are set before opening.
      openColorSettingsForEditing();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("colorComment.setup", () => {
      logg({
        message: "Setting up Color Comment extension...",
      });
      // Delegate to your setup function to orchestrate the default setup process.
      setUpDefaultFolder();
    })
  );
}

/**
 * Deactivates the Color Comment extension.
 * This function is called when your extension is deactivated.
 */
export function deactivate() {
  logg({ prefix: "Color Comment", message: "Extension deactivated." });
  // If you had any disposable objects (e.g., event listeners not pushed to `context.subscriptions`),
  // you would dispose of them here to prevent memory leaks.
}
