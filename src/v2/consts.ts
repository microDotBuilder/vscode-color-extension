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

export const watchLanguages = {
  // --- Languages with "//" single-line comments ---
  javascript: {
    fileExtension: ".js",
    commentPrefix: "//",
    commentPrefixRegex: /\s*\/\//g, // ADDED 'g' FLAG
    commentSuffix: "",
  },
  typescript: {
    fileExtension: ".ts",
    commentPrefix: "//",
    commentPrefixRegex: /\s*\/\//g, // ADDED 'g' FLAG
    commentSuffix: "",
  },
  typescriptreact: {
    fileExtension: ".tsx",
    commentPrefix: "//",
    commentPrefixRegex: /\s*\/\//g, // ADDED 'g' FLAG
    commentSuffix: "",
  },
  javascriptreact: {
    fileExtension: ".jsx",
    commentPrefix: "//",
    commentPrefixRegex: /\s*\/\//g, // ADDED 'g' FLAG
    commentSuffix: "",
  },
  java: {
    fileExtension: ".java",
    commentPrefix: "//",
    commentPrefixRegex: /\s*\/\//g, // ADDED 'g' FLAG
    commentSuffix: "",
  },
  c: {
    fileExtension: ".c",
    commentPrefix: "//",
    commentPrefixRegex: /\s*\/\//g, // ADDED 'g' FLAG
    commentSuffix: "",
  },
  "c++": {
    fileExtension: ".cpp",
    commentPrefix: "//",
    commentPrefixRegex: /\s*\/\//g, // ADDED 'g' FLAG
    commentSuffix: "",
  },
  "c#": {
    fileExtension: ".cs",
    commentPrefix: "//",
    commentPrefixRegex: /\s*\/\//g, // ADDED 'g' FLAG
    commentSuffix: "",
  },
  go: {
    fileExtension: ".go",
    commentPrefix: "//",
    commentPrefixRegex: /\s*\/\//g, // ADDED 'g' FLAG
    commentSuffix: "",
  },
  swift: {
    fileExtension: ".swift",
    commentPrefix: "//",
    commentPrefixRegex: /\s*\/\//g, // ADDED 'g' FLAG
    commentSuffix: "",
  },
  rust: {
    fileExtension: ".rs",
    commentPrefix: "//",
    commentPrefixRegex: /\s*\/\//g, // ADDED 'g' FLAG
    commentSuffix: "",
  },
  scala: {
    fileExtension: ".scala",
    commentPrefix: "//",
    commentPrefixRegex: /\s*\/\//g, // ADDED 'g' FLAG
    commentSuffix: "",
  },

  // --- Languages with "#" single-line comments ---
  python: {
    fileExtension: ".py",
    commentPrefix: "#",
    commentPrefixRegex: /\s*#/g, // ADDED 'g' FLAG
    commentSuffix: "",
  },
  elixir: {
    fileExtension: ".ex",
    commentPrefix: "#",
    commentPrefixRegex: /\s*#/g, // ADDED 'g' FLAG
    commentSuffix: "",
  },

  // --- Languages with "--" single-line comments ---
  haskell: {
    fileExtension: ".hs",
    commentPrefix: "--",
    commentPrefixRegex: /\s*--/g, // ADDED 'g' FLAG
    commentSuffix: "",
  },
  sql: {
    fileExtension: ".sql",
    commentPrefix: "--",
    commentPrefixRegex: /\s*--/g, // ADDED 'g' FLAG
    commentSuffix: "",
  },

  // --- Languages with "%" single-line comments ---
  prolog: {
    fileExtension: ".pl",
    commentPrefix: "%",
    commentPrefixRegex: /\s*%/g, // ADDED 'g' FLAG
    commentSuffix: "",
  },

  // --- Languages that primarily use BLOCK comments or have no standard `//` single-line comment ---
  html: {
    fileExtension: ".html",
    commentPrefix: "<!--",
    commentPrefixRegex: /\s*<!--/g, // ADDED 'g' FLAG
    commentSuffix: "-->",
  },
  css: {
    fileExtension: ".css",
    commentPrefix: "/*",
    commentPrefixRegex: /\s*\/\*/g, // ADDED 'g' FLAG
    commentSuffix: "*/",
  },
  json: {
    fileExtension: ".json",
    commentPrefix: "/*",
    commentPrefixRegex: /\s*\/\*/g, // ADDED 'g' FLAG
    commentSuffix: "*/",
  },
} as const;
