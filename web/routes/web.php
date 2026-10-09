<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GapNoveltyController;
use App\Http\Controllers\PaperController;
use App\Http\Controllers\ProjectComparisonController;
use App\Http\Controllers\ResearchGapController;
use App\Http\Controllers\ResearchIdeaController;
use App\Http\Controllers\ResearchProjectController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::resource('projects', ResearchProjectController::class)
        ->parameters([
            'projects' => 'researchProject',
        ]);

    Route::get(
        'projects/{researchProject}/comparison',
        [ProjectComparisonController::class, 'show']
    )->name('projects.comparison.show');

    Route::post(
        'projects/{researchProject}/comparison/generate',
        [ProjectComparisonController::class, 'generate']
    )->name('projects.comparison.generate');

    Route::get(
        'projects/{researchProject}/gaps',
        [ResearchGapController::class, 'index']
    )->name('projects.gaps.index');

    Route::post(
        'projects/{researchProject}/gaps/discover',
        [ResearchGapController::class, 'discover']
    )->name('projects.gaps.discover');

    Route::get(
        'projects/{researchProject}/novelty',
        [GapNoveltyController::class, 'index']
    )->name('projects.novelty.index');

    Route::get(
        'projects/{researchProject}/ideas',
        [ResearchIdeaController::class, 'index']
    )->name('projects.ideas.index');

    Route::patch(
        'gaps/{researchGap}',
        [ResearchGapController::class, 'updateStatus']
    )->name('gaps.update');

    Route::post(
        'gaps/{researchGap}/verify-novelty',
        [GapNoveltyController::class, 'verify']
    )->name('gaps.novelty.verify');

    Route::post(
        'projects/{researchProject}/ideas/generate',
        [ResearchIdeaController::class, 'generate']
    )->name('projects.ideas.generate');

    Route::delete(
        'ideas/{researchIdea}',
        [ResearchIdeaController::class, 'destroy']
    )->name('ideas.destroy');

    Route::get('papers', [PaperController::class, 'index'])
        ->name('papers.index');

    Route::post(
        'projects/{researchProject}/papers',
        [PaperController::class, 'store']
    )->name('projects.papers.store');

    Route::get('papers/{paper}', [PaperController::class, 'show'])
        ->name('papers.show');

    Route::post('papers/{paper}/retry', [PaperController::class, 'retry'])
        ->name('papers.retry');

    Route::get('papers/{paper}/file', [PaperController::class, 'file'])
        ->name('papers.file');

    Route::delete('papers/{paper}', [PaperController::class, 'destroy'])
        ->name('papers.destroy');
});

require __DIR__.'/settings.php';
