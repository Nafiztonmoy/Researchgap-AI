<?php

namespace App\Http\Controllers;

use App\Actions\Projects\CreateResearchProject;
use App\Actions\Projects\DeleteResearchProject;
use App\Actions\Projects\UpdateResearchProject;
use App\Http\Requests\StoreResearchProjectRequest;
use App\Http\Requests\UpdateResearchProjectRequest;
use App\Models\ResearchProject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ResearchProjectController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', ResearchProject::class);

        $projects = auth()->user()
            ->researchProjects()
            ->withCount('papers')
            ->latest()
            ->get();

        return Inertia::render('projects/index', [
            'projects' => $projects,
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', ResearchProject::class);

        return Inertia::render('projects/create');
    }

    public function store(
        StoreResearchProjectRequest $request,
        CreateResearchProject $action
    ): RedirectResponse {
        Gate::authorize('create', ResearchProject::class);

        $project = $action->execute(
            $request->user(),
            $request->validated()
        );

        return redirect()
            ->route('projects.show', $project)
            ->with('success', 'Research project created.');
    }

    public function show(ResearchProject $researchProject): Response
    {
        Gate::authorize('view', $researchProject);

        $researchProject->load([
            'papers' => fn ($query) => $query->with('analysis')->latest(),
            'comparison',
            'researchGaps' => fn ($query) => $query->with('noveltyVerification')->latest(),
            'researchIdeas' => fn ($query) => $query->with('researchGap')->latest(),
        ]);

        return Inertia::render('projects/show', [
            'project' => $researchProject,
        ]);
    }

    public function edit(ResearchProject $researchProject): Response
    {
        Gate::authorize('update', $researchProject);

        return Inertia::render('projects/edit', [
            'project' => $researchProject,
        ]);
    }

    public function update(
        UpdateResearchProjectRequest $request,
        ResearchProject $researchProject,
        UpdateResearchProject $action
    ): RedirectResponse {
        Gate::authorize('update', $researchProject);

        $action->execute(
            $researchProject,
            $request->validated()
        );

        return redirect()
            ->route('projects.show', $researchProject)
            ->with('success', 'Research project updated.');
    }

    public function destroy(
        ResearchProject $researchProject,
        DeleteResearchProject $action
    ): RedirectResponse {
        Gate::authorize('delete', $researchProject);

        $action->execute($researchProject);

        return redirect()
            ->route('projects.index')
            ->with('success', 'Research project deleted.');
    }
}
