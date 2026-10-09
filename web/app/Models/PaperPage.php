<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaperPage extends Model
{
    use HasFactory;

    protected $fillable = [
        'page_number',
        'text',
        'character_count',
    ];

    public function paper(): BelongsTo
    {
        return $this->belongsTo(Paper::class);
    }
}
