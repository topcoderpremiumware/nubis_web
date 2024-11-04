<?php

namespace App\Services;


use App\Helpers\AddressHelper;
use App\Models\Check;
use App\Models\Log;
use App\Models\Place;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use DOMDocument;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class SafTService
{
    /**
     * @param Place $place
     * @param string $from
     * @param string $to
     * @return array{status: bool, result: string}
     */
    public static function xmlReport(Place $place, string $from, string $to): array
    {
        $from = Carbon::parse($from);
        $to = Carbon::parse($to);
        if($from->format('Y') !== $to->format('Y')){
            $year = $from->format('Y').'-'.$to->format('Y');
        }else{
            $year = $from->format('Y');
        }
        $organization = $place->organization;

        /*  @var Collection<Check> $checks
         *  @var Check $first_check
         *  @var Check $last_check
         */
        $checks = Check::where('place_id',$place->id)
            ->whereBetween(DB::raw('DATE(printed_at)'),[$from,$to])
            ->whereIn('status',['closed','refund'])
            ->whereNotNull('place_check_id')
            ->orderBy('place_check_id','asc')
            ->get();
        if($checks->count() === 0) return ['status' => false, 'result' => 'There are no receipts in period'];

        $first_check = $checks->first();
        $last_check = $checks->last();

        /* @var Collection<Log> $logs */
        $logs = Log::whereIn('action',['create-check-refund','print-first-check','print-check'])
            ->whereBetween(DB::raw('DATE(created_at)'),[$from,$to])
            ->orderBy('created_at','asc')
            ->get();

        $cashiers = User::whereIn('id',$checks->pluck('printed_id')->merge($logs->pluck('user_id'))->toArray())->get();

        $used_products = Product::join('check_product', 'products.id', '=', 'check_product.product_id')
            ->whereIn('check_product.check_id', $checks->pluck('id')->toArray())
            ->select('products.*')
            ->distinct()
            ->get();

        $online_payment_currency = $place->setting('online-payment-currency');

        $basic_data = [
            '05' => [
                ['id' => 'SAL', 'desc' => 'Sale line'],
                ['id' => 'RET', 'desc' => 'Return line'],
            ],
            '08' => [
                ['id' => 'our_code_amount', 'desc' => 'Our gift card'],
                ['id' => 'code_amount', 'desc' => 'Other gift card'],
                ['id' => 'custom_amount', 'desc' => 'Custom amount'],
                ['id' => 'custom_percent', 'desc' => 'Custom percent']
            ],
            '11' => [
                ['id' => 'CASHSAL','pred' => '11001', 'desc' => 'Cash sale'],
                ['id' => 'RETURNSAL','pred' => '11006', 'desc' => 'Return sale']
            ],
            '12' => [
                ['id' => 'CASH','pred' => '12001', 'desc' => 'Cash'],
                ['id' => 'DEBCARD','pred' => '12002', 'desc' => 'Debit card']
            ],
            '13' => [
                ['id' => 'ZREP','pred' => '13009', 'desc' => 'Z report'],
                ['id' => 'SALREC','pred' => '13012', 'desc' => 'Sales receipt'],
                ['id' => 'RETREC','pred' => '13013', 'desc' => 'Return receipt']
            ],
        ];

        $xml = new \SimpleXMLElement('<?xml version="1.0" encoding="utf-8"?><auditfile xmlns="urn:StandardAuditFile-Taxation-CashRegister:DK" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:doc="urn:schema-extensions:documentation" xsi:schemaLocation="urn:StandardAuditFile-Taxation-CashRegister:DK schema.xsd" Id="AAAAA" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"></auditfile>');

        $header = $xml->addChild('header');
        $header->addChild('fiscalYear', $year);
        $header->addChild('startDate', $from->format('Y-m-d'));
        $header->addChild('endDate', $to->format('Y-m-d'));
        $header->addChild('curCode', $online_payment_currency);
        $header->addChild('dateCreated', now()->format('Y-m-d'));
        $header->addChild('timeCreated', now()->format('H:i:s'));
        $header->addChild('softwareDesc', 'Nubisreservation');
        $header->addChild('softwareVersion', '1.0');
        $header->addChild('softwareCompanyName', 'Vasilkoff LTD');
        $header->addChild('auditfileVersion', '1.0.3');

        $company = $xml->addChild('company');
        $company->addChild('companyIdent', $place->tax_number);
        $company->addChild('companyName', htmlspecialchars($place->name,ENT_XML1)); // $organization->name
        $company->addChild('taxRegistrationCountry', $place->country->code);

        // foreach place of company
//        foreach ($organization->places as $item) {
        $address_data = AddressHelper::parse($place->address);
        $address = $company->addChild('streetAddress');
        $address->addChild('streetname', $address_data['street']);
        $address->addChild('number', $address_data['number']);
        if($address_data['building']) $address->addChild('building', $address_data['building']);
        if($address_data['additional_number']) $address->addChild('number', $address_data['additional_number']);
        $address->addChild('city', htmlspecialchars($place->city,ENT_XML1));
        $address->addChild('postalCode', $place->zip_code);
        $address->addChild('country', $place->country->code);

        $postal_address = $company->addChild('postalAddress');
        $postal_address->addChild('streetname', $address_data['street']);
        $postal_address->addChild('number', $address_data['number']);
        if($address_data['building']) $postal_address->addChild('building', $address_data['building']);
        if($address_data['additional_number']) $postal_address->addChild('number', $address_data['additional_number']);
        $postal_address->addChild('city', htmlspecialchars($place->city, ENT_XML1));
        $postal_address->addChild('postalCode', $place->zip_code);
        $postal_address->addChild('country', $place->country->code);
//        }

        $vat_codes = $company->addChild('vatCodeDetails');
        $vat_code = $vat_codes->addChild('vatCodeDetail');
        $vat_code->addChild('vatCode', 1);
        $vat_code->addChild('dateOfEntry', '2019-12-01');
        $vat_code->addChild('vatDesc', 'VAT 25 %');
        $vat_code->addChild('standardVatCode', 1);

        $periods = $company->addChild('periods');
        $period = $periods->addChild('period');
        if($first_check){
            $period->addChild('periodNumber',1);
            $period->addChild('startDatePeriod',$first_check->printed_at->format('Y-m-d'));
            $period->addChild('startTimePeriod',$first_check->printed_at->format('H:i:s'));
            $period->addChild('endDatePeriod',$last_check->printed_at->format('Y-m-d'));
            $period->addChild('endTimePeriod',$last_check->printed_at->format('H:i:s'));
        }

        $employees = $company->addChild('employees');
        /* @var User $cashier */
        foreach ($cashiers as $cashier) {
            $employee = $employees->addChild('employee');
            $employee->addChild('empID',$cashier->id);
            $employee->addChild('dateOfEntry',$cashier->created_at->format('Y-m-d'));
            $employee->addChild('timeOfEntry',$cashier->created_at->format('H:i:s'));
            $employee->addChild('firstName',htmlspecialchars($cashier->first_name,ENT_COMPAT));
            $employee->addChild('surName',htmlspecialchars($cashier->last_name,ENT_XML1));
        }

        $articles = $company->addChild('articles');
        foreach ($used_products as $used_product) {
            $article = $articles->addChild('article');
            $article->addChild('artID', $used_product->id);
            $article->addChild('dateOfEntry', $used_product->created_at->format('Y-m-d'));
            $article->addChild('artDesc', htmlspecialchars($used_product->name,ENT_XML1));
        }

        $basics = $company->addChild('basics');
        foreach ($basic_data as $type => $basic_category) {
            foreach ($basic_category as $basic_datum) {
                $basic = $basics->addChild('basic');
                $basic->addChild('basicType', $type);
                $basic->addChild('basicID', $basic_datum['id']);
                if(array_key_exists('pred',$basic_datum)) $basic->addChild('predefinedBasicID', $basic_datum['pred']);
                $basic->addChild('basicDesc', $basic_datum['desc']);
            }
        }

        //foreach place
        $location = $company->addChild('location');
        $location->addChild('name',htmlspecialchars($place->name,ENT_XML1));
        $address = $location->addChild('streetAddress');
        $address->addChild('streetname', $address_data['street']);
        $address->addChild('number', $address_data['number']);
        if($address_data['building']) $address->addChild('building', $address_data['building']);
        if($address_data['additional_number']) $address->addChild('number', $address_data['additional_number']);
        $address->addChild('city', htmlspecialchars($place->city,ENT_XML1));
        $address->addChild('postalCode', $place->zip_code);
        $address->addChild('country', $place->country->code);

        // foreach cashregister
        $cashregister = $location->addChild('cashregister');
        $cashregister->addChild('registerID','Nubis-'.$place->id);
        $cashregister->addChild('regDesc', 'The only cash register');
        $event_id = 1;
        $report_id = 1;
        for ($i = 0; $i < count($logs); $i++) {
            $log = $logs->get($i);
            if(in_array($log->action,['print-first-check','print-check'])){
                $eventType = 'SALREC';
            }elseif(in_array($log->action,['create-check-refund'])){
                $eventType = 'RETREC';
            }else{
                continue;
            }
            $check_id = explode('#',$log->comment)[1];
            $check = Check::find($check_id);
            if(!$check || !$check->place_check_id) continue;
            $event = $cashregister->addChild('event');
            $event->addChild('eventID', $event_id);
            $event->addChild('eventType', $eventType);
            $event->addChild('transID', $check->place_check_id);
            $event->addChild('empID', $log->user_id);
            $event->addChild('eventDate', $log->created_at->format('Y-m-d'));
            $event->addChild('eventTime', $log->created_at->format('H:i:s'));
            $event_id++;
            if($logs->has($i+1)){
                if($log->created_at->format('Y-m-d') !== $logs->get($i+1)->created_at->format('Y-m-d')){
                    self::addZReport($cashregister,$event_id, $report_id, $place, $log->created_at);
                }
            }else{
                self::addZReport($cashregister,$event_id, $report_id, $place, $log->created_at);
            }
        }

        foreach ($checks as $check) {
            $signature_data = explode(';', $check->signature_data);
            $cashtransaction = $cashregister->addChild('cashtransaction');
            $cashtransaction->addChild('nr', $check->place_check_id);
            $cashtransaction->addChild('transID', $check->place_check_id);
            $cashtransaction->addChild('transType', $check->status === 'closed' ? 'CASHSAL' : 'RETURNSAL');
            $cashtransaction->addChild('transAmntIn', ($check->status === 'refund' ? '-' : '').$signature_data[7]);
            $cashtransaction->addChild('transAmntEx', ($check->status === 'refund' ? '-' : '').$signature_data[8]);
            $cashtransaction->addChild('amntTp', $check->status === 'closed' ? 'C' : 'D');
            $cashtransaction->addChild('empID', $check->printed_id);
            $cashtransaction->addChild('periodNumber', 1);
            $cashtransaction->addChild('transDate', $check->printed_at->format('Y-m-d'));
            $cashtransaction->addChild('transTime', $check->printed_at->format('H:i:s'));
            $cashtransaction->addChild('bookDate', $check->order->reservation_time->format('Y-m-d'));
            $cashtransaction->addChild('bookTime', $check->order->reservation_time->format('H:i:s'));
            $cashtransaction->addChild('invoiceID', $check->order->id);
            $cashtransaction->addChild('refID', implode(', ',$check->order->table_ids));
            foreach ($check->products as $index => $product) {

                $p_total = (float)$product->pivot->price * (float)$product->pivot->quantity;
                $p_discount = 0;
                if($check->discount){
                    if(str_contains($check->discount_type,'percent')){
                        $p_discount = $p_total * $check->discount / 100;
                    }else{
                        $p_discount = $p_total * $check->discount / $check->subtotal;
                    }
                    $p_total = $p_total - $p_discount;
                }

                $vat = round($p_total - $p_total / (1 + $product->tax / 100),2);

                $ctLine = $cashtransaction->addChild('ctLine');
                $ctLine->addChild('nr', $check->place_check_id);
                $ctLine->addChild('lineID', $index+1);
                $ctLine->addChild('lineType', $check->status === 'closed' ? 'SAL' : 'RET');
                $ctLine->addChild('artID', $product->id);
                $ctLine->addChild('qnt', ($check->status === 'refund' ? '-' : '').$product->pivot->quantity);
                $ctLine->addChild('lineAmntIn', ($check->status === 'refund' ? '-' : '').number_format($p_total,2,'.',''));
                $ctLine->addChild('lineAmntEx', ($check->status === 'refund' ? '-' : '').number_format(($p_total - $vat),2,'.',''));
                $ctLine->addChild('amntTp', $check->status === 'closed' ? 'C' : 'D');
                if($product->tax){
                    $xvat = $ctLine->addChild('vat');
                    $xvat->addChild('vatCode', 1);
                    $xvat->addChild('vatPerc', number_format($product->tax,2,'.',''));
                    $xvat->addChild('vatAmnt', ($check->status === 'refund' ? '-' : '').number_format($vat,2,'.',''));
                    $xvat->addChild('vatAmntTp', $check->status === 'closed' ? 'C' : 'D');
                    $xvat->addChild('vatBasAmnt', ($check->status === 'refund' ? '-' : '').number_format(($p_total - $vat),2,'.',''));
                }
                if($check->discount){
                    $discount = $ctLine->addChild('discount');
                    $discount->addChild('dscTp', $check->discount_type);
                    $discount->addChild('dscAmnt', ($check->status === 'refund' ? '-' : '').number_format($p_discount,2,'.',''));
                }
            }
            if($product->tax){
                $xvat = $cashtransaction->addChild('vat');
                $xvat->addChild('vatCode', 1);
                $xvat->addChild('vatPerc', number_format($product->tax,2,'.',''));
                $xvat->addChild('vatAmnt', ($check->status === 'refund' ? '-' : '').number_format($signature_data[7]-$signature_data[8],2,'.',''));
                $xvat->addChild('vatAmntTp', $check->status === 'closed' ? 'C' : 'D');
                $xvat->addChild('vatBasAmnt', ($check->status === 'refund' ? '-' : '').number_format($signature_data[8],2,'.',''));
            }
            if($check->cash_amount){
                $payment = $cashtransaction->addChild('payment');
                $payment->addChild('paymentType','CASH');
                $payment->addChild('paidAmnt',($check->status === 'refund' ? '-' : '').number_format($check->cash_amount,2,'.',''));
                $payment->addChild('empID',$check->printed_id);
            }
            if($check->card_amount){
                $payment = $cashtransaction->addChild('payment');
                $payment->addChild('paymentType','DEBCARD');
                $payment->addChild('paidAmnt',($check->status === 'refund' ? '-' : '').number_format($check->card_amount,2,'.',''));
                $payment->addChild('empID',$check->printed_id);
            }
            $cashtransaction->addChild('signature',$check->signature);
            $cashtransaction->addChild('keyVersion',$check->key_version);
            $cashtransaction->addChild('certificateData',$check->certificate);
            $cashtransaction->addChild('voidTransaction','false');
            $cashtransaction->addChild('trainingID','false');
        }

        $dom = new DOMDocument('1.0', 'UTF-8');
        $dom->preserveWhiteSpace = false;
        $dom->formatOutput = true;
        $dom->loadXML($xml->asXML());

        $xsdPath = base_path('xsd/SAF-T.xsd');
        if ($dom->schemaValidate($xsdPath)) {
            return ['status' => true, 'result' => $dom->saveXML()];
        } else {
            return ['status' => false, 'result' => self::libxmlGetErrors()];
        }
    }

    private static function addZReport(\SimpleXMLElement &$root, int &$event_id, int &$id,  Place $place, Carbon $date): void
    {
        /* @var Collection<Check> $checks */
        $checks = Check::where('place_id',$place->id)
            ->whereIn('status', ['closed', 'refund'])
            ->whereNotNull('place_check_id')
            ->where(DB::raw('DATE(printed_at)'),$date->format('Y-m-d'))
            ->get();

        $grand_total = Check::select(DB::raw('SUM(CASE
                WHEN status = "closed" THEN total
                ELSE 0
            END) as closed, SUM(CASE
                WHEN status = "refund" THEN total
                ELSE 0
            END) as refund'))
            ->where('place_id',$place->id)
            ->whereIn('status', ['closed', 'refund'])
            ->whereNotNull('place_check_id')
            ->whereBetween(DB::raw('DATE(printed_at)'),['2000-01-01',$date->format('Y-m-d')])
            ->first();

        $total = 0;
        $last = $checks->last();
        $cash = 0;
        $card = 0;
        $cash_num = 0;
        $card_num = 0;
        $emp_payments = [];
        $refund = 0;
        $refund_num = 0;
        $discount_amnt = 0;
        $discount_num = 0;
        foreach ($checks as $check) {
            $total += ($check->status === 'refund' ? -$check->total : $check->total);
            $cash += ($check->status === 'refund' ? -$check->cash_amount : $check->cash_amount);
            $card += ($check->status === 'refund' ? -$check->card_amount : $check->card_amount);
            if($check->cash_amount) $cash_num++;
            if($check->card_amount) $card_num++;

            if(!array_key_exists($check->printed_id,$emp_payments)){
                $emp_payments[$check->printed_id] = ['cash' => 0, 'card' => 0, 'cash_num' => 0, 'card_num' => 0];
            }
            $emp_payments[$check->printed_id]['cash'] += ($check->status === 'refund' ? -$check->cash_amount : $check->cash_amount);
            $emp_payments[$check->printed_id]['card'] += ($check->status === 'refund' ? -$check->card_amount : $check->card_amount);
            if($check->cash_amount) $emp_payments[$check->printed_id]['cash_num']++;
            if($check->card_amount) $emp_payments[$check->printed_id]['card_num']++;

            if($check->status === 'refund'){
                $refund += $check->total;
                $refund_num++;
            }

            if($check->total != $check->subtotal){
                $discount_amnt += $check->subtotal - $check->total;
                $discount_num++;
            }
        }

        $day_vat = round($total - $total / (1 + 25 / 100),2);

        $event = $root->addChild('event');
        $event->addChild('eventID', $event_id);
        $event->addChild('eventType', 'ZREP');
        $event->addChild('empID', $last->printed_id);
        $event->addChild('eventDate', $date->format('Y-m-d'));
        $event->addChild('eventTime', '23:59:59');
        $eventReport = $event->addChild('eventReport');
        $eventReport->addChild('reportID',$id);
        $eventReport->addChild('reportType','Z report');
        $eventReport->addChild('companyIdent',$place->tax_number);
        $eventReport->addChild('companyName',htmlspecialchars($place->name,ENT_XML1));
        $eventReport->addChild('reportDate',$date->format('Y-m-d'));
        $eventReport->addChild('reportTime','23:59:59');
        $eventReport->addChild('registerID','Nubis-'.$place->id);
        $reportTotalCashSales = $eventReport->addChild('reportTotalCashSales');
        $reportTotalCashSales->addChild('totalCashSaleAmnt',number_format($total,2,'.',''));

        $reportArtGroups = $eventReport->addChild('reportArtGroups');
        $reportArtGroup = $reportArtGroups->addChild('reportArtGroup');
        $reportArtGroup->addChild('artGroupID','NONE');
        $reportArtGroup->addChild('artGroupNum',0);
        $reportArtGroup->addChild('artGroupAmnt','0.00');

        $reportPayments = $eventReport->addChild('reportPayments');
        if($cash_num > 0){
            $reportPayment = $reportPayments->addChild('reportPayment');
            $reportPayment->addChild('paymentType','CASH');
            $reportPayment->addChild('paymentNum',$cash_num);
            $reportPayment->addChild('paymentAmnt',number_format($cash,2,'.',''));
        }
        if($card_num > 0){
            $reportPayment = $reportPayments->addChild('reportPayment');
            $reportPayment->addChild('paymentType','DEBCARD');
            $reportPayment->addChild('paymentNum',$card_num);
            $reportPayment->addChild('paymentAmnt',number_format($card,2,'.',''));
        }

        $reportEmpPayments = $eventReport->addChild('reportEmpPayments');
        foreach ($emp_payments as $emp_id => $emp_payment) {
            if($emp_payment['cash_num'] > 0){
                $reportEmpPayment = $reportEmpPayments->addChild('reportEmpPayment');
                $reportEmpPayment->addChild('empID',$emp_id);
                $reportEmpPayment->addChild('paymentType','CASH');
                $reportEmpPayment->addChild('paymentNum',$emp_payment['cash_num']);
                $reportEmpPayment->addChild('paymentAmnt',number_format($emp_payment['cash'],2,'.',''));
            }
            if($emp_payment['card_num'] > 0){
                $reportEmpPayment = $reportEmpPayments->addChild('reportEmpPayment');
                $reportEmpPayment->addChild('empID',$emp_id);
                $reportEmpPayment->addChild('paymentType','DEBCARD');
                $reportEmpPayment->addChild('paymentNum',$emp_payment['card_num']);
                $reportEmpPayment->addChild('paymentAmnt',number_format($emp_payment['card'],2,'.',''));
            }
        }
        $reportCashSalesVat = $eventReport->addChild('reportCashSalesVat');
        $reportCashSaleVat = $reportCashSalesVat->addChild('reportCashSaleVat');
        $reportCashSaleVat->addChild('vatPerc', '25.00');
        $reportCashSaleVat->addChild('cashSaleAmnt', number_format($total - $day_vat,2,'.',''));
        $reportCashSaleVat->addChild('vatAmnt', number_format($day_vat,2,'.',''));

        $eventReport->addChild('reportOpeningChangeFloat', '0.00');
        $eventReport->addChild('reportReceiptNum', count($checks));
        $eventReport->addChild('reportOpenCashBoxNum', 0);
        $eventReport->addChild('reportReceiptCopyNum', 0);
        $eventReport->addChild('reportReceiptCopyAmnt', '0.00');
        $eventReport->addChild('reportReceiptProformaNum', 0); // TODO: Створити логи в яких писати коли друкувався чек на оплату і на яку суму
        $eventReport->addChild('reportReceiptProformaAmnt', '0.00');
        $eventReport->addChild('reportReturnNum', $refund_num);
        $eventReport->addChild('reportReturnAmnt', number_format($refund,2,'.',''));
        $eventReport->addChild('reportDiscountNum', $discount_num);
        $eventReport->addChild('reportDiscountAmnt', number_format($discount_amnt,2,'.',''));
        $eventReport->addChild('reportVoidTransNum',0);
        $eventReport->addChild('reportVoidTransAmnt', '0.00');
        $reportCorrLines = $eventReport->addChild('reportCorrLines');
        $reportCorrLine = $reportCorrLines->addChild('reportCorrLine');
        $reportCorrLine->addChild('corrLineType', 'NONE');
        $reportCorrLine->addChild('corrLineNum', 0);
        $reportCorrLine->addChild('corrLineAmnt', '0.00');

        $reportPriceInquiries = $eventReport->addChild('reportPriceInquiries');
        $reportPriceInquiry = $reportPriceInquiries->addChild('reportPriceInquiry');
        $reportPriceInquiry->addChild('priceInquiryGroup', 'NONE');
        $reportPriceInquiry->addChild('priceInquiryNum', 0);
        $reportPriceInquiry->addChild('priceInquiryAmnt', '0.00');

        $reportOtherCorrs = $eventReport->addChild('reportOtherCorrs');
        $reportOtherCorr = $reportOtherCorrs->addChild('reportOtherCorr');
        $reportOtherCorr->addChild('otherCorrType', 'NONE');
        $reportOtherCorr->addChild('otherCorrNum', 0);
        $reportOtherCorr->addChild('otherCorrAmnt', '0.00');

        $eventReport->addChild('reportReceiptDeliveryNum', 0);
        $eventReport->addChild('reportReceiptDeliveryAmnt', '0.00');
        $eventReport->addChild('reportTrainingNum', 0);
        $eventReport->addChild('reportTrainingAmnt', '0.00');

        $eventReport->addChild('reportGrandTotalSales', number_format($grand_total->closed,2,'.',''));
        $eventReport->addChild('reportGrandTotalReturn', number_format($grand_total->refund,2,'.',''));
        $eventReport->addChild('reportGrandTotalSalesNet', number_format($grand_total->closed-$grand_total->refund,2,'.',''));

        $event_id++;
        $id++;
    }

    private static function libxmlGetErrors(): string
    {
        $errors = libxml_get_errors();
        $message = '';

        foreach ($errors as $error) {
            $message .= self::formatLibxmlError($error) . PHP_EOL;
        }

        libxml_clear_errors();

        return $message;
    }

    private static function formatLibxmlError(\LibXMLError $error): string
    {
        $return = "Error at line {$error->line} column {$error->column}: ";
        switch ($error->level) {
            case LIBXML_ERR_WARNING:
                $return .= "Warning {$error->code}: ";
                break;
            case LIBXML_ERR_ERROR:
                $return .= "Error {$error->code}: ";
                break;
            case LIBXML_ERR_FATAL:
                $return .= "Fatal Error {$error->code}: ";
                break;
        }
        $return .= trim($error->message);
        return $return;
    }
}
