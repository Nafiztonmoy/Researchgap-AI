<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaperChunk extends Model
{
    use HasFactory;

    protected $fillable = [
        'chunk_index',
        'page_start',
        'page_end',
        'section_title',
        'text',
        'character_count',
        'embedding',
        'embedding_model',
        'embedding_dimensions',
        'embedded_at',
    ];

    public function paper(): BelongsTo
    {
        return $this->belongsTo(Paper::class);
    }
}
