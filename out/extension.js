"use strict";
/**
 * Rich Text 扩展主文件
 * 提供智能语法高亮和逻辑符号提示功能
 */
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
const decorators_1 = require("./decorators");
const patterns_1 = require("./patterns");
const sequenceCounter_1 = require("./sequenceCounter");
const utils_1 = require("./utils");
const supportedLanguageIds = new Set(['richtext', 'latex', 'markdown']);
/**
 * 扩展激活函数
 */
function activate(context) {
    console.log('Rich Text extension activated');
    (0, patterns_1.refreshPatterns)();
    // 初始化装饰器
    (0, decorators_1.initializeDecorations)();
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
            (0, sequenceCounter_1.resetSequenceCounter)(); // 切换文档时重置计数器
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
    vscode.workspace.onDidChangeConfiguration(event => {
        if (!event.affectsConfiguration('poweredPlaintext')) {
            return;
        }
        (0, patterns_1.refreshPatterns)();
        (0, sequenceCounter_1.resetSequenceCounter)();
        triggerUpdateDecorations(vscode.window.activeTextEditor);
    }, null, context.subscriptions);
    // 注册格式化命令
    const formatCommand = vscode.commands.registerCommand('richtext.autoFormat', async () => {
        await autoFormatDocument();
    });
    context.subscriptions.push(formatCommand);
}
/**
 * 更新文本装饰
 * @param editor 文本编辑器
 */
function updateDecorations(editor) {
    if (!editor || !supportedLanguageIds.has(editor.document.languageId)) {
        return;
    }
    const text = editor.document.getText();
    const lines = text.split('\n');
    const decorations = (0, decorators_1.createDecorationCollection)();
    const isMarkdownDocument = editor.document.languageId === 'markdown';
    let isInsideMarkdownFence = false;
    // 遍历所有行
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (isMarkdownDocument && (0, utils_1.isMarkdownFenceLine)(line)) {
            isInsideMarkdownFence = !isInsideMarkdownFence;
            continue;
        }
        if (isInsideMarkdownFence) {
            continue;
        }
        // 检测标题行
        if ((0, utils_1.isTitleLine)(line)) {
            (0, sequenceCounter_1.handleTitleLine)(i);
            continue;
        }
        // 处理序列词(①②③...)
        const sequenceDecorations = (0, sequenceCounter_1.processSequenceWords)(line, i);
        decorations.sequence.push(...sequenceDecorations);
        // 处理关联词(→⇒⇄...)
        (0, decorators_1.processTransitionWords)(line, i, decorations);
    }
    // 应用所有装饰
    (0, decorators_1.applyDecorations)(editor, decorations);
}
/**
 * 自动格式化文档
 */
async function autoFormatDocument() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !supportedLanguageIds.has(editor.document.languageId)) {
        vscode.window.showWarningMessage('请在 Powered Plain Text 支持的文档中使用此命令');
        return;
    }
    const text = editor.document.getText();
    const lines = text.split('\n');
    const formatted = [];
    const isMarkdownDocument = editor.document.languageId === 'markdown';
    let isInsideMarkdownFence = false;
    for (let i = 0; i < lines.length; i++) {
        formatted.push(lines[i]);
        if (isMarkdownDocument && (0, utils_1.isMarkdownFenceLine)(lines[i])) {
            isInsideMarkdownFence = !isInsideMarkdownFence;
            continue;
        }
        if (isInsideMarkdownFence) {
            continue;
        }
        // 检测观点切换：句末后如果下一行以配置中的逻辑词起始，则插入空行
        if (/[。.!?]\s*$/.test(lines[i]) && lines[i + 1] && (0, patterns_1.shouldInsertParagraphBreak)(lines[i + 1])) {
            formatted.push(''); // 插入空行
        }
    }
    await editor.edit(editBuilder => {
        const fullRange = new vscode.Range(editor.document.positionAt(0), editor.document.positionAt(text.length));
        editBuilder.replace(fullRange, formatted.join('\n'));
    });
    vscode.window.showInformationMessage('格式化完成');
}
/**
 * 扩展停用函数
 */
function deactivate() {
    (0, decorators_1.disposeDecorations)();
}
//# sourceMappingURL=extension.js.map