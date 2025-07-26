import * as vscode from "vscode";

import {
  setUpDefaultFolder,
  openColorSettingsForEditing,
} from "./setupfolder/setup";
import { logg } from "./logger/logg";

// Store decoration types for each tag
// const decorationTypes = new Map<string, vscode.TextEditorDecorationType>();

// This will get activated with user manualy activating the extension
export function activate(context: vscode.ExtensionContext) {
  console.log("Color Comment extension v2 ...... activated!");

  // Command to open settings for editing
  let editSettingsCommand = vscode.commands.registerCommand(
    "colorComment.editSettings",
    () => {
      logg({
        message: "Opening color settings for editing...",
      });
      openColorSettingsForEditing();
    }
  );

  let setupCommand = vscode.commands.registerCommand(
    "colorComment.setup",
    () => {
      logg({
        message: "setting up  Color Comment extension...",
      });
      setUpDefaultFolder();
    }
  );

  // Register all commands
  context.subscriptions.push(editSettingsCommand, setupCommand);
}

// for any console.logg.....
export function deactivate() {}
