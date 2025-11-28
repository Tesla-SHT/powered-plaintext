"use strict";
/**
 * 装饰器管理模块
 * 负责创建、应用和处理文本装饰
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
exports.initializeDecorations = initializeDecorations;
exports.createSymbolDecoration = createSymbolDecoration;
exports.processTransitionWords = processTransitionWords;
exports.applyDecorations = applyDecorations;
exports.disposeDecorations = disposeDecorations;
const vscode = __importStar(require("vscode"));
const patterns_1 = require("./patterns");
/**
 * 关联词装饰类型
 */
let transitionDecorationType;
/**
 * 初始化装饰器
 * 在扩展激活时调用
 */
function initializeDecorations() {
    // 关联词符号装饰 - 只添加符号,不改变颜色
    transitionDecorationType = vscode.window.createTextEditorDecorationType({
        before: {
            contentText: '',
            color: new vscode.ThemeColor('editorCodeLens.foreground'),
            margin: '0 4px 0 0',
            fontWeight: 'bold'
        }
    });
}
/**
 * 创建符号装饰选项
 * @param position 装饰位置
 * @param symbol 要显示的符号
 * @returns 装饰选项
 */
function createSymbolDecoration(position, symbol) {
    return {
        range: new vscode.Range(position, position),
        renderOptions: {
            before: {
                contentText: symbol + ' ',
                color: new vscode.ThemeColor('editorCodeLens.foreground'),
                margin: '0 4px 0 0',
                fontWeight: 'bold'
            }
        }
    };
}
/**
 * 处理普通关联词装饰(不参与序列计数)
 * @param line 文本行
 * @param lineNumber 行号
 * @returns 装饰选项数组
 */
function processTransitionWords(line, lineNumber) {
    const decorations = [];
    for (const pattern of patterns_1.transitionPatterns) {
        let match;
        pattern.regex.lastIndex = 0;
        while ((match = pattern.regex.exec(line)) !== null) {
            const matchPos = match.index;
            const startPos = new vscode.Position(lineNumber, matchPos);
            decorations.push(createSymbolDecoration(startPos, pattern.symbol));
        }
    }
    return decorations;
}
/**
 * 应用所有装饰到编辑器
 * @param editor 文本编辑器
 * @param decorations 装饰选项数组
 */
function applyDecorations(editor, decorations) {
    editor.setDecorations(transitionDecorationType, decorations);
}
/**
 * 清理装饰器资源
 * 在扩展停用时调用
 */
function disposeDecorations() {
    if (transitionDecorationType) {
        transitionDecorationType.dispose();
    }
}
//# sourceMappingURL=decorators.js.map