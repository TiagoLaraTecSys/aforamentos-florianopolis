<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCemiterioRequest;
use App\Models\Cemiterio;
use App\Traits\HandlesApprovalWorkflow;
use App\Traits\LogsAudit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CemiterioController extends Controller
{
    use LogsAudit, HandlesApprovalWorkflow;

    public function index(): JsonResponse
    {
        return response()->json(Cemiterio::all());
    }

    public function store(StoreCemiterioRequest $request): JsonResponse
    {
        if ($this->userNeedsApproval($request)) {
            $pending = $this->createPendingOperation(
                $request,
                'cemiterio',
                null,
                'create',
                $request->validated()
            );

            return response()->json([
                'message' => 'Operação enviada para aprovação.',
                'pending' => $pending,
                'status'  => 'pendente',
            ], 202);
        }

        $cemiterio = Cemiterio::create($request->validated());

        $this->logAudit($request, 'created', 'cemiterio', $cemiterio->id, null, $cemiterio->toArray());

        return response()->json($cemiterio, 201);
    }

    public function show(string $id): JsonResponse
    {
        return response()->json(Cemiterio::findOrFail($id));
    }

    public function update(StoreCemiterioRequest $request, string $id): JsonResponse
    {
        $cemiterio = Cemiterio::findOrFail($id);

        if ($this->userNeedsApproval($request)) {
            $pending = $this->createPendingOperation(
                $request,
                'cemiterio',
                (int) $id,
                'update',
                $request->validated()
            );

            return response()->json([
                'message' => 'Operação enviada para aprovação.',
                'pending' => $pending,
                'status'  => 'pendente',
            ], 202);
        }

        $before = $cemiterio->toArray();
        $cemiterio->update($request->validated());

        $this->logAudit($request, 'updated', 'cemiterio', $cemiterio->id, $before, $cemiterio->fresh()->toArray());

        return response()->json($cemiterio);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $cemiterio = Cemiterio::findOrFail($id);

        if ($this->userNeedsApproval($request)) {
            $pending = $this->createPendingOperation(
                $request,
                'cemiterio',
                (int) $id,
                'delete',
                ['id' => (int) $id]
            );

            return response()->json([
                'message' => 'Operação enviada para aprovação.',
                'pending' => $pending,
                'status'  => 'pendente',
            ], 202);
        }

        $before = $cemiterio->toArray();
        $cemiterio->delete();

        $this->logAudit($request, 'deleted', 'cemiterio', (int) $id, $before, null);

        return response()->json(['message' => 'Cemitério excluído com sucesso.']);
    }
}
