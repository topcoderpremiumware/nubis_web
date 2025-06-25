<?php

namespace App\Gateways;

use App\Models\Check;
use App\Models\Terminal;
use Carbon\Carbon;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class VerifoneGateway
{
    private string $url;
    private int $user_id;
    private Terminal $terminal;
    private string $currency;
    private string $service_id;
    private string $token;
    private string $entityUID;

    public function __construct($user_id, $terminal_id)
    {
        $this->url = 'https://cstpos.test-gsc.vfims.com/oidc/poscloud/nexo/';
        $this->user_id = $user_id;
        $this->terminal = Terminal::find($terminal_id);
        $this->currency = $this->terminal->currency;
        $this->service_id = $this->generateRandom10DigitString();
        $this->token = base64_encode($this->terminal->user.':'.$this->terminal->password);
        $status = $this->status();
        $this->entityUID = $status ? $status['entityUID'] : '';
    }

    private function generateRandom10DigitString(): string
    {
        $random = random_int(0, 9999999999);
        return str_pad((string)$random, 10, '0', STR_PAD_LEFT);
    }

    private function getServiceId(): string
    {
        return str_pad((string)$this->service_id++, 10, '0', STR_PAD_LEFT);
    }

    private function status()
    {
        $result = $this->request(['url' => 'status', 'method' => 'get']);
        Log::info("VerifoneGateway::status",['$result' => $result]);
        if(isset($result['Response']['Result']) && $result['Response']['Result'] === 'SUCCESS'){
            $data = null;
            foreach ($result['POIStatus'] as $item) {
                if (isset($item['POIID'], $item['POIState']) && $item['POIID'] === $this->terminal->serial && in_array($item['POIState'],['CONNECTED','ACTIVE'])) {
                    $data = $item;
                    break;
                }
            }
            return $data ?: false;
        }else{
            return false;
        }
    }

    public function login(): string|bool
    {
        $result = $this->request(['url' => 'login', 'method' => 'post', 'headers' => ['x-site-entity-id' => $this->entityUID],
          'body' => [
              "MessageHeader" => [
                  "ProtocolVersion" => "3.0",
                  "MessageClass" => "SERVICE",
                  "MessageCategory" => "LOGIN",
                  "MessageType" => "REQUEST",
                  "ServiceID" => $this->getServiceId(),
                  "SaleID" => "TableBookingPOS",
                  "POIID" => $this->terminal->serial
              ],
              "LoginRequest" => [
                  "DateTime" => Carbon::now()->format('Y-m-d\TH:i:s.v\Z'),
                  "SaleSoftware" => [],
                  "SaleTerminalData" => [],
                  "TrainingModeFlag" => true,
                  "OperatorLanguage" => ["da"],
                  "OperatorID" => $this->user_id,
                  "ShiftNumber" => "string",
                  "TokenRequestedType" => "TRANSACTION",
                  "CustomerOrderReq" => [],
                  "POISerialNumber" => "string",
                  "_vf_GatewayLoginCredentials" => [
                      "CredentialsType" => "string",
                      "PlaintextUserPass" => [
                          "UserID" => "5678",
                          "PlaintextPassword" => "5678"
                      ]
                  ]
              ]
          ]]);
        Log::info("VerifoneGateway::login",['$result' => $result]);
        if(isset($result['LoginResponse']['Response']['Result']) && $result['LoginResponse']['Response']['Result'] === 'SUCCESS'){
            return true;
        }else{
            return false;
        }
    }

    /**
     * @param $amount
     * @param $order_id // id of order for webhook
     * @param $type // 'Normal' - pay, 'Refund' - refund
     * @return array|bool
     */
    public function pay($amount,$order_id = '1524253496',$type = 'Normal'): array|bool
    {

        try{
            $timestamp = Carbon::now()->format('Y-m-d\TH:i:s.v\Z');
            Cache::put('verifone_pay_'.$order_id.'_service',$this->service_id,now()->addDays(1));
            Cache::put('verifone_pay_'.$order_id.'_timestamp1',$timestamp,now()->addDays(1));

            $result = $this->request(['url' => 'payment', 'method' => 'post', 'headers' => ['x-site-entity-id' => $this->entityUID],
                'body' => [
                    "MessageHeader" => [
                        "MessageClass" => "SERVICE",
                        "MessageCategory" => "PAYMENT",
                        "MessageType" => "REQUEST",
                        "ServiceID" => $this->getServiceId(),
                        "SaleID" => "TableBookingPOS",
                        "POIID" => $this->terminal->serial
                    ],
                    "PaymentRequest" => [
                        "SaleData" => [
                            "OperatorID" => $this->user_id,
                            "SaleTransactionID" => [
                                "TransactionID" => $order_id,
                                "TimeStamp" => $timestamp,
                            ],
                        ],
                        "PaymentTransaction" => [
                            "AmountsReq" => [
                                "Currency" => $this->currency,
                                "RequestedAmount" => $amount,
                            ],
                        ],
                        "PaymentData" => [
                            "PaymentType" => strtoupper($type),
                            "SplitPaymentFlag" => true,
                        ],
                    ]
                ]]);
            if(!$result){
                sleep(1);
                $this->abort($order_id);
                sleep(1);
                $trans_result = $this->getTransaction($order_id);
                return ['SaleToPOIResponse' =>  $trans_result['TransactionStatusResponse']['RepeatedMessageResponse']];
            }
            if($result['PaymentResponse']['Response']['Result'] === 'FAILURE') {
                $condition = $result['PaymentResponse']['Response']['ErrorCondition'];
                if($condition === 'NotAllowed'){
                    sleep(1);
                    if($this->login()){
                        sleep(1);
                        return $this->pay($amount,$order_id,$type);
                    }
                }
            }
            $pt_id_data = $result['PaymentResponse']['POIData']['POITransactionID'];
            Cache::put('verifone_pay_'.$order_id.'_timestamp',$pt_id_data['TimeStamp'],now()->addDays(1));
            Cache::put('verifone_pay_'.$order_id.'_transaction',$pt_id_data['TransactionID'],now()->addDays(1));
            return $result;
        }catch (ConnectionException $e){
            Log::error('VerifoneGateway::pay',[$e->getMessage()]);
        }

        return false;
    }

    /**
     * @param $order_id // id of order for webhook
     * @return array|bool
     */
    public function revert($order_id = '1524253496'): array|bool
    {
        try{
            $pay_timestamp = Cache::get('verifone_pay_'.$order_id.'_timestamp');
            $pay_transaction1 = Cache::get('verifone_pay_'.$order_id.'_timestamp1');
            $pay_transaction = Cache::get('verifone_pay_'.$order_id.'_transaction');
            $result = $this->request(['url' => 'reversal', 'method' => 'post', 'headers' => ['x-site-entity-id' => $this->entityUID],
                'body' => [
                    "MessageHeader" => [
                        "MessageClass" => "SERVICE",
                        "MessageCategory" => "REVERSAL",
                        "MessageType" => "REQUEST",
                        "ServiceID" => $this->getServiceId(),
                        "SaleID" => "TableBookingPOS",
                        "POIID" => $this->terminal->serial
                    ],
                    "ReversalRequest" => [
                        "SaleData" => [
                            "SaleTransactionID" => [
                                "TransactionID" => $order_id,
                                "TimeStamp" => $pay_transaction1,
                            ],
                            // "CustomerOrderReq" => [
                            //   "BOTH"
                            // ],
                            // "SaleToPOIData" => "{\"c\":\"77763\",\"m\":\"MC\",\"p\":\"CREDIT\",\"i\":\"111111\",\"r\":\"CAPTURED\",\"rc\":\"4\",\"ts\":\"SUCCESS\"}"
                        ],
                        "OriginalPOITransaction" => [
                            "SaleID" => "TableBookingPOS",
                            "POIID" => $this->terminal->serial,
                            "POITransactionID" => [
                                "TransactionID" => $pay_transaction,
                                "TimeStamp" => $pay_timestamp
                            ]
                        ],
                        "ReversalReason" => "CUSTCANCEL",
                        "CustomerOrder" => [
                            "CustomerOrderID" => $order_id,
                            "StartDate" => $pay_transaction1,
                            "ForecastedAmount" => Check::find($order_id)->total,
                            "OpenOrderState" => true,
                            "Currency" => $this->currency
                        ]
                    ]
                ]]);
            return $result;
        }catch (ConnectionException $e){
            Log::error('VerifoneGateway::revert',[$e->getMessage()]);
        }

        return false;
    }

    /**
     * @param $order_id // id of order for webhook
     * @param $type // 'Normal' - pay, 'Refund' - refund
     * @return array|bool
     */
    public function abort($order_id = '1524253496'): array|bool
    {
        try{
            $pay_service_id = Cache::get('verifone_pay_'.$order_id.'_service');
            $result = $this->request(['url' => 'abort', 'method' => 'post', 'headers' => ['x-site-entity-id' => $this->entityUID],
                'body' => [
                    "MessageHeader" => [
                        "MessageClass" => "SERVICE",
                        "MessageCategory" => "ABORT",
                        "MessageType" => "REQUEST",
                        "ServiceID" => $this->getServiceId(),
                        "SaleID" => "TableBookingPOS",
                        "POIID" => $this->terminal->serial
                    ],
                    "AbortRequest" => [
                        "MessageReference" => [
                            "MessageCategory" => "PAYMENT",
                            "ServiceID" => $pay_service_id,
                            // "DeviceID" => "string",
                            "SaleID" => "TableBookingPOS",
                            "POIID" => $this->terminal->serial
                        ],
                        "AbortReason" => "CashierAborted"
                    ]
                ]]);
//            return true;
            return 'OK';
        }catch (ConnectionException $e){
            Log::error('VerifoneGateway::abort',[$e->getMessage()]);
        }

//        return false;
        return 'OK';
    }

    public function getTransaction($order_id = '1524253496'): array|bool
    {
        try{
//            $pay_service_id = Cache::get('verifone_pay_'.$order_id.'_service');
            $result = $this->request(['url' => 'transactionReport', 'method' => 'post', 'headers' => ['x-site-entity-id' => $this->entityUID],
                'body' => [
                    "MessageHeader" => [
                        "MessageClass" => "SERVICE",
                        "MessageCategory" => "TRANSACTIONSTATUS",
                        "MessageType" => "REQUEST",
                        "ServiceID" => $this->getServiceId(),
                        "SaleID" => "TableBookingPOS",
                        "POIID" => $this->terminal->serial
                    ],
                    "TransactionStatusRequest" => [
                        "MessageReference" => [
                            "messageCategory" => "PAYMENT",
                            // "serviceID" => "1234",
                            // "deviceID" => "string",
                            "saleID" => "TableBookingPOS",
                            "POIID" => $this->terminal->serial
                        ],
                        "ReceiptReprintFlag" => true,
                        "DocumentQualifier" => "SALERECEIPT"
                    ]
                ]]);
            return $result;
        }catch (ConnectionException $e){
            Log::error('VerifoneGateway::getTransaction',[$e->getMessage()]);
        }

        return false;
    }

    public function print($text): array|bool
    {
        try{
            $outputText = array_map(function($row){return ["Text" => $row];},$text);
            $result = $this->request(['url' => 'print', 'method' => 'post', 'headers' => ['x-site-entity-id' => $this->entityUID],
                'body' => [
                    "MessageHeader" => [
                        "MessageClass" => "DEVICE",
                        "MessageCategory" => "PRINT",
                        "MessageType" => "REQUEST",
                        "ServiceID" => $this->getServiceId(),
                        // "DeviceID" => "1375",
                        "SaleID" => "TableBookingPOS",
                        "POIID" => $this->terminal->serial
                    ],
                    "PrintRequest" => [
                        "PrintOutput" => [
                            "DocumentQualifier" => "CUSTOMERRECEIPT",
                            "ResponseMode" => "NotRequired",
                            "OutputContent" => [
                                "OutputFormat" => "TEXT",
                                "OutputText" => $outputText
                            ]
                        ]
                    ]
                ]]);
            return $result;
        }catch (ConnectionException $e){
            Log::error('VerifoneGateway::print',[$e->getMessage()]);
        }

        return false;
    }

    public function logout(): string|bool
    {
        try{
            $result = $this->request(['url' => 'logout', 'method' => 'post', 'headers' => ['x-site-entity-id' => $this->entityUID],
                'body' => [
                    "MessageHeader" => [
                        "MessageClass" => "SERVICE",
                        "MessageCategory" => "LOGOUT",
                        "MessageType" => "REQUEST",
                        "ServiceID" => $this->getServiceId(),
                        "SaleID" => "TableBookingPOS",
                        "POIID" => $this->terminal->serial
                    ],
                    "LogoutRequest" => [
                        "MaintenanceAllowed" => true
                    ]
                ]]);
            return $result;
        }catch (ConnectionException $e){
            Log::error('VerifoneGateway::logout',[$e->getMessage()]);
        }

        return false;
    }

    private function request($data): bool|array|null
    {
        $method = $data['method'];
        $response = Http::timeout(60)
            ->withHeaders([
                'Accept' => '*/*',
                'Authorization' => 'Basic '.$this->token,
                ...($data['headers'] ?? [])
        ])->withBody(json_encode($data['body'] ?? []),'application/json; charset=utf-8')
            ->$method($this->url.$data['url']);

        if($response->status() == 200){
            $data = json_decode($response->body(),true);
            return $data;
        }else{
            Log::error('VerifoneGateway::request',['status' => $response->status(), 'data' => $response->body()]);
            return false;
        }
    }
}
