<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleController extends Controller
{
    public function create(Request $request)
    {
        if(!Auth::user()->is_superadmin) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'title' => 'required|unique:roles',
        ]);

        $role = Role::create([
            'title' => $request->title,
        ]);

        Log::add($request,'create-role','Created new role');

        return response()->json($role);
    }

    public function getAll(Request $request)
    {
        $roles = Role::all();

        return response()->json($roles);
    }
}
