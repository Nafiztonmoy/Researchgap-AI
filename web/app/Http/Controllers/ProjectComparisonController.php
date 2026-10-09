<?php

namespace App\Http\Controllers;

use App\Jobs\CompareProjectJob;
use App\Models\ResearchProject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ProjectComparisonController extends Controller
{
    public function show(ResearchProject $researchProject): Response
    {
        Gate::authorize('view', $researchProject);

        $researchProject->load([
            'papers' => fn ($query) => $query->with('analysis')->latest(),
            'comparison',
            'researchGaps' => fn ($query) => $query->with('noveltyVerification')->latest(),
            'researchIdeas' => fn ($query) => $query->with('researchGap')->latest(),
        ]);

        return Inertia::render('projects/comparison', [
            'project' => $researchProject,
        ]);
    }

    public function generate(ResearchProject $researchProject): RedirectResponse
    {
        Gate::authorize('update', $researchProject);

        $analyzedCount = $researchProject->papers()
            ->whereHas('analysis')
            ->count();

        if ($analyzedCount < 2) {
            return back()->with(
                'error',
                'At least 2 analyzed papers are required before cross-paper comparison can be generated.'
            );
        }

        $researchProject->update([
            'comparison_status' => 'generating',
            'comparison_error' => null,
        ]);

        CompareProjectJob::dispatch($researchProject->id);

        return back()->with(
            'success',
            'Cross-paper comparison matrix has been queued.'
        );
    }
}
