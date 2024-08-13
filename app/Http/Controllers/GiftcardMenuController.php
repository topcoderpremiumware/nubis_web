<?php

namespace App\Http\Controllers;

use App\Models\CustomBookingLength;
use App\Models\GiftcardMenu;
use App\Models\Log;
use App\Models\Order;
use App\Models\Timetable;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class GiftcardMenuController extends Controller
{
    public function create(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
            'name' => 'required',
            'active' => 'required',
            'labels' => 'required',
            'price' => 'required'
        ]);

        if(!Auth::user()->places->contains($request->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $filename = null;

        if($request->file('image')){
            $file_upload = $request->file('image');
            $filename = 'giftcard_menu/'.$request->place_id.'/'.Carbon::now()->timestamp.'.'.$file_upload->getClientOriginalExtension();
            $content = $file_upload->getContent();
            Storage::disk('public')->put($filename,$content);
        }

        $giftcard_menu = GiftcardMenu::create([
            'place_id' => $request->place_id,
            'name' => $request->name,
            'active' => $request->active,
            'labels' => $request->labels,
            'image' => $filename,
            'price' => $request->price
        ]);

        Log::add($request,'create-giftcard_menu','Created giftcard menu #'.$giftcard_menu->id);

        return response()->json($giftcard_menu);
    }

    public function save($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $request->validate([
            'place_id' => 'required|exists:places,id',
            'name' => 'required',
            'active' => 'required',
            'labels' => 'required',
            'price' => 'required',
        ]);

        $giftcard_menu = GiftcardMenu::find($id);

        if(!Auth::user()->places->contains($request->place_id) ||
            !Auth::user()->places->contains($giftcard_menu->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $filename = null;

        if($request->file('image')){
            $file_upload = $request->file('image');
            $filename = 'giftcard_menu/'.$request->place_id.'/'.Carbon::now()->timestamp.'.'.$file_upload->getClientOriginalExtension();
            $content = $file_upload->getContent();
            Storage::disk('public')->put($filename,$content);
        }

        if(($giftcard_menu->image && $filename && $giftcard_menu->image != $filename) || $request->has('remove_image')){
            Storage::disk('public')->delete($giftcard_menu->image);
        }

        if($request->has('remove_image')){
            $giftcard_menu->image = null;
        }

        $res = $giftcard_menu->update([
            'place_id' => $request->place_id,
            'name' => $request->name,
            'active' => $request->active,
            'labels' => $request->labels,
            'image' => $filename ? $filename : $giftcard_menu->image,
            'price' => $request->price
        ]);

        Log::add($request,'change-giftcard_menu','Changed giftcard menu #'.$id);

        if($res){
            $giftcard_menu = GiftcardMenu::find($id);
            return response()->json($giftcard_menu);
        }else{
            return response()->json(['message' => 'Giftcard menu not updated'],400);
        }
    }

    public function delete($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) return response()->json([
            'message' => 'Unauthorized.'
        ], 401);

        $giftcard_menu = GiftcardMenu::find($id);

        if(!Auth::user()->places->contains($giftcard_menu->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        if($giftcard_menu->image){
            Storage::disk('public')->delete($giftcard_menu->image);
        }

        Log::add($request,'delete-giftcard_menu','Deleted giftcard menu #'.$giftcard_menu->id);

        $giftcard_menu->delete();

        return response()->json(['message' => 'Giftcard menu is deleted']);
    }

    public function getId($id, Request $request)
    {
        $giftcard_menu = GiftcardMenu::find($id);

        if(!Auth::user()->places->contains($giftcard_menu->place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        return response()->json($giftcard_menu);
    }

    public function getAllByPlace($place_id, Request $request)
    {
        if(!Auth::user()->places->contains($place_id)){
            return response()->json([
                'message' => 'It\'s not your place'
            ], 400);
        }

        $giftcard_menus = GiftcardMenu::where('place_id',$place_id)->get();

        return response()->json($giftcard_menus);
    }

    public function getAllByParams(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id'
        ]);

        $giftcard_menus = GiftcardMenu::where('place_id',$request->place_id)
            ->where('active',1)
            ->get();

        return response()->json($giftcard_menus);
    }
}
