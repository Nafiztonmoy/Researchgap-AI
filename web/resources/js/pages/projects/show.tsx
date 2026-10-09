import { Head, Link, router, useForm } from '@inertiajs/react';
import type { DragEvent, FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
    AlertTriangle,
    ArrowRight,
    ArrowUpRight,
    BookOpenText,
    CheckCircle2,
    CircleDashed,
    FileText,
    FlaskConical,
    Layers3,
    Lightbulb,
    RefreshCw,
    SearchCheck,
    Sparkles,
    Trash2,
    UploadCloud,
} from 'lucide-react';
import { toast } from 'sonner';
import { ProjectWorkspaceHeader } from '@/components/project-workspace-header';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { BreadcrumbItem } from '@/types';
import type { Paper, ResearchProject } from '@/types/research';

type Props = { project: ResearchProject };
type PaperUploadForm = { paper: File | null };

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Projects', href: '/projects' },
    { title: 'Overview & Papers', href: '#' },
];

export default function ProjectShow({ project }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);
    const [paperToDelete, setPaperToDelete] = useState<Paper | null>(null);

    const hasProcessingPaper = project.papers.some(
        (paper) =>
            paper.processing_status === 'uploaded' ||
            paper.processing_status === 'processing' ||
            paper.processing_status === 'parsed'
    );

    useEffect(() => {
        if (!hasProcessingPaper) return;

        const interval = setInterval(() => {
            router.reload({ only: ['project'] });
        }, 3000);

        return () => clearInterval(interval);
    }, [hasProcessingPaper]);

    const { data, setData, post, processing, progress, errors, reset, clearErrors } =
        useForm<PaperUploadForm>({ paper: null });

    function chooseFile(file: File | null) {
        clearErrors('paper');

        if (!file) {
            setData('paper', null);
            return;
        }

        if (file.type !== 'application/pdf') {
            toast.error('Only PDF documents are supported.');
            return;
        }

        if (file.size > 20 * 1024 * 1024) {
            toast.error('File size cannot exceed 20 MB.');
            return;
        }

        setData('paper', file);
    }

    function uploadPaper(event: FormEvent) {
        event.preventDefault();

        if (!data.paper) {
            toast.error('Please choose a PDF to upload.');
            return;
        }

        post(`/projects/${project.id}/papers`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset('paper');
                toast.success('Paper uploaded! Automatic PyMuPDF parsing and embedding started.');
            },
            onError: (formErrors) => {
                toast.error(formErrors.paper || 'Failed to upload paper.');
            },
        });
    }

    function handleDrop(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setDragActive(false);
        chooseFile(event.dataTransfer.files?.[0] ?? null);
    }

    function deletePaper() {
        if (!paperToDelete) return;

        router.delete(`/papers/${paperToDelete.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setPaperToDelete(null);
                toast.success('Paper removed.');
            },
        });
    }

    const analyzedPapers = project.papers.filter((p) => p.processing_status === 'completed');
    const gapsCount = (project.research_gaps ?? []).length;
    const verifiedGapsCount = (project.research_gaps ?? []).filter(
        (g) => g.novelty_verification?.status === 'completed'
    ).length;
    const ideasCount = (project.research_ideas ?? []).length;

    return (
        <>
            <Head title={`Overview - ${project.title}`} />

            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 animate-enter">
                <ProjectWorkspaceHeader project={project} activeTab="overview" />

                {/* Bright, Visually Engaging 5-Stage Research Progression Journey */}
                <section className="space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h2 className="text-sm font-bold tracking-tight text-foreground md:text-base">
                                🚀 Research Progression Journey
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Follow these five sequential stages to turn raw literature into publication-ready research proposals.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
                        {/* Stage 1: Literature Papers */}
                        <div className="research-surface group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-sky-500/40 bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-transparent p-4.5 shadow-sm transition hover:shadow-md">
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="flex size-8 items-center justify-center rounded-xl bg-sky-500 text-white shadow-xs">
                                        <BookOpenText className="size-4" />
                                    </span>
                                    <span className="rounded-full bg-sky-500/15 px-2.5 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300">
                                        STAGE 1 • ACTIVE
                                    </span>
                                </div>
                                <h3 className="mt-3.5 text-xs font-bold text-foreground">
                                    1. Ingest Literature
                                </h3>
                                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                                    {project.papers.length} PDF papers ({analyzedPapers.length} analyzed)
                                </p>
                            </div>
                            <span className="mt-3 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                                Current workspace focus
                            </span>
                        </div>

                        {/* Stage 2: Comparison Matrix */}
                        <Link
                            href={`/projects/${project.id}/comparison`}
                            className={`research-surface group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4.5 transition hover:-translate-y-0.5 hover:shadow-md ${
                                project.comparison
                                    ? 'border-teal-400/50 bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-transparent'
                                    : 'border-slate-200/80 bg-background/80 hover:border-teal-300 dark:border-slate-800'
                            }`}
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <span
                                        className={`flex size-8 items-center justify-center rounded-xl transition ${
                                            project.comparison
                                                ? 'bg-teal-600 text-white shadow-xs'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        <Layers3 className="size-4" />
                                    </span>
                                    {project.comparison ? (
                                        <span className="rounded-full bg-teal-500/15 px-2.5 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-300">
                                            READY ✓
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-muted-foreground">
                                            STAGE 2
                                        </span>
                                    )}
                                </div>
                                <h3 className="mt-3.5 text-xs font-bold text-foreground">
                                    2. Comparative Matrix
                                </h3>
                                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                                    {project.comparison
                                        ? 'Synthesis & tensions mapped'
                                        : analyzedPapers.length >= 2
                                        ? 'Ready to synthesize papers'
                                        : 'Upload 2+ papers to unlock'}
                                </p>
                            </div>
                            <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition">
                                Open Matrix <ArrowRight className="size-3" />
                            </span>
                        </Link>

                        {/* Stage 3: Research Gaps */}
                        <Link
                            href={`/projects/${project.id}/gaps`}
                            className={`research-surface group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4.5 transition hover:-translate-y-0.5 hover:shadow-md ${
                                gapsCount > 0
                                    ? 'border-purple-400/50 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent'
                                    : 'border-slate-200/80 bg-background/80 hover:border-purple-300 dark:border-slate-800'
                            }`}
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <span
                                        className={`flex size-8 items-center justify-center rounded-xl transition ${
                                            gapsCount > 0
                                                ? 'bg-purple-600 text-white shadow-xs'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        <SearchCheck className="size-4" />
                                    </span>
                                    {gapsCount > 0 ? (
                                        <span className="rounded-full bg-purple-500/15 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                                            {gapsCount} FOUND
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-muted-foreground">
                                            STAGE 3
                                        </span>
                                    )}
                                </div>
                                <h3 className="mt-3.5 text-xs font-bold text-foreground">
                                    3. Research Gaps
                                </h3>
                                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                                    {gapsCount > 0
                                        ? `${gapsCount} categorized gaps`
                                        : 'Evidence-backed gap discovery'}
                                </p>
                            </div>
                            <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition">
                                Explore Gaps <ArrowRight className="size-3" />
                            </span>
                        </Link>

                        {/* Stage 4: Novelty Lab */}
                        <Link
                            href={`/projects/${project.id}/novelty`}
                            className={`research-surface group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4.5 transition hover:-translate-y-0.5 hover:shadow-md ${
                                verifiedGapsCount > 0
                                    ? 'border-amber-400/50 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent'
                                    : 'border-slate-200/80 bg-background/80 hover:border-amber-300 dark:border-slate-800'
                            }`}
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <span
                                        className={`flex size-8 items-center justify-center rounded-xl transition ${
                                            verifiedGapsCount > 0
                                                ? 'bg-amber-500 text-white shadow-xs'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        <Lightbulb className="size-4" />
                                    </span>
                                    {verifiedGapsCount > 0 ? (
                                        <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                                            {verifiedGapsCount} CHECKED
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-muted-foreground">
                                            STAGE 4
                                        </span>
                                    )}
                                </div>
                                <h3 className="mt-3.5 text-xs font-bold text-foreground">
                                    4. Novelty Lab
                                </h3>
                                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                                    {verifiedGapsCount > 0
                                        ? `${verifiedGapsCount} verified via Semantic Scholar`
                                        : 'Semantic Scholar & arXiv verification'}
                                </p>
                            </div>
                            <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition">
                                Check Novelty <ArrowRight className="size-3" />
                            </span>
                        </Link>

                        {/* Stage 5: Research Ideas */}
                        <Link
                            href={`/projects/${project.id}/ideas`}
                            className={`research-surface group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4.5 transition hover:-translate-y-0.5 hover:shadow-md ${
                                ideasCount > 0
                                    ? 'border-emerald-400/50 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent'
                                    : 'border-slate-200/80 bg-background/80 hover:border-emerald-300 dark:border-slate-800'
                            }`}
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <span
                                        className={`flex size-8 items-center justify-center rounded-xl transition ${
                                            ideasCount > 0
                                                ? 'bg-emerald-600 text-white shadow-xs'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        <FlaskConical className="size-4" />
                                    </span>
                                    {ideasCount > 0 ? (
                                        <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                                            {ideasCount} BLUEPRINTS
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-muted-foreground">
                                            STAGE 5
                                        </span>
                                    )}
                                </div>
                                <h3 className="mt-3.5 text-xs font-bold text-foreground">
                                    5. Idea Blueprints
                                </h3>
                                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                                    {ideasCount > 0
                                        ? `${ideasCount} publication blueprints ready`
                                        : 'Thesis proposal & hypothesis architect'}
                                </p>
                            </div>
                            <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition">
                                View Blueprints <ArrowRight className="size-3" />
                            </span>
                        </Link>
                    </div>
                </section>

                {/* Research Context Summary Grid */}
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <InfoCard
                        label="Target Population / Scope"
                        value={project.target_population}
                        fallback="Not specified"
                        badge="Scope"
                    />
                    <InfoCard
                        label="Preferred Methodology"
                        value={project.preferred_methodology}
                        fallback="Open methodology"
                        badge="Method"
                    />
                    <InfoCard
                        label="Project Description"
                        value={project.description}
                        fallback="No description provided yet."
                        className="md:col-span-2"
                        badge="Context"
                    />
                    {project.keywords && project.keywords.length > 0 && (
                        <div className="research-surface rounded-2xl border border-slate-200/80 p-5 md:col-span-4 dark:border-slate-800">
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Research Domain Keywords ({project.keywords.length})
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {project.keywords.map((kw) => (
                                    <span
                                        key={kw}
                                        className="rounded-full border border-teal-200/80 bg-teal-50/70 px-3 py-1 text-xs font-semibold text-teal-700 dark:border-teal-900/60 dark:bg-teal-950/50 dark:text-teal-300"
                                    >
                                        #{kw}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                {/* Research Papers Management Card */}
                <section className="research-surface rounded-3xl border border-slate-200/90 shadow-xs dark:border-slate-800 overflow-hidden">
                    <div className="flex flex-col gap-3 border-b border-slate-200/80 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/80 p-5 md:flex-row md:items-center md:justify-between md:p-6 dark:border-slate-800 dark:from-slate-900/50 dark:via-slate-900 dark:to-slate-900/50">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="flex size-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
                                    <BookOpenText className="size-4" />
                                </span>
                                <h2 className="text-base font-bold tracking-tight text-foreground md:text-lg">
                                    Research Papers in this Workspace
                                </h2>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                                Protected PDFs are securely stored and analyzed with PyMuPDF, section extraction, and 384-dimensional pgvector embeddings.
                            </p>
                        </div>
                        <div className="rounded-full border border-sky-200/80 bg-sky-50 px-3.5 py-1 text-xs font-bold text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/50 dark:text-sky-300">
                            {project.papers.length} {project.papers.length === 1 ? 'Paper Uploaded' : 'Papers Uploaded'}
                        </div>
                    </div>

                    <div className="p-5 md:p-6 space-y-6">
                        {/* Drag and Drop Upload Zone */}
                        <form onSubmit={uploadPaper}>
                            <div
                                onDragEnter={(e) => {
                                    e.preventDefault();
                                    setDragActive(true);
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                onDragLeave={() => setDragActive(false)}
                                onDrop={handleDrop}
                                className={`relative rounded-2xl border-2 border-dashed p-6 transition-all duration-200 ${
                                    dragActive
                                        ? 'border-teal-500 bg-teal-50/30 shadow-inner'
                                        : 'border-teal-200/80 bg-gradient-to-br from-teal-50/20 via-white to-sky-50/20 hover:border-teal-400 hover:bg-teal-50/30 dark:border-slate-800 dark:from-slate-900/40 dark:to-slate-900/40'
                                }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    className="hidden"
                                    onChange={(e) => chooseFile(e.currentTarget.files?.[0] ?? null)}
                                />

                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-teal-200 bg-teal-50 text-teal-600 shadow-xs dark:border-teal-900 dark:bg-teal-950/60 dark:text-teal-400">
                                            <UploadCloud className="size-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">
                                                Add Research PDF to Workspace
                                            </p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                Drag &amp; drop a scholarly PDF here, or select a file. Maximum 20 MB.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="inline-flex shrink-0 items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition"
                                    >
                                        Choose PDF File
                                    </button>
                                </div>

                                {data.paper && (
                                    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-teal-200 bg-teal-50/50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-teal-900 dark:bg-teal-950/40">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <FileText className="size-5 shrink-0 text-teal-600 dark:text-teal-400" />
                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-semibold text-foreground">
                                                    {data.paper.name}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {formatFileSize(data.paper.size)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setData('paper', null)}
                                                className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-500 disabled:opacity-50"
                                            >
                                                {processing && (
                                                    <CircleDashed className="size-3.5 animate-spin" />
                                                )}
                                                Start Extraction
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </form>

                        {/* Papers List */}
                        {project.papers.length === 0 ? (
                            <div className="rounded-2xl border border-dashed p-8 text-center">
                                <FileText className="mx-auto size-9 text-muted-foreground/60" />
                                <h3 className="mt-3 text-sm font-bold text-foreground">No Papers Uploaded Yet</h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Upload your first scholarly PDF above to begin literature extraction.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 dark:divide-slate-800 dark:border-slate-800">
                                {project.papers.map((paper) => (
                                    <div
                                        key={paper.id}
                                        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-teal-50/20 transition dark:hover:bg-slate-800/20"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <PaperStatusBadge status={paper.processing_status} />
                                                {paper.page_count && (
                                                    <span className="text-[11px] font-medium text-muted-foreground">
                                                        📄 {paper.page_count} pages
                                                    </span>
                                                )}
                                                <span className="text-[11px] font-medium text-muted-foreground">
                                                    💾 {formatFileSize(paper.file_size)}
                                                </span>
                                            </div>

                                            <h4 className="mt-2 text-sm font-bold text-foreground leading-snug">
                                                <Link
                                                    href={`/papers/${paper.id}`}
                                                    className="hover:text-teal-600 dark:hover:text-teal-400 hover:underline"
                                                >
                                                    {paper.title || paper.original_filename}
                                                </Link>
                                            </h4>

                                            {paper.processing_error && (
                                                <p className="mt-1 text-xs font-medium text-rose-600">
                                                    ⚠️ {paper.processing_error}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex shrink-0 items-center gap-2">
                                            <Link
                                                href={`/papers/${paper.id}`}
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-teal-300 hover:bg-teal-50/50 hover:text-teal-700 dark:border-slate-700 dark:hover:bg-slate-800"
                                            >
                                                Deep Analysis <ArrowUpRight className="size-3 text-teal-500" />
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={() => setPaperToDelete(paper)}
                                                className="rounded-xl border border-rose-200/60 p-2 text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-950/40"
                                                title="Remove paper"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Private Notes */}
                {project.notes && (
                    <section className="research-surface rounded-2xl border border-slate-200/80 p-5 dark:border-slate-800">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Private Research Notes
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-foreground/90 md:text-sm">
                            {project.notes}
                        </p>
                    </section>
                )}
            </div>

            {/* Modal: Delete Paper */}
            <Dialog
                open={Boolean(paperToDelete)}
                onOpenChange={(open) => !open && setPaperToDelete(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove this paper from workspace?</DialogTitle>
                        <DialogDescription>
                            "{paperToDelete?.original_filename}" will be removed from protected storage and detached from this project.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <button
                            type="button"
                            onClick={() => setPaperToDelete(null)}
                            className="rounded-xl border px-4 py-2 text-xs font-medium hover:bg-muted"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={deletePaper}
                            className="rounded-xl bg-destructive px-4 py-2 text-xs font-semibold text-white hover:bg-destructive/90 shadow-sm"
                        >
                            Remove Paper
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function InfoCard({
    label,
    value,
    fallback,
    badge,
    className = '',
}: {
    label: string;
    value: string | null;
    fallback: string;
    badge: string;
    className?: string;
}) {
    return (
        <div className={`research-surface rounded-2xl border border-slate-200/80 p-5 dark:border-slate-800 ${className}`}>
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {label}
                </p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {badge}
                </span>
            </div>
            <p className="mt-2.5 whitespace-pre-wrap text-xs leading-relaxed text-foreground/90 md:text-sm">
                {value || <span className="text-muted-foreground italic">{fallback}</span>}
            </p>
        </div>
    );
}

function PaperStatusBadge({ status }: { status: string }) {
    const norm = status.toLowerCase();
    const isCompleted = norm === 'completed';
    const isFailed = norm === 'failed';
    const isUploaded = norm === 'uploaded';

    if (isCompleted) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <CheckCircle2 className="size-3 text-emerald-500" /> COMPLETED
            </span>
        );
    }

    if (isFailed) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                <AlertTriangle className="size-3 text-rose-500" /> FAILED
            </span>
        );
    }

    if (isUploaded) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                Awaiting Analysis
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
            <CircleDashed className="size-3 animate-spin text-sky-500" /> PROCESSING
        </span>
    );
}

function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
}

ProjectShow.layout = { breadcrumbs };
