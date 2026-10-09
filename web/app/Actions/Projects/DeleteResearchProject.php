<?php

namespace App\Actions\Projects;

use App\Models\ResearchProject;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DeleteResearchProject
{
    public function execute(ResearchProject $researchProject): void
    {
        $researchProject->loadMissing('papers');

        DB::transaction(function () use ($researchProject): void {
            foreach ($researchProject->papers as $paper) {
                Storage::disk($paper->file_disk)->delete($paper->file_path);
            }

            $researchProject->delete();
        });
    }
}
