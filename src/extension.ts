import * as vscode from "vscode";
import { CONFIG, tagColors } from "./const";
import { findTaggedComments, safeRegexExec } from "./utils";

// Store decoration types for each tag
const decorationTypes = new Map<string, vscode.TextEditorDecorationType>();

export function activate(context: vscode.ExtensionContext) {
  console.log("Color Comment extension activated!");

  try {
    // Create decoration types for each tag
    Object.entries(tagColors).forEach(([tag, color]) => {
      try {
        const decorationType = vscode.window.createTextEditorDecorationType({
          color: color,
          fontWeight: "bold",
          // Optional: add subtle background
          backgroundColor: `${color}15`, // 15 = ~8% opacity
        });
        decorationTypes.set(tag, decorationType);
        context.subscriptions.push(decorationType);
      } catch (error) {
        console.error(
          `Failed to create decoration type for tag ${tag}:`,
          error
        );
      }
    });

    const watchedLanguages = ["javascript", "typescript", "go"];

    // Watch for active editor changes
    const onDidChangeActiveEditor = vscode.window.onDidChangeActiveTextEditor(
      (editor) => {
        try {
          if (editor && watchedLanguages.includes(editor.document.languageId)) {
            console.log(`Switched to ${editor.document.languageId} file`);
            updateAllDecorations(editor);
          }
        } catch (error) {
          console.error("Error in onDidChangeActiveEditor:", error);
        }
      }
    );

    // Watch for document content changes
    const onDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument(
      (event) => {
        try {
          const document = event.document;
          const editor = vscode.window.activeTextEditor;

          if (
            editor &&
            editor.document === document &&
            watchedLanguages.includes(document.languageId)
          ) {
            updateAllDecorations(editor);
          }
        } catch (error) {
          console.error("Error in onDidChangeTextDocument:", error);
        }
      }
    );

    // Process currently active editor
    const activeEditor = vscode.window.activeTextEditor;
    if (
      activeEditor &&
      watchedLanguages.includes(activeEditor.document.languageId)
    ) {
      updateAllDecorations(activeEditor);
    }

    // Register command to show all available tags
    const showTagsCommand = vscode.commands.registerCommand(
      "color-comment.showTags",
      () => {
        try {
          const tagList = Object.keys(tagColors).join(", ");
          vscode.window.showInformationMessage(`Available tags: ${tagList}`);
        } catch (error) {
          console.error("Error showing tags:", error);
          vscode.window.showErrorMessage(
            "Color Comment: Failed to show available tags"
          );
        }
      }
    );

    // Register all disposables
    context.subscriptions.push(
      onDidChangeActiveEditor,
      onDidChangeTextDocument,
      showTagsCommand
    );
  } catch (error) {
    console.error("Failed to activate Color Comment extension:", error);
    vscode.window.showErrorMessage(
      "Color Comment: Extension activation failed"
    );
  }
}

function updateAllDecorations(editor: vscode.TextEditor) {
  try {
    if (!editor?.document) {
      console.warn("No valid editor or document found");
      return;
    }

    const document = editor.document;
    console.log(`Updating decorations for: ${document.fileName}`);

    // Check document size limit
    if (document.getText().length > CONFIG.MAX_DOCUMENT_SIZE) {
      console.warn(
        `Document too large (${
          document.getText().length
        } chars), skipping decoration`
      );
      vscode.window.showWarningMessage(
        "Color Comment: Document too large for processing"
      );
      return;
    }

    // Clear all existing decorations first
    decorationTypes.forEach((decorationType, tag) => {
      try {
        editor.setDecorations(decorationType, []);
      } catch (error) {
        console.error(`Failed to clear decorations for tag ${tag}:`, error);
      }
    });

    // Process each tag separately
    Object.keys(tagColors).forEach((tag) => {
      try {
        const decorations = findTaggedComments(document, tag);
        const decorationType = decorationTypes.get(tag);

        if (decorationType && decorations.length > 0) {
          editor.setDecorations(decorationType, decorations);
          console.log(
            `Applied ${decorations.length} decorations for tag: ${tag}`
          );
        }
      } catch (error) {
        console.error(`Failed to process tag ${tag}:`, error);
      }
    });
  } catch (error) {
    console.error("Failed to update decorations:", error);
    vscode.window.showErrorMessage(
      "Color Comment: Failed to update decorations"
    );
  }
}

export function deactivate() {
  try {
    console.log("Deactivating Color Comment extension...");

    // Dispose all decoration types
    decorationTypes.forEach((decorationType, tag) => {
      try {
        decorationType.dispose();
      } catch (error) {
        console.error(`Error disposing decoration type for tag ${tag}:`, error);
      }
    });

    decorationTypes.clear();
    console.log("Extension deactivated successfully!");
  } catch (error) {
    console.error("Error during extension deactivation:", error);
  }
}
