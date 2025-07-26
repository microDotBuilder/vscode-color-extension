# Color Comment Extension

A VS Code extension that highlights comments with specific tags using custom colors.

## Features

- **Customizable Colors**: Edit, rename, and add new comment tags with custom colors
- **Easy Setup**: Simple commands to setup and manage your color preferences
- **User-Friendly**: Built-in validation and helpful error messages

## Quick Start

1. **Setup the Extension**:

   - Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
   - Run: `Color Comment: Setup Color Comment Extension`

2. **Customize Your Colors**:

   - Run: `Color Comment: Edit Color Comment Settings`
   - This opens your `settings.json` file where you can customize colors

3. **View Current Settings**:
   - Run: `Color Comment: Show Current Color Settings`
   - See all your current color configurations

## How to Customize Colors

### Basic Customization

Your colors are stored in `.vscode/settings.json`:

```json
{
  "colorComment.tagColors": {
    "todo:": "#ffa500", // Orange for tasks
    "note:": "#4dabf7", // Blue for notes
    "important:": "#ff0000", // Red for important items
    "bug:": "#ff4757", // Dark red for bugs
    "temp:": "#a4b0be" // Gray for temporary code
  }
}
```

### What You Can Do

1. **Change Colors**: Modify hex values (e.g., `"#ffa500"` to `"#00ff00"`)
2. **Rename Tags**: Change tag names (e.g., `"todo:"` to `"task:"`)
3. **Add New Tags**: Create custom tags (e.g., `"urgent:": "#ff0000"`)
4. **Remove Tags**: Delete tags you don't need

### Tag Format Rules

- **Must end with colon**: `"tag:"` ✅, `"tag"` ❌
- **Use valid hex colors**: `"#ff6b6b"` ✅, `"red"` ❌
- **Alphanumeric characters only**: `"todo:"` ✅, `"to-do:"` ❌

### Example Customizations

```json
{
  "colorComment.tagColors": {
    "task:": "#ffa500", // Renamed from "todo:"
    "urgent:": "#ff0000", // New custom tag
    "note:": "#4dabf7", // Kept original
    "bug:": "#ff4757", // Renamed from "fixme:"
    "review:": "#26de81", // Kept original
    "temp:": "#a4b0be" // Kept original
  }
}
```

## Commands

- **Setup Color Comment Extension**: Initial setup
- **Edit Color Comment Settings**: Open settings for editing
- **Show Current Color Settings**: View current configuration
- **Test Color Comment Extension**: Run tests

## Default Colors

| Tag         | Color     | Purpose             |
| ----------- | --------- | ------------------- |
| `i:`        | `#ff6b6b` | Important/Info      |
| `todo:`     | `#ffa500` | Tasks to do         |
| `note:`     | `#4dabf7` | General notes       |
| `fixme:`    | `#ff4757` | Bugs to fix         |
| `hack:`     | `#9c88ff` | Temporary solutions |
| `warning:`  | `#ffd93d` | Warnings/Cautions   |
| `review:`   | `#26de81` | Code review items   |
| `debug:`    | `#fd79a8` | Debug information   |
| `temp:`     | `#a4b0be` | Temporary code      |
| `question:` | `#00d2d3` | Questions/Doubts    |

## Usage Examples

```javascript
// todo: This needs to be implemented
function processData() {
  // note: This is a temporary solution
  // fixme: Handle edge case when data is null
  // hack: Quick fix for now
  // temp: Remove this later
}
```

## Troubleshooting

### Common Issues

1. **Colors not showing**: Run the setup command first
2. **Invalid format errors**: Ensure tags end with `:` and colors are hex format
3. **Settings not saving**: Check file permissions for `.vscode/settings.json`

### Validation

The extension validates your settings and will show helpful error messages if:

- Tag format is incorrect
- Color format is invalid
- JSON syntax is malformed

## Development

- Built with TypeScript
- Uses VS Code Extension API
- Supports workspace-level configuration
