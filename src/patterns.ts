/**
 * 模式配置模块
 * 定义所有正则表达式和匹配规则
 */

import { TransitionPattern, SequencePatterns } from './types';

/**
 * 序列词模式配置
 * 用于识别和计数序列关系词
 */
export const sequencePatterns: SequencePatterns = {
    // 起始词 - 重置计数器为1
    starters: {
        regex: /\b([Ff]irst(ly)?|[Ii]nitially|[Tt]o begin with)\b|首先|第一/g,
        isStarter: true
    },
    
    // 延续词 - 递增计数器
    continuers: {
        regex: /\b([Ss]econd(ly)?|[Tt]hird(ly)?|[Nn]ext|[Tt]hen|[Aa]fter that|[Mm]oreover)\b|其次|第二|第三|然后|接着|再次/g,
        isStarter: false
    },
    
    // 终止词 - 显示计数后重置
    terminators: {
        regex: /\b([Ff]inally|[Ll]astly|[Ii]n the end)\b|最后|终于/g,
        isTerminator: true
    }
};

/**
 * 关联词模式配置
 * 用于添加逻辑符号提示
 */
export const transitionPatterns: TransitionPattern[] = [
    {
        regex: /\b([Bb]ecause|[Ss]ince|[Aa]s|[Dd]ue to)\b|因为|由于|既然|鉴于/g,
        symbol: '→'
    },
    {
        regex: /\b([Tt]herefore|[Tt]hus|[Ss]o|[Hh]ence|[Cc]onsequently|[Aa]ccordingly)\b|因此|所以|故而|从而|由此/g,
        symbol: '⇒'
    },
    {
        regex: /\b([Bb]ut|[Hh]owever|[Yy]et|[Aa]lthough|[Tt]hough|[Ww]hile|[Nn]evertheless|[Nn]onetheless|[Oo]n the other hand|[Ii]n contrast|[Cc]onversely)\b|但是|然而|却|不过|虽然|尽管|相反|反之/g,
        symbol: '⇄'
    },
    {
        regex: /\b([Mm]oreover|[Ff]urthermore|[Aa]dditionally|[Aa]lso|[Bb]esides|[Ii]n addition|[Ww]hat's more|[Ll]ikewise|[Ss]imilarly)\b|此外|并且|而且|同时|另外|再者|同样|类似地/g,
        symbol: '⊕'
    },
    {
        regex: /\b([Ii]n conclusion|[Ii]n summary|[Oo]verall|[Tt]o sum up|[Ii]n short|[Aa]ll in all)\b|总之|综上|总体来看|总而言之|简而言之/g,
        symbol: '◆'
    },
    {
        regex: /\b([Ff]or example|[Ff]or instance|[Ss]uch as|[Nn]amely|[Ii]ncluding)\b|例如|比如|诸如|包括|譬如/g,
        symbol: '📌'
    }
];
