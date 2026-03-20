<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Cemiterio;

class CemiterioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Cemiterio::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
     $data = $request->validate([
                 'name' => 'required|string',
                 'location' => 'required|string',
                 'address' => 'required|string',
                 'totalPlots' => 'required|integer',
                 'occupiedPlots' => 'required|integer',
                 'totalQuadras' => 'required|integer',
                 'plotsPerQuadra' => 'required|integer',
                 'cemeteryType' => 'required|string',
                 'yearEstablished' => 'required|integer',
                 'areaSize' => 'required|integer',
                 'hasOssuary' => 'required|boolean',
                 'hasColumbarium' => 'required|boolean',
                 'responsibleName' => 'required|string',
                 'responsiblePhone' => 'required|string',
                 'email' => 'required|email',
                 'openingHours' => 'required|string',
                 'notes' => 'nullable|string'
             ]);

             $cemiterio = Cemiterio::create($data);

             return response()->json($cemiterio, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $cemiterio = Cemiterio::findOrFail($id);
        return response()->json($cemiterio);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $cemiterio = Cemiterio::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|string',
            'location' => 'sometimes|string',
            'address' => 'sometimes|string',
            'totalPlots' => 'sometimes|integer',
            'occupiedPlots' => 'sometimes|integer',
            'totalQuadras' => 'sometimes|integer',
            'plotsPerQuadra' => 'sometimes|integer',
            'cemeteryType' => 'sometimes|string',
            'yearEstablished' => 'sometimes|integer',
            'areaSize' => 'sometimes|integer',
            'hasOssuary' => 'sometimes|boolean',
            'hasColumbarium' => 'sometimes|boolean',
            'responsibleName' => 'sometimes|string',
            'responsiblePhone' => 'sometimes|string',
            'email' => 'sometimes|email',
            'openingHours' => 'sometimes|string',
            'notes' => 'nullable|string'
        ]);

        $cemiterio->update($data);

        return response()->json($cemiterio);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
