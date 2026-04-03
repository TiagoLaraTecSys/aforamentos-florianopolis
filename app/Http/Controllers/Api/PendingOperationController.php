<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Burial;
use App\Models\Cemiterio;
use App\Models\Lease;
use App\Models\PendingOperation;
use App\Traits\LogsAudit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PendingOperationController extends Controller
{
    use LogsAudit;

    public function index(Request $request): JsonResponse
    {
        $query = PendingOperation::with(['requester', 'reviewer'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('entity_type')) {
            $query->where('entity_type', $request->entity_type);
        }

        return response()->json($query->paginate($request->get('per_page', 15)));
    }

    public function approve(Request $request, PendingOperation $pendingOperation): JsonResponse
    {
        if ($pendingOperation->status !== 'pendente') {
            return response()->json(['message' => 'Esta operação já foi revisada.'], 422);
        }

        $result = $this->applyOperation($pendingOperation);

        $pendingOperation->update([
            'status'      => 'aprovado',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $this->logAudit(
            $request,
            'approved',
            $pendingOperation->entity_type,
            $pendingOperation->entity_id ?? ($result['id'] ?? null),
            null,
            array_merge($pendingOperation->payload, ['pending_operation_id' => $pendingOperation->id])
        );

        return response()->json([
            'message'   => 'Operação aprovada e executada com sucesso.',
            'result'    => $result,
            'operation' => $pendingOperation->fresh(['requester', 'reviewer']),
        ]);
    }

    public function reject(Request $request, PendingOperation $pendingOperation): JsonResponse
    {
        $request->validate([
            'rejection_reason' => 'nullable|string|max:1000',
        ]);

        if ($pendingOperation->status !== 'pendente') {
            return response()->json(['message' => 'Esta operação já foi revisada.'], 422);
        }

        $pendingOperation->update([
            'status'           => 'rejeitado',
            'reviewed_by'      => $request->user()->id,
            'reviewed_at'      => now(),
            'rejection_reason' => $request->rejection_reason,
        ]);

        $this->logAudit(
            $request,
            'rejected',
            $pendingOperation->entity_type,
            $pendingOperation->entity_id,
            null,
            ['pending_operation_id' => $pendingOperation->id, 'reason' => $request->rejection_reason]
        );

        return response()->json([
            'message'   => 'Operação rejeitada.',
            'operation' => $pendingOperation->fresh(['requester', 'reviewer']),
        ]);
    }

    private function applyOperation(PendingOperation $operation): array
    {
        $modelMap = [
            'burial'    => Burial::class,
            'lease'     => Lease::class,
            'cemiterio' => Cemiterio::class,
        ];

        $modelClass = $modelMap[$operation->entity_type] ?? null;

        if (!$modelClass) {
            return ['error' => 'Tipo de entidade desconhecido.'];
        }

        return match ($operation->operation_type) {
            'create' => $this->applyCreate($modelClass, $operation->payload),
            'update' => $this->applyUpdate($modelClass, $operation->entity_id, $operation->payload),
            'delete' => $this->applyDelete($modelClass, $operation->entity_id),
            default  => ['error' => 'Tipo de operação desconhecido.'],
        };
    }

    private function applyCreate(string $modelClass, array $payload): array
    {
        $model = $modelClass::create($payload);
        return $model->toArray();
    }

    private function applyUpdate(string $modelClass, int $entityId, array $payload): array
    {
        $model = $modelClass::findOrFail($entityId);
        $model->update($payload);
        return $model->fresh()->toArray();
    }

    private function applyDelete(string $modelClass, int $entityId): array
    {
        $model = $modelClass::findOrFail($entityId);
        $model->delete();
        return ['deleted_id' => $entityId];
    }
}
