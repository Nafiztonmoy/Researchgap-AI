<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaperAnalysis extends Model
{
    use HasFactory, HasUlids;

    protected $table = 'paper_analyses';

    protected $fillable = [
        'paper_id',
        'research_problem',
        'objectives',
        'methodology',
        'datasets_or_data_sources',
        'key_findings',
        'contributions',
        'author_stated_limitations',
        'ai_inferred_limitations',
        'future_work',
        'analysis_scope_note',
        'analyzed_at',
    ];

    protected function casts(): array
    {
        return [
            'research_problem' => 'array',
            'objectives' => 'array',
            'methodology' => 'array',
            'datasets_or_data_sources' => 'array',
            'key_findings' => 'array',
            'contributions' => 'array',
            'author_stated_limitations' => 'array',
            'ai_inferred_limitations' => 'array',
            'future_work' => 'array',
            'analyzed_at' => 'datetime',
        ];
    }

    public function paper(): BelongsTo
    {
        return $this->belongsTo(Paper::class);
    }
}
