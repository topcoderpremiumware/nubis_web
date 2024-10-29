<?php

namespace App\Helpers;

use App\Models\Order;
use App\Models\Place;
use Illuminate\Support\Facades\Storage;

class AddressHelper
{
    public static function parse($address): array
    {
        // Регулярний вираз для відділення номера будинку
        $pattern = '/^(.+?)\s+(\d+[\w\-]*.*)$/';

        if (preg_match($pattern, $address, $matches)) {
            $number = trim($matches[2]);
            $building = '';  // Поле для зберігання літери

            // Перевіряємо наявність коми в номері і розділяємо, якщо так
            if (strpos($number, ',') !== false) {
                $numberParts = explode(',', $number);
                $number = trim($numberParts[0]); // Основний номер
                $additional_number = trim($numberParts[1]); // Додатковий номер
            } else {
                $additional_number = ''; // Якщо немає коми, додатковий номер порожній
            }

            // Перевіряємо, чи є в номері літера або суфікс
            if (preg_match('/(\d+)([a-zA-Z]+)/', $number, $numMatches)) {
                $number = $numMatches[1];     // Числова частина номера
                $building = $numMatches[2];   // Літера або суфікс
            }

            return [
                'street' => trim($matches[1]),   // Вулиця
                'number' => $number,             // Номер будинку
                'additional_number' => $additional_number,  // Додатковий номер (якщо є)
                'building' => $building          // Літера або суфікс (якщо є)
            ];
        } else {
            // Якщо не вдалося розділити, повертаємо оригінальну адресу як вулицю
            return [
                'street' => $address,
                'number' => '',
                'additional_number' => '',
                'building' => ''
            ];
        }
    }
}
