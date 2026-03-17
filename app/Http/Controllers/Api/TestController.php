<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TestController extends Controller
{
        public function index()
        {
            return response()->json([
                'message' => 'API funcionando 🚀'
            ]);
        }

        public function store(Request $request)
        {
            return response()->json([
                'received' => $request->all()
            ]);
        }
}
