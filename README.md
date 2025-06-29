# Color Comment

A Visual Studio Code extension that highlights tagged comments with different colors to improve code readability and organization.

## Features

- 🎨 **Multi-color comment highlighting** - Different tags get different colors
- 🔍 **Language support** - Works with JavaScript, TypeScript, and Go
- ⚡ **Real-time updates** - Colors update as you type
- 🏷️ **10 predefined tags** - Common development tags ready to use
- 💡 **Hover information** - See tag information on hover

## Supported Tags

| Tag         | Color       | Purpose                     | Example                              |
| ----------- | ----------- | --------------------------- | ------------------------------------ |
| `i:`        | 🔴 Red      | Important information       | `// i: Critical security check`      |
| `todo:`     | 🟠 Orange   | Tasks to complete           | `// todo: Add input validation`      |
| `note:`     | 🔵 Blue     | General notes/documentation | `// note: This handles file uploads` |
| `fixme:`    | 🔴 Dark Red | Bugs that need fixing       | `// fixme: Memory leak in loop`      |
| `hack:`     | 🟣 Purple   | Temporary solutions         | `// hack: Quick fix for production`  |
| `warning:`  | 🟡 Yellow   | Warnings/cautions           | `// warning: Deprecated method`      |
| `review:`   | 🟢 Green    | Code review items           | `// review: Check this logic`        |
| `debug:`    | 🩷 Pink      | Debug information           | `// debug: Log user actions`         |
| `temp:`     | ⚪ Gray     | Temporary code              | `// temp: Remove after testing`      |
| `question:` | 🔵 Cyan     | Questions/doubts            | `// question: Should this be async?` |

## Usage

Simply add any of the supported tags at the beginning of your comments:

### JavaScript/TypeScript

```javascript
// i: This is important information
// todo: Implement user authentication
/* note: This function handles 
   multi-line operations */

function example() {
  // fixme: Handle edge case here
  return data.process();
}
```

### Go

```go
// i: Critical performance section
// todo: Add error handling
func main() {
    // warning: This will be removed in v2.0
    fmt.Println("Hello World")
}
```

## Supported Languages

- **JavaScript** (`.js`)
- **TypeScript** (`.ts`)
- **Go** (`.go`)

Both single-line (`//`) and multi-line (`/* */`) comments are supported.

## Installation

1. Open Visual Studio Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "Color Comment"
4. Click Install

## Commands

- **Show Available Tags**: Use `Ctrl+Shift+P` and search for "Show Tags" to see all available tags

## Examples

### Before

```javascript
// This is important
// TODO: Fix this later
// NOTE: Check documentation
// BUG: Memory issue here
```

### After

With Color Comment extension, each tagged comment gets its distinct color:

- `// i: This is important` → **Red**
- `// todo: Fix this later` → **Orange**
- `// note: Check documentation` → **Blue**
- `// fixme: Memory issue here` → **Dark Red**

## Benefits

- **Better Code Organization** - Quickly identify different types of comments
- **Improved Readability** - Color coding makes comments stand out
- **Team Collaboration** - Standardized comment tags across your team
- **Faster Code Review** - Easily spot review items and todos
- **Bug Tracking** - Highlight known issues with `fixme:` tags

## Configuration

Currently, the extension works out of the box with predefined colors. Future versions will include customizable colors and tags.

## Requirements

- Visual Studio Code 1.101.0 or higher
- Files with JavaScript, TypeScript, or Go language mode

## Known Issues

- Only supports JavaScript, TypeScript, and Go files currently
- Tags must be at the beginning of comments (after `//` or `/*`)
- Case sensitive tag matching

## Release Notes

### 0.0.1

- Initial release
- Support for 10 predefined tags
- JavaScript, TypeScript, and Go language support
- Real-time comment highlighting

## Contributing

Found a bug or want to request a feature? Please create an issue on our GitHub repository.

## License

This extension is licensed under the MIT License.

---

**Enjoy coding with colorful comments!** 🎨✨
