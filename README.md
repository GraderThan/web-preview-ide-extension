# Web Preview

Experiment with JavaScript, HTML, and CSS directly in your familiar Grader Than
IDE! This tool allows you to quickly test and prototype code snippets without
any setup.

This project was forked from [Sandbox-vscode](https://github.com/jccr/sandbox-vscode)

![Sandbox in action](https://github.com/GraderThan/web-preview-ide-extension/raw/master/assets/demo.gif)

## Key Features

### Interactive Coding Playground

Bring your web development ideas to life with ease. This live coding environment lets you prototype and experiment instantly.

1. Start a new project by using the command: 
   - `Web Preview: New Project`

2. Write your code in the provided editor.
3. See real-time updates as your code runs in the live preview window.

- Open an existing project with the command: 
   - `Web Preview: Open Project`

- Need a manual refresh? Use the command:
   - `Developer: Reload Webviews`

- For debugging, access built-in tools with:
   - `Developer: Open Webview Developer Tools`

## Known Issues

There are a few quirks with the built-in VS Code _Webview Developer Tools_. The following workarounds can help:

- **Elements:** Your sandbox’s DOM is housed in the "active-frame" `iframe`.
- **Console:** To run code, select "active-frame" from the dropdown in the top-left (it’s set to "top" by default).
- **Sources:** Your JavaScript code appears under the name `script.js` in the file tree for easy access.

When downloading the sandbox as a folder in Explorer, the Windows file dialog may incorrectly save it as a ".txt" file. You can rename the folder to fix this.

### Version 1.0.0

This marks the initial launch of the Grader Than Web Preview, designed to make web development in VS Code even more efficient!
 