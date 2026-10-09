<?php

use App\Enums\PaperStatus;
use App\Jobs\DiscoverResearchGapsJob;
use App\Models\ResearchProject;
use App\Models\User;
use App\Services\Ai\AiServiceClient;
use Illuminate\Support\Facades\Queue;
use Mockery\MockInterface;

function createProjectWithPaperForGaps(User $user): ResearchProject
{
    $project = $user->researchProjects()->create([
        'title' => 'Quantum Fault Tolerance Project',
        'research_domain' => 'Quantum Computing',
        'research_question' => 'What are the limits of surface code threshold scaling?',
        'status' => 'active',
    ]);

    $paper = $project->papers()->create([
        'title' => 'Surface Codes Under Non-Markovian Noise',
        'original_filename' => 'surface_codes.pdf',
        'file_disk' => 'local',
        'file_path' => 'papers/test/surface_codes.pdf',
        'mime_type' => 'application/pdf',
        'file_size' => 2048,
        'processing_status' => PaperStatus::COMPLETED,
    ]);

    $paper->analysis()->create([
        'research_problem' => ['claim' => 'Evaluating threshold behavior under correlated noise.'],
        'objectives' => [['claim' => 'Simulate 1000 cycles with non-Markovian phase drift.']],
        'methodology' => [['claim' => 'Monte Carlo syndrome sampling.']],
        'datasets_or_data_sources' => [['claim' => 'Synthetic error trajectories.']],
        'key_findings' => [['claim' => 'Threshold drops from 1.0% to 0.4% under temporal correlations.']],
        'contributions' => [['claim' => 'Novel spatio-temporal decoder.']],
        'author_stated_limitations' => [['limitation' => 'Assumes uniform qubit coupling across lattice.']],
        'ai_inferred_limitations' => [['limitation' => 'Does not account for thermal dissipation in real dilution fridges.']],
        'future_work' => [['proposal' => 'Extend to continuous-variable bosonic codes.']],
    ]);

    return $project;
}

test('project owner can trigger research gap discovery when analyzed papers exist', function () {
    Queue::fake();

    $user = User::factory()->create();
    $project = createProjectWithPaperForGaps($user);

    $response = $this->actingAs($user)
        ->from(route('projects.show', $project))
        ->post(route('projects.gaps.discover', $project));

    $response->assertRedirect(route('projects.show', $project));
    Queue::assertPushed(DiscoverResearchGapsJob::class, fn ($job) => $job->projectId === $project->id);
});

test('triggering gap discovery fails when no analyzed papers exist', function () {
    Queue::fake();

    $user = User::factory()->create();
    $project = $user->researchProjects()->create([
        'title' => 'Empty Project',
        'status' => 'active',
    ]);

    $response = $this->actingAs($user)
        ->from(route('projects.show', $project))
        ->post(route('projects.gaps.discover', $project));

    $response->assertRedirect(route('projects.show', $project));
    $response->assertSessionHas('error');
    Queue::assertNotPushed(DiscoverResearchGapsJob::class);
});

test('another user cannot trigger gap discovery or update gap for a project they do not own', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $project = createProjectWithPaperForGaps($owner);

    $gap = $project->researchGaps()->create([
        'title' => 'Crosstalk Under Large Lattice Regimes',
        'category' => 'methodological',
        'description' => 'Scalability degradation due to spectator qubit crosstalk.',
        'rationale' => 'Physical hardware manifests parasitic ZZ coupling.',
        'evidence_sources' => [],
        'potential_impact' => 'high',
        'actionability_score' => 8,
        'suggested_directions' => ['Dynamical decoupling pulse insertion'],
        'status' => 'discovered',
    ]);

    $this->actingAs($otherUser)
        ->post(route('projects.gaps.discover', $project))
        ->assertForbidden();

    $this->actingAs($otherUser)
        ->patch(route('gaps.update', $gap), ['status' => 'saved'])
        ->assertForbidden();
});

test('project owner can update gap status and notes', function () {
    $user = User::factory()->create();
    $project = createProjectWithPaperForGaps($user);

    $gap = $project->researchGaps()->create([
        'title' => 'Thermal Dissipation in Scaled Cryostats',
        'category' => 'empirical',
        'description' => 'Empirical absence of dilution refrigerator heat-load modeling.',
        'rationale' => 'Critical for commercial deployment beyond 1000 qubits.',
        'evidence_sources' => [],
        'potential_impact' => 'high',
        'actionability_score' => 9,
        'suggested_directions' => ['Empirical cryogenic thermal measurements'],
        'status' => 'discovered',
    ]);

    $response = $this->actingAs($user)
        ->from(route('projects.show', $project))
        ->patch(route('gaps.update', $gap), [
            'status' => 'saved',
            'notes' => 'Top priority for our grant application.',
        ]);

    $response->assertRedirect(route('projects.show', $project));

    $gap->refresh();
    expect($gap->status)->toBe('saved');
    expect($gap->notes)->toBe('Top priority for our grant application.');
});

test('updating gap status validates status enum', function () {
    $user = User::factory()->create();
    $project = createProjectWithPaperForGaps($user);

    $gap = $project->researchGaps()->create([
        'title' => 'Test Gap',
        'category' => 'theoretical',
        'description' => 'Test description',
        'rationale' => 'Test rationale',
        'evidence_sources' => [],
        'potential_impact' => 'medium',
        'actionability_score' => 5,
        'suggested_directions' => [],
        'status' => 'discovered',
    ]);

    $response = $this->actingAs($user)
        ->from(route('projects.show', $project))
        ->patch(route('gaps.update', $gap), [
            'status' => 'invalid_status_value',
        ]);

    $response->assertSessionHasErrors('status');
});

test('discover research gaps job calls ai service and persists gap records', function () {
    $user = User::factory()->create();
    $project = createProjectWithPaperForGaps($user);
    $paper = $project->papers()->first();

    $mockGapResult = [
        'project_id' => $project->id,
        'domain_landscape_summary' => 'Current surface code research predominantly assumes idealized Gaussian noise, leaving correlated noise mitigation unexplored.',
        'gaps' => [
            [
                'title' => 'Non-Markovian Noise Mitigation in Real Hardware Decoders',
                'category' => 'methodological',
                'description' => 'Current decoders fail to adjust priors dynamically when temporal phase drift occurs across syndrome cycles.',
                'rationale' => 'Decoders designed for memoryless Pauli channels produce sub-optimal matching under 1/f noise.',
                'evidence_sources' => [
                    [
                        'paper_id' => $paper->id,
                        'paper_title' => $paper->title,
                        'evidence_summary' => 'Threshold drops to 0.4% under non-Markovian noise.',
                    ],
                ],
                'potential_impact' => 'high',
                'actionability_score' => 9,
                'suggested_directions' => [
                    'Implement recurrent neural network decoder with memory units.',
                    'Apply Bayesian belief propagation with correlated error factors.',
                ],
            ],
            [
                'title' => 'Cryogenic Heat-Load Constraints on Large Surface Code Lattices',
                'category' => 'empirical',
                'description' => 'Lack of empirical benchmarks measuring dilution refrigerator thermal drift during sustained syndrome extraction cycles.',
                'rationale' => 'Active microwave lines heat the mixing chamber, degrading T1 times.',
                'evidence_sources' => [
                    [
                        'paper_id' => $paper->id,
                        'paper_title' => $paper->title,
                        'evidence_summary' => 'Does not account for thermal dissipation in real dilution fridges.',
                    ],
                ],
                'potential_impact' => 'high',
                'actionability_score' => 8,
                'suggested_directions' => [
                    'Perform in-situ calorimetric measurement during continuous 10^5 cycle syndrome extraction.',
                ],
            ],
        ],
    ];

    $mockAiClient = $this->mock(AiServiceClient::class, function (MockInterface $mock) use ($mockGapResult) {
        $mock->shouldReceive('discoverResearchGaps')
            ->once()
            ->andReturn($mockGapResult);
    });

    $job = new DiscoverResearchGapsJob($project->id);
    $job->handle($mockAiClient);

    $this->assertDatabaseHas('research_gaps', [
        'research_project_id' => $project->id,
        'title' => 'Non-Markovian Noise Mitigation in Real Hardware Decoders',
        'category' => 'methodological',
        'status' => 'discovered',
    ]);

    $this->assertDatabaseHas('research_gaps', [
        'research_project_id' => $project->id,
        'title' => 'Cryogenic Heat-Load Constraints on Large Surface Code Lattices',
        'category' => 'empirical',
    ]);

    $gaps = $project->fresh()->researchGaps;
    expect($gaps)->toHaveCount(2);
    expect($gaps->first()->evidence_sources)->toHaveCount(1);
    expect($gaps->first()->suggested_directions)->toHaveCount(2);
    expect($gaps->first()->actionability_score)->toBe(9);
});

test('project show page returns research gaps data', function () {
    $user = User::factory()->create();
    $project = createProjectWithPaperForGaps($user);

    $project->researchGaps()->create([
        'title' => 'Boundary Effect Anomalies in Planar Codes',
        'category' => 'theoretical',
        'description' => 'Planar code rough and smooth boundaries experience asymmetric error propagation.',
        'rationale' => 'Boundary syndrome measurements have lower weight.',
        'evidence_sources' => [],
        'potential_impact' => 'medium',
        'actionability_score' => 7,
        'suggested_directions' => ['Boundary weight re-balancing.'],
        'status' => 'saved',
    ]);

    $response = $this->actingAs($user)->get(route('projects.show', $project));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('projects/show')
        ->has('project.research_gaps', 1)
        ->where('project.research_gaps.0.title', 'Boundary Effect Anomalies in Planar Codes')
        ->where('project.research_gaps.0.status', 'saved')
    );
});
