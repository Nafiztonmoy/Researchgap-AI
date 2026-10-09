<?php

namespace App\Actions\Projects;

use App\Models\ResearchProject;

class UpdateResearchProject
{
    public function execute(
        ResearchProject $researchProject,
        array $data
    ): ResearchProject {
        $researchProject->update($data);

        return $researchProject->refresh();
    }
}
