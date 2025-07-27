import * as vscode from "vscode";
import { logg, loggError } from "./logger/logg"; // Ensure correct path for your logger
import { ColorConfig } from "./config/color-config"; // Ensure correct path for ColorConfig

import {
  setUpDefaultFolder,
  openColorSettingsForEditing,
} from "./setupfolder/setup"; // Ensure correct path for setup functions
import { LanguageService } from "./main/language-service";
import {
  colorComment,
  createDecorationTypes,
  clearDecorationsForDocument,
  disposeAllDecorationTypes,
} from "./main/color";
// import { testLanguage } from "./main/utils";

// Global variable to hold the first workspace folder.
// This is used for scoping configuration operations to the current workspace.
let _workspaceFolder: vscode.WorkspaceFolder | undefined;

/**
 * This function is called by `ColorConfig` whenever the tag colors configuration changes.
 * It is responsible for refreshing any active text editor decorations.
 * IMPORTANT: This function MUST be exported so `ColorConfig` can import and call it.
 */
export function refreshDecorations() {
  // Recreate decoration types with the new colors
  createDecorationTypes();

  // Apply decorations to all visible editors
  vscode.window.visibleTextEditors.forEach((editor) => {
    colorComment(editor);
  });
}

// Debounce timer for text document changes
let debounceTimer: NodeJS.Timeout | undefined;

/**
 * Efficiently refreshes decorations for a specific document only.
 * This is much more performant than refreshing all visible editors.
 */
function refreshDecorationsForDocument(document: vscode.TextDocument) {
  const editor = vscode.window.visibleTextEditors.find(
    (editor) => editor.document === document
  );

  if (editor) {
    colorComment(editor);
  }
}

/**
 * Efficiently refreshes decorations for specific changed lines only.
 * This provides the most seamless experience.
 */
function refreshDecorationsForChangedLines(
  document: vscode.TextDocument,
  changedLines: number[]
) {
  const editor = vscode.window.visibleTextEditors.find(
    (editor) => editor.document === document
  );

  if (editor) {
    colorComment(editor, changedLines);
  }
}

/**
 * Debounced version of refreshDecorationsForChangedLines to avoid excessive calls during typing.
 */
function debouncedRefreshDecorations(
  document: vscode.TextDocument,
  changedLines?: number[]
) {
  // Clear existing timer
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  // Set new timer
  debounceTimer = setTimeout(() => {
    if (changedLines && changedLines.length > 0) {
      refreshDecorationsForChangedLines(document, changedLines);
    } else {
      refreshDecorationsForDocument(document);
    }
  }, 150); // Reduced debounce delay for more responsive feel
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

  // 4. Create decoration types for all configured tags
  createDecorationTypes();

  // logg({ message: "we are about to test decoration functionality" });
  // // testDecorationFunctionality();
  refreshDecorations();
  attachListeners(context);
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

  // Clear any pending debounce timer
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = undefined;
  }

  // Dispose of all decoration types to prevent memory leaks
  disposeAllDecorationTypes();
}

export function testDecorationFunctionality() {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    colorComment(editor);
  }
}

/**
 * Attaches listeners to the workspace for text and workspace folder changes.
 * this will also be responsible for refreshing the decorations when user changes
 * text in file
 * @param context - The extension context.
 */

function attachListeners(context: vscode.ExtensionContext) {
  // Listen for text document changes - only refresh the specific document that changed
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      // Only process if the document is a supported language
      const languageInfo = LanguageService.getLanguageInfo(event.document);
      if (languageInfo) {
        // Extract changed line numbers for incremental updates
        const changedLines = new Set<number>();
        event.contentChanges.forEach((change) => {
          const startLine = change.range.start.line;
          const endLine = change.range.end.line;

          // Add all lines that were affected by the change
          for (let line = startLine; line <= endLine; line++) {
            changedLines.add(line);
          }

          // If new lines were added, also process the lines after the insertion
          if (change.text.includes("\n")) {
            const newLineCount = (change.text.match(/\n/g) || []).length;
            for (
              let line = endLine + 1;
              line <= endLine + newLineCount;
              line++
            ) {
              changedLines.add(line);
            }
          }
        });

        // Convert to array and sort for consistent processing
        const changedLinesArray = Array.from(changedLines).sort(
          (a, b) => a - b
        );

        // Use incremental update for better performance
        debouncedRefreshDecorations(event.document, changedLinesArray);
      }
    })
  );

  // Listen for workspace folder changes - refresh all visible editors
  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders((event) => {
      refreshDecorations();
    })
  );

  // Listen for active editor changes - refresh decorations when switching between files
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        const languageInfo = LanguageService.getLanguageInfo(editor.document);
        if (languageInfo) {
          refreshDecorationsForDocument(editor.document);
        }
      }
    })
  );

  // Listen for document close events - clear cached decorations
  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((document) => {
      clearDecorationsForDocument(document);
    })
  );
}
