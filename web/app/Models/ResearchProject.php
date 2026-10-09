<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ResearchProject extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'title',
        'research_domain',
        'research_question',
        'description',
        'target_population',
        'keywords',
        'preferred_methodology',
        'notes',
        'status',
        'comparison_status',
        'comparison_error',
        'gap_discovery_status',
        'gap_discovery_error',
    ];

    public function papers(): HasMany
    {
        return $this->hasMany(Paper::class);
    }

    public function comparison(): HasOne
    {
        return $this->hasOne(ProjectComparison::class);
    }

    public function researchGaps(): HasMany
    {
        return $this->hasMany(ResearchGap::class);
    }

    public function researchIdeas(): HasMany
    {
        return $this->hasMany(ResearchIdea::class);
    }

    protected function casts(): array
    {
        return [
            'keywords' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
