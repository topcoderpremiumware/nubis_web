<?php

namespace App\Http\Controllers;

use App\Models\Country;
use App\Models\Place;
use Illuminate\Http\Request;

class CountryController extends Controller
{
    public function getAll(Request $request)
    {
        $countries = Country::all();

        return response()->json($countries);
    }
}
