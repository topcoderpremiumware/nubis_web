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
                $q->where('id',Auth::user()->id);
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
            'organization_id' => $organization_id,
            'language' => $request->language
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

        if(!Auth::user()->is_superadmin && !Auth::user()->places->contains($id)){
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
            'tax_number' => $request->tax_number,
            'language' => $request->language
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
        if(Auth::user()->is_superadmin){
            $places = Place::all();
        }else{
            $places = Auth::user()->places;
        }

        return response()->json($places);
    }

    public function getId($id, Request $request)
    {
//        if(!Auth::user()->is_superadmin && !Auth::user()->places->contains($id)){
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
        return response()->json($place->is_bill_paid(['booking','pos','pos_terminal','giftcards']));
    }

    public function getPaidMessages($place_id, Request $request)
    {
        $place = Place::find($request->place_id);
        if($place){
            $sms_limit_count = $place->setting('sms_limit_count') ?? 0;
        }else{
            $sms_limit_count = 0;
        }

        return response()->json(['count' => $sms_limit_count]);
    }

    public function getBillPaidStatus($place_id, Request $request)
    {
        $place = Place::find($request->place_id);

        if(!$place) return response()->json(['status' => 'none']);

        $bill = $place->paid_bills()->orderByDesc('expired_at')->first();

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

//        $superadmins = User::where('is_superadmin',1)->get();
//        if(count($superadmins) > 0){
//            foreach ($superadmins as $superadmin){
//                if($superadmin->id !== Auth::user()->id){
                    try{
                        \Illuminate\Support\Facades\Mail::html($request->message, function($msg) use ($request) {
                            $msg->to('support@nubisreservation.com')->subject('Place ID: '.$request->place_id.' '.$request->subject);
                        });
                    }catch (\Exception $e){}
//                }
//            }
//        }
    }

    public function sendContact($place_id, Request $request)
    {
        $request->validate([
            'message' => 'required',
            'first_name' => 'required',
            'last_name' => 'required',
            'email' => 'required',
            'phone' => 'required'
        ]);
        $place = Place::find($place_id);
        $customer_name = $request->first_name.' '.$request->last_name;

        if($place->setting('sms-notification-number')){
            $sms_notification_numbers = explode(',',$place->setting('sms-notification-number'));
        }else{
            $sms_notification_numbers = [$place->phone];
        }
        foreach ($sms_notification_numbers as $number) {
            if($place->allow_send_sms()){
                $place->decrease_sms_limit();
                $result = SMS::send([$number], $customer_name.': '.$request->message."\nPhone: ".$request->phone."\nEmail: ".$request->email, env('APP_SHORT_NAME'));
            }
        }

        try{
            \Illuminate\Support\Facades\Mail::html($request->message.'<br><br>Phone: '.$request->phone.'<br>Email: '.$request->email, function($msg) use ($customer_name, $place, $request) {
                $msg->to($place->email)->subject('Customer Message: '.$customer_name);
            });
        }catch (\Exception $e){

        }
    }

    public function sendtoAdmin(Request $request)
    {
        $request->validate([
            'first_name' => 'required',
            'last_name' => 'required',
            'email' => 'required|email',
            'phone' => 'required',
            'message' => 'required'
        ]);
        try{
            \Illuminate\Support\Facades\Mail::html($request->message.'<br><br>First name: '.$request->first_name.'<br>Last name: '.$request->last_name.'<br>Phone: '.$request->phone.'<br>Email: '.$request->email, function($msg) use ($request) {
                $msg->to(env('MAIL_FROM_ADDRESS'))->subject('Contact Message: '.$request->first_name.' '.$request->last_name);
            });
        }catch (\Exception $e){}
        return back()->with('status', 'The message was sent successfully');
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

        $workings = $place->timetables()
            ->whereNotNull('tableplan_id')
            ->where('status','working')
            ->get();

        $seats = [0];
        foreach ($workings as $working) {
            $tableplan = $working->tableplan;
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

    public function delete($id, Request $request)
    {
        $place = Place::find($id);

        if(!Auth::user()->is_superadmin && !Auth::user()->places->contains($id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        Log::add($request,'delete-place','Deleted place #'.$id);

        if($place->is_bill_paid(['booking','pos','pos_terminal','giftcards'])){
            try{
                \Illuminate\Support\Facades\Mail::html('The place #'.$id.' '.$place->name.' was deleted by admin. Maybe you need to unsubscribe this place from the Stripe.', function($msg) use ($id) {
                    $msg->to(env('MAIL_FROM_ADDRESS'))->subject('Place was deleted #'.$id);
                });
            }catch (\Exception $e){}
        }

        $place->delete();

        return response()->json(['message' => 'Place is deleted']);
    }
}
