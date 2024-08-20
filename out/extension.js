"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const fileSystemProvider_1 = require("./fileSystemProvider");
const opener = require("./opener");
function activate(context) {
    return opener.awaiter(this, void 0, void 0, function* () {
        const memFs = new fileSystemProvider_1.MemFS();
        context.subscriptions.push(vscode.workspace.registerFileSystemProvider("sandbox", memFs, {
            isCaseSensitive: true
        }));

        function getSandboxWorkspaceFolder() {
            return vscode.workspace.getWorkspaceFolder(vscode.Uri.parse("sandbox:/"));
        }

        if (getSandboxWorkspaceFolder()) {
            yield prepareWorkspace(true);
        }
        // Register the open project command
        context.subscriptions.push(vscode.commands.registerCommand("sandbox.closeProject", () => opener.awaiter(this, void 0, void 0, function* () {
            opener.cleanup();
        })));

        // Register the open project command
        context.subscriptions.push(vscode.commands.registerCommand("sandbox.openProject", () => opener.awaiter(this, void 0, void 0, function* () {
            vscode.window.showInputBox({
                placeHolder: 'Enter the name of the project to open',
                prompt: 'Please provide the project name',
            }).then(projectName => {
                if (projectName) {
                    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
                    
                    // Check if a workspace folder is open
                    if (!workspaceFolder) {
                        vscode.window.showErrorMessage('No workspace folder is open.');
                        return;
                    }

                    const projectPath = path.join(workspaceFolder, projectName);
                    if (fs.existsSync(projectPath) && fs.lstatSync(projectPath).isDirectory()) {
                        opener.openProject(context, workspaceFolder, projectPath);
                        
                    } else {
                        // If the project folder does not exist show an error message
                        vscode.window.showErrorMessage(`Project folder "${projectName}" does not exist.`);
                    }
                } else {
                    // If the user did not provide a project name silently return
                    return;
                }
            });
        })));

        // Register the new project command
        context.subscriptions.push(vscode.commands.registerCommand("sandbox.newProject", () => opener.awaiter(this, void 0, void 0, function* () {
            // Step 1: Prompt user for project name
            vscode.window.showInputBox({
                placeHolder: 'Enter the name of the project to create',
                prompt: 'Please provide the project name',
            }).then(projectName => {
                if (projectName) {
                    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
                    
                    // Check if a workspace folder is open
                    if (!workspaceFolder) {
                        vscode.window.showErrorMessage('No workspace folder is open.');
                        return;
                    }

                    const projectPath = path.join(workspaceFolder, projectName);
                    if (fs.existsSync(projectPath) && fs.lstatSync(projectPath).isDirectory()) {
                        // If the project folder already exists, show an error message
                        vscode.window.showInformationMessage(`Project folder "${projectName}" already exists. Opening project instead...`);
                        opener.openProject(context, workspaceFolder, projectPath);
                        return;
                    }

                    // Step 2: Show dropdown for including CSS and JS
                    vscode.window.showQuickPick(
                        ['Include CSS', 'Include JS'],  // Options
                        {
                            canPickMany: true,  // Allow multiple selections (simulating checkboxes)
                            placeHolder: 'Select whether to include a CSS file and/or JS file.',
                        }
                    ).then(selection => {

                        // Step 3: Create project folder and files

                         // create project folder
                        fs.mkdirSync(projectPath);
                        
                        const includeCSS = selection?.includes('Include CSS') ?? false;
                        const includeJS = selection?.includes('Include JS') ?? false;

                        // create index.html file
                        fs.writeFileSync(path.join(projectPath, 'index.html'), '', 'utf8');

                        // write text to index.html file
                        fs.writeFileSync(path
                            .join(projectPath, 'index.html'),
                            `<!--
Welcome to your new project!

This is the index.html file where you can write the main structure of your website.

All the edits you make will be instantly reflected in the white Output panel.

Good luck, and have fun coding!
-->
`
                        );

                        // create script.js file if selected
                        if (includeJS) {
                            fs.writeFileSync(path
                                .join(projectPath, 'script.js'), '', 'utf8');
                            
                            fs.writeFileSync(path
                            .join(projectPath, 'script.js'),
                            "// This is the script.js file where you can write JavaScript code to add functionality to your website."
                        );
                        }

                        // create style.css file if selected
                        if (includeCSS) {
                            fs.writeFileSync(path
                                .join(projectPath, 'style.css'), '', 'utf8');

                            fs.writeFileSync(path
                            .join(projectPath, 'style.css'),
                            `/*
This is the style.css file where you can write CSS code to style your website.

You can change colors, fonts, layout, and more to make your site look great!
*/
`
                        );
                        }

                        // Step 4: Open the project after creation
                        opener.openProject(context, workspaceFolder, projectPath);
                    });

                } else {
                    // Display an error message if the user did not provide a project name
                    vscode.window.showErrorMessage('Please provide a project name.');
                }
            });
        })));
    });
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map