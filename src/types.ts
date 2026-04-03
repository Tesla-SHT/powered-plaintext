/**
 * 序列计数器状态
 */
export interface SequenceState {
    counter: number;
    lastLineNumber: number;
    lastIndentLevel: number;
}

export type WritingProfile = 'general' | 'academic' | 'journal' | 'notes';

export type TransitionCategory =
    | 'causation'
    | 'result'
    | 'contrast'
    | 'addition'
    | 'summary'
    | 'example';

export interface TransitionWords {
    causation: string[];
    result: string[];
    contrast: string[];
    addition: string[];
    summary: string[];
    example: string[];
}

export interface SequenceWords {
    starters: string[];
    continuers: string[];
    terminators: string[];
}

export interface RichTextRuntimeConfiguration {
    writingProfile: WritingProfile;
    enableSymbolHints: boolean;
    transitionWords: TransitionWords;
    sequenceWords: SequenceWords;
    autoFormatParagraphBreakWords: string[];
}

/**
 * 关联词模式配置
 */
export interface TransitionPattern {
    category: TransitionCategory;
    regex: RegExp;
    symbol: string;
}

/**
 * 序列词模式配置
 */
export interface SequencePattern {
    regex: RegExp;
    isStarter?: boolean;
    isTerminator?: boolean;
}

/**
 * 序列词模式集合
 */
export interface SequencePatterns {
    starters: SequencePattern;
    continuers: SequencePattern;
    terminators: SequencePattern;
}
