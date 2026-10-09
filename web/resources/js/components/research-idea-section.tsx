import { useState } from 'react';
import {
    BarChart3,
    Check,
    Copy,
    Cpu,
    Database,
    FileText,
    FlaskConical,
    Layers3,
    Lightbulb,
    RefreshCw,
    ShieldAlert,
    Sparkles,
    Target,
    Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { ResearchIdea, ResearchProject } from '@/types/research';

type Props = {
    project: ResearchProject;
    onGenerateIdea: (gapId?: string) => void;
    onDeleteIdea: (ideaId: string) => void;
    isGenerating: boolean;
};

type ActiveTab = 'hypothesis' | 'methodology' | 'benchmarks' | 'metrics' | 'risks';

export function ResearchIdeaSection({
    project,
    onGenerateIdea,
    onDeleteIdea,
    isGenerating,
}: Props) {
    const ideas = project.research_ideas ?? [];
    const gaps = project.research_gaps ?? [];

    const [activeTabs, setActiveTabs] = useState<Record<string, ActiveTab>>({});
    const [generateModalOpen, setGenerateModalOpen] = useState(false);
    const [selectedGapId, setSelectedGapId] = useState<string>(gaps[0]?.id || '');
    const [ideaToDelete, setIdeaToDelete] = useState<ResearchIdea | null>(null);
    const [copiedIdeaId, setCopiedIdeaId] = useState<string | null>(null);

    function getTab(ideaId: string): ActiveTab {
        return activeTabs[ideaId] || 'hypothesis';
    }

    function setTab(ideaId: string, tab: ActiveTab) {
        setActiveTabs((prev) => ({
            ...prev,
            [ideaId]: tab,
        }));
    }

    function handleCopyMarkdown(idea: ResearchIdea) {
        const md = `# ${idea.title}

## Executive Summary
${idea.executive_summary || ''}

## Primary Hypothesis
> **${idea.primary_hypothesis || ''}**

### Hypothesized Mechanisms
${(idea.hypothesized_mechanisms || []).map((m) => `- ${m}`).join('\n')}

## Proposed System Architecture & Technical Pipeline
${idea.system_architecture_overview || ''}

### Methodology Phases
${(idea.methodology_phases || [])
    .map(
        (p) =>
            `### ${p.phase}: ${p.title}\n${p.description}\n*Key Techniques:* ${p.key_techniques?.join(', ') || 'N/A'}`
    )
    .join('\n\n')}

## Target Datasets & Benchmarks
${(idea.target_datasets || [])
    .map(
        (d) =>
            `- **${d.name}** (${d.availability}): ${d.description} - *Purpose: ${d.purpose}*`
    )
    .join('\n')}

## Baseline Models to Outperform
${(idea.baseline_models || [])
    .map(
        (b) =>
            `- **${b.model_name}**: ${b.description} *(Known limitation: ${b.expected_weakness})*`
    )
    .join('\n')}

## Evaluation Metrics & Target Thresholds
${(idea.evaluation_metrics || [])
    .map(
        (m) =>
            `- **${m.metric_name}**: ${m.measurement_goal} (Target: \`${m.target_threshold}\`)`
    )
    .join('\n')}

## Expected Scientific Contributions
${(idea.expected_scientific_contributions || [])
    .map((c) => `- ${c}`)
    .join('\n')}

## Feasibility, Risk Analysis & Mitigations
${(idea.risks_and_mitigations || [])
    .map(
        (r) =>
            `- **[Severity: ${r.severity.toUpperCase()}]** ${r.risk}\n  - *Mitigation:* ${r.mitigation_strategy}`
    )
    .join('\n')}

## Target Peer-Reviewed Venues
${(idea.publication_target_venues || []).map((v) => `- ${v}`).join('\n')}
`;

        navigator.clipboard.writeText(md);
        setCopiedIdeaId(idea.id);
        toast.success('Research Proposal Blueprint copied to clipboard as Markdown!');
        setTimeout(() => setCopiedIdeaId(null), 2500);
    }

    return (
        <section
            id="ideas"
            className="research-surface scroll-mt-24 rounded-3xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5 animate-enter-delay-3"
        >
            <div className="flex flex-col gap-4 border-b border-border/80 p-5 md:flex-row md:items-center md:justify-between md:p-6">
                <div>
                    <div className="flex items-center gap-2.5">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25">
                            <FlaskConical className="size-5" />
                        </span>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-foreground">
                                Research Idea &amp; Hypothesis Blueprint Lab
                            </h2>
                            <p className="text-xs text-muted-foreground md:text-sm">
                                Transforms verified gaps into publication-ready research proposals, formal causal hypotheses, technical architectures, benchmarks, and risk matrices.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            if (gaps.length === 0) {
                                toast.error('Discover research gaps first before generating blueprints.');
                                return;
                            }
                            setGenerateModalOpen(true);
                        }}
                        disabled={isGenerating}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-500/25 transition-all hover:shadow-lg hover:shadow-emerald-500/35 hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                    >
                        {isGenerating ? (
                            <>
                                <RefreshCw className="size-3.5 animate-spin" />
                                Formulating Blueprint...
                            </>
                        ) : (
                            <>
                                <Sparkles className="size-3.5" />
                                Formulate New Blueprint
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-5 md:p-6">
                {isGenerating && (
                    <div className="mb-6 flex min-h-48 flex-col items-center justify-center rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 via-background to-background p-6 text-center shadow-lg shadow-emerald-500/5 animate-pulse">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                            <RefreshCw className="size-7 animate-spin" />
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-foreground">
                            Formulating Research Proposal Blueprint...
                        </h3>
                        <p className="mt-1.5 max-w-md text-xs leading-relaxed text-muted-foreground">
                            Synthesizing formal hypothesis, multi-phase technical methodology, baseline models to outperform, and evaluation metrics. Updating automatically.
                        </p>
                    </div>
                )}

                {ideas.length === 0 && !isGenerating ? (
                    <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
                        <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 shadow-sm">
                            <FlaskConical className="size-8" />
                        </div>
                        <h3 className="mt-4 text-base font-bold text-foreground">
                            No Research Proposal Blueprints Formulated Yet
                        </h3>
                        <p className="mt-1.5 max-w-lg text-xs leading-relaxed text-muted-foreground">
                            Select any discovered research gap to formulate a comprehensive, publication-ready research proposal complete with formal hypotheses, system architecture, target benchmarks, and feasibility analysis.
                        </p>
                        {gaps.length > 0 && (
                            <button
                                type="button"
                                onClick={() => onGenerateIdea()}
                                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-500/25 transition hover:shadow-lg hover:brightness-105"
                            >
                                <Sparkles className="size-4" />
                                Formulate Blueprint from Top Gap
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {ideas.map((idea) => {
                            const currentTab = getTab(idea.id);

                            return (
                                <article
                                    key={idea.id}
                                    className="research-surface rounded-3xl border border-border/80 shadow-sm transition-all duration-200 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5"
                                >
                                    {/* Blueprint Header */}
                                    <div className="border-b border-border/80 p-5 md:p-6">
                                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                            <div className="min-w-0 max-w-3xl">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                                        Publication Blueprint
                                                    </span>

                                                    {idea.research_gap && (
                                                        <span className="text-xs text-muted-foreground line-clamp-1">
                                                            Anchored to gap: <strong className="text-foreground">{idea.research_gap.title}</strong>
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="mt-2 text-xl font-bold tracking-tight text-foreground">
                                                    {idea.title}
                                                </h3>

                                                {idea.publication_target_venues && idea.publication_target_venues.length > 0 && (
                                                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                                                        <span className="text-[11px] font-medium text-muted-foreground">
                                                            Target Venues:
                                                        </span>
                                                        {idea.publication_target_venues.map((venue, i) => (
                                                            <span
                                                                key={i}
                                                                className="rounded-lg border border-teal-500/20 bg-teal-500/10 px-2 py-0.5 text-[11px] font-bold text-teal-700 dark:text-teal-300 shadow-2xs"
                                                            >
                                                                {venue}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex shrink-0 items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopyMarkdown(idea)}
                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-background/80 px-3.5 py-2 text-xs font-semibold text-foreground transition hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-600 shadow-2xs"
                                                    title="Copy full proposal as formatted Markdown"
                                                >
                                                    {copiedIdeaId === idea.id ? (
                                                        <>
                                                            <Check className="size-3.5 text-emerald-500" />
                                                            Copied!
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="size-3.5" />
                                                            Copy Markdown
                                                        </>
                                                    )}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setIdeaToDelete(idea)}
                                                    className="rounded-xl border border-destructive/20 p-2 text-destructive hover:bg-destructive/10 transition"
                                                    title="Delete blueprint"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Internal Tabs Segmented Control */}
                                        <div className="mt-5 flex flex-wrap gap-1.5 border-t border-border/70 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setTab(idea.id, 'hypothesis')}
                                                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                                                    currentTab === 'hypothesis'
                                                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-500/20'
                                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                }`}
                                            >
                                                <Target className="size-3.5" />
                                                Hypothesis &amp; Summary
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setTab(idea.id, 'methodology')}
                                                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                                                    currentTab === 'methodology'
                                                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-500/20'
                                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                }`}
                                            >
                                                <Cpu className="size-3.5" />
                                                Architecture &amp; Roadmap
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setTab(idea.id, 'benchmarks')}
                                                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                                                    currentTab === 'benchmarks'
                                                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-500/20'
                                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                }`}
                                            >
                                                <Database className="size-3.5" />
                                                Datasets &amp; Baselines
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setTab(idea.id, 'metrics')}
                                                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                                                    currentTab === 'metrics'
                                                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-500/20'
                                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                }`}
                                            >
                                                <BarChart3 className="size-3.5" />
                                                Evaluation Metrics
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setTab(idea.id, 'risks')}
                                                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                                                    currentTab === 'risks'
                                                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-500/20'
                                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                }`}
                                            >
                                                <ShieldAlert className="size-3.5" />
                                                Risk &amp; Feasibility
                                            </button>
                                        </div>
                                    </div>

                                    {/* Blueprint Tab Contents */}
                                    <div className="p-5 md:p-6">
                                        {currentTab === 'hypothesis' && (
                                            <div className="space-y-4">
                                                {/* Primary Hypothesis Box */}
                                                <div className="rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-5 shadow-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                                                            Primary Testable Hypothesis (H₁)
                                                        </span>
                                                    </div>
                                                    <blockquote className="mt-3 font-serif text-base italic leading-relaxed text-foreground md:text-lg">
                                                        "{idea.primary_hypothesis}"
                                                    </blockquote>
                                                </div>

                                                {/* Hypothesized Mechanisms */}
                                                {idea.hypothesized_mechanisms && idea.hypothesized_mechanisms.length > 0 && (
                                                    <div className="rounded-2xl border border-border/80 bg-background/70 p-4 shadow-2xs">
                                                        <p className="text-xs font-bold text-foreground">
                                                            Hypothesized Causal Mechanisms
                                                        </p>
                                                        <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                                                            {idea.hypothesized_mechanisms.map((mech, i) => (
                                                                <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                                                                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                                                                        {i + 1}
                                                                    </span>
                                                                    <span>
                                                                        <strong className="text-foreground">{mech.split(':')[0]}:</strong>{' '}
                                                                        {mech.includes(':') ? mech.split(':').slice(1).join(':') : mech}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Executive Summary */}
                                                <div className="rounded-2xl border border-border/80 bg-background/70 p-4 shadow-2xs">
                                                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                                        Executive Proposal Summary
                                                    </p>
                                                    <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-foreground/90">
                                                        {idea.executive_summary}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {currentTab === 'methodology' && (
                                            <div className="space-y-4">
                                                {/* Architecture Overview */}
                                                {idea.system_architecture_overview && (
                                                    <div className="rounded-2xl border border-border/80 bg-background/70 p-4 shadow-2xs">
                                                        <p className="text-xs font-bold text-foreground">
                                                            Proposed System Architecture &amp; Technical Pipeline
                                                        </p>
                                                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                                            {idea.system_architecture_overview}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Methodology Phases */}
                                                {idea.methodology_phases && idea.methodology_phases.length > 0 && (
                                                    <div className="space-y-3">
                                                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                                            Phased Implementation Roadmap
                                                        </p>
                                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                            {idea.methodology_phases.map((phase, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="flex flex-col justify-between rounded-2xl border border-border/80 bg-background/80 p-4 text-xs shadow-xs"
                                                                >
                                                                    <div>
                                                                        <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                                                                            {phase.phase}
                                                                        </span>
                                                                        <h4 className="mt-2.5 font-bold text-foreground">
                                                                            {phase.title}
                                                                        </h4>
                                                                        <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                                                                            {phase.description}
                                                                        </p>
                                                                    </div>

                                                                    {phase.key_techniques && phase.key_techniques.length > 0 && (
                                                                        <div className="mt-3.5 flex flex-wrap gap-1 border-t border-border/70 pt-2.5">
                                                                            {phase.key_techniques.map((tech, j) => (
                                                                                <span
                                                                                    key={j}
                                                                                    className="rounded-md border border-border/60 bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-foreground/80"
                                                                                >
                                                                                    {tech}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {currentTab === 'benchmarks' && (
                                            <div className="space-y-4">
                                                {/* Datasets */}
                                                <div>
                                                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                                        Target Datasets &amp; Experimental Benchmarks
                                                    </p>
                                                    <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
                                                        {(idea.target_datasets || []).map((ds, i) => (
                                                            <div
                                                                key={i}
                                                                className="rounded-2xl border border-border/80 bg-background/80 p-3.5 text-xs shadow-xs"
                                                            >
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <h4 className="font-bold text-foreground">
                                                                        {ds.name}
                                                                    </h4>
                                                                    <span className="rounded-md border border-sky-500/30 bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300">
                                                                        {ds.availability}
                                                                    </span>
                                                                </div>
                                                                <p className="mt-1.5 text-[11px] text-muted-foreground">
                                                                    {ds.description}
                                                                </p>
                                                                <p className="mt-2 rounded-lg bg-muted/30 p-2 text-[11px] text-foreground/90">
                                                                    <strong className="text-foreground">Purpose: </strong>
                                                                    {ds.purpose}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Baselines */}
                                                <div className="border-t border-border/70 pt-4">
                                                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                                        Baseline Models to Outperform
                                                    </p>
                                                    <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
                                                        {(idea.baseline_models || []).map((base, i) => (
                                                            <div
                                                                key={i}
                                                                className="rounded-2xl border border-border/80 bg-background/80 p-3.5 text-xs shadow-xs"
                                                            >
                                                                <h4 className="font-bold text-foreground">
                                                                    {base.model_name}
                                                                </h4>
                                                                <p className="mt-1.5 text-[11px] text-muted-foreground">
                                                                    {base.description}
                                                                </p>
                                                                <p className="mt-2 rounded-lg border border-destructive/20 bg-destructive/5 p-2 text-[11px] text-destructive">
                                                                    <strong>Known Limitation: </strong>
                                                                    {base.expected_weakness}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {currentTab === 'metrics' && (
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                                        Quantitative Evaluation Metrics &amp; Target Thresholds
                                                    </p>
                                                    <div className="mt-2.5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                        {(idea.evaluation_metrics || []).map((metric, i) => (
                                                            <div
                                                                key={i}
                                                                className="flex flex-col justify-between rounded-2xl border border-border/80 bg-background/80 p-3.5 text-xs shadow-xs"
                                                            >
                                                                <div>
                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <h4 className="font-bold text-foreground">
                                                                            {metric.metric_name}
                                                                        </h4>
                                                                        <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                                                                            {metric.target_threshold}
                                                                        </span>
                                                                    </div>
                                                                    <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
                                                                        {metric.measurement_goal}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Anticipated Contributions */}
                                                {idea.expected_scientific_contributions && (
                                                    <div className="border-t border-border/70 pt-4">
                                                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                                            Expected Scientific Contributions
                                                        </p>
                                                        <ul className="mt-2.5 space-y-1.5 text-xs text-foreground/90">
                                                            {idea.expected_scientific_contributions.map((contrib, i) => (
                                                                <li key={i} className="flex items-start gap-2">
                                                                    <Sparkles className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                                                                    <span>{contrib}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {currentTab === 'risks' && (
                                            <div className="space-y-4">
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                                    Feasibility, Risk Matrix &amp; Mitigation Strategies
                                                </p>
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    {(idea.risks_and_mitigations || []).map((risk, i) => (
                                                        <div
                                                            key={i}
                                                            className="rounded-2xl border border-border/80 bg-background/80 p-4 text-xs shadow-xs"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span
                                                                    className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                                                        risk.severity === 'high'
                                                                            ? 'border-rose-500/30 bg-rose-500/15 text-rose-700 dark:text-rose-300'
                                                                            : risk.severity === 'medium'
                                                                            ? 'border-amber-500/30 bg-amber-500/15 text-amber-800 dark:text-amber-300'
                                                                            : 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                                                    }`}
                                                                >
                                                                    Severity: {risk.severity}
                                                                </span>
                                                            </div>
                                                            <h4 className="mt-2.5 font-bold text-foreground">
                                                                {risk.risk}
                                                            </h4>
                                                            <div className="mt-2.5 rounded-xl border border-border/70 bg-muted/30 p-3 text-[11px] leading-relaxed text-foreground/90">
                                                                <strong className="text-emerald-600 dark:text-emerald-400">Mitigation Strategy: </strong>
                                                                {risk.mitigation_strategy}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal: Formulate Blueprint for Specific Gap */}
            <Dialog open={generateModalOpen} onOpenChange={setGenerateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Formulate Research Proposal Blueprint</DialogTitle>
                        <DialogDescription>
                            Choose which discovered research gap to anchor this proposal blueprint to:
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        {gaps.map((gap) => (
                            <label
                                key={gap.id}
                                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                                    selectedGapId === gap.id
                                        ? 'border-primary bg-primary/5'
                                        : 'hover:bg-muted/50'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="gapSelection"
                                    value={gap.id}
                                    checked={selectedGapId === gap.id}
                                    onChange={() => setSelectedGapId(gap.id)}
                                    className="mt-1"
                                />
                                <div className="text-xs">
                                    <p className="font-semibold text-foreground">{gap.title}</p>
                                    <p className="mt-0.5 text-muted-foreground line-clamp-2">
                                        {gap.description}
                                    </p>
                                    <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                                        <span className="capitalize">{gap.category}</span>
                                        <span>•</span>
                                        <span>Actionability: {gap.actionability_score}/10</span>
                                        {gap.novelty_verification && (
                                            <>
                                                <span>•</span>
                                                <span className="font-semibold text-emerald-600">
                                                    {gap.novelty_verification.novelty_score}% Novel
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>

                    <DialogFooter>
                        <button
                            type="button"
                            onClick={() => setGenerateModalOpen(false)}
                            className="rounded-lg border px-4 py-2 text-xs font-medium hover:bg-muted"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setGenerateModalOpen(false);
                                onGenerateIdea(selectedGapId);
                            }}
                            className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            Generate Proposal Blueprint
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Delete Blueprint Confirmation */}
            <Dialog open={Boolean(ideaToDelete)} onOpenChange={(open) => !open && setIdeaToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete this Research Idea Blueprint?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove "{ideaToDelete?.title}"? This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <button
                            type="button"
                            onClick={() => setIdeaToDelete(null)}
                            className="rounded-lg border px-4 py-2 text-xs font-medium hover:bg-muted"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                if (ideaToDelete) {
                                    onDeleteIdea(ideaToDelete.id);
                                }
                            }}
                            className="rounded-lg bg-destructive px-4 py-2 text-xs font-medium text-white hover:bg-destructive/90"
                        >
                            Delete Blueprint
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    );
}
