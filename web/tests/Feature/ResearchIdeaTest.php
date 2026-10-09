<?php

use App\Jobs\GenerateResearchIdeaJob;
use App\Models\ResearchIdea;
use App\Models\User;
use App\Services\Ai\AiServiceClient;
use Illuminate\Support\Facades\Queue;
use Mockery\MockInterface;

function createProjectWithGapForIdea(User $user): array
{
    $project = $user->researchProjects()->create([
        'title' => 'Quantum Fault Tolerance Project',
        'research_domain' => 'Quantum Computing',
        'research_question' => 'What are the limits of surface code threshold scaling?',
        'status' => 'active',
    ]);

    $gap = $project->researchGaps()->create([
        'title' => 'Absence of Real-Time Scalable Decoders Under Correlated Phase Noise',
        'category' => 'methodological',
        'description' => 'Existing decoders assume uncorrelated Pauli noise, breaking down on physical transmon architectures.',
        'rationale' => 'Addressing this is critical for fault-tolerant syndrome processing at scale.',
        'evidence_sources' => [],
        'potential_impact' => 'high',
        'actionability_score' => 9,
        'suggested_directions' => ['Implement graph neural network syndrome decoding.'],
        'status' => 'discovered',
    ]);

    return [$project, $gap];
}

test('project owner can trigger research idea blueprint generation', function () {
    Queue::fake();

    $user = User::factory()->create();
    [$project, $gap] = createProjectWithGapForIdea($user);

    $response = $this->actingAs($user)
        ->from(route('projects.show', $project))
        ->post(route('projects.ideas.generate', $project), [
            'research_gap_id' => $gap->id,
        ]);

    $response->assertRedirect(route('projects.show', $project));
    $response->assertSessionHas('success');

    Queue::assertPushed(GenerateResearchIdeaJob::class, function ($job) use ($project, $gap) {
        return $job->projectId === $project->id && $job->gapId === $gap->id;
    });

    $this->assertDatabaseHas('research_ideas', [
        'research_project_id' => $project->id,
        'research_gap_id' => $gap->id,
        'status' => 'processing',
    ]);
});

test('unauthorized user cannot generate research idea for another user project', function () {
    Queue::fake();

    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    [$project, $gap] = createProjectWithGapForIdea($owner);

    $response = $this->actingAs($otherUser)
        ->post(route('projects.ideas.generate', $project), [
            'research_gap_id' => $gap->id,
        ]);

    $response->assertForbidden();
    Queue::assertNothingPushed();
});

test('generating idea blueprint fails if no gaps exist in project', function () {
    Queue::fake();

    $user = User::factory()->create();
    $project = $user->researchProjects()->create([
        'title' => 'Empty Project',
        'status' => 'active',
    ]);

    $response = $this->actingAs($user)
        ->from(route('projects.show', $project))
        ->post(route('projects.ideas.generate', $project));

    $response->assertRedirect(route('projects.show', $project));
    $response->assertSessionHas('error');
    Queue::assertNothingPushed();
});

test('generate research idea job successfully populates complete proposal blueprint', function () {
    $user = User::factory()->create();
    [$project, $gap] = createProjectWithGapForIdea($user);

    $idea = ResearchIdea::create([
        'research_project_id' => $project->id,
        'research_gap_id' => $gap->id,
        'title' => 'Pending Formulation',
        'status' => 'processing',
    ]);

    $mockResponse = [
        'gap_id' => $gap->id,
        'title' => 'Neural Syndrome Tracking: Real-Time Non-Markovian Decoders for Surface Codes',
        'executive_summary' => 'This project introduces a spatio-temporal graph neural network decoder...',
        'primary_hypothesis' => 'H1: If temporal recurrence is embedded into the syndromic lattice representation, then threshold drops under non-Markovian noise will be mitigated by at least 45% because memory kernels capture time-correlated phase drift.',
        'hypothesized_mechanisms' => [
            'Markovian violation mitigation: Recurrent hidden states retain multi-cycle error accumulation.',
        ],
        'system_architecture_overview' => 'A three-tier pipeline comprising FPGA syndrome streaming, recurrent GNN message passing, and Pauli frame update.',
        'methodology_phases' => [
            [
                'phase' => 'Phase 1',
                'title' => 'Noise Calibration & Dataset Synthesis',
                'description' => 'Simulate 10^7 syndrome cycles using Stim.',
                'key_techniques' => ['Stim simulator', 'Stochastic phase drift injection'],
            ],
        ],
        'target_datasets' => [
            [
                'name' => 'OpenQASM Correlated Surface-17',
                'description' => '17-qubit planar distance-3 surface code trajectories.',
                'availability' => 'Public GitHub repo',
                'purpose' => 'Benchmark decoder latency and logical error rate.',
            ],
        ],
        'baseline_models' => [
            [
                'model_name' => 'PyMatching (MWPM)',
                'description' => 'Standard Minimum Weight Perfect Matching algorithm.',
                'expected_weakness' => 'Assumes independent edge weights, cannot model temporal correlations.',
            ],
        ],
        'evaluation_metrics' => [
            [
                'metric_name' => 'Logical Error Rate per Cycle',
                'measurement_goal' => 'Minimize rate of uncorrected logical X/Z flips.',
                'target_threshold' => '< 10^-5 at p=0.005',
            ],
        ],
        'expected_scientific_contributions' => [
            'First real-time sub-microsecond non-Markovian syndrome decoder for surface codes.',
        ],
        'risks_and_mitigations' => [
            [
                'risk' => 'FPGA routing congestion for large distance lattices.',
                'severity' => 'medium',
                'mitigation_strategy' => 'Implement localized systolic array partitioning.',
            ],
        ],
        'publication_target_venues' => [
            'IEEE Transactions on Quantum Engineering',
            'PRX Quantum',
            'QCE (IEEE Quantum Week)',
        ],
    ];

    $this->mock(AiServiceClient::class, function (MockInterface $mock) use ($mockResponse) {
        $mock->shouldReceive('generateResearchIdea')
            ->once()
            ->andReturn($mockResponse);
    });

    $job = new GenerateResearchIdeaJob($project->id, $gap->id, $idea->id);
    $job->handle(app(AiServiceClient::class));

    $idea->refresh();

    expect($idea->status)->toBe('completed')
        ->and($idea->title)->toBe('Neural Syndrome Tracking: Real-Time Non-Markovian Decoders for Surface Codes')
        ->and($idea->primary_hypothesis)->toContain('H1:')
        ->and($idea->methodology_phases)->toHaveCount(1)
        ->and($idea->baseline_models)->toHaveCount(1)
        ->and($idea->target_datasets)->toHaveCount(1)
        ->and($idea->publication_target_venues)->toHaveCount(3);
});

test('user can delete their research idea blueprint', function () {
    $user = User::factory()->create();
    [$project, $gap] = createProjectWithGapForIdea($user);

    $idea = ResearchIdea::create([
        'research_project_id' => $project->id,
        'research_gap_id' => $gap->id,
        'title' => 'Blueprint to delete',
        'status' => 'completed',
    ]);

    $response = $this->actingAs($user)
        ->delete(route('ideas.destroy', $idea));

    $response->assertRedirect();
    $this->assertDatabaseMissing('research_ideas', ['id' => $idea->id]);
});
