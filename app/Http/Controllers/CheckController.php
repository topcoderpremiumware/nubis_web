<?php

namespace App\Http\Controllers;

use App\Helpers\AddressHelper;
use App\Models\Check;
use App\Models\Log;
use App\Models\Place;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use App\Services\SafTService;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Collection;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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

        if($request->payment_method === 'card/cash'){
            if(!$request->has('cash_amount') || !$request->has('card_amount')){
                abort(400, 'Amount is required');
            }elseif(($request->cash_amount + $request->card_amount) != $request->total){
                abort(400, 'Payment amount is not full');
            }
        }

        if($request->has('payment_method') && $request->payment_method){
            $printed_by = User::find($request->printed_id);
            if($printed_by){
                if($printed_by->pin != $request->pin) abort(400, 'PIN code not matched');
                $check->printed_at = now()->format('Y-m-d H:i:s');
                $check->printed_id = $request->printed_id;
                $check->save();
            }else{
                abort(400, 'Cashier is not selected');
            }
        }

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
            'payment_method' => $request->payment_method,
            'cash_amount' => $request->payment_method === 'cash' ? $request->total : $request->cash_amount,
            'card_amount' => $request->payment_method === 'card' ? $request->total : $request->card_amount
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
            return response()->json(['message' => 'Check not updated'],400);
        }
    }

    public function getAllByOrder($order_id, Request $request)
    {
        $checks = Check::with('products')
            ->where('order_id',$order_id)
            ->whereIn('status',['open','closed'])
            ->get();

        return response()->json($checks);
    }

    public function print($id, Request $request)
    {
        $check = Check::find($id);
        if($check->status === 'open' && $check->printed_id){
            $check->status = 'closed';
            $check->save();
            Log::add($request,'print-first-check','Printed check first time #'.$check->id);
        }elseif($check->status === 'closed'){
            Log::add($request,'print-check','Printed check #'.$check->id);
        }

        $html = view('pdfs.check', compact('check'))->render();
        $this->generateCheckPDF($html);
    }

    public function printProducts($id, Request $request)
    {
        $request->validate([
            'products' => 'required',
        ]);

        $check = Check::find($id);
        if($request->print_type !== 'all'){
            DB::table('check_product')
                ->where('check_id', $id)
                ->whereIn('product_id', array_map(function($el){
                    return $el['id'];
                },$request->products))
                ->update(['is_printed' => 1]);
        }

        $html = view('pdfs.check_products', ['check' => $check, 'products' => $request->products, 'print_type' => $request->print_type])->render();
        $this->generateCheckPDF($html);
    }

    public function printTemplate($data, Request $request)
    {
        $data = json_decode(base64_decode($data),true);

        $text = $data['Merchant']['Optional']['ReceiptString'];
        $html = view('pdfs.check_template', compact('text'))->render();
        $this->generateCheckPDF($html);
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

    public function getAllReceipts(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
        ]);

        if(!Auth::user()->places->contains($request->place_id)) abort(400, 'It\'s not your place');

        $per_page = $request->has('per_page') ? $request->per_page : 10;

        $checks = Check::where('place_id',$request->place_id)
            ->whereIn('status',['closed','refund'])->with('order');
        if($request->has('filter_field')) {
            $checks = $checks->where($request->filter_field, 'like', $request->filter_value . '%');
        }

        if($request->has('sort_field')){
            $checks = $checks->orderBy($request->sort_field, $request->sort_value);
        }else{
            $checks = $checks->orderBy('id', 'desc');
        }

        if($request->has('from')){
            $checks = $checks->whereBetween(DB::raw('DATE(created_at)'),[$request->from,$request->to]);
        }

        $total_amount = $checks->clone()->select(DB::raw('SUM(CASE
                WHEN status = "closed" THEN total
                WHEN status = "refund" THEN -total
                ELSE 0
            END) as total_amount'))
            ->reorder()
            ->groupBy('place_id')
            ->get()
            ->pluck('total_amount');

        $checks = json_decode(json_encode($checks->paginate($per_page)->setPath('/')),true);
        $checks['total_amount'] = count($total_amount) > 0 ? $total_amount[0] : 0;
        return response()->json($checks);
    }

    public function getReceipt($id, Request $request)
    {
        $check = Check::where('id',$id)->with(['products','order','printed','refunds.products'])->first();

        if(!Auth::user()->places->contains($check->place_id)) abort(400, 'It\'s not your place');

        return response()->json($check);
    }

    public function getReceiptsReport(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'from' => 'required|date_format:Y-m-d',
            'to' => 'required|date_format:Y-m-d'
        ]);

        if(!Auth::user()->places->contains($request->place_id)) abort(400, 'It\'s not your place');

        $incomes = Check::select(DB::raw('DATE(created_at) as date, SUM(CASE
                WHEN status = "closed" THEN total
                WHEN status = "refund" THEN -total
                ELSE 0
            END) as value'))
            ->where('place_id',$request->place_id)
            ->whereIn('status', ['closed', 'refund'])
            ->whereBetween(DB::raw('DATE(created_at)'),[$request->from,$request->to])
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date','asc')
            ->get();

        $data_incomes = [];
        $temp_incomes = array_column($incomes->toArray(), null, 'date');
        foreach (CarbonPeriod::create($request->from, $request->to) as $date) {
            if(array_key_exists($date->format('Y-m-d'),$temp_incomes)){
                $data_incomes[] = $temp_incomes[$date->format('Y-m-d')];
            }else{
                $data_incomes[] = ['date' => $date->format('Y-m-d'), 'value' => 0];
            }
        }

        $total = 0;
//        $number = Check::where('place_id',$request->place_id)
//            ->where('status','closed')
//            ->whereBetween(DB::raw('DATE(created_at)'),[$request->from,$request->to])
//            ->count();
        $number_returned = DB::table('checks')
            ->join('check_product', 'checks.id', '=', 'check_product.check_id')
            ->select(DB::raw('SUM(check_product.quantity) as total_products'))
            ->where('checks.place_id', $request->place_id)
            ->whereIn('checks.status', ['refund'])
            ->whereBetween(DB::raw('DATE(checks.created_at)'), [$request->from, $request->to])
            ->first()
            ->total_products;
        $number = DB::table('checks')
            ->join('check_product', 'checks.id', '=', 'check_product.check_id')
            ->select(DB::raw('SUM(CASE
                WHEN checks.status = "closed" THEN check_product.quantity
                WHEN checks.status = "refund" THEN -check_product.quantity
                ELSE 0
            END) as total_products'))
            ->where('checks.place_id', $request->place_id)
            ->whereIn('checks.status', ['closed', 'refund'])
            ->whereBetween(DB::raw('DATE(checks.created_at)'), [$request->from, $request->to])
            ->first()
            ->total_products;

        foreach ($incomes as $income) {
            $total += $income->value;
        }

        $payment_methods = Check::select(DB::raw('payment_method, SUM(CASE
                WHEN status = "closed" THEN total
                WHEN status = "refund" THEN -total
                ELSE 0
            END) as value'))
            ->where('place_id',$request->place_id)
            ->whereIn('checks.status', ['closed', 'refund'])
            ->whereBetween(DB::raw('DATE(created_at)'),[$request->from,$request->to])
            ->groupBy(DB::raw('payment_method'))
            ->get();

        $discounts = Check::select(DB::raw('discount_type, SUM(CASE
                WHEN status = "closed" THEN subtotal - total
                WHEN status = "refund" THEN -(subtotal - total)
                ELSE 0
            END) as value'))
            ->where('place_id',$request->place_id)
            ->whereIn('checks.status', ['closed', 'refund'])
            ->whereNotNull('discount_type')
            ->whereBetween(DB::raw('DATE(created_at)'),[$request->from,$request->to])
            ->groupBy(DB::raw('discount_type'))
            ->get();

        if($request->has('compare')){
            if($request->compare === 'year'){
                $compare_from = Carbon::parse($request->from)->addYears(-1)->format('Y-m-d');
                $compare_to = Carbon::parse($request->to)->addYears(-1)->format('Y-m-d');
            }else{
                $days = Carbon::parse($request->to)->diffInDays($request->from,false);
                $days -= 1;
                $compare_from = Carbon::parse($request->from)->addDays($days)->format('Y-m-d');
                $compare_to = Carbon::parse($request->to)->addDays($days)->format('Y-m-d');
            }

            $compare_incomes = Check::select(DB::raw('DATE(created_at) as date, SUM(CASE
                WHEN status = "closed" THEN total
                WHEN status = "refund" THEN -total
                ELSE 0
            END) as value'))
                ->where('place_id',$request->place_id)
                ->whereIn('checks.status', ['closed', 'refund'])
                ->whereBetween(DB::raw('DATE(created_at)'),[$compare_from,$compare_to])
                ->groupBy(DB::raw('DATE(created_at)'))
                ->orderBy('date','asc')
                ->get();

            $data_compare_incomes = [];
            $temp_compare_incomes = array_column($compare_incomes->toArray(), null, 'date');
            foreach (CarbonPeriod::create($compare_from, $compare_to) as $date) {
                if(array_key_exists($date->format('Y-m-d'),$temp_compare_incomes)){
                    $data_compare_incomes[] = $temp_compare_incomes[$date->format('Y-m-d')];
                }else{
                    $data_compare_incomes[] = ['date' => $date->format('Y-m-d'), 'value' => 0];
                }
            }

            $compare_total = 0;
//            $compare_number = Check::where('place_id',$request->place_id)
//                ->where('status','closed')
//                ->whereBetween(DB::raw('DATE(created_at)'),[$compare_from,$compare_to])
//                ->count();
            $compare_number_returned = DB::table('checks')
                ->join('check_product', 'checks.id', '=', 'check_product.check_id')
                ->select(DB::raw('SUM(check_product.quantity) as total_products'))
                ->where('checks.place_id', $request->place_id)
                ->whereIn('checks.status', ['refund'])
                ->whereBetween(DB::raw('DATE(checks.created_at)'), [$compare_from, $compare_to])
                ->first()
                ->total_products;
            $compare_number = DB::table('checks')
                ->join('check_product', 'checks.id', '=', 'check_product.check_id')
                ->select(DB::raw('SUM(CASE
                WHEN checks.status = "closed" THEN check_product.quantity
                WHEN checks.status = "refund" THEN -check_product.quantity
                ELSE 0
            END) as total_products'))
                ->where('checks.place_id', $request->place_id)
                ->whereIn('checks.status', ['closed', 'refund'])
                ->whereBetween(DB::raw('DATE(checks.created_at)'), [$compare_from, $compare_to])
                ->first()
                ->total_products;

            foreach ($compare_incomes as $compare_income) {
                $compare_total += $compare_income->value;
            }
        }

        return response()->json([
            'incomes' => $data_incomes,
            'total' => $total,
            'number' => $number,
            'number_returned' => $number_returned,
            'payment_methods' => $payment_methods,
            'discounts' => $discounts,
            'compare_incomes' => $data_compare_incomes ?? [],
            'compare_total' => $compare_total ?? 0,
            'compare_number' => $compare_number ?? 0,
            'compare_number_returned' => $compare_number_returned ?? 0,
        ]);
    }

    public function getReceiptsCategoryReport(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'from' => 'required|date_format:Y-m-d',
            'to' => 'required|date_format:Y-m-d',
        ]);

        if(!Auth::user()->places->contains($request->place_id)) abort(400, 'It\'s not your place');

        /* @var Collection<Check> $checks */
        $checks = Check::where('place_id',$request->place_id)
            ->whereIn('checks.status', ['closed', 'refund'])
            ->whereBetween(DB::raw('DATE(created_at)'),[$request->from,$request->to])
            ->get();

        $categories = ProductCategory::where('place_id',$request->place_id)
            ->orderBy('path','ASC')
            ->get();

        $categories_sums = [];
        foreach ($categories as $category) {
            $categories_sums[$category->id] = $category;
            $categories_sums[$category->id]->value = 0;
        }
        foreach ($checks as $check) {
            foreach ($check->products as $product) {
                $p_total = (float)$product->pivot->price * (float)$product->pivot->quantity;
                if($check->discount){
                    if(str_contains($check->discount_type,'percent')){
                        $p_discount = $p_total * $check->discount / 100;
                    }else{
                        $p_discount = $check->subtotal ? $p_total * $check->discount / $check->subtotal : 0;
                    }
                    $p_total = $p_total - $p_discount;
                }
                foreach ($product->product_categories as $product_category) {
                    if($check->status === 'closed'){
                        $categories_sums[$product_category->id]->value += $p_total;
                    }else{
                        $categories_sums[$product_category->id]->value -= $p_total;
                    }
                }
            }
        }

        return response()->json(array_values($categories_sums));
    }

    public function exportCSV(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
        ]);

        if(!Auth::user()->places->contains($request->place_id)) abort(400, 'It\'s not your place');

        $checks = Check::where('place_id',$request->place_id)
            ->whereIn('status',['closed','refund'])->with('order');
        if($request->has('filter_field')) {
            $checks = $checks->where($request->filter_field, 'like', $request->filter_value . '%');
        }

        if($request->has('sort_field')){
            $checks = $checks->orderBy($request->sort_field, $request->sort_value);
        }else{
            $checks = $checks->orderBy('id', 'desc');
        }

        if($request->has('from')){
            $checks = $checks->whereBetween(DB::raw('DATE(created_at)'),[$request->from,$request->to]);
        }

        $checks = $checks->get();
        $data = [];
        $total = 0;
        /* @var Check $check */
        foreach ($checks as $check) {
            $data[] = [
                'id' => $check->place_check_id,
                'payment_method' => $check->payment_method,
                'given' => $check->created_at,
                'description' => 'Booking id: #' . $check->order->id.', seats: '.$check->order->seats.'. tables: '.implode(',',$check->order->table_ids),
                'total' => str_replace('.',',',$check->status === 'refund' ? -$check->total : $check->total),
            ];
            $total += $check->status === 'refund' ? -$check->total : $check->total;
        }

        $data[] = [
            'id' => '',
            'payment_method' => '',
            'given' => '',
            'description' => 'total',
            'total' => str_replace('.',',',$total),
        ];

        $csvFileName = 'user.csv';
        $csvFile = fopen($csvFileName, 'w');
        $headers = array_keys($data[0]);
        fputcsv($csvFile, $headers);

        foreach ($data as $row) {
            fputcsv($csvFile, $row);
        }

        fclose($csvFile);

        return response()->download(public_path($csvFileName))->deleteFileAfterSend(true);
    }

    public function exportPDF(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
        ]);

        if(!Auth::user()->places->contains($request->place_id)) abort(400, 'It\'s not your place');

        $checks = Check::where('place_id',$request->place_id)
            ->whereIn('status',['closed','refund'])->with('order');
        if($request->has('filter_field')) {
            $checks = $checks->where($request->filter_field, 'like', $request->filter_value . '%');
        }

        if($request->has('sort_field')){
            $checks = $checks->orderBy($request->sort_field, $request->sort_value);
        }else{
            $checks = $checks->orderBy('id', 'desc');
        }

        if($request->has('from')){
            $checks = $checks->whereBetween(DB::raw('DATE(created_at)'),[$request->from,$request->to]);
        }

        $checks = $checks->get();
        $data = [];
        $total = 0;
        /* @var Check $check */
        foreach ($checks as $check) {
            $data[] = [
                'id' => $check->place_check_id,
                'payment_method' => $check->payment_method,
                'given' => $check->created_at,
                'description' => 'Booking id: #' . $check->order->id.', seats: '.$check->order->seats.'. tables: '.implode(',',$check->order->table_ids),
                'total' => str_replace('.',',',$check->status === 'refund' ? -$check->total : $check->total),
            ];
            $total += $check->status === 'refund' ? -$check->total : $check->total;
        }

        $data[] = [
            'id' => '',
            'payment_method' => '',
            'given' => '',
            'description' => 'total',
            'total' => str_replace('.',',',$total),
        ];

        $html = view('pdfs.export_receipts', compact('data'))->render();
        $options = new Options();
        $options->set('enable_remote', TRUE);
        $options->set('enable_html5_parser', FALSE);
        $options->set('dpi', 72);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4');
        $dompdf->render();
        $dompdf->stream('export_receipts.pdf', array("Attachment" => false,'compress' => false));
    }

    public function refund($id, Request $request)
    {
        $request->validate([
            'products' => 'required',
            'refund_description' => 'required'
        ]);

        $check = Check::find($id);

        if(!Auth::user()->places->contains($check->place_id)) abort(400, 'It\'s not your place');

        $subtotal = 0;
        $total = 0;
        $discount = 0;

        foreach ($request->products as $product) {
            $p_total = (float)$product['pivot']['price'] * (float)$product['pivot']['quantity'];
            $subtotal += $p_total;
            if($check->discount){
                if(str_contains($check->discount_type,'percent')){
                    $p_discount = $p_total * $check->discount / 100;
                }else{
                    $p_discount = $p_total * $check->discount / $check->subtotal;
                }
                $p_total = $p_total - $p_discount;
                $discount += $p_discount;
            }
            $total += $p_total;
        }

        $refund = Check::create([
            'name' => $check->name,
            'place_id' => $check->place_id,
            'order_id' => $check->order_id,
            'status' => 'refund',
            'subtotal' => $subtotal,
            'total' => $total,
            'discount' => str_contains($check->discount_type,'percent') ? $check->discount : $discount,
            'discount_name' => $check->discount_name,
            'discount_type' => $check->discount_type,
            'discount_code' => $check->discount_code,
            'payment_method' => $check->payment_method,
            'parent_id' => $check->id,
            'refund_description' => $request->refund_description,
            'cash_amount' => $check->payment_method === 'cash' ? $total : 0,
            'card_amount' => in_array($check->payment_method,['card','card/cash']) ? $total : 0,
            'printed_at' => now()->format('Y-m-d H:i:s'),
            'printed_id' => Auth::user()->id,
        ]);

        if($request->has('products')){
            $sync_array = [];
            foreach ($request->products as $product) {
                $sync_array[$product['id']] = [
                    'price' => $product['pivot']['price'],
                    'quantity' => $product['pivot']['quantity']
                ];
            }
            $refund->products()->sync($sync_array);
        }

        Log::add($request,'create-check-refund','Created check refund #'.$refund->id);

        return response()->json($refund);
    }

    public function generateSaftReport(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'from' => 'required|date_format:Y-m-d',
            'to' => 'required|date_format:Y-m-d',
        ]);

        $place = Place::find($request->place_id);
        $report = SafTService::xmlReport($place, $request->from, $request->to);
        if($report['status']){
            return response()->json([
                'filename' => "SAF-T Cash Register_".$place->tax_number."_".now()->format('YmdHis')."_1_1.xml",
                'content' => $report['result']
            ]);
        }else{
            abort(400,$report['result']);
        }

//         $filename = "SAF-T Cash Register_".$place->tax_number."_".now()->format('YmdHis')."_1_1.xml";
//        $file_path = '';
//        return response()->download($file_path)->deleteFileAfterSend(true);
    }

    public function createProforma($id, Request $request)
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

        if($request->payment_method === 'card/cash'){
            if(!$request->has('cash_amount') || !$request->has('card_amount')){
                abort(400, 'Amount is required');
            }elseif(($request->cash_amount + $request->card_amount) != $request->total){
                abort(400, 'Payment amount is not full');
            }
        }

        $printed_by = User::find($request->printed_id);
        if($printed_by){
            if($printed_by->pin != $request->pin) abort(400, 'PIN code not matched');
        }else {
            abort(400, 'Cashier is not selected');
        }

        Log::add($request,'print-proforma','Printed proforma #'.$id.':'.$check->total, $request->printed_id);

        return response()->json(['message' => 'Proforma saved to the logs']);
    }

    private function generateCheckPDF($html): void
    {
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

    public function updateBankLog($id, Request $request)
    {
        $request->validate([
            'bank_log' => 'required',
        ]);
        $check = Check::find($id);
        $check->bank_log = $request->bank_log;
        $check->save();

        return response()->json(['message' => 'Check updated']);
    }
}
