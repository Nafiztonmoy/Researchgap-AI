<?php

namespace App\Http\Controllers;

use App\Jobs\VerifyGapNoveltyJob;
use App\Models\GapNoveltyVerification;
use App\Models\ResearchGap;
use App\Models\ResearchProject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class GapNoveltyController extends Controller
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

        return Inertia::render('projects/novelty', [
            'project' => $researchProject,
        ]);
    }

    public function verify(Request $request, ResearchGap $researchGap): RedirectResponse
    {
        $researchGap->loadMissing('researchProject');
        Gate::authorize('update', $researchGap->researchProject);

        GapNoveltyVerification::updateOrCreate(
            ['research_gap_id' => $researchGap->id],
            [
                'status' => 'processing',
                'error_message' => null,
            ]
        );

        VerifyGapNoveltyJob::dispatch($researchGap->id);

        return back()->with(
            'success',
            'Novelty verification queued for analysis against scholarly literature.'
        );
    }
}
