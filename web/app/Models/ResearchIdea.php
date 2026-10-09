<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResearchIdea extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'research_project_id',
        'research_gap_id',
        'title',
        'executive_summary',
        'primary_hypothesis',
        'hypothesized_mechanisms',
        'system_architecture_overview',
        'methodology_phases',
        'target_datasets',
        'baseline_models',
        'evaluation_metrics',
        'expected_scientific_contributions',
        'risks_and_mitigations',
        'publication_target_venues',
        'status',
        'error_message',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'hypothesized_mechanisms' => 'array',
            'methodology_phases' => 'array',
            'target_datasets' => 'array',
            'baseline_models' => 'array',
            'evaluation_metrics' => 'array',
            'expected_scientific_contributions' => 'array',
            'risks_and_mitigations' => 'array',
            'publication_target_venues' => 'array',
        ];
    }

    public function researchProject(): BelongsTo
    {
        return $this->belongsTo(ResearchProject::class);
    }

    public function researchGap(): BelongsTo
    {
        return $this->belongsTo(ResearchGap::class);
    }
}
