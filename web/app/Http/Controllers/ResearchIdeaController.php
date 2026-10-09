<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateResearchIdeaJob;
use App\Models\ResearchIdea;
use App\Models\ResearchProject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ResearchIdeaController extends Controller
{
    public function index(ResearchProject $researchProject): Response
    {
        Gate::authorize('view', $researchProject);

        $researchProject->load([
            'papers' => fn ($query) => $query->with('analysis')->latest(),
            'comparison',
            'researchGaps' => fn ($query) => $query->with('noveltyVerification')->latest(),
            'researchIdeas' => fn ($query) => $query->with('researchGap')->latest(),
        ]);

        return Inertia::render('projects/ideas', [
            'project' => $researchProject,
        ]);
    }

    public function generate(Request $request, ResearchProject $researchProject): RedirectResponse
    {
        Gate::authorize('update', $researchProject);

        $validated = $request->validate([
            'research_gap_id' => ['nullable', 'string', 'exists:research_gaps,id'],
        ]);

        $gapId = $validated['research_gap_id'] ?? null;
        $gap = null;

        if ($gapId) {
            $gap = $researchProject->researchGaps()->where('id', $gapId)->firstOrFail();
        } else {
            $gap = $researchProject->researchGaps()->orderByDesc('actionability_score')->first();
        }

        if (! $gap) {
            return back()->with(
                'error',
                'At least one research gap is required to generate a research proposal blueprint.'
            );
        }

        $idea = ResearchIdea::create([
            'research_project_id' => $researchProject->id,
            'research_gap_id' => $gap->id,
            'title' => 'Formulating Blueprint: '.$gap->title,
            'status' => 'processing',
        ]);

        GenerateResearchIdeaJob::dispatch($researchProject->id, $gap->id, $idea->id);

        return back()->with(
            'success',
            'Research idea blueprint generation has been queued.'
        );
    }

    public function destroy(ResearchIdea $researchIdea): RedirectResponse
    {
        $researchIdea->loadMissing('researchProject');
        Gate::authorize('update', $researchIdea->researchProject);

        $researchIdea->delete();

        return back()->with('success', 'Research idea blueprint removed.');
    }
}
