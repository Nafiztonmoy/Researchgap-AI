<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectComparison extends Model
{
    use HasFactory, HasUlids;

    protected $table = 'project_comparisons';

    protected $fillable = [
        'research_project_id',
        'literature_synthesis',
        'methodology_landscape',
        'dataset_landscape',
        'matrix_rows',
        'tensions_and_contradictions',
        'shared_limitations',
        'compared_paper_count',
        'compared_paper_ids',
        'compared_at',
    ];

    protected function casts(): array
    {
        return [
            'matrix_rows' => 'array',
            'tensions_and_contradictions' => 'array',
            'shared_limitations' => 'array',
            'compared_paper_ids' => 'array',
            'compared_paper_count' => 'integer',
            'compared_at' => 'datetime',
        ];
    }

    public function researchProject(): BelongsTo
    {
        return $this->belongsTo(ResearchProject::class);
    }
}
