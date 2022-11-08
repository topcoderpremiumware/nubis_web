<?php

namespace App\SMS;


class SMS
{
    /**
     * @param array $recipients
     * @param string $message
     * @param string $sender
     * @param string $api_token
     * @return string
     */
    public static function send(
        array $recipients,
        string $message = 'Hello world',
        string $sender = 'ExampleSMS',
        string $api_token = null
    ): string
    {
        if(!$api_token) $api_token = env('GATEWAYAPI_DEFAULT_TOKEN');
        $url = "https://gatewayapi.com/rest/mtsms";

        $json = [
            'sender' => $sender,
            'message' => $message,
            'recipients' => [],
        ];
        foreach ($recipients as $msisdn) {
            $json['recipients'][] = ['msisdn' => $msisdn];
        }

        $ch = curl_init();
        curl_setopt($ch,CURLOPT_URL, $url);
        curl_setopt($ch,CURLOPT_HTTPHEADER, array("Content-Type: application/json"));
        curl_setopt($ch,CURLOPT_USERPWD, $api_token.":");
        curl_setopt($ch,CURLOPT_POSTFIELDS, json_encode($json));
        curl_setopt($ch,CURLOPT_RETURNTRANSFER, true);
        $result = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);

        if ($err) {
            return "cURL Error #:".$err;
        } else {
            return $result;
        }
    }
}
