<?php

namespace App\Http\Controllers;

use App\Models\Paper;
use App\Models\ResearchProject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $userId = $request->user()->id;

        $projectsQuery = ResearchProject::query()->where('user_id', $userId);
        $papersQuery = Paper::query()->whereHas(
            'researchProject',
            fn ($query) => $query->where('user_id', $userId)
        );

        $recentProjects = ResearchProject::query()
            ->where('user_id', $userId)
            ->withCount('papers')
            ->latest('updated_at')
            ->limit(5)
            ->get();

        $recentPapers = Paper::query()
            ->whereHas(
                'researchProject',
                fn ($query) => $query->where('user_id', $userId)
            )
            ->with('researchProject:id,title')
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => [
                'projects' => (clone $projectsQuery)->count(),
                'papers' => (clone $papersQuery)->count(),
                'processing' => (clone $papersQuery)
                    ->whereNotIn('processing_status', ['completed', 'failed', 'uploaded'])
                    ->count(),
                'readyForAnalysis' => (clone $papersQuery)
                    ->where('processing_status', 'uploaded')
                    ->count(),
            ],
            'recentProjects' => $recentProjects,
            'recentPapers' => $recentPapers,
        ]);
    }
}
