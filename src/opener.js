"use strict";
var awaiter = (this && this.awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
exports.awaiter = awaiter;

Object.defineProperty(exports, "__esModule", { value: true });

let currentOutputPanel;
exports.currentOutputPanel = currentOutputPanel;

const vscode = require("vscode");
const fs = require("fs");
const path = require('path');
const debounce_1 = require("./debounce");
const htmlView_1 = require("./htmlView");


function openDocumentInColumn(workspace, fileName, overwrite, column, focus = false) {
    return awaiter(this, void 0, void 0, function* () {
        // if workspace is empty or undefined defaults to the first workspace
        // folder
        if (!workspace) {
            workspace = vscode.workspace.workspaceFolders[0].uri.toString();
            if (!workspace) {
                throw new Error("No workspace folder found");
            }
        }

        let uri = vscode.Uri.parse(`${fileName}`);
        try {
            memFs.writeFile(uri, new Uint8Array(0), {
                create: true,
                overwrite
            });
        }
        catch (error) {
            console.error(error);
        }
        let doc = yield vscode.workspace.openTextDocument(uri);
        yield vscode.window.showTextDocument(doc, {
            preview: false,
            viewColumn: column,
            preserveFocus: !focus
        });
        return doc;
    });
}

function prepareWorkspace(overwrite) {
    return awaiter(this, void 0, void 0, function* () {
        yield vscode.commands.executeCommand("workbench.action.closeAllEditors");
        yield vscode.commands.executeCommand("vscode.setEditorLayout", {
            groups: [{ groups: [{}, {}], size: 0.5 }, { groups: [{}, {}], size: 0.5 }]
        });
        const docHTML = yield openDocumentInColumn("index.html", overwrite, vscode.ViewColumn.One);
        const docJS = yield openDocumentInColumn("script.js", overwrite, vscode.ViewColumn.Two, true);
        const docCSS = yield openDocumentInColumn("style.css", overwrite, vscode.ViewColumn.Three);
        currentOutputPanel = vscode.window.createWebviewPanel("sandboxOutput", "Output", { viewColumn: vscode.ViewColumn.Four, preserveFocus: true }, { enableScripts: true });
        const htmlView = new htmlView_1.HTMLView(currentOutputPanel.webview, context);
        context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(debounce_1.debounce(e => {
            if (e.document === docHTML) {
                htmlView.html = docHTML.getText();
            }
            if (e.document === docJS) {
                htmlView.js = docJS.getText();
            }
            if (e.document === docCSS) {
                htmlView.css = docCSS.getText();
            }
        }, 750)));
        htmlView.html = docHTML.getText();
        htmlView.js = docJS.getText();
        htmlView.css = docCSS.getText();
    });
}
exports.prepareWorkspace = prepareWorkspace;

function openProject(context, workspaceFolder, projectPath) {
    // locate index.html file in the project file
    const htmlFile = fs.readdirSync(projectPath).find(file => file.toLowerCase() === 'index.html');
    // if there is no index.html create one
    if (!htmlFile) {
        // create index.html file
        fs.writeFileSync(path, 'index.html', 'utf8');
        return;
    }

    // locate script.js file in the project file
    const jsFile = fs.readdirSync(projectPath).find(file => file.toLowerCase() === 'script.js');

    // locate style.css file in the project file
    const cssFile = fs.readdirSync(projectPath).find(file => file.toLowerCase() === 'style.css');

    setupViews(context, workspaceFolder, projectPath, true, jsFile !== undefined, cssFile !== undefined);

}

exports.openProject = openProject;


function setupViews(context, workspace, filePathRoot, overwrite, openJS = true, openCSS = true) {
    return awaiter(this, void 0, void 0, function* () {        
        // Close all editors before setting layout
        yield cleanup()

        // Determine layout based on the openJS and openCSS flags
        if (!openJS && !openCSS) {
            // Scenario 1: Only HTML and Preview (split into two panels)
            yield vscode.commands.executeCommand("vscode.setEditorLayout", {
                groups: [
                    { size: 0.5 },  // HTML
                    { size: 0.5 }   // Preview
                ]
            });
        } else if (openJS && openCSS) {
            // Scenario 3: Both JS and CSS (4 equal panels)
            yield vscode.commands.executeCommand("vscode.setEditorLayout", {
                groups: [
                    { groups: [{}, {}], size: 0.5 },  // HTML & JS/CSS
                    { groups: [{}, {}], size: 0.5 }   // Preview & another pane (optional)
                ]
            });
        } else {
            // Scenario 2: HTML and either CSS/JS stacked on the left, Preview larger on the right
            yield vscode.commands.executeCommand("vscode.setEditorLayout", {
                groups: [
                    { groups: [{}, {}], size: 0.5}, // HTML & JS/CSS stacked
                    { size: 0.5 }                     // Larger Preview
                ]
            });
        }

        // Open the documents in the specified layout
        const docHTML = yield openDocumentInColumn(workspace, path.join(filePathRoot, "index.html"), overwrite, vscode.ViewColumn.One, true);
        var docJS = null;
        var docCSS = null;

        // Move cursor to the end of the HTML document
        if(vscode.window.activeTextEditor){
            moveCursorToEnd(vscode.window.activeTextEditor);
        }

        // if openJS or openCSS is true open output in column three
        var outputPos = vscode.ViewColumn.Three

        if (!openJS && !openCSS) {
            // if openJS and openCSS are false open output in column two
            outputPos = vscode.ViewColumn.Two
        }else if(openJS && openCSS){
            // if openJS and openCSS are true open output in column four
            outputPos = vscode.ViewColumn.Four
        }

        currentOutputPanel = vscode.window.createWebviewPanel("sandboxOutput", "Output", {
            viewColumn: outputPos,
            preserveFocus: true
        }, { enableScripts: true });

        // Wait for the webview panel to be visible/active
        const waitForWebview = new Promise((resolve) => {
            const disposable = currentOutputPanel.onDidChangeViewState((event) => {
                if (event.webviewPanel.visible) {
                    resolve();
                    disposable.dispose();  // Clean up listener after webview is ready
                }
            });
        });

        // Perform actions after the webview is ready
        waitForWebview.then(() => {
            awaiter(this, void 0, void 0, function* () {    
                    // If openJS is true, open script.js in column two
                    if (openJS) {
                        docJS = yield openDocumentInColumn(workspace, path.join(filePathRoot, "script.js"), overwrite, !openCSS ? vscode.ViewColumn.Two : vscode.ViewColumn.Three, false)
                    }

                    // If openCSS is true, open style.css in column three
                    if (openCSS) {
                        docCSS = yield openDocumentInColumn(workspace, path.join(filePathRoot, "style.css"), overwrite, vscode.ViewColumn.Two, false);
                    }

                    const htmlView = new htmlView_1.HTMLView(currentOutputPanel.webview, context);


                    // Update preview when document content changes
                    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(debounce_1.debounce(e => {
                        if (e.document === docHTML) {
                            htmlView.html = docHTML.getText();
                        }
                        if (openJS && e.document === docJS) {
                            htmlView.js = docJS.getText();
                        }
                        if (openCSS && e.document === docCSS) {
                            htmlView.css = docCSS.getText();
                        }
                    }, 720)));

                    // Initially set the content for the preview
                    htmlView.html = docHTML.getText();
                    if (openJS) htmlView.js = docJS.getText();
                    if (openCSS) htmlView.css = docCSS.getText();
                });
            })
    });
}

function cleanup(){
    return awaiter(this, void 0, void 0, function* () {
        //close all windows
        vscode.commands.executeCommand("workbench.action.closeAllEditors");
        if(currentOutputPanel) currentOutputPanel.dispose();
        yield vscode.commands.executeCommand("vscode.setEditorLayout", {
            groups: [
                { size: 1 } // Single editor takes 100% of the space
            ]
        });
    })
    
}

exports.cleanup = cleanup;

function moveCursorToEnd(editor) {
    const position = editor.document.positionAt(editor.document.getText().length);
    editor.selection = new vscode.Selection(position, position);
    editor.revealRange(new vscode.Range(position, position));
}
