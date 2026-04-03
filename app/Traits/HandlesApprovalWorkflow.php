<?php

namespace App\Traits;

use App\Models\PendingOperation;
use App\Models\User;
use App\Notifications\PendingOperationCreated;
use Illuminate\Http\Request;

trait HandlesApprovalWorkflow
{
    /**
     * Roles that can execute operations immediately without approval.
     */
    protected array $privilegedRoles = ['admin', 'moderador'];

    protected function userNeedsApproval(Request $request): bool
    {
        $user = $request->user();
        if (!$user) {
            return true;
        }

        foreach ($this->privilegedRoles as $role) {
            if ($user->hasRole($role)) {
                return false;
            }
        }

        return true;
    }

    protected function createPendingOperation(
        Request $request,
        string $entityType,
        ?int $entityId,
        string $operationType,
        array $payload
    ): PendingOperation {
        $pending = PendingOperation::create([
            'entity_type'    => $entityType,
            'entity_id'      => $entityId,
            'operation_type' => $operationType,
            'payload'        => $payload,
            'status'         => 'pendente',
            'requested_by'   => $request->user()->id,
        ]);

        $this->notifyAdmins($pending, $request->user());

        return $pending;
    }

    protected function notifyAdmins(PendingOperation $pending, User $requester): void
    {
        $admins = User::role(['admin', 'moderador'])->get();

        foreach ($admins as $admin) {
            $admin->notify(new PendingOperationCreated($pending, $requester));
        }
    }
}
