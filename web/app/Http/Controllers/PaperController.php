<?php

namespace App\Http\Controllers;

use App\Actions\Papers\UploadPaper;
use App\Http\Requests\StorePaperRequest;
use App\Jobs\AnalyzePaperJob;
use App\Jobs\EmbedPaperJob;
use App\Jobs\ParsePaperJob;
use App\Models\Paper;
use App\Models\ResearchProject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PaperController extends Controller
{
    public function index(Request $request): Response
    {
        $papers = Paper::query()
            ->whereHas(
                'researchProject',
                fn ($query) => $query->where('user_id', $request->user()->id)
            )
            ->with(['researchProject:id,title', 'analysis'])
            ->latest()
            ->get();

        return Inertia::render('papers/index', [
            'papers' => $papers,
        ]);
    }

    public function show(Paper $paper): Response
    {
        $paper->loadMissing([
            'researchProject',
            'analysis',
            'chunks' => fn ($query) => $query->orderBy('chunk_index'),
        ]);

        Gate::authorize('view', $paper->researchProject);

        return Inertia::render('papers/show', [
            'paper' => $paper,
        ]);
    }

    public function retry(Paper $paper): RedirectResponse
    {
        $paper->loadMissing('researchProject');
        Gate::authorize('update', $paper->researchProject);

        if ($paper->chunks()->doesntExist()) {
            ParsePaperJob::dispatch($paper->id);
        } elseif ($paper->chunks()->whereNull('embedding')->exists()) {
            EmbedPaperJob::dispatch($paper->id);
        } else {
            AnalyzePaperJob::dispatch($paper->id);
        }

        return back()->with('success', 'Analysis pipeline restarted for this paper.');
    }

    public function store(
        StorePaperRequest $request,
        ResearchProject $researchProject,
        UploadPaper $action
    ): RedirectResponse {
        Gate::authorize('update', $researchProject);

        $action->execute(
            $researchProject,
            $request->file('paper')
        );

        return redirect()
            ->route('projects.show', $researchProject)
            ->with('success', 'Paper uploaded successfully.');
    }

    public function file(Paper $paper): StreamedResponse
    {
        $paper->loadMissing('researchProject');
        Gate::authorize('view', $paper->researchProject);

        abort_unless(
            Storage::disk($paper->file_disk)->exists($paper->file_path),
            404
        );

        return Storage::disk($paper->file_disk)->response(
            $paper->file_path,
            $paper->original_filename,
            [
                'Content-Type' => 'application/pdf',
                'X-Content-Type-Options' => 'nosniff',
            ]
        );
    }

    public function destroy(Paper $paper): RedirectResponse
    {
        $paper->loadMissing('researchProject');
        Gate::authorize('update', $paper->researchProject);

        Storage::disk($paper->file_disk)->delete($paper->file_path);
        $paper->delete();

        return back()->with('success', 'Paper removed from the project.');
    }
}
