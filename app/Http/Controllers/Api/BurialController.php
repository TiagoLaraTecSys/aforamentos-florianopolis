<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBurialRequest;
use App\Models\Burial;
use App\Traits\HandlesApprovalWorkflow;
use App\Traits\LogsAudit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BurialController extends Controller
{
    use LogsAudit, HandlesApprovalWorkflow;

    public function index(Request $request): JsonResponse
    {
        $query = Burial::with('cemetery');

        if ($request->filled('cemetery_id')) {
            $query->where('cemetery_id', $request->cemetery_id);
        }

        if ($request->filled('deceased_name')) {
            $query->where('deceased_name', 'like', '%' . $request->deceased_name . '%');
        }

        if ($request->filled('burial_type')) {
            $query->where('burial_type', $request->burial_type);
        }

        if ($request->filled('current_status')) {
            $query->where('current_status', $request->current_status);
        }

        $perPage = $request->get('per_page', 15);

        return response()->json($query->orderBy('id', 'desc')->paginate($perPage));
    }

    public function store(StoreBurialRequest $request): JsonResponse
    {
        if ($this->userNeedsApproval($request)) {
            $pending = $this->createPendingOperation(
                $request,
                'burial',
                null,
                'create',
                $request->validated()
            );

            return response()->json([
                'message'   => 'Operação enviada para aprovação.',
                'pending'   => $pending,
                'status'    => 'pendente',
            ], 202);
        }

        $burial = Burial::create($request->validated());

        $this->logAudit($request, 'created', 'burial', $burial->id, null, $burial->toArray());

        return response()->json($burial->load('cemetery'), 201);
    }

    public function show(Burial $burial): JsonResponse
    {
        return response()->json($burial->load('cemetery'));
    }

    public function update(StoreBurialRequest $request, Burial $burial): JsonResponse
    {
        if ($this->userNeedsApproval($request)) {
            $pending = $this->createPendingOperation(
                $request,
                'burial',
                $burial->id,
                'update',
                $request->validated()
            );

            return response()->json([
                'message' => 'Operação enviada para aprovação.',
                'pending' => $pending,
                'status'  => 'pendente',
            ], 202);
        }

        $before = $burial->toArray();
        $burial->update($request->validated());

        $this->logAudit($request, 'updated', 'burial', $burial->id, $before, $burial->fresh()->toArray());

        return response()->json($burial->load('cemetery'));
    }

    public function destroy(Request $request, Burial $burial): JsonResponse
    {
        if ($this->userNeedsApproval($request)) {
            $pending = $this->createPendingOperation(
                $request,
                'burial',
                $burial->id,
                'delete',
                ['id' => $burial->id]
            );

            return response()->json([
                'message' => 'Operação enviada para aprovação.',
                'pending' => $pending,
                'status'  => 'pendente',
            ], 202);
        }

        $before = $burial->toArray();
        $burial->delete();

        $this->logAudit($request, 'deleted', 'burial', $burial->id, $before, null);

        return response()->json(['message' => 'Sepultamento excluído com sucesso.']);
    }
}
