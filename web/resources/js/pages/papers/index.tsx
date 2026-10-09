import { Head, Link, router } from '@inertiajs/react';
import { ArrowUpRight, BookOpenText, FileText, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { BreadcrumbItem } from '@/types';

type Paper = {
    id: string;
    title: string | null;
    original_filename: string;
    file_size: number;
    processing_status: string;
    publication_year: number | null;
    created_at: string;
    research_project: {
        id: string;
        title: string;
    };
};

type Props = { papers: Paper[] };

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Paper Library', href: '/papers' }];

export default function PaperLibrary({ papers }: Props) {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();
        if (!term) return papers;

        return papers.filter((paper) =>
            [paper.title, paper.original_filename, paper.research_project.title]
                .filter(Boolean)
                .some((value) => value!.toLowerCase().includes(term)),
        );
    }, [papers, query]);

    return (
        <>
            <Head title="Paper Library" />
            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="animate-enter">
                    <div className="mb-2 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        <BookOpenText className="size-3.5" />
                        Cross-project literature
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight">Paper Library</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                        Every PDF you own across all research projects, with direct access back to its evidence workspace.
                    </p>
                </div>

                <div className="research-surface flex items-center gap-3 rounded-xl border px-3 py-2.5 animate-enter-delay-1">
                    <Search className="size-4 text-muted-foreground" />
                    <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search paper library"
                        placeholder="Search papers or projects..." className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{filtered.length}</span>
                </div>

                {papers.length === 0 ? (
                    <div className="research-surface research-grid flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center animate-enter-delay-2">
                        <BookOpenText className="size-9 text-muted-foreground" />
                        <p className="mt-4 font-semibold">Your paper library is empty</p>
                        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Open a research project and upload related PDFs to build the literature collection.</p>
                        <Link href="/projects" className="mt-5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">Go to projects</Link>
                    </div>
                ) : (
                    <div className="research-surface overflow-hidden rounded-2xl border animate-enter-delay-2">
                        <div className="hidden grid-cols-[minmax(0,1.7fr)_minmax(180px,0.8fr)_120px_150px_90px] gap-4 border-b bg-muted/30 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground lg:grid">
                            <span>Paper</span><span>Project</span><span>Size</span><span>Status</span><span className="text-right">Actions</span>
                        </div>
                        <div className="divide-y">
                            {filtered.map((paper) => (
                                <div key={paper.id} className="grid gap-4 p-5 transition hover:bg-muted/25 lg:grid-cols-[minmax(0,1.7fr)_minmax(180px,0.8fr)_120px_150px_90px] lg:items-center">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background"><FileText className="size-4" /></div>
                                        <div className="min-w-0">
                                            <Link href={`/papers/${paper.id}`} className="truncate text-sm font-semibold transition hover:text-primary hover:underline hover:underline-offset-4">{paper.title || paper.original_filename}</Link>
                                            <p className="mt-1 text-xs text-muted-foreground">Uploaded {new Date(paper.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <Link href={`/projects/${paper.research_project.id}`} className="truncate text-sm text-muted-foreground transition hover:text-foreground hover:underline hover:underline-offset-4">{paper.research_project.title}</Link>
                                    <span className="text-sm text-muted-foreground">{formatFileSize(paper.file_size)}</span>
                                    <span className="w-fit rounded-full border bg-muted/30 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">{paper.processing_status === 'uploaded' ? 'Awaiting analysis' : formatStatus(paper.processing_status)}</span>
                                    <div className="flex justify-end gap-2">
                                        <a href={`/papers/${paper.id}/file`} target="_blank" rel="noreferrer" className="inline-flex size-8 items-center justify-center rounded-lg border bg-background text-muted-foreground hover:bg-muted hover:text-foreground" title="Open PDF"><ArrowUpRight className="size-3.5" /></a>
                                        <button type="button" onClick={() => window.confirm(`Remove ${paper.original_filename}?`) && router.delete(`/papers/${paper.id}`, { preserveScroll: true })} className="inline-flex size-8 items-center justify-center rounded-lg border bg-background text-muted-foreground hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive" title="Remove paper"><Trash2 className="size-3.5" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
}

function formatStatus(status: string) {
    return status.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

PaperLibrary.layout = { breadcrumbs };
