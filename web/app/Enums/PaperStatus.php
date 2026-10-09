<?php

namespace App\Enums;

enum PaperStatus: string
{
    case UPLOADED = 'uploaded';
    case PARSING = 'parsing';
    case PARSED = 'parsed';
    case EMBEDDING = 'embedding';
    case EMBEDDED = 'embedded';
    case ANALYZING = 'analyzing';
    case COMPLETED = 'completed';
    case FAILED = 'failed';
}
