<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class TestEmailController extends Controller
{
    public function test()
    {
        try {
            Mail::raw('Teste de email do Laravel - Aforamentos', function($message) {
                $message->to('laratecsys@gmail.com') // Altere para seu email
                        ->subject('Teste de Configuração de Email');
            });
            
            return response()->json([
                'success' => true,
                'message' => 'Email enviado com sucesso!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao enviar email: ' . $e->getMessage()
            ], 500);
        }
    }

    public function testForm()
    {
        return view('test-email');
    }

    public function sendTest(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'message' => 'required|string'
        ]);

        try {
            Mail::raw($request->message, function($message) use ($request) {
                $message->to($request->email)
                        ->subject('Teste de Email - Aforamentos');
            });
            
            return back()->with('success', 'Email enviado com sucesso!');
        } catch (\Exception $e) {
            return back()->with('error', 'Erro ao enviar email: ' . $e->getMessage());
        }
    }
}
