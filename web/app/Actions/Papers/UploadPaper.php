<?php

namespace App\Actions\Papers;

use App\Enums\PaperStatus;
use App\Jobs\ParsePaperJob;
use App\Models\Paper;
use App\Models\ResearchProject;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class UploadPaper
{
    public function execute(
        ResearchProject $researchProject,
        UploadedFile $file
    ): Paper {
        $storageName = Str::ulid().'.pdf';

        $path = $file->storeAs(
            "papers/{$researchProject->id}",
            $storageName,
            'local'
        );

        if (! $path) {
            throw ValidationException::withMessages([
                'paper' => 'The PDF could not be stored. Check the storage permissions and try again.',
            ]);
        }

        try {
            $paper = $researchProject->papers()->create([
                'original_filename' => $file->getClientOriginalName(),
                'file_disk' => 'local',
                'file_path' => $path,
                'mime_type' => $file->getMimeType() ?? 'application/pdf',
                'file_size' => $file->getSize(),
                'processing_status' => PaperStatus::UPLOADED,
            ]);
        } catch (Throwable $exception) {
            Storage::disk('local')->delete($path);

            throw $exception;
        }

        ParsePaperJob::dispatch($paper->id);

        return $paper;
    }
}
