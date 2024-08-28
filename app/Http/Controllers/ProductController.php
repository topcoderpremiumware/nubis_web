<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Log;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function create(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) abort(401, 'Unauthorized.');

        $request->validate([
            'name' => 'required',
            'place_id' => 'required|exists:places,id',
            'file' => 'nullable|file|mimes:jpg,jpeg,png|max:1024',
            'cost_price' => 'required|numeric',
            'selling_price' => 'required|numeric',
            'stock' => 'required|numeric',
            'tax' => 'required|numeric',
            'product_category_id' => 'nullable|exists:product_categories,id',
        ]);

        if(!Auth::user()->places->contains($request->place_id)) abort(400, 'It\'s not your place');

        $filename = null;
        if($request->has('file')){
            $file_upload = $request->file('file');
            $filename = 'products/'.$request->place_id.'/'.Carbon::now()->timestamp.'.'.$file_upload->getClientOriginalExtension();
            $content = $file_upload->getContent();
            Storage::disk('public')->put($filename,$content);
        }

        $product = Product::create([
            'name' => $request->name,
            'place_id' => $request->place_id,
            'image' => $filename,
            'cost_price' => $request->cost_price,
            'selling_price' => $request->selling_price,
            'stock' => $request->stock,
            'tax' => $request->tax,
            'product_category_id' => $request->product_category_id
        ]);

        Log::add($request,'create-product','Created product #'.$product->id);

        return response()->json($product);
    }

    public function save($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) abort(401, 'Unauthorized.');

        $request->validate([
            'name' => 'required',
            'place_id' => 'required|exists:places,id',
            'file' => 'nullable|file|mimes:jpg,jpeg,png|max:1024',
            'cost_price' => 'required|numeric',
            'selling_price' => 'required|numeric',
            'stock' => 'required|numeric',
            'tax' => 'required|numeric',
            'product_category_id' => 'nullable|exists:product_categories,id',
        ]);

        $product = Product::find($id);

        if(!Auth::user()->places->contains($request->place_id) ||
            !Auth::user()->places->contains($product->place_id)) abort(400, 'It\'s not your place');

        if($request->has('file')){
            if($product->image){
                Storage::disk('public')->delete($product->image);
            }

            $file_upload = $request->file('file');
            $filename = 'product_categories/'.$request->place_id.'/'.Carbon::now()->timestamp.'.'.$file_upload->getClientOriginalExtension();
            $content = $file_upload->getContent();
            Storage::disk('public')->put($filename,$content);
        }else{
            $filename = $product->image;
        }

        $res = $product->update([
            'name' => $request->name,
            'place_id' => $request->place_id,
            'image' => $filename,
            'cost_price' => $request->cost_price,
            'selling_price' => $request->selling_price,
            'stock' => $request->stock,
            'tax' => $request->tax,
            'product_category_id' => $request->product_category_id
        ]);

        Log::add($request,'change-product','Changed product #'.$id);

        if($res){
            $product = Product::find($id);
            return response()->json($product);
        }else{
            return response()->json(['message' => 'Product not updated'],400);
        }
    }

    public function getAllByPlace($place_id,Request $request)
    {
        $products = Product::where('place_id',$place_id)
            ->where('product_category_id',$request->product_category_id)
            ->get();

        return response()->json($products);
    }

    public function delete($id, Request $request)
    {
        $product = Product::find($id);

        if(!Auth::user()->places->contains($product->place_id)) abort(400, 'It\'s not your place');

        Log::add($request,'delete-product','Deleted product #'.$product->id);

        $product->delete();

        return response()->json(['message' => 'Product is deleted']);
    }
}
