<?php

namespace App\Gateways;

use Carbon\Carbon;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SwedbankGateway
{
    private $user_id;
    private $place_id;
    private $terminal_id;
    private $service_id;

    public function __construct($user_id, $place_id, $terminal_id)
    {
        $this->user_id = $user_id;
        $this->place_id = $place_id;
        $this->terminal_id = $terminal_id;
        $this->service_id = time();
    }

    public function login(): string|bool
    {
        $result = $this->request('<SaleToPOIRequest>
 <MessageHeader ProtocolVersion="3.1" MessageClass="Service" MessageCategory="Login" MessageType="Request" ServiceID="'.$this->getServiceId().'" SaleID="'.$this->user_id.'" POIID="N-'.$this->place_id.'-'.$this->terminal_id.'"/>
 <LoginRequest OperatorLanguage="da">
  <DateTime>'.Carbon::now()->format('Y-m-d\TH:i:s.uP').'</DateTime>
  <SaleSoftware ProviderIdentification="Vasilkoff LTD" ApplicationName="'.env('APP_NAME').'" SoftwareVersion="1.0"/>
  <SaleTerminalData TerminalEnvironment="Attended">
   <SaleCapabilities>CashierStatus CashierError CashierDisplay POIReplication CustomerAssistance CashierInput PrinterReceipt</SaleCapabilities>
   <SaleProfile GenericProfile="Extended">
    <ServiceProfiles>Loyalty PIN CardReader</ServiceProfiles>
   </SaleProfile>
  </SaleTerminalData>
 </LoginRequest>
</SaleToPOIRequest>');
        if($result['LoginResponse']['Response']['@attributes']['Result'] === 'Success'){
            return true;
        }else{
            return false;
        }
    }

    /**
     * @param $amount
     * @param $currency
     * @param $order_id // id of order for webhook
     * @param $type // 'Normal' - pay, 'Refund' - refund
     * @return array|bool
     */
    public function pay($amount,$currency,$order_id = '1524253496',$type = 'Normal'): array|bool
    {
        try{
            $result = $this->request('<SaleToPOIRequest>
    <MessageHeader ProtocolVersion="3.1" MessageClass="Service" MessageCategory="Payment" MessageType="Request" ServiceID="'.$this->getServiceId().'" SaleID="'.$this->user_id.'" POIID="N-'.$this->place_id.'-'.$this->terminal_id.'" />
    <PaymentRequest>
        <SaleData TokenRequestedType="Customer">
            <SaleTransactionID TimeStamp="'.Carbon::now()->format('Y-m-d\TH:i:s.uP').'" TransactionID="'.$order_id.'"/>
        </SaleData>
        <PaymentTransaction>
            <AmountsReq CashBackAmount="0" Currency="'.$currency.'" RequestedAmount="'.$amount.'"/>
        </PaymentTransaction>
        <PaymentData PaymentType="'.$type.'"/>
    </PaymentRequest>
</SaleToPOIRequest>');
            return $result;
        }catch (ConnectionException $e){
            Log::error('SwedbankGateway::pay',[$e->getMessage()]);
        }

        return false;
    }

    public function getTransaction(): array|bool
    {
        try{
            $result = $this->request('<SaleToPOIRequest>
     <MessageHeader ProtocolVersion="3.1" MessageClass="Service" MessageCategory="TransactionStatus" MessageType="Request" ServiceID="'.$this->getServiceId().'" SaleID="'.$this->user_id.'" POIID="N-'.$this->place_id.'-'.$this->terminal_id.'" />
     <TransactionStatusRequest/>
    </SaleToPOIRequest>');
            return $result;
        }catch (ConnectionException $e){
            Log::error('SwedbankGateway::getTransaction',[$e->getMessage()]);
        }

        return false;
    }

    public function logout(): string|bool
    {
        $result = $this->request('<SaleToPOIRequest>
 <MessageHeader ProtocolVersion="3.1" MessageClass="Service" MessageCategory="Logout" MessageType="Request" ServiceID="'.$this->getServiceId().'" SaleID="'.$this->user_id.'" POIID="N-'.$this->place_id.'-'.$this->terminal_id.'" />
 <LogoutRequest MaintenanceAllowed="true"/>
</SaleToPOIRequest>');

        echo '<pre>';
        var_dump($result);
        echo '</pre>';
        return true;
    }

    private function request($xml): bool|array
    {
        $response = Http::timeout(30)->accept('*/*')->withBody($xml,'application/xml; charset=utf-8')
            ->post(env('SWEDBANK_TERMINAL_URL').'/EPASSaleToPOI/3.1');

        if($response->status() == 200){
            $data = json_decode(json_encode(simplexml_load_string($response->body())),true);
            return $data;
        }else{
            Log::error('SwedbankGateway::request',['status' => $response->status(), 'data' => $response->body()]);
            return false;
        }
    }

    private function getServiceId()
    {
        return $this->service_id++;
    }
}
