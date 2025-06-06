<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @method static insert(array[] $data)
 */
class MessageTemplate extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function place()
    {
        return $this->belongsTo(Place::class);
    }

    public static function seedPlace($place_id)
    {
        $data = [
            [
                'place_id' => $place_id,
                'purpose' => 'sms-reminder',
                'subject' => 'Nubis Reservation',
                'text' => "Dear #FIRST_NAME#\nWe are looking forward to seeing you #BOOK_DAY# for #NUMBER_OF_GUESTS# persons at #BOOK_HOUR#:#BOOK_MIN# at #RESTAURANT_NAME# You are welcome to contact us at #RESTAURANT_PHONE# if you have changes.",
                'language' => 'en',
                'active' => 1
            ],
            [
                'place_id' => $place_id,
                'purpose' => 'sms-reminder',
                'subject' => 'Nubis Reservation',
                'text' => "Dear #FIRST_NAME#\nVi ser frem til at byde dig velkommen #BOOK_DAY# for #NUMBER_OF_GUESTS# personer #BOOK_HOUR#:#BOOK_MIN# at #RESTAURANT_NAME# Du er velkommen til at kontakte os her #RESTAURANT_PHONE# hvis du har spørgsmål eller ændringer til din bestilling",
                'language' => 'da',
                'active' => 1
            ],
            [
                'place_id' => $place_id,
                'purpose' => 'sms-notification',
                'subject' => 'Nubis Reservation',
                'text' => "Dear #FIRST_NAME#\nYou have a table for #NUMBER_OF_GUESTS# persons at #RESTAURANT_NAME# the #BOOK_DAY# of #BOOK_MONTH_NAME# at #BOOK_HOUR#:#BOOK_MIN#.\nWe are looking forward to seeing you\nBest regards #RESTAURANT_NAME#\n\nIf you have changes to your booking you can call us at #RESTAURANT_PHONE#",
                'language' => 'en',
                'active' => 1
            ],
            [
                'place_id' => $place_id,
                'purpose' => 'sms-notification',
                'subject' => 'Nubis Reservation',
                'text' => "Kære #FIRST_NAME# #LAST_NAME# Du har booket et bord på #NUMBER_OF_GUESTS# persons at #RESTAURANT_NAME# the #BOOK_MONTH_NAME# #BOOK_DAY_NAME# #BOOK_DAY# at #BOOK_HOUR#:#BOOK_MIN#. Vi ser frem til at se jer #RESTAURANT_NAME#\nDu kan afbestille din booking her #CANCEL_LINK# Du er også velkommen til at kontakte os på telefon #RESTAURANT_PHONE# hvis du har ændringer eller spørgsmål eller kommentarer til din booking",
                'language' => 'da',
                'active' => 1
            ],
            [
                'place_id' => $place_id,
                'purpose' => 'sms-delete',
                'subject' => 'Nubis Reservation',
                'text' => "Dear #CONTACT_PERSON#\nYou have deleted your reservation for #NUMBER_OF_GUESTS# persons at #RESTAURANT_NAME# the #BOOK_DAY#\nWe hope to see you an other day\nBest regards #RESTAURANT_NAME#",
                'language' => 'en',
                'active' => 1
            ],
            [
                'place_id' => $place_id,
                'purpose' => 'sms-delete',
                'subject' => 'Nubis Reservation',
                'text' => "Kære #CONTACT_PERSON#\nDu har annulleret  #NUMBER_OF_GUESTS# persons at #RESTAURANT_NAME# the #BOOK_DAY#\nVi håber at se jer en anden gang\nMed venlig hilsen #RESTAURANT_NAME#",
                'language' => 'da',
                'active' => 1
            ],
            [
                'place_id' => $place_id,
                'purpose' => 'sms-confirmation',
                'subject' => 'Nubis Reservation',
                'text' => "Dear #FIRST_NAME# #LAST_NAME# you have booked a table for #NUMBER_OF_GUESTS# persons at #RESTAURANT_NAME# the #BOOK_MONTH_NAME# #BOOK_DAY_NAME# #BOOK_DAY# at #BOOK_HOUR#:#BOOK_MIN#. We are looking forward to seeing you. Best regards #RESTAURANT_NAME#\nYou can cancel your booking here #CANCEL_LINK#",
                'language' => 'en',
                'active' => 1
            ],
            [
                'place_id' => $place_id,
                'purpose' => 'sms-confirmation',
                'subject' => 'Nubis Reservation',
                'text' => "Kære #FIRST_NAME# #LAST_NAME# Du har booket et bord på #NUMBER_OF_GUESTS# persons at #RESTAURANT_NAME# the #BOOK_MONTH_NAME# #BOOK_DAY_NAME# #BOOK_DAY# at #BOOK_HOUR#:#BOOK_MIN#. Vi ser frem til at se jer #RESTAURANT_NAME#\nDu kan afbestille din booking her #CANCEL_LINK#",
                'language' => 'da',
                'active' => 1
            ],
            [
                'place_id' => $place_id,
                'purpose' => 'sms-change',
                'subject' => 'Nubis Reservation',
                'text' => "Dear #FIRST_NAME#\nYou have changed your reservation to #NUMBER_OF_GUESTS# persons at #BOOK_DAY# #BOOK_HOUR#:#BOOK_MIN# we are looking forward to seeing you\nBest regards\n\nWe are looking forward to seeing you at #RESTAURANT_NAME#",
                'language' => 'en',
                'active' => 1
            ],
            [
                'place_id' => $place_id,
                'purpose' => 'sms-change',
                'subject' => 'Nubis Reservation',
                'text' => "Dear #FIRST_NAME# #FIRST_NAME#\nDu har ændret din reservation til #NUMBER_OF_GUESTS# peroner til #BOOK_DAY# #BOOK_HOUR#:#BOOK_MIN# Vi ser frem til at byde dig velkommen\nMed venlig hilsen\n\n#RESTAURANT_NAME#",
                'language' => 'da',
                'active' => 1
            ],
            [
                'place_id' => $place_id,
                'purpose' => 'sms-payment-request',
                'subject' => 'Nubis Reservation',
                'text' => "Dear #FIRST_NAME# #LAST_NAME# you have booked a table for #NUMBER_OF_GUESTS# persons at #RESTAURANT_NAME# the #BOOK_MONTH_NAME# #BOOK_DAY_NAME# #BOOK_DAY# at #BOOK_HOUR#:#BOOK_MIN#.\nYOU HAVE TO MAKE A PREPAYMENT HERE #PAY_BOOKING_LINK#\nOr your booking will be automatically canceled.",
                'language' => 'en',
                'active' => 1
            ],
            [
                'place_id' => $place_id,
                'purpose' => 'sms-payment-request',
                'subject' => 'Nubis Reservation',
                'text' => "Beste #FIRST_NAME# #LAST_NAME#, je hebt een tafel gereserveerd voor #NUMBER_OF_GUESTS# personen bij #RESTAURANT_NAME# de #BOOK_MONTH_NAME# #BOOK_DAY_NAME# #BOOK_DAY# om #BOOK_HOUR#:#BOOK_MIN#.\nU MOET HIER EEN VOORUITBETALING DOEN #PAY_BOOKING_LINK#\nOf je boeking wordt automatisch geannuleerd.",
                'language' => 'da',
                'active' => 1
            ],
            [
                'place_id' => $place_id,
                'purpose' => 'sms-waiting-list',
                'subject' => 'You on our waiting list',
                'text' => "Dear #FIRST_NAME# #LAST_NAME# you are on our waiting list for a table for:\n#NUMBER_OF_GUESTS# persons at #RESTAURANT_NAME# the #BOOK_MONTH_NAME# #BOOK_DAY_NAME# #BOOK_DAY# at #BOOK_HOUR#:#BOOK_MIN#. We are looking forward to seeing you. Best regards #RESTAURANT_NAME#\nWe will contact you if we get a free table and are hoping to see you in the near future",
                'language' => 'en',
                'active' => 1
            ],
            [
                'place_id' => $place_id,
                'purpose' => 'sms-waiting-list',
                'subject' => 'Du kommet på vores venteliste',
                'text' => "Kære #FIRST_NAME# #LAST_NAME#\nDu er kommet på vores venteliste for:\n#NUMBER_OF_GUESTS# persons at #RESTAURANT_NAME# the #BOOK_MONTH_NAME# #BOOK_DAY_NAME# #BOOK_DAY# at #BOOK_HOUR#:#BOOK_MIN#. We are looking forward to seeing you. Best regards #RESTAURANT_NAME#\nVi vil kontakte dig såfremt der bliver et bord ledigt til dig og håber at se dig i nær fremtid",
                'language' => 'da',
                'active' => 1
            ],
            [
                'place_id' => $place_id,
                'purpose' => 'email-waiting-list',
                'subject' => 'You on our waiting list',
                'text' => '<p>Dear #FIRST_NAME# #LAST_NAME# <i><strong>you are on our waiting list </strong></i>for a table for:</p><p>&nbsp;#NUMBER_OF_GUESTS# persons at #RESTAURANT_NAME# the #BOOK_MONTH_NAME# #BOOK_DAY_NAME# #BOOK_DAY# at #BOOK_HOUR#:#BOOK_MIN#. We are looking forward to seeing you. Best regards #RESTAURANT_NAME#&nbsp;</p><p><strong>We will contact you if we get a free table and are hoping to see you in the near future</strong></p><p>You can not replay to this e-mail but you can contack us here:</p><p>#RESTAURANT_NAME#</p><p>#RESTAURANT_ZIPCODE# #RESTAURANT_CITY#</p><p>#RESTAURANT_EMAIL#</p><p>#RESTAURANT_PHONE#</p><p>&nbsp;</p>',
                'language' => 'en',
                'active' => 1
            ],
            [
                'place_id' => $place_id,
                'purpose' => 'email-waiting-list',
                'subject' => 'Du kommet på vores venteliste',
                'text' => '<p>Kære #FIRST_NAME# #LAST_NAME#&nbsp;</p><p><i><strong>Du er kommet på vores venteliste for</strong></i>:</p><p>#NUMBER_OF_GUESTS# persons at #RESTAURANT_NAME# the #BOOK_MONTH_NAME# #BOOK_DAY_NAME# #BOOK_DAY# at #BOOK_HOUR#:#BOOK_MIN#. We are looking forward to seeing you. Best regards #RESTAURANT_NAME#&nbsp;</p><p>Vi vil kontakte dig såfremt der bliver et bord ledigt til dig og håber at se dig i nær fremtid</p><p>Du kan ikke svare på denne e-mail men vi kan kontaktes på nedenstående:</p><p>#RESTAURANT_NAME#</p><p>#RESTAURANT_ZIPCODE# #RESTAURANT_CITY#</p><p>#RESTAURANT_EMAIL#</p><p>#RESTAURANT_PHONE#</p><p>&nbsp;</p>',
                'language' => 'da',
                'active' => 1
            ],
            [
                'place_id' => $place_id,
                'purpose' => 'email-reminder',
                'subject' => 'You have a reservation',
                'text' => '<p>Dear #FIRST_NAME# #LAST_NAME# you have booked a table for #NUMBER_OF_GUESTS# persons at #RESTAURANT_NAME# the #BOOK_MONTH_NAME# #BOOK_DAY_NAME# #BOOK_DAY# at #BOOK_HOUR#:#BOOK_MIN#. We are looking forward to seeing you. Best regards #RESTAURANT_NAME# Your booking id is #BOOK_ID# and you have the booking for #BOOK_LENGTH# minutes</p><p>You can not replay to this e-mail but you can contact us here:</p><p>#RESTAURANT_NAME#</p><p>#RESTAURANT_ZIPCODE# #RESTAURANT_CITY#</p><p>#RESTAURANT_EMAIL#</p><p>#RESTAURANT_PHONE#</p><p>or you can cancel your booking here:</p><p>#CANCEL_BOOKING_PAGE#</p>',
                'language' => 'en',
                'active' => 1
            ],
            [
                'place_id' => $place_id,
                'purpose' => 'email-reminder',
                'subject' => 'Vi glæder os til at se dig',
                'text' => '<p>Kære #FIRST_NAME# #LAST_NAME# Du har booket et bord til #NUMBER_OF_GUESTS# personer til #RESTAURANT_NAME# the #BOOK_MONTH_NAME# #BOOK_DAY_NAME# #BOOK_DAY# at #BOOK_HOUR#:#BOOK_MIN#. Vi ser frem til at se dig #RESTAURANT_NAME# Dit booking id er #BOOK_ID# og du har bordet i #BOOK_LENGTH# minuten</p><p>Du kan ikke svare på denne mail men har du spørgsmål eller ændringer kan du kontakte os her:</p><p>#RESTAURANT_NAME#</p><p>#RESTAURANT_ZIPCODE# #RESTAURANT_CITY#</p><p>#RESTAURANT_EMAIL#</p><p>#RESTAURANT_PHONE#</p><p>Eller du kan afbestille din booking her</p><p>#CANCEL_BOOKING_PAGE#</p>',
                'language' => 'da',
                'active' => 1
            ],
            [
                'place_id' => $place_id,
                'purpose' => 'email-payment-request',
                'subject' => 'You have a reservation',
                'text' => '<p>Dear #FIRST_NAME# #LAST_NAME# you have booked a table for #NUMBER_OF_GUESTS# persons at #RESTAURANT_NAME# the #BOOK_MONTH_NAME# #BOOK_DAY_NAME# #BOOK_DAY# at #BOOK_HOUR#:#BOOK_MIN#. We are looking forward to seeing you. Best regards #RESTAURANT_NAME# Your booking id is #BOOK_ID# and you have the booking for #BOOK_LENGTH# minutes</p><p>YOU HAVE TO MAKE A PREPAYMENT HERE #PAY_BOOKING_LINK#</p><p>You can not replay to this e-mail but you can contact us here:</p><p>#RESTAURANT_NAME#</p><p>#RESTAURANT_ZIPCODE# #RESTAURANT_CITY#</p><p>#RESTAURANT_EMAIL#</p><p>#RESTAURANT_PHONE#</p><p>You can pay for your booking via the link:</p><p>#PAY_BOOKING_LINK#</p><p>or you can cancel your booking here:</p><p>#CANCEL_BOOKING_PAGE#</p>',
                'language' => 'en',
                'active' => 1
            ],
            [
                'place_id' => $place_id,
                'purpose' => 'email-payment-request',
                'subject' => 'Betalingsanmodning for din reservation',
                'text' => '<p>Kære #FIRST_NAME# #LAST_NAME#</p><p>Du har lavet en booking til #NUMBER_OF_GUESTS# people at #RESTAURANT_NAME# the #BOOK_DAY_NAME# #BOOK_TIME#. Der er knyttet en forudbetaling til din bestilling som du kan betale her #PAY_BOOKING_LINK#</p><p>Vi glæder os til at se dig</p><p>#RESTAURANT_NAME#</p>',
                'language' => 'da',
                'active' => 1
            ],
            [
                'place_id' => $place_id,
                'purpose' => 'email-delete',
                'subject' => 'You have deletet your booking',
                'text' => '<p>Dear #CONTACT_PERSON#<br>You have deleted your reservation for #NUMBER_OF_GUESTS# persons at #RESTAURANT_NAME# the #BOOK_DAY#<br>We hope to see you an other day<br>Best regards #RESTAURANT_NAME#</p>',
                'language' => 'en',
                'active' => 1
            ],
            [
                'place_id' => $place_id,
                'purpose' => 'email-delete',
                'subject' => 'Du har slettet din reservation',
                'text' => '<p>Kære #CONTACT_PERSON#<br>Du har slettet din reservation for &nbsp;#NUMBER_OF_GUESTS# persons at #RESTAURANT_NAME# the #BOOK_DAY#<br>Vi håber at se dig en anden gang<br>Med venlig hilsen &nbsp;#RESTAURANT_NAME#</p>',
                'language' => 'da',
                'active' => 1
            ],
            [
                'place_id' => $place_id,
                'purpose' => 'email-confirmation',
                'subject' => 'You have made a reservation',
                'text' => '<p>Dear #FIRST_NAME# #LAST_NAME# you have booked a table for #NUMBER_OF_GUESTS# persons at #RESTAURANT_NAME# the #BOOK_MONTH_NAME# #BOOK_DAY_NAME# #BOOK_DAY# at #BOOK_HOUR#:#BOOK_MIN#. We are looking forward to seeing you. Best regards #RESTAURANT_NAME# Your booking id is #BOOK_ID# and you have the booking for #BOOK_LENGTH# minutes</p><p>You can not replay to this e-mail but you can contact us here:</p><p>#RESTAURANT_NAME#</p><p>#RESTAURANT_ZIPCODE# #RESTAURANT_CITY#</p><p>#RESTAURANT_EMAIL#</p><p>#RESTAURANT_PHONE#</p><p>or you can cancel your booking here:</p><p>#CANCEL_BOOKING_PAGE#</p>',
                'language' => 'en',
                'active' => 1
            ],
            [
                'place_id' => $place_id,
                'purpose' => 'email-confirmation',
                'subject' => 'Du har booket et bord',
                'text' => '<p>Kære #FIRST_NAME# #LAST_NAME# Du har booket et bord til #NUMBER_OF_GUESTS# personer til #RESTAURANT_NAME# the #BOOK_MONTH_NAME# #BOOK_DAY_NAME# #BOOK_DAY# at #BOOK_HOUR#:#BOOK_MIN#. Vi ser frem til at se dig #RESTAURANT_NAME# Dit booking id er #BOOK_ID# og du har bordet i #BOOK_LENGTH# minuten</p><p>Du kan ikke svare på denne mail men har du spørgsmål eller ændringer kan du kontakte os her:</p><p>#RESTAURANT_NAME#</p><p>#RESTAURANT_ZIPCODE# #RESTAURANT_CITY#</p><p>#RESTAURANT_EMAIL#</p><p>#RESTAURANT_PHONE#</p><p>Eller du kan afbestille din booking her</p><p>#CANCEL_BOOKING_PAGE#</p>',
                'language' => 'da',
                'active' => 1
            ],
            [
                'place_id' => $place_id,
                'purpose' => 'email-change',
                'subject' => 'You have changed your reservaton',
                'text' => '<p>Dear #FIRST_NAME#<br>You have changed your reservation to #NUMBER_OF_GUESTS# persons at #BOOK_DAY# #BOOK_HOUR#:#BOOK_MIN# we are looking forward to seeing you<br>Best regards</p><p>We are looking forward to seeing you at #RESTAURANT_NAME#</p>',
                'language' => 'en',
                'active' => 1
            ],
            [
                'place_id' => $place_id,
                'purpose' => 'email-change',
                'subject' => 'Du har ændret din reservation',
                'text' => '<p>Dear #FIRST_NAME#<br>Du har ændret din reservation til #NUMBER_OF_GUESTS# personer på #BOOK_DAY# #BOOK_HOUR#:#BOOK_MIN# Vi ser frem til at se dig<br>Med venlig hilsen</p><p>&nbsp;#RESTAURANT_NAME#</p>',
                'language' => 'da',
                'active' => 1
            ],
            [
                'place_id' => $place_id,
                'purpose' => 'email-feedback-request',
                'subject' => 'Feedback',
                'text' => '<p>Dear #FIRST_NAME#</p><p></p><p>How was your visit to #RESTAURANT_NAME# on #BOOK_DAY_NAME# #BOOK_DAY# #BOOK_MONTH_NAME# #BOOK_YEAR# at #BOOK_HOUR#:#BOOK_MIN#?</p><p>We would greatly appreciate it if you would take two minutes of your time to give us feedback on your experience.</p><p>#FEEDBACK_LINK#</p><p>Thank you for your feedback</p>',
                'language' => 'en',
                'active' => 1
            ],
            [
                'place_id' => $place_id,
                'purpose' => 'email-feedback-request',
                'subject' => 'Feedback',
                'text' => '<p>Kære #FIRST_NAME#</p><p></p><p>Hvordan var dit besøg på #RESTAURANT_NAME# #BOOK_DAY_NAME# #BOOK_DAY# #BOOK_MONTH_NAME# #BOOK_YEAR# at #BOOK_HOUR#:#BOOK_MIN#?</p><p>Vi sætter stor pris på, hvis du vil bruge to minutter af din tid på at give os feedback på din oplevelse.</p><p>#FEEDBACK_LINK#</p><p>Tak for din feedback</p>',
                'language' => 'da',
                'active' => 1
            ],
        ];
        MessageTemplate::insert($data);
    }
}
