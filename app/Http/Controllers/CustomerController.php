<?php

namespace App\Http\Controllers;

use App\Models\BlackList;
use App\Models\Customer;
use App\Models\Log;
use App\Models\Order;
use App\Models\User;
use App\Notifications\PasswordResetNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use mysql_xdevapi\Exception;

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
            'phone' => 'required',
//            'email' => 'email|unique:customers',
            'password' => 'min:4|confirmed',
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
        if(Auth::guard('customer')->user()){
            Auth::guard('customer')->user()->tokens()->delete();
            Auth::guard('customer')->logout();
        }
        if(Auth::guard('user')->user()){
            Auth::guard('user')->user()->tokens()->delete();
            Auth::guard('user')->logout();
        }
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return response()->json([
            'message' => 'You have successfully logged out and token was successfully deleted.'
        ]);
    }

    public function save(Request $request)
    {
        if(!Auth::user()->tokenCan('customer')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'first_name' => 'required|min:3',
            'last_name' => 'required|min:2',
            'email' => 'required|email|unique:customers,email,'.Auth::user()->id,
        ]);

        $res = Customer::where('id',Auth::user()->id)->update([
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
            $customer = Customer::find(Auth::user()->id);
            return response()->json($customer);
        }else{
            return response()->json(['message' => 'Customer not updated'],400);
        }
    }

    public function language(Request $request)
    {
        if(!Auth::user()->tokenCan('customer')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'language' => 'required|min:2|max:2',
        ]);

        $res = Customer::where('id',Auth::user()->id)->update([
            'language' => $request->language ?? 'en'
        ]);

        if($res){
            $customer = Customer::find(Auth::user()->id);
            return response()->json($customer);
        }else{
            return response()->json(['message' => 'Customer not updated'],400);
        }
    }

    public function password(Request $request)
    {
        if(!Auth::user()->tokenCan('customer')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'password' => 'required|min:4|confirmed',
        ]);

        $res = Customer::where('id',Auth::user()->id)->update([
            'password' => bcrypt($request->password),
        ]);

        if($res){
            $customer = Customer::find(Auth::user()->id);
            Auth::user()->tokens()->delete();
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

    public function allCustomers(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id'
        ]);

        $order_customers = Order::select('customer_id')
            ->where('place_id',$request->place_id)
            ->whereNotNull('customer_id')
            ->groupBy('customer_id')
            ->pluck('customer_id');

        $customers = Customer::whereIn('id',$order_customers);

        if($request->has('first_name') && $request->first_name){
            $customers = $customers->where('first_name','like','%'.$request->first_name.'%');
        }

        if($request->has('last_name') && $request->last_name){
            $customers = $customers->where('last_name','like','%'.$request->last_name.'%');
        }

        if($request->has('email') && $request->email){
            $customers = $customers->where('email','like','%'.$request->email.'%');
        }

        if($request->has('phone') && $request->phone){
            $customers = $customers->where('phone','like','%'.$request->phone.'%');
        }

        $customers = $customers->get();

        return response()->json($customers);
    }

    public function getByEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $customer = Customer::whereEmail($request->email)->first();

        return response()->json($customer);
    }

    public function forgot(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $user = Customer::where('email',$request->email)->first();
        if(!$user || !$user->email){
            return response()->json(['message' => 'Email not found'],400);
        }

        $token = str_pad(random_int(1, 9999),4,'0',STR_PAD_LEFT);

        $password_reset = DB::table('password_resets')->where('email',$request->email)->first();
        if($password_reset){
            DB::table('password_resets')->where('email',$request->email)->update(['token' => $token]);
        }else{
            DB::table('password_resets')->insert(['email' => $request->email,'token' => $token]);
        }

        $user->notify(new PasswordResetNotification($user,$token,'customer'));

        return response()->json([
            'message' => 'A code has been sent to your email address.'
        ]);
    }

    public function reset(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required',
            'password' => 'required|min:4|confirmed'
        ]);

        $user = Customer::where('email',$request->email)->first();
        if(!$user || !$user->email){
            return response()->json(['message' => 'Email not found'],400);
        }

        $password_reset = DB::table('password_resets')->where('email',$request->email)->first();

        if(!$password_reset || $password_reset->token != $request->token){
            return response()->json(['message' => 'Token mismatch'],400);
        }

        $user->fill(['password' => bcrypt($request->password)]);
        $user->save();

        $user->tokens()->delete();
        DB::table('password_resets')->where('email',$request->email)->delete();

        return $this->response($user);
    }

    public function addBlackList($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id'
        ]);

        if(!Auth::user()->is_superadmin && !Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $black_list = BlackList::create([
            'customer_id' => $id,
            'place_id' => $request->place_id,
        ]);

        Log::add($request,'added-customer-black_list','Added customer #'.$id.' to the black list of the place #'.$request->place_id);

        return response()->json(['message' => 'Customer added to the black list']);
    }

    public function removeBlackList($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id'
        ]);

        if(!Auth::user()->is_superadmin && !Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        Log::add($request,'removed-customer-black_list','Removed customer #'.$id.' to the black list of the place #'.$request->place_id);

        BlackList::where('customer_id',$id)
            ->where('place_id',$request->place_id)
            ->delete();

        return response()->json(['message' => 'Customer removed from the black list']);
    }
}
