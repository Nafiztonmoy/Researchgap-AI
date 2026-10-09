<?php

namespace App\Actions\Projects;

use App\Models\ResearchProject;
use App\Models\User;

class CreateResearchProject
{
    public function execute(User $user, array $data): ResearchProject
    {
        return $user->researchProjects()->create($data);
    }
}
