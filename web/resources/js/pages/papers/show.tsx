import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    AlertTriangle,
    ArrowLeft,
    ArrowUpRight,
    BookOpenText,
    CheckCircle2,
    Clock,
    FileText,
    HelpCircle,
    Layers,
    Lightbulb,
    Quote,
    RefreshCw,
    Sparkles,
    Target,
} from 'lucide-react';
import { toast } from 'sonner';
import type { BreadcrumbItem } from '@/types';

type SupportedClaim = {
    claim: string;
    evidence_ids: string[];
};

type AuthorStatedLimitation = {
    limitation: string;
    evidence_ids: string[];
    source_type: 'author_stated';
};

type InferredLimitation = {
    limitation: string;
    reasoning: string;
    evidence_ids: string[];
    confidence: 'low' | 'medium' | 'high';
    source_type: 'ai_inferred';
};

type FutureWorkItem = {
    proposal: string;
    evidence_ids: string[];
    origin: 'author_suggested' | 'ai_suggested';
};

type PaperAnalysis = {
    id: string;
    research_problem: SupportedClaim;
    objectives: SupportedClaim[];
    methodology: SupportedClaim[];
    datasets_or_data_sources: SupportedClaim[];
    key_findings: SupportedClaim[];
    contributions: SupportedClaim[];
    author_stated_limitations: AuthorStatedLimitation[];
    ai_inferred_limitations: InferredLimitation[];
    future_work: FutureWorkItem[];
    analysis_scope_note: string | null;
    analyzed_at: string;
};

type PaperChunk = {
    id: string;
    chunk_index: number;
    page_start: number;
    page_end: number;
    section_title: string | null;
    text: string;
};

type Paper = {
    id: string;
    title: string | null;
    original_filename: string;
    authors: string[] | null;
    abstract: string | null;
    publication_year: number | null;
    venue: string | null;
    doi: string | null;
    keywords: string[] | null;
    file_size: number;
    page_count: number | null;
    processing_status: string;
    processing_error: string | null;
    created_at: string;
    research_project: {
        id: string;
        title: string;
    };
    analysis: PaperAnalysis | null;
    chunks?: PaperChunk[];
};

type Props = {
    paper: Paper;
};

export default function PaperShow({ paper }: Props) {
    const [activeTab, setActiveTab] = useState<'analysis' | 'limitations' | 'chunks'>('limitations');
    const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
    const [retrying, setRetrying] = useState(false);

    const isProcessing = ['uploaded', 'parsing', 'parsed', 'embedding', 'embedded', 'analyzing'].includes(
        paper.processing_status.toLowerCase(),
    );
    const isCompleted = paper.processing_status.toLowerCase() === 'completed' && paper.analysis;
    const isFailed = paper.processing_status.toLowerCase() === 'failed';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Projects', href: '/projects' },
        { title: paper.research_project.title, href: `/projects/${paper.research_project.id}` },
        { title: paper.title || paper.original_filename, href: '#' },
    ];

    function handleRetry() {
        setRetrying(true);
        router.post(
            `/papers/${paper.id}/retry`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Analysis job re-dispatched.');
                    setRetrying(false);
                },
                onError: () => {
                    toast.error('Failed to trigger re-analysis.');
                    setRetrying(false);
                },
            },
        );
    }

    return (
        <>
            <Head title={paper.title || paper.original_filename} />

            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                {/* Header */}
                <header className="research-surface relative overflow-hidden rounded-2xl border p-5 md:p-7 animate-enter">
                    <div className="absolute -right-12 -top-20 size-56 rounded-full bg-primary/5 blur-3xl" />
                    <div className="relative flex flex-col gap-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <Link
                                href={`/projects/${paper.research_project.id}`}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
                            >
                                <ArrowLeft className="size-3.5" />
                                Back to {paper.research_project.title}
                            </Link>
                            <div className="flex items-center gap-2">
                                <StatusBadge status={paper.processing_status} />
                                {paper.publication_year && (
                                    <span className="rounded-full border bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                        {paper.publication_year}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                                {paper.title || paper.original_filename}
                            </h1>

                            {paper.authors && paper.authors.length > 0 && (
                                <p className="mt-2 text-sm text-muted-foreground">
                                    By {paper.authors.join(', ')}
                                </p>
                            )}

                            {paper.venue && (
                                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground/80">
                                    Published in: {paper.venue}
                                </p>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            <a
                                href={`/papers/${paper.id}/file`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg border bg-background/80 px-3.5 py-2 text-sm font-medium transition hover:bg-muted"
                            >
                                <ArrowUpRight className="size-4" />
                                Open PDF
                            </a>

                            <button
                                type="button"
                                onClick={handleRetry}
                                disabled={retrying}
                                className="inline-flex items-center gap-2 rounded-lg border bg-background/80 px-3.5 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                            >
                                <RefreshCw className={`size-4 ${retrying ? 'animate-spin' : ''}`} />
                                {retrying ? 'Queuing...' : 'Re-run Analysis'}
                            </button>

                            {paper.doi && (
                                <a
                                    href={`https://doi.org/${paper.doi}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground hover:underline"
                                >
                                    DOI: {paper.doi}
                                </a>
                            )}
                        </div>
                    </div>
                </header>

                {/* Pipeline Status Banner if processing or failed */}
                {isProcessing && !isCompleted && (
                    <div className="flex items-center gap-4 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-800 dark:text-blue-200">
                        <Clock className="size-5 shrink-0 animate-spin text-blue-600 dark:text-blue-400" />
                        <div>
                            <p className="font-semibold">Analysis in progress ({paper.processing_status})</p>
                            <p className="text-xs text-blue-700/80 dark:text-blue-300/80">
                                The AI pipeline is parsing sections, embedding text vectors, and extracting verifiable claims and limitations.
                            </p>
                        </div>
                    </div>
                )}

                {isFailed && (
                    <div className="flex items-start justify-between gap-4 rounded-xl border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="size-5 shrink-0" />
                            <div>
                                <p className="font-semibold">Analysis pipeline encountered an error</p>
                                <p className="mt-1 text-xs">{paper.processing_error || 'Unknown error occurred during processing.'}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleRetry}
                            className="shrink-0 rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground hover:opacity-90"
                        >
                            Retry Now
                        </button>
                    </div>
                )}

                {/* Navigation Tabs */}
                <div className="flex gap-2 border-b pb-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('limitations')}
                        className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                            activeTab === 'limitations'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        <AlertTriangle className="size-4" />
                        Research Limitations & Gaps
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('analysis')}
                        className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                            activeTab === 'analysis'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        <Sparkles className="size-4" />
                        Structured Analysis
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('chunks')}
                        className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                            activeTab === 'chunks'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        <Layers className="size-4" />
                        Evidence Chunks ({paper.chunks?.length ?? 0})
                    </button>
                </div>

                {/* Tab: Limitations & Gaps */}
                {activeTab === 'limitations' && (
                    <div className="flex flex-col gap-6 animate-enter">
                        {/* Scope Note Banner */}
                        {paper.analysis?.analysis_scope_note && (
                            <div className="rounded-xl border bg-muted/40 p-3.5 text-xs text-muted-foreground">
                                <span className="font-semibold text-foreground">Grounded Scope: </span>
                                {paper.analysis.analysis_scope_note}
                            </div>
                        )}

                        {/* Author-Stated Limitations */}
                        <section className="research-surface rounded-2xl border p-5 md:p-6">
                            <div className="flex items-center gap-2.5">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                    <Quote className="size-4" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold">Author-Stated Limitations</h2>
                                    <p className="text-xs text-muted-foreground">
                                        Explicitly recognized and disclosed by the paper’s authors.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 space-y-3">
                                {paper.analysis?.author_stated_limitations &&
                                paper.analysis.author_stated_limitations.length > 0 ? (
                                    paper.analysis.author_stated_limitations.map((lim, index) => (
                                        <div
                                            key={index}
                                            className="rounded-xl border bg-muted/20 p-4 transition hover:bg-muted/30"
                                        >
                                            <p className="text-sm font-medium text-foreground">{lim.limitation}</p>
                                            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                                                <span className="text-xs text-muted-foreground">Citations:</span>
                                                {lim.evidence_ids.map((id) => (
                                                    <span
                                                        key={id}
                                                        onClick={() => {
                                                            setSelectedEvidenceId(id);
                                                            setActiveTab('chunks');
                                                        }}
                                                        className="cursor-pointer rounded border bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-mono font-semibold text-amber-700 dark:text-amber-300 hover:underline"
                                                        title="Click to view corresponding chunk"
                                                    >
                                                        [{id}]
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">
                                        No explicit limitation statements detected or analysis pending.
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* AI-Inferred Limitations */}
                        <section className="research-surface rounded-2xl border p-5 md:p-6">
                            <div className="flex items-center gap-2.5">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    <Sparkles className="size-4" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold">AI-Inferred Limitations & Threats</h2>
                                    <p className="text-xs text-muted-foreground">
                                        Derived from analysis of methodology, sample size, domain assumptions, and evaluation.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 space-y-3">
                                {paper.analysis?.ai_inferred_limitations &&
                                paper.analysis.ai_inferred_limitations.length > 0 ? (
                                    paper.analysis.ai_inferred_limitations.map((lim, index) => (
                                        <div
                                            key={index}
                                            className="rounded-xl border bg-muted/20 p-4 transition hover:bg-muted/30"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <p className="text-sm font-medium text-foreground">{lim.limitation}</p>
                                                <span
                                                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                                        lim.confidence === 'high'
                                                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                                            : lim.confidence === 'medium'
                                                              ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                                              : 'border-muted bg-muted/40 text-muted-foreground'
                                                    }`}
                                                >
                                                    {lim.confidence} confidence
                                                </span>
                                            </div>
                                            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                                <span className="font-medium text-foreground/80">Reasoning: </span>
                                                {lim.reasoning}
                                            </p>
                                            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                                                <span className="text-xs text-muted-foreground">Source Evidence:</span>
                                                {lim.evidence_ids.map((id) => (
                                                    <span
                                                        key={id}
                                                        onClick={() => {
                                                            setSelectedEvidenceId(id);
                                                            setActiveTab('chunks');
                                                        }}
                                                        className="cursor-pointer rounded border bg-blue-500/10 px-1.5 py-0.5 text-[11px] font-mono font-semibold text-blue-700 dark:text-blue-300 hover:underline"
                                                    >
                                                        [{id}]
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">
                                        No inferred limitations available yet.
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* Future Work Proposals */}
                        <section className="research-surface rounded-2xl border p-5 md:p-6">
                            <div className="flex items-center gap-2.5">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <Lightbulb className="size-4" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold">Future Work & Open Directions</h2>
                                    <p className="text-xs text-muted-foreground">
                                        Identified opportunities for subsequent research or unresolved investigation.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 space-y-3">
                                {paper.analysis?.future_work && paper.analysis.future_work.length > 0 ? (
                                    paper.analysis.future_work.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start justify-between gap-4 rounded-xl border bg-muted/20 p-4"
                                        >
                                            <div>
                                                <p className="text-sm text-foreground">{item.proposal}</p>
                                                <div className="mt-2 flex items-center gap-1.5">
                                                    {item.evidence_ids.map((id) => (
                                                        <span
                                                            key={id}
                                                            className="rounded border bg-muted/50 px-1.5 py-0.5 text-[10px] font-mono font-medium"
                                                        >
                                                            [{id}]
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="shrink-0 rounded-full border bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                                {item.origin.replace('_', ' ')}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">
                                        No future work items extracted yet.
                                    </p>
                                )}
                            </div>
                        </section>
                    </div>
                )}

                {/* Tab: Structured Analysis */}
                {activeTab === 'analysis' && (
                    <div className="grid gap-6 md:grid-cols-2 animate-enter">
                        {/* Research Problem */}
                        <div className="research-surface rounded-2xl border p-5 md:col-span-2">
                            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                <Target className="size-4 text-primary" /> Research Problem
                            </h3>
                            <p className="mt-3 text-base font-medium leading-relaxed text-foreground">
                                {paper.analysis?.research_problem.claim || 'Not extracted yet.'}
                            </p>
                            {paper.analysis?.research_problem.evidence_ids && (
                                <div className="mt-2 flex gap-1">
                                    {paper.analysis.research_problem.evidence_ids.map((id) => (
                                        <span key={id} className="rounded border bg-primary/10 px-1.5 py-0.5 text-[10px] font-mono text-primary font-semibold">
                                            [{id}]
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Objectives */}
                        <ClaimCard
                            title="Objectives"
                            icon={CheckCircle2}
                            claims={paper.analysis?.objectives}
                        />

                        {/* Methodology */}
                        <ClaimCard
                            title="Methodology"
                            icon={Layers}
                            claims={paper.analysis?.methodology}
                        />

                        {/* Datasets / Data Sources */}
                        <ClaimCard
                            title="Datasets & Data Sources"
                            icon={FileText}
                            claims={paper.analysis?.datasets_or_data_sources}
                        />

                        {/* Key Findings */}
                        <ClaimCard
                            title="Key Findings"
                            icon={Sparkles}
                            claims={paper.analysis?.key_findings}
                        />

                        {/* Contributions */}
                        <ClaimCard
                            title="Contributions"
                            icon={BookOpenText}
                            claims={paper.analysis?.contributions}
                            className="md:col-span-2"
                        />
                    </div>
                )}

                {/* Tab: Chunks & Evidence */}
                {activeTab === 'chunks' && (
                    <div className="space-y-4 animate-enter">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Academic chunks extracted with PyMuPDF and indexed with pgvector embeddings.
                            </p>
                            {selectedEvidenceId && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedEvidenceId(null)}
                                    className="text-xs text-primary hover:underline"
                                >
                                    Clear filter
                                </button>
                            )}
                        </div>

                        {paper.chunks && paper.chunks.length > 0 ? (
                            paper.chunks.map((chunk) => {
                                const isSelected = selectedEvidenceId && chunk.id.includes(selectedEvidenceId);
                                return (
                                    <article
                                        key={chunk.id}
                                        className={`research-surface rounded-xl border p-4 transition ${
                                            isSelected ? 'ring-2 ring-primary border-primary bg-primary/5' : ''
                                        }`}
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 text-xs text-muted-foreground border-b">
                                            <span className="font-mono font-medium">
                                                Chunk #{chunk.chunk_index} • Pages {chunk.page_start}–{chunk.page_end}
                                            </span>
                                            {chunk.section_title && (
                                                <span className="rounded-full border bg-muted/40 px-2.5 py-0.5 font-medium">
                                                    {chunk.section_title}
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-3 text-xs font-mono leading-relaxed text-foreground/90 whitespace-pre-wrap">
                                            {chunk.text}
                                        </p>
                                    </article>
                                );
                            })
                        ) : (
                            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                                No chunks found. Run parsing on this paper.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

function ClaimCard({
    title,
    icon: Icon,
    claims,
    className = '',
}: {
    title: string;
    icon: typeof CheckCircle2;
    claims?: SupportedClaim[];
    className?: string;
}) {
    return (
        <div className={`research-surface rounded-2xl border p-5 ${className}`}>
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Icon className="size-4 text-primary" /> {title}
            </h3>
            <div className="mt-3 space-y-2.5">
                {claims && claims.length > 0 ? (
                    claims.map((claim, index) => (
                        <div key={index} className="rounded-lg border bg-muted/20 p-3">
                            <p className="text-sm text-foreground">{claim.claim}</p>
                            {claim.evidence_ids.length > 0 && (
                                <div className="mt-2 flex gap-1">
                                    {claim.evidence_ids.map((id) => (
                                        <span
                                            key={id}
                                            className="rounded border bg-primary/10 px-1.5 py-0.2 text-[10px] font-mono text-primary font-semibold"
                                        >
                                            [{id}]
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-muted-foreground italic">No data extracted yet.</p>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const normalized = status.toLowerCase();
    const classes =
        normalized === 'failed'
            ? 'border-destructive/30 bg-destructive/10 text-destructive'
            : normalized === 'completed'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
              : normalized === 'uploaded'
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                : 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300';

    return (
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${classes}`}>
            {status.replaceAll('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
        </span>
    );
}
