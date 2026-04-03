<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeaseRequest;
use App\Models\Lease;
use App\Traits\HandlesApprovalWorkflow;
use App\Traits\LogsAudit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaseController extends Controller
{
    use LogsAudit, HandlesApprovalWorkflow;

    public function index(Request $request): JsonResponse
    {
        $query = Lease::with('cemetery');

        if ($request->filled('cemetery_id')) {
            $query->where('cemetery_id', $request->cemetery_id);
        }

        if ($request->filled('leaseholder_name')) {
            $query->where('leaseholder_name', 'like', '%' . $request->leaseholder_name . '%');
        }

        if ($request->filled('lease_type')) {
            $query->where('lease_type', $request->lease_type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->get('per_page', 15);

        return response()->json($query->orderBy('id', 'desc')->paginate($perPage));
    }

    public function store(StoreLeaseRequest $request): JsonResponse
    {
        if ($this->userNeedsApproval($request)) {
            $pending = $this->createPendingOperation(
                $request,
                'lease',
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

        $lease = Lease::create($request->validated());

        $this->logAudit($request, 'created', 'lease', $lease->id, null, $lease->toArray());

        return response()->json($lease->load('cemetery'), 201);
    }

    public function show(Lease $lease): JsonResponse
    {
        return response()->json($lease->load('cemetery'));
    }

    public function update(StoreLeaseRequest $request, Lease $lease): JsonResponse
    {
        if ($this->userNeedsApproval($request)) {
            $pending = $this->createPendingOperation(
                $request,
                'lease',
                $lease->id,
                'update',
                $request->validated()
            );

            return response()->json([
                'message' => 'Operação enviada para aprovação.',
                'pending' => $pending,
                'status'  => 'pendente',
            ], 202);
        }

        $before = $lease->toArray();
        $lease->update($request->validated());

        $this->logAudit($request, 'updated', 'lease', $lease->id, $before, $lease->fresh()->toArray());

        return response()->json($lease->load('cemetery'));
    }

    public function destroy(Request $request, Lease $lease): JsonResponse
    {
        if ($this->userNeedsApproval($request)) {
            $pending = $this->createPendingOperation(
                $request,
                'lease',
                $lease->id,
                'delete',
                ['id' => $lease->id]
            );

            return response()->json([
                'message' => 'Operação enviada para aprovação.',
                'pending' => $pending,
                'status'  => 'pendente',
            ], 202);
        }

        $before = $lease->toArray();
        $lease->delete();

        $this->logAudit($request, 'deleted', 'lease', $lease->id, $before, null);

        return response()->json(['message' => 'Aforamento excluído com sucesso.']);
    }
}
