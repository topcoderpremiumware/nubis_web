<?php

namespace App\Http\Controllers;

use App\Helpers\TemplateHelper;
use App\Models\Customer;
use App\Models\Log;
use App\Models\MessageTemplate;
use App\Models\Order;
use App\Models\Organization;
use App\Models\Place;
use App\Models\Role;
use App\Models\Tableplan;
use App\Models\User;
use App\SMS\SMS;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PlaceController extends Controller
{
    public function create(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'name' => 'required',
            'country_id' => 'required|exists:countries,id'
        ]);

        $organization_id = null;
        if($request->has('organization_name') && $request->organization_name){
            $organization = Organization::create(['name' => $request->organization_name]);
            $organization_id = $organization->id;
        }else{
            $place = Place::whereHas('users',function (Builder $q) {
                $q->whereIn('id',Auth::user()->id);
            })->whereNotNull('organization_id')->first();
            if(!$place){
                return response()->json([
                    'message' => 'Organization name is not set'
                ], 400);
            }
            $organization_id = $place->organization_id;
        }

        $place = Place::create([
            'name' => $request->name,
            'address' => $request->address ?? '',
            'city' => $request->city ?? '',
            'zip_code' => $request->zip_code ?? '',
            'phone' => $request->phone ?? '',
            'email' => $request->email ?? '',
            'home_page' => $request->home_page ?? '',
            'country_id' => $request->country_id,
            'tax_number' => $request->tax_number,
            'organization_id' => $organization_id
        ]);

        MessageTemplate::seedPlace($place->id);

        Auth::user()->places()->attach($place->id);
        $role = Role::firstOrCreate([
            'title' => 'admin'
        ]);
        Auth::user()->roles()
        ->wherePivot('place_id',$place->id)
        ->syncWithPivotValues([$role->id], ['place_id' => $place->id]);

        //Attach superadmin to this place as admin
        $superadmins = User::where('is_superadmin',1)->get();
        if(count($superadmins) > 0){
            foreach ($superadmins as $superadmin){
                if($superadmin->id !== Auth::user()->id){
                    $superadmin->places()->attach($place->id);
                    $superadmin->roles()
                        ->wherePivot('place_id',$place->id)
                        ->syncWithPivotValues([$role->id], ['place_id' => $place->id]);
                }
            }
        }

        Log::add($request,'create-place','Created place #'.$place->id);

        return response()->json($place);
    }

    public function save($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'name' => 'required',
            'country_id' => 'required|exists:countries,id'
        ]);

        if(!Auth::user()->places->contains($id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $res = Place::find($id)->update([
            'name' => $request->name,
            'address' => $request->address ?? '',
            'city' => $request->city ?? '',
            'zip_code' => $request->zip_code ?? '',
            'phone' => $request->phone ?? '',
            'email' => $request->email ?? '',
            'home_page' => $request->home_page ?? '',
            'country_id' => $request->country_id,
            'tax_number' => $request->tax_number
        ]);

        Log::add($request,'change-place','Changed place #'.$id);

        if($res){
            $place = Place::find($id);
            return response()->json($place);
        }else{
            return response()->json(['message' => 'Place not updated'],400);
        }
    }

    public function getAll(Request $request)
    {
        $places = Place::all();

        return response()->json($places);
    }

    public function getAllMine(Request $request)
    {
        $places = Auth::user()->places;

        return response()->json($places);
    }

    public function getId($id, Request $request)
    {
//        if(!Auth::user()->places->contains($id)){
//            return response()->json([
//                'message' => 'It\'s not your place'
//            ], 400);
//        }

        $place = Place::find($request->id);

        return response()->json($place);
    }

    public function getCustomers($place_id, Request $request)
    {
        $customers = Customer::whereIn('id', function($query) use ($place_id){
            $query->select('customer_id')
                ->from(with(new Order)->getTable())
                ->where('place_id', $place_id);
        })->get();

        return response()->json($customers);
    }

    public function getUsers($place_id, Request $request)
    {
        $place = Place::find($place_id);
        $users = $place->users()
            ->with(['roles' => function($q) use ($place_id) {
                $q->where('place_id',$place_id);
            }])
            ->get();

        return response()->json($users);
    }

    public function isBillPaid($place_id, Request $request)
    {
        $place = Place::find($request->place_id);
        return response()->json($place->is_bill_paid());
    }

    public function getBillPaidStatus($place_id, Request $request)
    {
        $place = Place::find($request->place_id);

        if(!$place->organization) return response()->json(['status' => 'none']);

        $bill = $place->organization->paid_bills()->orderByDesc('expired_at')->first();

        if(!$bill){
            $status = 'none';
        }else{
            if($bill->expired_at > \Carbon\Carbon::now()){
                $status = 'paid';
            }else{
                $status = 'expired';
            }
        }
        return response()->json(['status' => $status]);
    }

    public function isTrialBillPaid($place_id, Request $request)
    {
        $place = Place::find($request->place_id);
        $trial_bill = $place->paid_bills()->where('product_name','Trial')->first();

        return response()->json(boolval($trial_bill));
    }

    public function sendSupport(Request $request)
    {
        $request->validate([
            'subject' => 'required',
            'message' => 'required',
            'place_id' => 'required'
        ]);

        $superadmins = User::where('is_superadmin',1)->get();
        if(count($superadmins) > 0){
            foreach ($superadmins as $superadmin){
                if($superadmin->id !== Auth::user()->id){
                    \Illuminate\Support\Facades\Mail::html($request->message, function($msg) use ($request, $superadmin) {
                        $msg->to($superadmin->email)->subject('Place ID: '.$request->place_id.' '.$request->subject);
                    });
                }
            }
        }
    }

    public function sendContact($place_id, Request $request)
    {
        $request->validate([
            'message' => 'required'
        ]);
        $place = Place::find($place_id);
        $smsApiToken = $place->setting('sms-api-token');
        $customer_name = Auth::user()->first_name.' '.Auth::user()->last_name.' ('.Auth::user()->id.')';
        $sms_notification_number = $place->setting('sms-notification-number') ?? $place->phone;
        if($smsApiToken){
            $result = SMS::send([$sms_notification_number], $customer_name.': '.$request->message, env('APP_SHORT_NAME'), $smsApiToken);
        }
        \Illuminate\Support\Facades\Mail::html($request->message.'<br><br>Phone: '.Auth::user()->phone.'<br>Email: '.Auth::user()->email, function($msg) use ($customer_name, $place, $request) {
            $msg->to($place->email)->subject('Customer Message: '.$customer_name);
        });
    }

    public function getAlternative($place_id, Request $request)
    {
        $place = Place::find($place_id);

        $places = $place->organization->places()
            ->where('id','!=',$place_id)
            ->get();

        return response()->json($places);
    }

    public function getMaxAvailableSeats($place_id, Request $request)
    {
        $place = Place::find($place_id);
        $tableplans = $place->tableplans;
        $seats = [0];
        foreach ($tableplans as $tableplan) {
            $tables = $tableplan->getTables();
            foreach ($tables as $table) {
                $seats[] = $table['seats'];
            }
            $groups = $tableplan->getTableGroups();
            foreach ($groups as $group) {
                $seats[] = $group['seats'];
            }
        }
        return response()->json(max($seats));
    }
}
