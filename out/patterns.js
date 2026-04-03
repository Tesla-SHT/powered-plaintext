"use strict";
/**
 * 模式配置模块
 * 定义默认词表、写作配置和运行时正则模式
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
exports.refreshPatterns = refreshPatterns;
exports.getRuntimeConfiguration = getRuntimeConfiguration;
exports.getTransitionPatterns = getTransitionPatterns;
exports.getSequencePatterns = getSequencePatterns;
exports.shouldInsertParagraphBreak = shouldInsertParagraphBreak;
const vscode = __importStar(require("vscode"));
const transitionSymbols = {
    causation: '→',
    result: '⇒',
    contrast: '⇄',
    addition: '⊕',
    summary: '◆',
    example: '📌'
};
const transitionCategories = [
    'causation',
    'result',
    'contrast',
    'addition',
    'summary',
    'example'
];
const baseTransitionWords = {
    causation: ['because', 'since', 'as', 'due to', '因为', '由于', '既然', '鉴于'],
    result: ['therefore', 'thus', 'so', 'hence', 'consequently', 'accordingly', '因此', '所以', '故而', '从而', '由此'],
    contrast: ['but', 'however', 'yet', 'although', 'though', 'while', 'nevertheless', 'nonetheless', 'on the other hand', 'in contrast', 'conversely', '但是', '然而', '却', '不过', '虽然', '尽管', '相反', '反之'],
    addition: ['moreover', 'furthermore', 'additionally', 'also', 'besides', 'in addition', "what's more", 'likewise', 'similarly', '此外', '并且', '而且', '同时', '另外', '再者', '同样', '类似地'],
    summary: ['in conclusion', 'in summary', 'overall', 'to sum up', 'in short', 'all in all', '总之', '综上', '总体来看', '总而言之', '简而言之'],
    example: ['for example', 'for instance', 'such as', 'namely', 'including', '例如', '比如', '诸如', '包括', '譬如']
};
const profileTransitionWordPresets = {
    general: {},
    academic: {
        causation: ['given that', 'owing to'],
        result: ['as a result', 'this suggests that'],
        contrast: ['by contrast', 'in comparison'],
        addition: ['further', 'more importantly'],
        summary: ['to conclude', 'taken together'],
        example: ['in particular', 'specifically']
    },
    journal: {
        causation: ['that is why'],
        result: ['so'],
        contrast: ['still', 'even so'],
        addition: ['meanwhile'],
        summary: ['for now', 'at the end of the day'],
        example: ['for one thing']
    },
    notes: {
        addition: ['plus'],
        summary: ['recap', 'tl;dr', 'in brief'],
        example: ['e.g.', 'eg', 'i.e.'],
        contrast: ['instead']
    }
};
const baseSequenceWords = {
    starters: ['first', 'firstly', 'initially', 'to begin with', '首先', '第一'],
    continuers: ['second', 'secondly', 'third', 'thirdly', 'next', 'then', 'after that', '其次', '第二', '第三', '然后', '接着', '再次'],
    terminators: ['finally', 'lastly', 'in the end', '最后', '终于']
};
const profileParagraphBreakCategories = {
    general: ['contrast', 'summary'],
    academic: ['contrast', 'result', 'summary'],
    journal: ['contrast', 'summary', 'example'],
    notes: ['addition', 'contrast', 'summary']
};
let runtimeConfiguration = buildRuntimeConfiguration();
let runtimeTransitionPatterns = buildTransitionPatterns(runtimeConfiguration.transitionWords);
let runtimeSequencePatterns = buildSequencePatterns(runtimeConfiguration.sequenceWords);
let autoFormatParagraphBreakPattern = buildLineStartMatcher(runtimeConfiguration.autoFormatParagraphBreakWords);
/**
 * 刷新运行时配置和正则缓存
 */
function refreshPatterns() {
    runtimeConfiguration = buildRuntimeConfiguration();
    runtimeTransitionPatterns = buildTransitionPatterns(runtimeConfiguration.transitionWords);
    runtimeSequencePatterns = buildSequencePatterns(runtimeConfiguration.sequenceWords);
    autoFormatParagraphBreakPattern = buildLineStartMatcher(runtimeConfiguration.autoFormatParagraphBreakWords);
}
/**
 * 获取运行时配置
 */
function getRuntimeConfiguration() {
    return runtimeConfiguration;
}
/**
 * 获取关联词模式
 */
function getTransitionPatterns() {
    return runtimeTransitionPatterns;
}
/**
 * 获取序列词模式
 */
function getSequencePatterns() {
    return runtimeSequencePatterns;
}
/**
 * 判断某行是否应该在自动格式化时前插空行
 */
function shouldInsertParagraphBreak(line) {
    if (!autoFormatParagraphBreakPattern) {
        return false;
    }
    return autoFormatParagraphBreakPattern.test(line);
}
function buildRuntimeConfiguration() {
    const configuration = vscode.workspace.getConfiguration('poweredPlaintext');
    const writingProfile = getWritingProfile(configuration.get('writingProfile'));
    const customTransitionWords = sanitizeTransitionWords(configuration.get('customTransitionWords', {}));
    const customSequenceWords = sanitizeSequenceWords(configuration.get('customSequenceWords', {}));
    const transitionWords = mergeTransitionWords(baseTransitionWords, profileTransitionWordPresets[writingProfile], customTransitionWords);
    const sequenceWords = mergeSequenceWords(baseSequenceWords, {}, customSequenceWords);
    const autoFormatParagraphBreakWords = normalizeWords([
        ...profileParagraphBreakCategories[writingProfile].flatMap(category => transitionWords[category]),
        ...sanitizeWords(configuration.get('autoFormatParagraphBreakWords', []))
    ]);
    return {
        writingProfile,
        enableSymbolHints: configuration.get('enableSymbolHints', true),
        transitionWords,
        sequenceWords,
        autoFormatParagraphBreakWords
    };
}
function getWritingProfile(value) {
    switch (value) {
        case 'academic':
        case 'journal':
        case 'notes':
            return value;
        default:
            return 'general';
    }
}
function sanitizeTransitionWords(value) {
    return {
        causation: sanitizeWords(value.causation),
        result: sanitizeWords(value.result),
        contrast: sanitizeWords(value.contrast),
        addition: sanitizeWords(value.addition),
        summary: sanitizeWords(value.summary),
        example: sanitizeWords(value.example)
    };
}
function sanitizeSequenceWords(value) {
    return {
        starters: sanitizeWords(value.starters),
        continuers: sanitizeWords(value.continuers),
        terminators: sanitizeWords(value.terminators)
    };
}
function sanitizeWords(words) {
    if (!Array.isArray(words)) {
        return [];
    }
    const uniqueWords = new Map();
    for (const word of words) {
        if (typeof word !== 'string') {
            continue;
        }
        const trimmed = word.trim();
        if (!trimmed) {
            continue;
        }
        const key = trimmed.toLocaleLowerCase();
        if (!uniqueWords.has(key)) {
            uniqueWords.set(key, trimmed);
        }
    }
    return Array.from(uniqueWords.values());
}
function mergeTransitionWords(base, preset, custom) {
    return {
        causation: normalizeWords([...base.causation, ...(preset.causation ?? []), ...(custom.causation ?? [])]),
        result: normalizeWords([...base.result, ...(preset.result ?? []), ...(custom.result ?? [])]),
        contrast: normalizeWords([...base.contrast, ...(preset.contrast ?? []), ...(custom.contrast ?? [])]),
        addition: normalizeWords([...base.addition, ...(preset.addition ?? []), ...(custom.addition ?? [])]),
        summary: normalizeWords([...base.summary, ...(preset.summary ?? []), ...(custom.summary ?? [])]),
        example: normalizeWords([...base.example, ...(preset.example ?? []), ...(custom.example ?? [])])
    };
}
function mergeSequenceWords(base, preset, custom) {
    return {
        starters: normalizeWords([...base.starters, ...(preset.starters ?? []), ...(custom.starters ?? [])]),
        continuers: normalizeWords([...base.continuers, ...(preset.continuers ?? []), ...(custom.continuers ?? [])]),
        terminators: normalizeWords([...base.terminators, ...(preset.terminators ?? []), ...(custom.terminators ?? [])])
    };
}
function normalizeWords(words) {
    return sanitizeWords(words);
}
function buildTransitionPatterns(words) {
    return transitionCategories.map(category => ({
        category,
        regex: buildGlobalWordMatcher(words[category]),
        symbol: transitionSymbols[category]
    }));
}
function buildSequencePatterns(words) {
    return {
        starters: {
            regex: buildGlobalWordMatcher(words.starters),
            isStarter: true
        },
        continuers: {
            regex: buildGlobalWordMatcher(words.continuers)
        },
        terminators: {
            regex: buildGlobalWordMatcher(words.terminators),
            isTerminator: true
        }
    };
}
function buildGlobalWordMatcher(words) {
    const pattern = buildWordPattern(words);
    if (!pattern) {
        return /$^/g;
    }
    return new RegExp(pattern, 'gi');
}
function buildLineStartMatcher(words) {
    const pattern = buildWordPattern(words);
    if (!pattern) {
        return undefined;
    }
    return new RegExp(`^\\s*(?:${pattern})`, 'i');
}
function buildWordPattern(words) {
    const boundarySafeWords = [];
    const literalWords = [];
    for (const word of normalizeWords(words)) {
        const escapedWord = escapeRegex(word).replace(/\s+/g, '\\s+');
        if (isBoundarySafeWord(word)) {
            boundarySafeWords.push(escapedWord);
        }
        else {
            literalWords.push(escapedWord);
        }
    }
    const patterns = [];
    if (boundarySafeWords.length > 0) {
        patterns.push(`\\b(?:${boundarySafeWords.join('|')})\\b`);
    }
    if (literalWords.length > 0) {
        patterns.push(`(?:${literalWords.join('|')})`);
    }
    return patterns.join('|');
}
function isBoundarySafeWord(word) {
    return /^[A-Za-z0-9\s'-]+$/.test(word);
}
function escapeRegex(word) {
    return word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
//# sourceMappingURL=patterns.js.map