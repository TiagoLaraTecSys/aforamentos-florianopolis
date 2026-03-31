<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Cemiterio;
use App\Http\Requests\StoreCemiterioRequest;

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
    public function store(StoreCemiterioRequest $request)
    {
        $data = $request->validate();
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
    public function update(StoreCemiterioRequest $request, string $id)
    {
        $cemiterio = Cemiterio::findOrFail($id);

        $data = $request->validate();

        $cemiterio->update($data);

        return response()->json($cemiterio);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
       $cemiterio = Cemiterio::findOrFail($id);
       $cemiterio->delete();

       return response()->json(['message' => 'Deletado com sucesso']);
    }
}
