// src/config/ColorConfig.ts
import * as vscode from "vscode";
import { logg, loggError } from "../logger/logg"; // Adjust path as necessary
import { tagColors as defaultTagColors } from "../consts"; // Your default tags

// IMPORTANT: This function needs to be exported from your main extension file
// and imported here. Ensure the path is correct.
import { refreshDecorations } from "../extension"; // Adjust this import path!

export class ColorConfig {
  private static _instance: ColorConfig | undefined;
  public tagColors: Record<string, string>;

  private constructor(tagColors: Record<string, string>) {
    this.tagColors = tagColors;
  }

  /**
   * Initializes or updates the singleton instance of ColorConfig by reading
   * the 'colorComment.tagColors' setting from VS Code's configuration.
   * This should be called on extension activation and whenever config changes.
   *
   * @param scopeUri The URI representing the scope (e.g., a workspace folder URI).
   *                 If undefined, it loads the global/user configuration.
   */
  public static updateColorsState(scopeUri?: vscode.Uri): void {
    const config = vscode.workspace.getConfiguration("colorComment", scopeUri);
    const tagColors = config.get<Record<string, string>>("tagColors", {});

    ColorConfig._instance = new ColorConfig(tagColors);

    logg({
      prefix: "ColorConfig",
      message: `Loaded tagColors from configuration (Scope: ${
        scopeUri ? scopeUri.fsPath : "Global"
      }).`,
    });

    // Trigger decoration refresh after the in-memory state is updated
    refreshDecorations();
  }

  /**
   * Gets the current tag colors from the in-memory singleton instance.
   * Any part of your extension should call this to get the active colors.
   */
  public static getColors(): Record<string, string> {
    return ColorConfig._instance ? ColorConfig._instance.tagColors : {};
  }

  /**
   * Provides the default tag colors that your extension ships with.
   */
  public static get default(): Record<string, string> {
    return { ...defaultTagColors };
  }

  /**
   * Checks if default tag colors are set in the workspace folder's settings.json.
   * If not, it writes them. This is the new home for `initializeDefaultColors` logic.
   *
   * @param workspaceUri The URI of the workspace folder to configure.
   */
  public static async provisionDefaultsIfMissing(
    workspaceUri: vscode.Uri
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration(
      "colorComment",
      workspaceUri
    );
    const inspection = config.inspect<Record<string, string>>("tagColors");
    const hasWorkspaceValue = inspection?.workspaceValue !== undefined;

    if (hasWorkspaceValue) {
      logg({
        message: `Config already exists for workspace folder ${workspaceUri.fsPath}. Skipping default provisioning.`,
      });
      return;
    }

    logg({
      message: `Adding default colors to workspace folder ${workspaceUri.fsPath}.`,
    });

    try {
      await config.update(
        "tagColors",
        ColorConfig.default,
        vscode.ConfigurationTarget.WorkspaceFolder
      );
      logg({
        message:
          "Default tag colors successfully set in workspace settings.json.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      loggError({
        message: `Failed to set initial tag colors in workspace ${workspaceUri.fsPath}: ${errorMessage}`,
      });
      throw error; // Re-throw to allow calling functions to handle (e.g., showErrorMessage)
    }
  }
}
