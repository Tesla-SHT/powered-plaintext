"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
let decorationType;
function activate(context) {
    console.log('Rich Text extension activated');
    // 创建装饰类型（虚拟文本样式）
    decorationType = vscode.window.createTextEditorDecorationType({
        before: {
            contentText: '',
            color: new vscode.ThemeColor('editorCodeLens.foreground'),
            margin: '0 8px 0 0',
            fontWeight: 'bold'
        }
    });
    // 监听文档变化
    let timeout = undefined;
    const triggerUpdateDecorations = (editor) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => updateDecorations(editor), 100);
    };
    // 初始化当前编辑器
    if (vscode.window.activeTextEditor) {
        triggerUpdateDecorations(vscode.window.activeTextEditor);
    }
    // 监听编辑器切换
    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            triggerUpdateDecorations(editor);
        }
    }, null, context.subscriptions);
    // 监听文档内容变化
    vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.activeTextEditor;
        if (editor && event.document === editor.document) {
            triggerUpdateDecorations(editor);
        }
    }, null, context.subscriptions);
    // 注册格式化命令
    const formatCommand = vscode.commands.registerCommand('richtext.autoFormat', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'richtext') {
            vscode.window.showWarningMessage('请在 Rich Text 文件中使用此命令');
            return;
        }
        const text = editor.document.getText();
        const lines = text.split('\n');
        const formatted = [];
        for (let i = 0; i < lines.length; i++) {
            formatted.push(lines[i]);
            // 检测观点切换（简单规则：句号后跟转折词）
            if (lines[i].match(/[。.!?]$/) && lines[i + 1]?.match(/^(However|But|然而|但是)/)) {
                formatted.push(''); // 插入空行
            }
        }
        await editor.edit(editBuilder => {
            const fullRange = new vscode.Range(editor.document.positionAt(0), editor.document.positionAt(text.length));
            editBuilder.replace(fullRange, formatted.join('\n'));
        });
        vscode.window.showInformationMessage('格式化完成');
    });
    context.subscriptions.push(formatCommand);
}
function updateDecorations(editor) {
    if (!editor || editor.document.languageId !== 'richtext') {
        return;
    }
    const text = editor.document.getText();
    const lines = text.split('\n');
    const decorations = [];
    // 定义所有匹配规则
    const patterns = [
        { regex: /\b([Bb]ecause|[Ss]ince|[Aa]s)\b|因为|由于|既然/g, symbol: '→' },
        { regex: /\b([Tt]herefore|[Tt]hus|[Ss]o|[Hh]ence|[Cc]onsequently)\b|因此|所以|故而|从而/g, symbol: '⇒' },
        { regex: /\b([Bb]ut|[Hh]owever|[Yy]et|[Aa]lthough|[Tt]hough|[Ww]hile)\b|然而|但是|却|不过|虽然/g, symbol: '⇄' },
        { regex: /\b([Mm]oreover|[Ff]urthermore|[Aa]dditionally|[Aa]lso)\b|此外|并且|而且|同时|另外/g, symbol: '⊕' },
        { regex: /\b([Ii]n conclusion|[Ii]n summary|[Oo]verall|[Ff]inally)\b|总之|综上|总体来看|最后/g, symbol: '◆' }
    ];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // 遍历所有模式，找到所有匹配
        for (const pattern of patterns) {
            let match;
            // 重置正则表达式的 lastIndex
            pattern.regex.lastIndex = 0;
            while ((match = pattern.regex.exec(line)) !== null) {
                const matchPos = match.index;
                const startPos = new vscode.Position(i, matchPos);
                const decoration = {
                    range: new vscode.Range(startPos, startPos),
                    renderOptions: {
                        before: {
                            contentText: pattern.symbol + ' ',
                            color: new vscode.ThemeColor('editorCodeLens.foreground'),
                            margin: '0 4px 0 0',
                            fontWeight: 'bold'
                        }
                    }
                };
                decorations.push(decoration);
            }
        }
    }
    editor.setDecorations(decorationType, decorations);
}
function deactivate() {
    if (decorationType) {
        decorationType.dispose();
    }
}
//# sourceMappingURL=extension.js.map