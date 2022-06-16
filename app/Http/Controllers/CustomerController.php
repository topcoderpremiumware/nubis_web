<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CustomerController extends Controller
{
    public function response($customer)
    {
        $token = $customer->createToken(str()->random(40),['customer'])->plainTextToken;
        return response()->json([
            'customer' => $customer,
            'token' => $token,
            'token_type' => 'Bearer'
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'first_name' => 'required|min:3',
            'last_name' => 'required|min:2',
            'email' => 'required|email|unique:customers',
            'password' => 'required|min:4|confirmed',
        ]);

        $customer = Customer::create([
            'first_name' => ucwords($request->first_name),
            'last_name' => ucwords($request->last_name),
            'phone' => $request->phone,
            'email' => $request->email,
            'zip_code' => $request->zip_code,
            'password' => bcrypt($request->password),
            'allow_send_emails' => $request->allow_send_emails,
            'allow_send_news' => $request->allow_send_news,
            'language' => $request->language ?? 'en'
        ]);

        return $this->response($customer);
    }

    public function login(Request $request)
    {
        $cred = $request->validate([
            'email' => 'required|email|exists:customers',
            'password' => 'required|min:4'
        ]);

        if(!Auth::guard('customer')->attempt($cred)){
            return response()->json([
                'message' => 'Unauthorized.'
            ], 401);
        }

        return $this->response(Auth::guard('customer')->user());
    }

    public function logout(Request $request)
    {
        $logs = [];
        array_push($logs,['customer check' => Auth::guard('customer')->check()]);
        array_push($logs,['customer user' => Auth::guard('customer')->user()]);
        array_push($logs,['user check' => Auth::guard('user')->check()]);
        array_push($logs,['user user' => Auth::guard('user')->user()]);
        array_push($logs,['default check' => Auth::guard()->check()]);
        array_push($logs,['default user' => Auth::guard()->user()]);
//        Auth::guard('customer')->user()->tokens()->delete();
        return response()->json([
            'message' => 'You have successfully logged out and token was successfully deleted.',
            'logs' => $logs
        ]);
    }

    public function save(Request $request)
    {
        if(!Auth::guard('customer')->user()->tokenCan('customer')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'first_name' => 'required|min:3',
            'last_name' => 'required|min:2',
            'email' => 'required|email|unique:customers,email,'.Auth::guard('customer')->user()->id,
        ]);

        $res = Customer::where('id',Auth::guard('customer')->user()->id)->update([
            'first_name' => ucwords($request->first_name),
            'last_name' => ucwords($request->last_name),
            'phone' => $request->phone,
            'email' => $request->email,
            'zip_code' => $request->zip_code,
            'allow_send_emails' => $request->allow_send_emails,
            'allow_send_news' => $request->allow_send_news,
            'language' => $request->language ?? 'en'
        ]);

        if($res){
            $customer = Customer::find(Auth::guard('customer')->user()->id);
            return response()->json($customer);
        }else{
            return response()->json(['message' => 'Customer not updated'],400);
        }
    }

    public function language(Request $request)
    {
        if(!Auth::guard('customer')->user()->tokenCan('customer')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'language' => 'required|min:2|max:2',
        ]);

        $res = Customer::where('id',Auth::guard('customer')->user()->id)->update([
            'language' => $request->language ?? 'en'
        ]);

        if($res){
            $customer = Customer::find(Auth::guard('customer')->user()->id);
            return response()->json($customer);
        }else{
            return response()->json(['message' => 'Customer not updated'],400);
        }
    }

    public function password(Request $request)
    {
        if(!Auth::guard('customer')->user()->tokenCan('customer')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'password' => 'required|min:4|confirmed',
        ]);

        $res = Customer::where('id',Auth::guard('customer')->user()->id)->update([
            'password' => bcrypt($request->password),
        ]);

        if($res){
            $customer = Customer::find(Auth::guard('customer')->user()->id);
            Auth::guard('customer')->user()->tokens()->delete();
            return $this->response($customer);
        }else{
            return response()->json(['message' => 'Customer not updated'],400);
        }
    }

    public function checkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:customers',
        ]);

        return response()->json(['message' => 'Customer is exists']);
    }
}
