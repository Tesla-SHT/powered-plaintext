"use strict";
/**
 * 装饰器管理模块
 * 负责创建、应用和处理动态文本装饰
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
exports.createDecorationCollection = createDecorationCollection;
exports.createSequenceDecoration = createSequenceDecoration;
exports.processTransitionWords = processTransitionWords;
exports.applyDecorations = applyDecorations;
exports.disposeDecorations = disposeDecorations;
const vscode = __importStar(require("vscode"));
const patterns_1 = require("./patterns");
const utils_1 = require("./utils");
const transitionCategories = [
    'causation',
    'result',
    'contrast',
    'addition',
    'summary',
    'example'
];
const transitionDecorationColors = {
    causation: 'terminal.ansiBlue',
    result: 'terminal.ansiGreen',
    contrast: 'terminal.ansiRed',
    addition: 'terminal.ansiCyan',
    summary: 'terminal.ansiMagenta',
    example: 'terminal.ansiYellow'
};
/**
 * 关联词装饰类型
 */
let transitionDecorationTypes;
let sequenceDecorationType;
/**
 * 初始化装饰器
 * 在扩展激活时调用
 */
function initializeDecorations() {
    transitionDecorationTypes = {
        causation: createDecorationType(transitionDecorationColors.causation),
        result: createDecorationType(transitionDecorationColors.result),
        contrast: createDecorationType(transitionDecorationColors.contrast),
        addition: createDecorationType(transitionDecorationColors.addition),
        summary: createDecorationType(transitionDecorationColors.summary),
        example: createDecorationType(transitionDecorationColors.example)
    };
    sequenceDecorationType = createDecorationType('editorInfo.foreground');
}
/**
 * 创建空装饰集合
 * @returns 装饰集合
 */
function createDecorationCollection() {
    return {
        transitions: {
            causation: [],
            result: [],
            contrast: [],
            addition: [],
            summary: [],
            example: []
        },
        sequence: []
    };
}
/**
 * 创建序列词装饰选项
 * @param range 装饰范围
 * @param symbol 要显示的符号
 * @returns 装饰选项
 */
function createSequenceDecoration(range, symbol) {
    return createDecoration(range, symbol, 'editorInfo.foreground', (0, patterns_1.getRuntimeConfiguration)().enableSymbolHints);
}
/**
 * 处理普通关联词装饰(不参与序列计数)
 * @param line 文本行
 * @param lineNumber 行号
 * @param decorations 装饰集合
 */
function processTransitionWords(line, lineNumber, decorations) {
    const runtimeConfiguration = (0, patterns_1.getRuntimeConfiguration)();
    for (const pattern of (0, patterns_1.getTransitionPatterns)()) {
        let match;
        pattern.regex.lastIndex = 0;
        while ((match = pattern.regex.exec(line)) !== null) {
            const matchedWord = match[0];
            if (!(0, utils_1.isValidTransitionPosition)(line, match.index)) {
                continue;
            }
            const startPos = new vscode.Position(lineNumber, match.index);
            const endPos = new vscode.Position(lineNumber, match.index + matchedWord.length);
            decorations.transitions[pattern.category].push(createDecoration(new vscode.Range(startPos, endPos), pattern.symbol, transitionDecorationColors[pattern.category], runtimeConfiguration.enableSymbolHints));
        }
    }
}
/**
 * 应用所有装饰到编辑器
 * @param editor 文本编辑器
 * @param decorations 装饰集合
 */
function applyDecorations(editor, decorations) {
    for (const category of transitionCategories) {
        editor.setDecorations(transitionDecorationTypes[category], decorations.transitions[category]);
    }
    editor.setDecorations(sequenceDecorationType, decorations.sequence);
}
/**
 * 清理装饰器资源
 * 在扩展停用时调用
 */
function disposeDecorations() {
    if (transitionDecorationTypes) {
        for (const category of transitionCategories) {
            transitionDecorationTypes[category].dispose();
        }
    }
    if (sequenceDecorationType) {
        sequenceDecorationType.dispose();
    }
}
function createDecorationType(colorId) {
    return vscode.window.createTextEditorDecorationType({
        color: new vscode.ThemeColor(colorId)
    });
}
function createDecoration(range, symbol, colorId, showSymbol = true) {
    if (!showSymbol) {
        return { range };
    }
    return {
        range,
        renderOptions: {
            before: {
                contentText: symbol + ' ',
                color: new vscode.ThemeColor(colorId),
                margin: '0 4px 0 0',
                fontWeight: 'bold'
            }
        }
    };
}
//# sourceMappingURL=decorators.js.map