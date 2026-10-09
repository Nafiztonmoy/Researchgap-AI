import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

type ResearchProject = {
    id: string;
    title: string;
    research_domain: string | null;
    research_question: string | null;
    description: string | null;
    target_population: string | null;
    keywords: string[] | null;
    preferred_methodology: string | null;
    notes: string | null;
};

type Props = { project: ResearchProject };

type ProjectForm = {
    title: string;
    research_domain: string;
    research_question: string;
    description: string;
    target_population: string;
    keywords: string;
    preferred_methodology: string;
    notes: string;
};

const fieldClass =
    'w-full rounded-xl border border-input bg-background/80 px-3.5 py-2.5 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/15';

export default function EditProject({ project }: Props) {
    const { data, setData, put, processing, errors, transform } = useForm<ProjectForm>({
        title: project.title,
        research_domain: project.research_domain ?? '',
        research_question: project.research_question ?? '',
        description: project.description ?? '',
        target_population: project.target_population ?? '',
        keywords: project.keywords?.join(', ') ?? '',
        preferred_methodology: project.preferred_methodology ?? '',
        notes: project.notes ?? '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        transform((formData) => ({
            ...formData,
            keywords: formData.keywords
                .split(',')
                .map((keyword) => keyword.trim())
                .filter(Boolean),
        }));

        put(`/projects/${project.id}`);
    }

    return (
        <>
            <Head title={`Edit ${project.title}`} />

            <div className="mx-auto w-full max-w-4xl p-4 md:p-6 lg:p-8">
                <Link
                    href={`/projects/${project.id}`}
                    className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground animate-enter"
                >
                    <ArrowLeft className="size-4" />
                    Back to project
                </Link>

                <main className="research-surface rounded-2xl border p-5 md:p-7 animate-enter-delay-1">
                    <div className="mb-7">
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Project settings</p>
                        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Edit research project</h1>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Keep the project framing current as your literature review becomes more focused.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-5 md:grid-cols-2">
                            <Field label="Project title" error={errors.title} required className="md:col-span-2">
                                <input value={data.title} onChange={(e) => setData('title', e.target.value)} className={fieldClass} />
                            </Field>
                            <Field label="Research domain" error={errors.research_domain}>
                                <input value={data.research_domain} onChange={(e) => setData('research_domain', e.target.value)} className={fieldClass} />
                            </Field>
                            <Field label="Target population / domain" error={errors.target_population}>
                                <input value={data.target_population} onChange={(e) => setData('target_population', e.target.value)} className={fieldClass} />
                            </Field>
                            <Field label="Research question" error={errors.research_question} className="md:col-span-2">
                                <textarea rows={4} value={data.research_question} onChange={(e) => setData('research_question', e.target.value)} className={fieldClass} />
                            </Field>
                            <Field label="Description" error={errors.description} className="md:col-span-2">
                                <textarea rows={4} value={data.description} onChange={(e) => setData('description', e.target.value)} className={fieldClass} />
                            </Field>
                            <Field label="Keywords" error={errors.keywords} className="md:col-span-2" hint="Separate keywords with commas.">
                                <input value={data.keywords} onChange={(e) => setData('keywords', e.target.value)} className={fieldClass} />
                            </Field>
                            <Field label="Preferred methodology" error={errors.preferred_methodology}>
                                <textarea rows={4} value={data.preferred_methodology} onChange={(e) => setData('preferred_methodology', e.target.value)} className={fieldClass} />
                            </Field>
                            <Field label="Private notes" error={errors.notes}>
                                <textarea rows={4} value={data.notes} onChange={(e) => setData('notes', e.target.value)} className={fieldClass} />
                            </Field>
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
                            <Link href={`/projects/${project.id}`} className="inline-flex items-center justify-center rounded-lg border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-muted">
                                Cancel
                            </Link>
                            <button type="submit" disabled={processing} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:pointer-events-none disabled:opacity-50">
                                <Save className="size-4" />
                                {processing ? 'Saving...' : 'Save changes'}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </>
    );
}

function Field({ label, error, hint, required = false, className = '', children }: { label: string; error?: string; hint?: string; required?: boolean; className?: string; children: React.ReactNode }) {
    return (
        <label className={`block space-y-2 ${className}`}>
            <span className="text-sm font-medium">{label} {required && <span className="text-destructive">*</span>}</span>
            {children}
            {hint && !error && <span className="block text-xs text-muted-foreground">{hint}</span>}
            {error && <span className="block text-xs font-medium text-destructive">{error}</span>}
        </label>
    );
}

EditProject.layout = { breadcrumbs: [
    { title: 'Projects', href: '/projects' },
    { title: 'Edit project', href: '#' },
] satisfies BreadcrumbItem[] };
