<?php

namespace App\Helpers;

use App\Models\Order;
use App\Models\Place;
use Illuminate\Support\Facades\Storage;

class TemplateHelper
{
    public static function setVariables(Order $order, string $text): string
    {
        $area = $order->area;
        $place = $order->place;
        $customer = $order->customer;
        $end_reservation = $order->reservation_time->copy()->addMinutes($order->length);
        $place_photo_file = $place->files()->where('purpose','online_booking_picture')->first();
        $place_photo_url = '';
        if($place_photo_file){
            $place_photo_url = Storage::disk('public')->url($place_photo_file->filename);
        }

        $vars = [
            "#ADDRESS#",
            "#AREA_NAME#",
            "#BOOK_DAY#",
            "#BOOK_DAY_NAME#",
            "#BOOK_TIME#",
            "#BOOK_TIME_AMPM#",
            "#BOOK_HOUR#",
            "#BOOK_HOUR_END#",
            "#BOOK_ID#",
            "#BOOK_LENGTH#",
            "#BOOK_MIN#",
            "#BOOK_ENDTIME#",
            "#BOOK_ENDTIME_AMPM#",
            "#BOOK_MIN_END#",
            "#BOOK_MONTH#",
            "#BOOK_MONTH_NAME#",
            "#BOOK_YEAR#",
            "#BOOK_COMMENT#",
            "#CALENDAR_LINK#",
            "#CANCEL_LINK#",
            "#RECONFIRM_LINK#",
            "#CHECK_CREDIT_CARD_LINK#",
            "#CITY#",
            "#COMPANY#",
            "#CONTACT_PERSON#",
            "#CONTACT_PHONE#",
            "#CUSTOM_BOOK_LENGTH_NAME#",
            "#EMAIL#",
            "#FIRST_NAME#",
            "#LAST_NAME#",
            "#FULL_NAME#",
            "#MAP_LINK#",
            "#NUMBER_OF_GUESTS#",
            "#PAY_BOOKING_LINK#",
            "#PHONE#",
            "#RESTAURANT_ADDRESS#",
            "#RESTAURANT_CITY#",
            "#RESTAURANT_VAT#",
            "#RESTAURANT_COUNTRY#",
            "#RESTAURANT_EMAIL#",
            "#RESTAURANT_HOMEPAGE#",
            "#RESTAURANT_NAME#",
            "#RESTAURANT_PHONE#",
            "#RESTAURANT_PHOTO#",
            "#RESTAURANT_ZIPCODE#",
            "#ZIPCODE#",
            "#LANDING_PAGE#",
            "#MAX_PAX_PAGE#",
            "#CANCEL_BOOKING_PAGE#",
            "#ALTERNATIVE_RESTAURANTS_PAGE#",
            "#UNSUBSCRIBE_LINK#"
        ];
        $values = [
            '', //#ADDRESS#
            $area->name,
            $order->reservation_time->format("d"),
            $order->reservation_time->format("l"),
            $order->reservation_time->format("H:i"),
            $order->reservation_time->format("A"), //#BOOK_TIME_AMPM#
            $order->reservation_time->format("H"),
            $end_reservation->format("H"),
            $order->id,
            $order->length,
            $order->reservation_time->format("i"), //#BOOK_MIN#
            $end_reservation->format("H:i"),
            $end_reservation->format("A"), //#BOOK_ENDTIME_AMPM#
            $end_reservation->format("i"), //#BOOK_MIN_END#
            $order->reservation_time->format("m"), //#BOOK_MONTH#
            $order->reservation_time->format("F"), //#BOOK_MONTH_NAME#
            $order->reservation_time->format("Y"), //#BOOK_YEAR#
            $order->comment, //#BOOK_COMMENT#
            '', //#CALENDAR_LINK#
            '', //#CANCEL_LINK#
            '', //#RECONFIRM_LINK#
            '', //#CHECK_CREDIT_CARD_LINK#
            '', //#CITY#
            '', //#COMPANY#
            $customer->first_name.' '.$customer->last_name, //#CONTACT_PERSON#
            $customer->phone, //#CONTACT_PHONE#
            $order->custom_booking_length->name, //#CUSTOM_BOOK_LENGTH_NAME#
            $customer->email, //#EMAIL#
            $customer->first_name,
            $customer->last_name,
            $customer->first_name.' '.$customer->last_name, //#FULL_NAME#
            '', //#MAP_LINK#
            $order->seats, //#NUMBER_OF_GUESTS#
            $order->payment_link, //#PAY_BOOKING_LINK#
            $customer->phone, //#PHONE#
            $place->address, //#RESTAURANT_ADDRESS#
            $place->city, //#RESTAURANT_CITY#
            '', //#RESTAURANT_VAT#
            $place->country->name, //#RESTAURANT_COUNTRY#
            $place->email,
            $place->home_page,
            $place->name,
            $place->phone,
            $place_photo_url, //#RESTAURANT_PHOTO#
            $place->zip_code,
            $customer->zip_code,
            '', //#LANDING_PAGE#
            '', //#MAX_PAX_PAGE#
            '', //#CANCEL_BOOKING_PAGE#
            '', //#ALTERNATIVE_RESTAURANTS_PAGE#
            '', //#UNSUBSCRIBE_LINK#
        ];

        $output = str_replace($vars, $values, $text);

        return $output;
    }

    public static function setPlaceVariables(Place $place, string $text): string
    {
        $place_photo_file = $place->files()->where('purpose','online_booking_picture')->first();
        $place_photo_url = '';
        if($place_photo_file){
            $place_photo_url = Storage::disk('public')->url($place_photo_file->filename);
        }

        $vars = [
            "#RESTAURANT_ADDRESS#",
            "#RESTAURANT_CITY#",
            "#RESTAURANT_VAT#",
            "#RESTAURANT_COUNTRY#",
            "#RESTAURANT_EMAIL#",
            "#RESTAURANT_HOMEPAGE#",
            "#RESTAURANT_NAME#",
            "#RESTAURANT_PHONE#",
            "#RESTAURANT_PHOTO#",
            "#RESTAURANT_ZIPCODE#"
        ];
        $values = [
            $place->address, //#RESTAURANT_ADDRESS#
            $place->city, //#RESTAURANT_CITY#
            '', //#RESTAURANT_VAT#
            $place->country->name, //#RESTAURANT_COUNTRY#
            $place->email,
            $place->home_page,
            $place->name,
            $place->phone,
            $place_photo_url, //#RESTAURANT_PHOTO#
            $place->zip_code
        ];

        $output = str_replace($vars, $values, $text);

        return $output;
    }
}
