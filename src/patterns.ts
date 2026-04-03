/**
 * 模式配置模块
 * 定义默认词表、写作配置和运行时正则模式
 */

import * as vscode from 'vscode';
import {
    RichTextRuntimeConfiguration,
    SequencePatterns,
    SequenceWords,
    TransitionCategory,
    TransitionPattern,
    TransitionWords,
    WritingProfile
} from './types';

const transitionSymbols: Record<TransitionCategory, string> = {
    causation: '→',
    result: '⇒',
    contrast: '⇄',
    addition: '⊕',
    summary: '◆',
    example: '📌'
};

const transitionCategories: TransitionCategory[] = [
    'causation',
    'result',
    'contrast',
    'addition',
    'summary',
    'example'
];

const baseTransitionWords: TransitionWords = {
    causation: ['because', 'since', 'as', 'due to', '因为', '由于', '既然', '鉴于'],
    result: ['therefore', 'thus', 'so', 'hence', 'consequently', 'accordingly', '因此', '所以', '故而', '从而', '由此'],
    contrast: ['but', 'however', 'yet', 'although', 'though', 'while', 'nevertheless', 'nonetheless', 'on the other hand', 'in contrast', 'conversely', '但是', '然而', '却', '不过', '虽然', '尽管', '相反', '反之'],
    addition: ['moreover', 'furthermore', 'additionally', 'also', 'besides', 'in addition', "what's more", 'likewise', 'similarly', '此外', '并且', '而且', '同时', '另外', '再者', '同样', '类似地'],
    summary: ['in conclusion', 'in summary', 'overall', 'to sum up', 'in short', 'all in all', '总之', '综上', '总体来看', '总而言之', '简而言之'],
    example: ['for example', 'for instance', 'such as', 'namely', 'including', '例如', '比如', '诸如', '包括', '譬如']
};

const profileTransitionWordPresets: Record<WritingProfile, Partial<TransitionWords>> = {
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

const baseSequenceWords: SequenceWords = {
    starters: ['first', 'firstly', 'initially', 'to begin with', '首先', '第一'],
    continuers: ['second', 'secondly', 'third', 'thirdly', 'next', 'then', 'after that', '其次', '第二', '第三', '然后', '接着', '再次'],
    terminators: ['finally', 'lastly', 'in the end', '最后', '终于']
};

const profileParagraphBreakCategories: Record<WritingProfile, TransitionCategory[]> = {
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
export function refreshPatterns(): void {
    runtimeConfiguration = buildRuntimeConfiguration();
    runtimeTransitionPatterns = buildTransitionPatterns(runtimeConfiguration.transitionWords);
    runtimeSequencePatterns = buildSequencePatterns(runtimeConfiguration.sequenceWords);
    autoFormatParagraphBreakPattern = buildLineStartMatcher(runtimeConfiguration.autoFormatParagraphBreakWords);
}

/**
 * 获取运行时配置
 */
export function getRuntimeConfiguration(): RichTextRuntimeConfiguration {
    return runtimeConfiguration;
}

/**
 * 获取关联词模式
 */
export function getTransitionPatterns(): TransitionPattern[] {
    return runtimeTransitionPatterns;
}

/**
 * 获取序列词模式
 */
export function getSequencePatterns(): SequencePatterns {
    return runtimeSequencePatterns;
}

/**
 * 判断某行是否应该在自动格式化时前插空行
 */
export function shouldInsertParagraphBreak(line: string): boolean {
    if (!autoFormatParagraphBreakPattern) {
        return false;
    }

    return autoFormatParagraphBreakPattern.test(line);
}

function buildRuntimeConfiguration(): RichTextRuntimeConfiguration {
    const configuration = vscode.workspace.getConfiguration('poweredPlaintext');
    const writingProfile = getWritingProfile(configuration.get<string>('writingProfile'));
    const customTransitionWords = sanitizeTransitionWords(
        configuration.get<Partial<TransitionWords>>('customTransitionWords', {})
    );
    const customSequenceWords = sanitizeSequenceWords(
        configuration.get<Partial<SequenceWords>>('customSequenceWords', {})
    );

    const transitionWords = mergeTransitionWords(
        baseTransitionWords,
        profileTransitionWordPresets[writingProfile],
        customTransitionWords
    );
    const sequenceWords = mergeSequenceWords(
        baseSequenceWords,
        {},
        customSequenceWords
    );
    const autoFormatParagraphBreakWords = normalizeWords([
        ...profileParagraphBreakCategories[writingProfile].flatMap(category => transitionWords[category]),
        ...sanitizeWords(configuration.get<string[]>('autoFormatParagraphBreakWords', []))
    ]);

    return {
        writingProfile,
        enableSymbolHints: configuration.get<boolean>('enableSymbolHints', true),
        transitionWords,
        sequenceWords,
        autoFormatParagraphBreakWords
    };
}

function getWritingProfile(value: string | undefined): WritingProfile {
    switch (value) {
        case 'academic':
        case 'journal':
        case 'notes':
            return value;
        default:
            return 'general';
    }
}

function sanitizeTransitionWords(value: Partial<TransitionWords>): Partial<TransitionWords> {
    return {
        causation: sanitizeWords(value.causation),
        result: sanitizeWords(value.result),
        contrast: sanitizeWords(value.contrast),
        addition: sanitizeWords(value.addition),
        summary: sanitizeWords(value.summary),
        example: sanitizeWords(value.example)
    };
}

function sanitizeSequenceWords(value: Partial<SequenceWords>): Partial<SequenceWords> {
    return {
        starters: sanitizeWords(value.starters),
        continuers: sanitizeWords(value.continuers),
        terminators: sanitizeWords(value.terminators)
    };
}

function sanitizeWords(words: string[] | undefined): string[] {
    if (!Array.isArray(words)) {
        return [];
    }

    const uniqueWords = new Map<string, string>();

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

function mergeTransitionWords(
    base: TransitionWords,
    preset: Partial<TransitionWords>,
    custom: Partial<TransitionWords>
): TransitionWords {
    return {
        causation: normalizeWords([...base.causation, ...(preset.causation ?? []), ...(custom.causation ?? [])]),
        result: normalizeWords([...base.result, ...(preset.result ?? []), ...(custom.result ?? [])]),
        contrast: normalizeWords([...base.contrast, ...(preset.contrast ?? []), ...(custom.contrast ?? [])]),
        addition: normalizeWords([...base.addition, ...(preset.addition ?? []), ...(custom.addition ?? [])]),
        summary: normalizeWords([...base.summary, ...(preset.summary ?? []), ...(custom.summary ?? [])]),
        example: normalizeWords([...base.example, ...(preset.example ?? []), ...(custom.example ?? [])])
    };
}

function mergeSequenceWords(
    base: SequenceWords,
    preset: Partial<SequenceWords>,
    custom: Partial<SequenceWords>
): SequenceWords {
    return {
        starters: normalizeWords([...base.starters, ...(preset.starters ?? []), ...(custom.starters ?? [])]),
        continuers: normalizeWords([...base.continuers, ...(preset.continuers ?? []), ...(custom.continuers ?? [])]),
        terminators: normalizeWords([...base.terminators, ...(preset.terminators ?? []), ...(custom.terminators ?? [])])
    };
}

function normalizeWords(words: string[]): string[] {
    return sanitizeWords(words);
}

function buildTransitionPatterns(words: TransitionWords): TransitionPattern[] {
    return transitionCategories.map(category => ({
        category,
        regex: buildGlobalWordMatcher(words[category]),
        symbol: transitionSymbols[category]
    }));
}

function buildSequencePatterns(words: SequenceWords): SequencePatterns {
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

function buildGlobalWordMatcher(words: string[]): RegExp {
    const pattern = buildWordPattern(words);
    if (!pattern) {
        return /$^/g;
    }

    return new RegExp(pattern, 'gi');
}

function buildLineStartMatcher(words: string[]): RegExp | undefined {
    const pattern = buildWordPattern(words);
    if (!pattern) {
        return undefined;
    }

    return new RegExp(`^\\s*(?:${pattern})`, 'i');
}

function buildWordPattern(words: string[]): string {
    const boundarySafeWords: string[] = [];
    const literalWords: string[] = [];

    for (const word of normalizeWords(words)) {
        const escapedWord = escapeRegex(word).replace(/\s+/g, '\\s+');

        if (isBoundarySafeWord(word)) {
            boundarySafeWords.push(escapedWord);
        } else {
            literalWords.push(escapedWord);
        }
    }

    const patterns: string[] = [];

    if (boundarySafeWords.length > 0) {
        patterns.push(`\\b(?:${boundarySafeWords.join('|')})\\b`);
    }

    if (literalWords.length > 0) {
        patterns.push(`(?:${literalWords.join('|')})`);
    }

    return patterns.join('|');
}

function isBoundarySafeWord(word: string): boolean {
    return /^[A-Za-z0-9\s'-]+$/.test(word);
}

function escapeRegex(word: string): string {
    return word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
