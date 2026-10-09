<?php

namespace App\Http\Controllers;

use App\Jobs\DiscoverResearchGapsJob;
use App\Models\ResearchGap;
use App\Models\ResearchProject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ResearchGapController extends Controller
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

        return Inertia::render('projects/gaps', [
            'project' => $researchProject,
        ]);
    }

    public function discover(ResearchProject $researchProject): RedirectResponse
    {
        Gate::authorize('update', $researchProject);

        $analyzedCount = $researchProject->papers()
            ->whereHas('analysis')
            ->count();

        if ($analyzedCount === 0) {
            return back()->with(
                'error',
                'At least one paper with a completed analysis is required to discover research gaps.'
            );
        }

        $researchProject->update([
            'gap_discovery_status' => 'discovering',
            'gap_discovery_error' => null,
        ]);

        DiscoverResearchGapsJob::dispatch($researchProject->id);

        return back()->with(
            'success',
            'Research gap discovery has been queued.'
        );
    }

    public function updateStatus(Request $request, ResearchGap $researchGap): RedirectResponse
    {
        $researchGap->loadMissing('researchProject');
        Gate::authorize('update', $researchGap->researchProject);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['discovered', 'investigating', 'saved', 'dismissed'])],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $researchGap->update($validated);

        return back()->with('success', 'Research gap status updated.');
    }
}
