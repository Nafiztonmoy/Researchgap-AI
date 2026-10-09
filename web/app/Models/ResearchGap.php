<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ResearchGap extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'research_project_id',
        'title',
        'category',
        'description',
        'rationale',
        'evidence_sources',
        'potential_impact',
        'actionability_score',
        'suggested_directions',
        'status',
        'notes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'evidence_sources' => 'array',
            'suggested_directions' => 'array',
            'actionability_score' => 'integer',
        ];
    }

    public function researchProject(): BelongsTo
    {
        return $this->belongsTo(ResearchProject::class);
    }

    public function noveltyVerification(): HasOne
    {
        return $this->hasOne(GapNoveltyVerification::class);
    }

    public function researchIdeas(): HasMany
    {
        return $this->hasMany(ResearchIdea::class);
    }
}
