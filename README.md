# Powered Plain Text

Add intelligent syntax highlighting and logical symbols to plain text documents for better readability.

## Features

### 🎨 Automatic Syntax Highlighting

- **Logical Transition Words**: Automatically recognize causal, contrastive, progressive relationships
- **Punctuation**: Soft gray display
- **Quoted Content**: String-style highlighting
- **Book Titles**: Highlighted display for books and works
- **Parenthetical Content**: Dimmed display for supplementary notes
- **Numbers**: Eye-catching orange display

### 🔣 Logical Symbol Hints

Logical transition words in text automatically display corresponding symbols (display only, won't be copied):

- `→` Causation: because, since, 因为, 由于
- `⇒` Result: therefore, thus, 因此, 所以
- `⇄` Contrast: but, however, 但是, 然而
- `⊕` Addition: moreover, furthermore, 此外, 并且
- `◆` Summary: in conclusion, finally, 总之, 最后
- `📌` Example: for example, for instance, 例如, 比如
- `①` Sequence: first, second, 首先, 其次

### 📝 Auto-Formatting

Use the command `Rich Text: Auto Format` to automatically insert blank lines at viewpoint transitions.

## Supported File Extensions

- `.txt`
- `.rtxt`
- `.rich`
- `.tex`
- `.latex`
- 
## Usage

1. Open any file with a supported extension
2. Click the language mode in the bottom right corner and select `Rich Text`
3. Start typing and enjoy automatic syntax highlighting

## Requirements

- VS Code 1.85.0 or higher
- Node.js 18 or higher for local development
- npm 9 or higher for local development

## Development Setup

1. Install Node.js 18+ and npm 9+
2. Run `npm install`
3. Run `npm run compile`

If you installed Node.js from your Linux distribution with `apt install nodejs npm`, you may get an outdated Node.js version. In that case, switch to a current LTS release from NodeSource or the official Node.js packages before running the build.

## Release Notes
Shown in `CHANGELOG.md` file.