import * as vscode from "vscode";
import { ColorConfig } from "../config/color-config";
import { logg } from "../logger/logg";
import { LanguageConfig } from "./language-service";

export interface TagMatchInfo {
  tag: string;
  range: vscode.Range;
  color: string;
}

/**
 * Service class responsible for finding and processing tags in text documents.
 * This class is designed to be easily testable and reusable.
 */
export class TagFinder {
  /**
   * Finds all tags in a single line of text and returns an array of TagMatchInfo objects.
   *
   * @param lineText The text of the line to search
   * @param lineIndex The index of the line
   * @param commentPrefixRegex The regex to match comment prefixes
   * @param currentTagColors The current tag colors configuration
   * @returns Array of TagMatchInfo objects found in the line
   */
  static findTagsInLine(
    lineText: string,
    lineIndex: number,
    commentPrefixRegex: RegExp,
    currentTagColors: Record<string, string>
  ): TagMatchInfo[] {
    const tagMatches: TagMatchInfo[] = [];

    // Ensure the regex has the 'g' flag for `matchAll` to find all occurrences.
    const commentMatches = lineText.matchAll(commentPrefixRegex);

    for (const match of commentMatches) {
      const commentPrefixMatchStart = match.index!; // Start index of the comment prefix itself
      const commentPrefixLength = match[0].length; // Length of the matched prefix

      // Extract the content *after* the comment prefix from the original line, then trim.
      const commentContent = lineText
        .substring(commentPrefixMatchStart + commentPrefixLength)
        .trim();

      // Iterate through each configured tag (e.g., "i:", "todo:", "note:")
      for (const tag in currentTagColors) {
        if (commentContent.startsWith(tag)) {
          const color = currentTagColors[tag]; // Get the color for this tag

          // Calculate the exact start and end position of the tag within the original line
          const tagStartIndexInFullLine = lineText.indexOf(
            tag,
            commentPrefixMatchStart + commentPrefixLength
          );

          if (tagStartIndexInFullLine !== -1) {
            const range = new vscode.Range(
              lineIndex, // Line number
              tagStartIndexInFullLine, // Start character index of the tag
              lineIndex, // Line number
              tagStartIndexInFullLine + tag.length // End character index of the tag
            );

            const tagMatchInfo: TagMatchInfo = {
              tag: tag,
              range: range,
              color: color, // Store the specific color for this match
            };

            tagMatches.push(tagMatchInfo);

            logg({
              prefix: "TagFinder.findTagsInLine",
              message: `Found tag '${tag}' on line ${lineIndex + 1} at range ${
                range.start.character
              }-${range.end.character}. Color: ${color}.`,
            });
            // Break from inner loop if you only want the first tag found in this comment block.
            // If you want all tags from one comment block, remove `break;`.
            break;
          }
        }
      }
    }

    return tagMatches;
  }

  /**
   * Finds all tags in multiple lines and returns a map of line index to TagMatchInfo arrays.
   *
   * @param lines Array of line strings to search
   * @param commentPrefixRegex The regex to match comment prefixes
   * @returns Map of line index to array of TagMatchInfo objects
   */
  static findTagsInLines(
    lines: string[],
    commentPrefixRegex: RegExp
  ): Map<number, TagMatchInfo[]> {
    const result = new Map<number, TagMatchInfo[]>();

    if (!lines || lines.length === 0) {
      return result;
    }

    const currentTagColors = ColorConfig.getColors(); // Get the latest in-memory tag colors

    lines.forEach((lineText, index) => {
      const tagMatches = TagFinder.findTagsInLine(
        lineText,
        index,
        commentPrefixRegex,
        currentTagColors
      );

      if (tagMatches.length > 0) {
        result.set(index, tagMatches);
      }
    });

    return result;
  }

  /**
   * Finds tags in specific lines only, for incremental updates.
   *
   * @param lines Array of line strings to search
   * @param lineIndices Array of line indices to search
   * @param commentPrefixRegex The regex to match comment prefixes
   * @returns Map of line index to array of TagMatchInfo objects
   */
  static findTagsInSpecificLines(
    lines: string[],
    lineIndices: number[],
    commentPrefixRegex: RegExp
  ): Map<number, TagMatchInfo[]> {
    const result = new Map<number, TagMatchInfo[]>();
    const currentTagColors = ColorConfig.getColors();

    lineIndices.forEach((lineIndex) => {
      if (lineIndex < lines.length) {
        const lineText = lines[lineIndex];
        const tagMatches = TagFinder.findTagsInLine(
          lineText,
          lineIndex,
          commentPrefixRegex,
          currentTagColors
        );

        if (tagMatches.length > 0) {
          result.set(lineIndex, tagMatches);
        }
      }
    });

    return result;
  }

  /**
   * Validates if a tag is supported by checking if it exists in the current configuration.
   *
   * @param tag The tag to validate
   * @returns True if the tag is supported, false otherwise
   */
  static isSupportedTag(tag: string): boolean {
    const tagColors = ColorConfig.getColors();
    return TagFinder.validateTag(tag) && tagColors.hasOwnProperty(tag);
  }

  /**
   * Validates a tag string format.
   *
   * @param tag The tag to validate
   * @returns True if the tag format is valid, false otherwise
   */
  static validateTag(tag: string): boolean {
    return (
      typeof tag === "string" &&
      tag.length > 0 &&
      tag.length <= 50 && // MAX_TAG_LENGTH
      /^[a-zA-Z0-9_:-]+$/.test(tag)
    );
  }
}
