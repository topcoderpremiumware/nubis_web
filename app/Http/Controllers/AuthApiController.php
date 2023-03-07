<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthApiController extends Controller
{
    public function response($user)
    {
        $token = $user->createToken(str()->random(40),['admin'])->plainTextToken;
        return response()->json([
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer'
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'first_name' => 'required|min:3',
            'last_name' => 'required|min:2',
            'email' => 'required|email|unique:users',
            'phone' => 'required',
            'password' => 'required|min:4|confirmed',
        ]);

        $user = User::create([
            'name' => ucwords($request->first_name.' '.$request->last_name),
            'first_name' => ucwords($request->first_name),
            'last_name' => ucwords($request->last_name),
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => bcrypt($request->password),
            'language' => $request->language ?? 'en'
        ]);

        return $this->response($user);
    }

    public function login(Request $request)
    {
        $cred = $request->validate([
            'email' => 'required|email|exists:users',
            'password' => 'required|min:4'
        ]);

        if(!Auth::attempt($cred)){
            return response()->json([
                'message' => 'Unauthorized.'
            ], 401);
        }

        Log::add($request,'login','Logged in');

        return $this->response(Auth::user());
    }

    public function logout(Request $request)
    {
        Log::add($request,'logout','Logged out');

        Auth::user()->tokens()->delete();
        return response()->json([
           'message' => 'You have successfully logged out and token was successfully deleted.'
        ]);
    }

    public function save(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'first_name' => 'required|min:3',
            'last_name' => 'required|min:2',
            'email' => 'required|email|unique:users,email,'.Auth::user()->id,
            'phone' => 'required',
        ]);

        $res = User::where('id',Auth::user()->id)->update([
            'name' => ucwords($request->first_name.' '.$request->last_name),
            'first_name' => ucwords($request->first_name),
            'last_name' => ucwords($request->last_name),
            'email' => $request->email,
            'phone' => $request->phone,
            'language' => $request->language ?? 'en'
        ]);

        Log::add($request,'save-user','Saved user data');

        if($res){
            $user = User::find(Auth::user()->id);
            return response()->json($user);
        }else{
            return response()->json(['message' => 'User not updated'],400);
        }
    }

    public function language(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'language' => 'required|min:2|max:2',
        ]);

        $res = User::where('id',Auth::user()->id)->update([
            'language' => $request->language ?? 'en'
        ]);

        Log::add($request,'language-user','Changed user language');

        if($res){
            $user = User::find(Auth::user()->id);
            return response()->json($user);
        }else{
            return response()->json(['message' => 'User not updated'],400);
        }
    }

    public function password(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'password' => 'required|min:4|confirmed',
        ]);

        $res = User::where('id',Auth::user()->id)->update([
            'password' => bcrypt($request->password),
        ]);

        Log::add($request,'password-user','Changed user password');

        if($res){
            $user = User::find(Auth::user()->id);
            Auth::user()->tokens()->delete();
            return $this->response($user);
        }else{
            return response()->json(['message' => 'User not updated'],400);
        }
    }

    public function setRole(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'role_id' => 'required',
            'place_id' => 'required|exists:places,id',
            'email' => 'required'
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        if(!Auth::user()->hasRole('admin',$request->place_id)){
            return response()->json([
                'message' => 'Only admin can set role.'
            ], 403);
        }

        $user = User::where('email',$request->email)->first();
        if(!$user){
            $text = 'You have been invited to register on the website '.env('APP_NAME').'. To register, you can follow the link '.env('APP_URL').'/admin/register';
            \Illuminate\Support\Facades\Mail::html($text, function($msg) use ($request) {
                $msg->to($request->email)->subject('Invitation to registration');
            });
            return response()->json([
                'message' => 'This email is not registered, so a letter was sent to register.'
            ], 400);
        }

        if($user->is_superadmin){
            return response()->json([
                'message' => 'This user is protected'
            ], 403);
        }

        if($user->id == Auth::user()->id){
            return response()->json([
                'message' => 'Forbidden to change yourself'
            ], 403);
        }

        Log::add($request,'role-user','Changed user #'.$user->id.' role '.json_encode($request->role_id).' in place #'.$request->place_id);

        $user->places()->syncWithoutDetaching([$request->place_id]);
        $user->roles()
            ->wherePivot('place_id',$request->place_id)
            ->syncWithPivotValues([$request->role_id], ['place_id' => $request->place_id]);
        return response()->json(['message' => 'Role are set']);
    }

    public function getRole(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $roles = Auth::user()->roles()
            ->wherePivot('place_id',$request->place_id)
            ->get();
        return response()->json($roles);
    }

    public function deleteRole(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
            'email' => 'required'
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        if(!Auth::user()->hasRole('admin',$request->place_id)){
            return response()->json([
                'message' => 'Only admin can set role.'
            ], 403);
        }

        $user = User::where('email',$request->email)->first();
        if(!$user){
            return response()->json([
                'message' => 'This email is not registered'
            ], 400);
        }

        if($user->is_superadmin){
            return response()->json([
                'message' => 'This user is protected'
            ], 403);
        }

        Log::add($request,'delete-role-user','Deleted user #'.$user->id.' role '.json_encode($user->roles[0]->id).' in place #'.$request->place_id);

        $user->places()->detach($request->place_id);
        $user->roles()
            ->wherePivot('place_id',$request->place_id)
            ->syncWithPivotValues([], ['place_id' => $request->place_id]);
        return response()->json(['message' => 'Role are deleted']);
    }
}
