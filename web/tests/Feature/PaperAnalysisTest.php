<?php

use App\Enums\PaperStatus;
use App\Jobs\AnalyzePaperJob;
use App\Models\Paper;
use App\Models\PaperAnalysis;
use App\Models\User;
use App\Services\Ai\AiServiceClient;
use App\Services\Analysis\SinglePaperAnalysisContextBuilder;
use Illuminate\Support\Facades\Queue;
use Mockery\MockInterface;

function createTestPaperWithChunks(User $user): Paper
{
    $project = $user->researchProjects()->create([
        'title' => 'Test Project',
        'status' => 'active',
    ]);

    $paper = $project->papers()->create([
        'original_filename' => 'quantum_computing.pdf',
        'file_disk' => 'local',
        'file_path' => 'papers/test/quantum.pdf',
        'mime_type' => 'application/pdf',
        'file_size' => 1024,
        'processing_status' => PaperStatus::EMBEDDED,
    ]);

    $paper->chunks()->create([
        'chunk_index' => 0,
        'page_start' => 1,
        'page_end' => 1,
        'section_title' => 'Introduction',
        'text' => 'Quantum algorithms provide quadratic speedups for unstructured search problems.',
        'character_count' => 74,
        'embedding' => '[0.1,0.2]',
    ]);

    return $paper;
}

test('project owner can view paper details and analysis page', function () {
    $user = User::factory()->create();
    $paper = createTestPaperWithChunks($user);

    $response = $this->actingAs($user)->get(route('papers.show', $paper));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('papers/show')
        ->has('paper.id')
    );
});

test('another user cannot view paper details for a project they do not own', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $paper = createTestPaperWithChunks($owner);

    $this->actingAs($otherUser)
        ->get(route('papers.show', $paper))
        ->assertForbidden();
});

test('project owner can retry paper processing', function () {
    Queue::fake();

    $user = User::factory()->create();
    $paper = createTestPaperWithChunks($user);

    $this->actingAs($user)
        ->post(route('papers.retry', $paper))
        ->assertRedirect();

    Queue::assertPushed(AnalyzePaperJob::class, fn ($job) => $job->paperId === $paper->id);
});

test('analyze paper job creates analysis record and updates paper status to completed', function () {
    $user = User::factory()->create();
    $paper = createTestPaperWithChunks($user);

    $mockAnalysisResult = [
        'research_problem' => [
            'claim' => 'Evaluating scalability of error correction across superconducting qubits.',
            'evidence_ids' => ['E1'],
        ],
        'objectives' => [
            [
                'claim' => 'Demonstrate fault-tolerant threshold lower bound.',
                'evidence_ids' => ['E1'],
            ],
        ],
        'methodology' => [
            [
                'claim' => 'Surface code lattice simulation.',
                'evidence_ids' => ['E1'],
            ],
        ],
        'datasets_or_data_sources' => [
            [
                'claim' => 'Simulated quantum noise traces.',
                'evidence_ids' => ['E1'],
            ],
        ],
        'key_findings' => [
            [
                'claim' => 'Threshold achieved at 0.7% physical error rate.',
                'evidence_ids' => ['E1'],
            ],
        ],
        'contributions' => [
            [
                'claim' => 'Optimized syndrome decoder reducing latency.',
                'evidence_ids' => ['E1'],
            ],
        ],
        'author_stated_limitations' => [
            [
                'limitation' => 'Assumes uncorrelated Pauli noise across physical qubits.',
                'evidence_ids' => ['E1'],
                'source_type' => 'author_stated',
            ],
        ],
        'ai_inferred_limitations' => [
            [
                'limitation' => 'Hardware decoherence rates may exceed theoretical noise model in real cryostats.',
                'reasoning' => 'Idealized syndrome cycles do not model thermal drift.',
                'evidence_ids' => ['I1'],
                'confidence' => 'high',
                'source_type' => 'ai_inferred',
            ],
        ],
        'future_work' => [
            [
                'proposal' => 'Experimental validation on 127-qubit processor.',
                'evidence_ids' => ['E1'],
                'origin' => 'author_suggested',
            ],
        ],
        'analysis_scope_note' => 'This analysis is grounded only in the provided paper evidence and does not establish global research novelty.',
    ];

    $this->mock(AiServiceClient::class, function (MockInterface $mock) use ($mockAnalysisResult) {
        $mock->shouldReceive('analyzeSinglePaper')
            ->once()
            ->andReturn($mockAnalysisResult);
    });

    $this->mock(SinglePaperAnalysisContextBuilder::class, function (MockInterface $mock) {
        $mock->shouldReceive('build')
            ->once()
            ->andReturn(['mock_context' => true]);
    });

    $job = new AnalyzePaperJob($paper->id);
    app()->call([$job, 'handle']);

    $paper->refresh();
    expect($paper->processing_status)->toBe(PaperStatus::COMPLETED)
        ->and($paper->processing_error)->toBeNull();

    $analysis = PaperAnalysis::query()->where('paper_id', $paper->id)->first();
    expect($analysis)->not->toBeNull()
        ->and($analysis->research_problem['claim'])->toBe('Evaluating scalability of error correction across superconducting qubits.')
        ->and($analysis->author_stated_limitations)->toHaveCount(1)
        ->and($analysis->ai_inferred_limitations)->toHaveCount(1)
        ->and($analysis->author_stated_limitations[0]['limitation'])->toBe('Assumes uncorrelated Pauli noise across physical qubits.');
});
