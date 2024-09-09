<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Check;
use App\Models\Log;
use App\Models\ProductCategory;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CheckController extends Controller
{
    public function create(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'order_id' => 'required|exists:orders,id',
            'status' => 'required',
            'subtotal' => 'required',
            'total' => 'required'
        ]);

        if(!Auth::user()->places->contains($request->place_id)) abort(400, 'It\'s not your place');

        $check = Check::create([
            'name' => $request->name,
            'place_id' => $request->place_id,
            'order_id' => $request->order_id,
            'status' => $request->status,
            'subtotal' => $request->subtotal,
            'total' => $request->total,
            'discount' => $request->discount,
            'discount_name' => $request->discount_name,
            'discount_type' => $request->discount_type,
            'discount_code' => $request->discount_code,
            'payment_method' => $request->payment_method
        ]);

        if($request->has('products')){
            $sync_array = [];
            foreach ($request->products as $product) {
                $sync_array[$product['id']] = [
                    'price' => $product['pivot']['price'],
                    'quantity' => $product['pivot']['quantity']
                ];
            }
            $check->products()->sync($sync_array);
        }

        Log::add($request,'create-check','Created check #'.$check->id);

        return response()->json($check);
    }

    public function save($id, Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'order_id' => 'required|exists:orders,id',
            'status' => 'required',
            'subtotal' => 'required',
            'total' => 'required'
        ]);

        $check = Check::find($id);
        if($check->status == 'closed') abort(400, 'This cart is closed');

        if(!Auth::user()->places->contains($request->place_id) ||
            !Auth::user()->places->contains($check->place_id)) abort(400, 'It\'s not your place');

        $res = $check->update([
            'name' => $request->name,
            'place_id' => $request->place_id,
            'order_id' => $request->order_id,
            'status' => $request->status,
            'subtotal' => $request->subtotal,
            'total' => $request->total,
            'discount' => $request->discount,
            'discount_name' => $request->discount_name,
            'discount_type' => $request->discount_type,
            'discount_code' => $request->discount_code,
            'payment_method' => $request->payment_method
        ]);

        if($request->has('products')){
            $sync_array = [];
            foreach ($request->products as $product) {
                $sync_array[$product['id']] = [
                    'price' => $product['pivot']['price'],
                    'quantity' => $product['pivot']['quantity']
                ];
            }
            $check->products()->sync($sync_array);
        }

        Log::add($request,'change-check','Changed check #'.$id);

        if($res){
            $check = Check::find($id);
            return response()->json($check);
        }else{
            return response()->json(['message' => 'Product category not updated'],400);
        }
    }

    public function getAllByOrder($order_id, Request $request)
    {
        $checks = Check::with('products')
            ->where('order_id',$order_id)
            ->get();

        return response()->json($checks);
    }

    public function print($id, Request $request)
    {
        $check = Check::find($id);
        $check->status = 'closed';
        $check->save();

        $html = view('pdfs.check', compact('check'))->render();
        $options = new Options();
        $options->set('enable_remote', TRUE);
        $options->set('enable_html5_parser', FALSE);
        $options->set('dpi', 72);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper([0,0,5.7/2.54*72,3000]);

        $GLOBALS['bodyHeight'] = 0;

        $dompdf->setCallbacks([
            'myCallbacks' => [
                'event' => 'end_frame', 'f' => function ($frame) {
                    $node = $frame->get_node();
                    if (strtolower($node->nodeName) === "body") {
                        $padding_box = $frame->get_padding_box();
                        $GLOBALS['bodyHeight'] += $padding_box['h'];
                    }
                }
            ]
        ]);

        $dompdf->render();
        unset($dompdf);
        $docHeight = $GLOBALS['bodyHeight'] + 30;

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper([0,0,5.7/2.54*72,$docHeight]);
        $dompdf->render();
        $dompdf->stream('check.pdf', array("Attachment" => false,'compress' => false));
    }

    public function delete($id, Request $request)
    {
        $check = Check::find($id);
        if($check->status === 'closed') abort(400, 'This cart is closed');

        if(!Auth::user()->places->contains($check->place_id)) abort(400, 'It\'s not your place');

        Log::add($request,'delete-check','Deleted check #'.$check->id);

        $check->delete();

        return response()->json(['message' => 'Check is deleted']);
    }
}
