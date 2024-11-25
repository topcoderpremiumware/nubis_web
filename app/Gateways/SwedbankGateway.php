<?php

namespace App\Gateways;

use App\Models\Terminal;
use Carbon\Carbon;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SwedbankGateway
{
    private $user_id;
    private $terminal;
    private $service_id;

    public function __construct($user_id, $terminal_id)
    {
        $this->user_id = $user_id;
        $this->terminal = Terminal::find($terminal_id);
        $this->currency = $this->terminal->place->setting('online-payment-currency');
        $this->service_id = time();
    }

    public function login($try_number = 0): string|bool
    {
        // <SaleCapabilities>CashierStatus CashierError CashierDisplay POIReplication CustomerAssistance CashierInput PrinterReceipt</SaleCapabilities>
        $result = $this->request('<SaleToPOIRequest>
     <MessageHeader ProtocolVersion="3.1" MessageClass="Service" MessageCategory="Login" MessageType="Request" ServiceID="'.$this->getServiceId().'" SaleID="'.$this->user_id.'" POIID="'.$this->terminal->serial.'" />
     <LoginRequest OperatorLanguage="da">
  <DateTime>'.Carbon::now()->format('Y-m-d\TH:i:s.uP').'</DateTime>
  <SaleSoftware ProviderIdentification="Vasilkoff LTD" ApplicationName="'.env('APP_NAME').'" SoftwareVersion="1.0"/>
  <SaleTerminalData TerminalEnvironment="Attended">
   <SaleCapabilities>PrinterReceipt</SaleCapabilities>
   <SaleProfile GenericProfile="Extended">
    <ServiceProfiles>Loyalty PIN CardReader</ServiceProfiles>
   </SaleProfile>
  </SaleTerminalData>
 </LoginRequest>
 </SaleToPOIRequest>');
        Log::info("SwedbankGateway::login",['$result' => $result]);
        if($result['LoginResponse']['Response']['@attributes']['Result'] === 'Success'){
            return true;
        }else{
            if($try_number == 0){
                $try_number++;
                return $this->login($try_number);
            }
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
            $timestamp = Carbon::now()->format('Y-m-d\TH:i:s.uP');
            Cache::put('swed_pay_'.$order_id.'_service',$this->service_id,now()->addDays(1));
            $result = $this->request('<SaleToPOIRequest>
     <MessageHeader ProtocolVersion="3.1" MessageClass="Service" MessageCategory="Payment" MessageType="Request" ServiceID="'.$this->getServiceId().'" SaleID="'.$this->user_id.'" POIID="'.$this->terminal->serial.'" />
     <PaymentRequest>
        <SaleData TokenRequestedType="Customer">
            <SaleTransactionID TimeStamp="'.$timestamp.'" TransactionID="'.$order_id.'"/>
        </SaleData>
        <PaymentTransaction>
            <AmountsReq CashBackAmount="0" Currency="'.$this->currency.'" RequestedAmount="'.$amount.'"/>
        </PaymentTransaction>
        <PaymentData PaymentType="'.$type.'"/>
    </PaymentRequest>
    </SaleToPOIRequest>');
            $response_result = $result['PaymentResponse']['Response']['@attributes']['Result'];
            if($response_result === 'Failure') {
                $condition = $result['PaymentResponse']['Response']['@attributes']['ErrorCondition'];
                if($condition === 'NotAllowed'){
                    if($this->login()){
                        return $this->pay($amount,$order_id,$type);
                    }
                }
            }
            $pt_id_data = $result['PaymentResponse']['POIData']['POITransactionID'];
            Cache::put('swed_pay_'.$order_id.'_timestamp',$pt_id_data['@attributes']['TimeStamp'],now()->addDays(1));
            Cache::put('swed_pay_'.$order_id.'_transaction',$pt_id_data['@attributes']['TransactionID'],now()->addDays(1));
            return $result;
        }catch (ConnectionException $e){
            Log::error('SwedbankGateway::pay',[$e->getMessage()]);
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
            $pay_timestamp = Cache::get('swed_pay_'.$order_id.'_timestamp');
            $pay_transaction = Cache::get('swed_pay_'.$order_id.'_transaction');
            $result = $this->request('<SaleToPOIRequest>
     <MessageHeader ProtocolVersion="3.1" MessageClass="Service" MessageCategory="Reversal" MessageType="Request" ServiceID="'.$this->getServiceId().'" SaleID="'.$this->user_id.'" POIID="'.$this->terminal->serial.'" />
     <ReversalRequest ReversalReason="MerchantCancel">
  <OriginalPOITransaction SaleID="'.$this->user_id.'" POIID="'.$this->terminal->serial.'">
   <POITransactionID TransactionID="'.$pay_transaction.'" TimeStamp="'.$pay_timestamp.'"/>
  </OriginalPOITransaction>
 </ReversalRequest>
     </SaleToPOIRequest>');
            return $result;
        }catch (ConnectionException $e){
            Log::error('SwedbankGateway::revert',[$e->getMessage()]);
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
            $pay_service_id = Cache::get('swed_pay_'.$order_id.'_service');
            $result = $this->request('<SaleToPOIRequest>
     <MessageHeader ProtocolVersion="3.1" MessageClass="Service" MessageCategory="Abort" MessageType="Request" ServiceID="'.$this->getServiceId().'" SaleID="'.$this->user_id.'" POIID="'.$this->terminal->serial.'" />
     <AbortRequest>
        <MessageReference MessageCategory="Payment" SaleID="'.$this->user_id.'" POIID="'.$this->terminal->serial.'" ServiceID="'.$pay_service_id.'"/>
        <AbortReason>Abort by Sale System</AbortReason>
    </AbortRequest>
     </SaleToPOIRequest>');
            return true;
        }catch (ConnectionException $e){
            Log::error('SwedbankGateway::abort',[$e->getMessage()]);
        }

        return false;
    }

    public function getTransaction(): array|bool
    {
        try{
            $result = $this->request('<SaleToPOIRequest>
     <MessageHeader ProtocolVersion="3.1" MessageClass="Service" MessageCategory="TransactionStatus" MessageType="Request" ServiceID="'.$this->getServiceId().'" SaleID="'.$this->user_id.'" POIID="'.$this->terminal->serial.'" />
     <TransactionStatusRequest/>
    </SaleToPOIRequest>');
            return $result;
        }catch (ConnectionException $e){
            Log::error('SwedbankGateway::getTransaction',[$e->getMessage()]);
        }

        return false;
    }

    /**
     * @param $value
     * @return array|bool
     */
    public function input($value): array|bool
    {
        try{
            $result = $this->request('<SaleToPOIRequest>
 <MessageHeader ProtocolVersion="3.1" MessageClass="Service" MessageCategory="Input" MessageType="Response" ServiceID="'.$this->getServiceId().'" SaleID="'.$this->user_id.'" POIID="'.$this->terminal->serial.'" />
 <InputResponse><Response Result="'.$value.'" /></InputResponse>
 </SaleToPOIRequest>');
            return $result;
        }catch (ConnectionException $e){
            Log::error('SwedbankGateway::input',[$e->getMessage()]);
        }

        return false;
    }

    public function logout(): string|bool
    {
        $result = $this->request('<SaleToPOIRequest>
 <MessageHeader ProtocolVersion="3.1" MessageClass="Service" MessageCategory="Logout" MessageType="Request" ServiceID="'.$this->getServiceId().'" SaleID="'.$this->user_id.'" POIID="'.$this->terminal->serial.'" />
 <LogoutRequest MaintenanceAllowed="true"/>
</SaleToPOIRequest>');

        return $result;
    }

    private function request($xml): bool|array
    {
        $response = Http::timeout(60)->accept('*/*')->withBody($xml,'application/xml; charset=utf-8')
            ->post($this->terminal->url.'/EPASSaleToPOI/3.1');

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
