import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ProjectWorkspaceHeader } from '@/components/project-workspace-header';
import { ResearchIdeaSection } from '@/components/research-idea-section';
import type { BreadcrumbItem } from '@/types';
import type { ResearchProject } from '@/types/research';

type Props = { project: ResearchProject };

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Projects', href: '/projects' },
    { title: 'Research Ideas', href: '#' },
];

export default function ProjectIdeasPage({ project }: Props) {
    const [generating, setGenerating] = useState(false);

    const ideas = project.research_ideas ?? [];
    const hasGeneratingIdea = ideas.some(
        (i) => i.status === 'processing' || i.status === 'pending'
    );
    const isRunning = generating || hasGeneratingIdea;

    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            router.reload({ only: ['project'] });
        }, 3000);

        return () => clearInterval(interval);
    }, [isRunning]);

    function generateIdea(gapId?: string) {
        setGenerating(true);
        router.post(
            `/projects/${project.id}/ideas/generate`,
            gapId ? { research_gap_id: gapId } : {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Research idea blueprint generation queued.');
                    setGenerating(false);
                },
                onError: () => {
                    toast.error('Failed to trigger research idea generation.');
                    setGenerating(false);
                },
            }
        );
    }

    function deleteIdea(ideaId: string) {
        router.delete(`/ideas/${ideaId}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Research idea blueprint deleted.');
            },
            onError: () => {
                toast.error('Failed to delete research idea.');
            },
        });
    }

    return (
        <>
            <Head title={`Research Ideas - ${project.title}`} />

            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <ProjectWorkspaceHeader project={project} activeTab="ideas" />

                <ResearchIdeaSection
                    project={project}
                    onGenerateIdea={generateIdea}
                    onDeleteIdea={deleteIdea}
                    isGenerating={isRunning}
                />
            </div>
        </>
    );
}

ProjectIdeasPage.layout = { breadcrumbs };
