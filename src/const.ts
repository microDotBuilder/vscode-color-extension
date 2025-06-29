// Configuration constants
export const CONFIG = {
  MAX_DOCUMENT_SIZE: 1000000, // 1MB limit
  MAX_ITERATIONS: 10000, // Prevent infinite loops
  REGEX_TIMEOUT_MS: 100, // Regex execution timeout
  MAX_TAG_LENGTH: 50, // Maximum tag length
} as const;

// Define tag colors
export const tagColors = {
  "i:": "#ff6b6b", // Red - Important/Info
  "todo:": "#ffa500", // Orange - Tasks to do
  "note:": "#4dabf7", // Blue - General notes
  "fixme:": "#ff4757", // Dark Red - Bugs to fix
  "hack:": "#9c88ff", // Purple - Temporary solutions
  "warning:": "#ffd93d", // Yellow - Warnings/Cautions
  "review:": "#26de81", // Green - Code review items
  "debug:": "#fd79a8", // Pink - Debug information
  "temp:": "#a4b0be", // Gray - Temporary code
  "question:": "#00d2d3", // Cyan - Questions/Doubts
} as const;
