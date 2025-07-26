import * as vscode from "vscode";
import { logg, loggError, showMessage } from "../logger/logg";
import { tagColors } from "../consts";

// This function remains excellent as is. No changes needed.
export async function openColorSettingsForEditing(): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    showMessage("No workspace folder found. Please open a folder first.");
    return;
  }
  // For simplicity, we open the settings of the first workspace.
  // You could enhance this by prompting the user to choose in a multi-root scenario.
  const workspaceFolder = workspaceFolders[0];
  const settingsJsonPath = vscode.Uri.joinPath(
    workspaceFolder.uri,
    ".vscode",
    "settings.json"
  );

  try {
    // Ensure the file exists before opening it by running setup.
    // The setup is idempotent, so it's safe to run multiple times.
    await initializeDefaultColors(workspaceFolder);

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
      await initializeDefaultColors(workspaceFolder);
    }
    logg({ message: "Default folder setup completed successfully." });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    loggError({ message: `setUpDefaultFolder failed: ${errorMessage}` });
    showMessage(
      "Color Comment setup failed. Please check the logs for details."
    );
  }
}

/**
 * Initializes the default color configuration in the settings.json of a
 * specific workspace folder if it's not already present.
 *
 * @param workspaceFolder The workspace folder to configure.
 */
async function initializeDefaultColors(
  workspaceFolder: vscode.WorkspaceFolder
): Promise<void> {
  // Get the configuration scoped to the specific workspace folder.
  const config = vscode.workspace.getConfiguration(
    "colorComment",
    workspaceFolder.uri
  );

  // Inspect the configuration at the WorkspaceFolder level.
  const inspection = config.inspect<typeof tagColors>("tagColors");
  const hasWorkspaceValue = inspection?.workspaceValue !== undefined;

  // Only write to settings.json if no workspace-specific value is set.
  // This respects user overrides and avoids unnecessary writes.
  if (hasWorkspaceValue) {
    logg({
      message: `Config already exists for workspace '${workspaceFolder.name}'. Skipping.`,
    });
    return;
  }

  logg({
    message: `Adding default colors to workspace '${workspaceFolder.name}'.`,
  });

  // This single command handles everything:
  // - Creates .vscode/settings.json if they don't exist.
  // - Adds the "colorComment.tagColors" property.
  // - Preserves existing settings and comments.
  await config.update(
    "tagColors",
    tagColors,
    vscode.ConfigurationTarget.WorkspaceFolder
  );
}
