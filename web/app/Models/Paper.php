<?php

namespace App\Models;

use App\Enums\PaperStatus;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Paper extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'title',
        'authors',
        'abstract',
        'publication_year',
        'venue',
        'doi',
        'keywords',

        'original_filename',
        'file_disk',
        'file_path',
        'mime_type',
        'file_size',

        'page_count',
        'processing_status',
        'extraction_confidence',
        'processing_error',
    ];

    protected function casts(): array
    {
        return [
            'authors' => 'array',
            'keywords' => 'array',
            'publication_year' => 'integer',
            'page_count' => 'integer',
            'file_size' => 'integer',
            'extraction_confidence' => 'decimal:4',
            'processing_status' => PaperStatus::class,
        ];
    }

    public function pages(): HasMany
    {
        return $this->hasMany(PaperPage::class);
    }

    public function chunks(): HasMany
    {
        return $this->hasMany(PaperChunk::class);
    }

    public function analysis(): HasOne
    {
        return $this->hasOne(PaperAnalysis::class);
    }

    public function researchProject(): BelongsTo
    {
        return $this->belongsTo(ResearchProject::class);
    }
}
