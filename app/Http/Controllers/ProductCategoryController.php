<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Log;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProductCategoryController extends Controller
{
    public function create(Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) abort(401, 'Unauthorized.');

        $request->validate([
            'name' => 'required',
            'place_id' => 'required|exists:places,id',
            'file' => 'nullable|file|mimes:jpg,jpeg,png|max:1024',
        ]);

        if(!Auth::user()->places->contains($request->place_id)) abort(400, 'It\'s not your place');

        $filename = null;
        if($request->has('file')){
            $file_upload = $request->file('file');
            $filename = 'product_categories/'.$request->place_id.'/'.Carbon::now()->timestamp.'.'.$file_upload->getClientOriginalExtension();
            $content = $file_upload->getContent();
            Storage::disk('public')->put($filename,$content);
        }

        $category = ProductCategory::create([
            'name' => $request->name,
            'place_id' => $request->place_id,
            'image' => $filename
        ]);

        Log::add($request,'create-product_category','Created product category #'.$category->id);

        return response()->json($category);
    }

    public function save($id, Request $request)
    {
        if(!Auth::user()->tokenCan('admin')) abort(401, 'Unauthorized.');

        $request->validate([
            'name' => 'required',
            'place_id' => 'required|exists:places,id',
            'file' => 'nullable|file|mimes:jpg,jpeg,png|max:1024',
        ]);

        $category = ProductCategory::find($id);

        if(!Auth::user()->places->contains($request->place_id) ||
            !Auth::user()->places->contains($category->place_id)) abort(400, 'It\'s not your place');

        if($request->has('file')){
            if($category->image){
                Storage::disk('public')->delete($category->image);
            }

            $file_upload = $request->file('file');
            $filename = 'product_categories/'.$request->place_id.'/'.Carbon::now()->timestamp.'.'.$file_upload->getClientOriginalExtension();
            $content = $file_upload->getContent();
            Storage::disk('public')->put($filename,$content);
        }else{
            $filename = $category->image;
        }

        $res = $category->update([
            'name' => $request->name,
            'place_id' => $request->place_id,
            'image' => $filename
        ]);

        Log::add($request,'change-product_category','Changed product category #'.$id);

        if($res){
            $category = ProductCategory::find($id);
            return response()->json($category);
        }else{
            return response()->json(['message' => 'Product category not updated'],400);
        }
    }

    public function getAllByPlace($place_id, Request $request)
    {
        $categories = ProductCategory::where('place_id',$place_id)->get();

        return response()->json($categories);
    }

    public function delete($id, Request $request)
    {
        $category = ProductCategory::find($id);

        if(!Auth::user()->places->contains($category->place_id)) abort(400, 'It\'s not your place');

        Log::add($request,'delete-product_category','Deleted product category #'.$category->id);

        if($category->image){
            Storage::disk('public')->delete($category->image);
        }

        $category->delete();

        return response()->json(['message' => 'Product category is deleted']);
    }
}
