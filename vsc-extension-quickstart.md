# Welcome to Powered Plain Text VS Code Extension

## What's in the folder

* This folder contains all of the files necessary for your extension.
* `package.json` - this is the manifest file in which you declare your language support and define the location of the grammar file that has been copied into your extension.
* `syntaxes/richtext.tmLanguage.json` - this is the Text mate grammar file that is used for tokenization.
* `language-configuration.json` - this is the language configuration, defining the tokens that are used for comments and brackets.

## Get up and running straight away

* Make sure the language configuration settings in `language-configuration.json` are accurate.
* Press `F5` to open a new window with your extension loaded.
* Create a new file with a file name suffix matching your language.
* Verify that syntax highlighting works and that the language configuration settings are working.

## Make changes

* You can relaunch the extension from the debug toolbar after making changes to the files listed above.
* You can also reload (`Ctrl+R` or `Cmd+R` on Mac) the VS Code window with your extension to load your changes.

## Install your extension

* To start using your extension with Visual Studio Code copy it into the `<user home>/.vscode/extensions` folder and restart Code.
* To share your extension with the world, read on https://code.visualstudio.com/api/working-with-extensions/publishing-extension about publishing an extension.


## Compile Extension
- Use Node.js 18+ and npm 9+ for local development.
- On Debian or Ubuntu, `apt install nodejs npm` may install an older Node.js that cannot run TypeScript 5.
- If that happens, install a current LTS Node.js release from NodeSource or the official Node.js distribution first: `curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -` and `sudo apt install nodejs`.
- `npm install` - Installs the necessary dependencies for the extension after installing npm.
- `npm run compile` - Compiles the extension code using TypeScript compiler.
- `F5` - Launches a new VS Code window with the extension loaded for debugging.

## Generate VSIX
- `npm install -g vsce` - Installs the VS Code Extension Manager globally.
- `vsce package` - Generates a `.vsix` package file for the extension, which can be shared or published to the VS Code Marketplace.
- `Ctrl + Shift + P` and select `Extensions: Install from VSIX...` - Installs the generated `.vsix` package into VS Code for testing or usage.
