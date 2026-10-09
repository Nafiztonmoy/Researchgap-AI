<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GapNoveltyVerification extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'research_gap_id',
        'novelty_score',
        'novelty_verdict',
        'synthesis',
        'overlapping_papers',
        'distinguishing_angles',
        'potential_pitfalls',
        'status',
        'error_message',
        'verified_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'novelty_score' => 'integer',
            'overlapping_papers' => 'array',
            'distinguishing_angles' => 'array',
            'potential_pitfalls' => 'array',
            'verified_at' => 'datetime',
        ];
    }

    public function researchGap(): BelongsTo
    {
        return $this->belongsTo(ResearchGap::class);
    }
}
