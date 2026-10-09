import { Head, Link } from '@inertiajs/react';
import { ArrowRight, FileText, FolderKanban, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Projects',
        href: '/projects',
    },
];

type ResearchProject = {
    id: string;
    title: string;
    research_domain: string | null;
    research_question: string | null;
    status: string;
    papers_count: number;
    created_at: string;
    updated_at: string;
};

type Props = {
    projects: ResearchProject[];
};

export default function ProjectsIndex({ projects }: Props) {
    const [query, setQuery] = useState('');

    const filteredProjects = useMemo(() => {
        const term = query.trim().toLowerCase();

        if (!term) {
            return projects;
        }

        return projects.filter((project) =>
            [project.title, project.research_domain, project.research_question]
                .filter(Boolean)
                .some((value) => value!.toLowerCase().includes(term)),
        );
    }, [projects, query]);

    return (
        <>
            <Head title="Research Projects" />

            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between animate-enter">
                    <div>
                        <div className="mb-2 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                            <FolderKanban className="size-3.5" />
                            Literature workspaces
                        </div>
                        <h1 className="text-3xl font-semibold tracking-tight">Research Projects</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                            Keep each research question, paper collection, and gap analysis together in one focused workspace.
                        </p>
                    </div>

                    <Link
                        href="/projects/create"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                        <Plus className="size-4" />
                        New Project
                    </Link>
                </div>

                <div className="research-surface flex items-center gap-3 rounded-xl border px-3 py-2.5 animate-enter-delay-1">
                    <Search className="size-4 text-muted-foreground" />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        aria-label="Search research projects"
                        placeholder="Search by title, domain, or research question..."
                        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                    <span className="shrink-0 text-xs text-muted-foreground">
                        {filteredProjects.length} of {projects.length}
                    </span>
                </div>

                {projects.length === 0 ? (
                    <div className="research-surface research-grid flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center animate-enter-delay-2">
                        <div className="flex size-14 items-center justify-center rounded-2xl border bg-background shadow-sm">
                            <FolderKanban className="size-6 text-muted-foreground" />
                        </div>
                        <h2 className="mt-5 text-lg font-semibold">Start with a focused research question</h2>
                        <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                            Create a project, upload related papers, then build toward evidence-backed comparison, gap discovery, and novelty verification.
                        </p>
                        <Link
                            href="/projects/create"
                            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
                        >
                            <Plus className="size-4" />
                            Create your first project
                        </Link>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="research-surface rounded-2xl border p-10 text-center animate-enter-delay-2">
                        <Search className="mx-auto size-8 text-muted-foreground" />
                        <p className="mt-3 font-medium">No matching projects</p>
                        <p className="mt-1 text-sm text-muted-foreground">Try a broader search phrase.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 animate-enter-delay-2">
                        {filteredProjects.map((project, index) => (
                            <Link
                                key={project.id}
                                href={`/projects/${project.id}`}
                                className="research-surface project-card group relative overflow-hidden rounded-2xl border p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                                style={{ animationDelay: `${Math.min(index * 35, 210)}ms` }}
                            >
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent opacity-0 transition group-hover:opacity-100" />
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/50 transition group-hover:bg-primary group-hover:text-primary-foreground">
                                            <FileText className="size-4.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h2 className="truncate font-semibold tracking-tight">{project.title}</h2>
                                            <p className="mt-1 truncate text-xs text-muted-foreground">
                                                {project.research_domain || 'Domain not specified'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="rounded-full border bg-background/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                        {project.status}
                                    </span>
                                </div>

                                <p className="mt-5 line-clamp-3 min-h-[3.75rem] text-sm leading-5 text-muted-foreground">
                                    {project.research_question || 'No research question has been added yet.'}
                                </p>

                                <div className="mt-5 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                                    <span>{project.papers_count} {project.papers_count === 1 ? 'paper' : 'papers'}</span>
                                    <span className="inline-flex items-center gap-1 font-medium transition group-hover:text-foreground">
                                        Open workspace
                                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

ProjectsIndex.layout = { breadcrumbs };
