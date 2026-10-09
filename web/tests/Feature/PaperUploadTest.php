<?php

use App\Jobs\ParsePaperJob;
use App\Models\Paper;
use App\Models\ResearchProject;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

function projectForPaperTest(User $user): ResearchProject
{
    return $user->researchProjects()->create([
        'title' => 'Paper upload test',
        'status' => 'active',
    ]);
}

test('project owner can upload a pdf', function () {
    Storage::fake('local');
    Queue::fake([ParsePaperJob::class]);

    $user = User::factory()->create();
    $project = projectForPaperTest($user);
    $file = UploadedFile::fake()->create('study.pdf', 500, 'application/pdf');

    $response = $this->actingAs($user)->post(
        route('projects.papers.store', $project),
        ['paper' => $file]
    );

    $paper = Paper::query()->first();

    expect($paper)->not->toBeNull()
        ->and($paper->research_project_id)->toBe($project->id)
        ->and($paper->original_filename)->toBe('study.pdf');

    Storage::disk('local')->assertExists($paper->file_path);
    Queue::assertPushed(ParsePaperJob::class, fn ($job) => $job->paperId === $paper->id);
    $response->assertRedirect(route('projects.show', $project));
});

test('non pdf uploads are rejected', function () {
    Storage::fake('local');

    $user = User::factory()->create();
    $project = projectForPaperTest($user);
    $file = UploadedFile::fake()->create('notes.txt', 10, 'text/plain');

    $this->actingAs($user)
        ->post(route('projects.papers.store', $project), ['paper' => $file])
        ->assertSessionHasErrors('paper');

    expect(Paper::query()->count())->toBe(0);
});

test('another user cannot upload into a project they do not own', function () {
    Storage::fake('local');

    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $project = projectForPaperTest($owner);

    $this->actingAs($otherUser)
        ->post(route('projects.papers.store', $project), [
            'paper' => UploadedFile::fake()->create('study.pdf', 100, 'application/pdf'),
        ])
        ->assertForbidden();
});

test('removing a paper also removes its protected file', function () {
    Storage::fake('local');

    $user = User::factory()->create();
    $project = projectForPaperTest($user);
    Storage::disk('local')->put('papers/test/study.pdf', 'pdf');

    $paper = $project->papers()->create([
        'original_filename' => 'study.pdf',
        'file_disk' => 'local',
        'file_path' => 'papers/test/study.pdf',
        'mime_type' => 'application/pdf',
        'file_size' => 3,
        'processing_status' => 'uploaded',
    ]);

    $this->actingAs($user)
        ->delete(route('papers.destroy', $paper))
        ->assertRedirect();

    Storage::disk('local')->assertMissing('papers/test/study.pdf');
    expect($paper->fresh())->toBeNull();
});
