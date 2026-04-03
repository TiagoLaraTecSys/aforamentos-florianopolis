<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

trait LogsAudit
{
    protected function logAudit(
        Request $request,
        string $action,
        string $entityType,
        ?int $entityId,
        ?array $beforeData = null,
        ?array $afterData = null
    ): void {
        $user = $request->user();

        AuditLog::create([
            'user_id'     => $user?->id,
            'user_name'   => $user?->name,
            'user_role'   => $user?->getRoleNames()->first(),
            'entity_type' => $entityType,
            'entity_id'   => $entityId,
            'action'      => $action,
            'before_data' => $beforeData,
            'after_data'  => $afterData,
            'ip_address'  => $request->ip(),
        ]);
    }

    protected function modelToArray(Model $model): array
    {
        return $model->toArray();
    }
}
