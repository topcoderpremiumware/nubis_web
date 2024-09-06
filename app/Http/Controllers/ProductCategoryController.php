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
            'parent_id' => 'nullable|exists:product_categories,id',
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
            'image' => $filename,
            'parent_id' => $request->parent_id
        ]);

        $category->position = $category->parent->children->count() - 1;
        $category->save();

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
            'parent_id' => 'nullable|exists:product_categories,id',
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
            'image' => $filename,
            'parent_id' => $request->parent_id
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
        $categories = ProductCategory::where('place_id',$place_id)
            ->orderBy('position','asc');
        if($request->has('parent_id')){
            if($request->parent_id !== 'all'){
                $categories = $categories->where('parent_id',$request->parent_id);
            }
        }else{
            $categories = $categories->whereNull('parent_id');
        }
        $categories = $categories->get();

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

    public function setPosition(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|exists:product_categories,id',
        ]);

        foreach ($request->ids as $index => $id) {
            ProductCategory::where('id',$id)->update(['position' => $index]);
        }

        return response()->json(['message' => 'Category position saved']);
    }
}
