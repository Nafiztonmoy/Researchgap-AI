<?php

namespace App\Policies;

use App\Models\ResearchProject;
use App\Models\User;

class ResearchProjectPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ResearchProject $researchProject): bool
    {
        return $user->id === $researchProject->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, ResearchProject $researchProject): bool
    {
        return $user->id === $researchProject->user_id;
    }

    public function delete(User $user, ResearchProject $researchProject): bool
    {
        return $user->id === $researchProject->user_id;
    }

    public function restore(User $user, ResearchProject $researchProject): bool
    {
        return false;
    }

    public function forceDelete(User $user, ResearchProject $researchProject): bool
    {
        return false;
    }
}
