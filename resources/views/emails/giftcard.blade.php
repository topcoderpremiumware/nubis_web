@php use App\Models\Giftcard; @endphp
@php
/** @var Giftcard $giftcard */
$place = $giftcard->place;
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{$place->name}}</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
<!-- Container -->
<table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" bgcolor="#ffffff">
    <tr>
        <td align="center">
            <!-- Content -->
            <table width="600" border="0" cellspacing="0" cellpadding="20" align="center">
                <tr>
                    <td align="center">
                        <!-- Restaurant Image -->
                        <div style ="background-image:url('http://img.mailinblue.com/7878101/images/66bb14a201a3a_1723536546.jpg');width:100%; height: 150px;" ></div>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="font-size: 24px; font-weight: bold;">
                        {{$place->name}}
                    </td>
                </tr>
                <tr>
                    <td align="center" style="font-size: 20px;">
                        Gift card
                    </td>
                </tr>
                @if($giftcard->giftcard_menu_id && array_key_exists($place->language,$giftcard->giftcard_menu->labels))
                <tr>
                    <td align="center" style="font-size: 18px; font-style: italic;">
                        {{$giftcard->giftcard_menu->labels[$place->language]['name']}}
                    </td>
                </tr>
                <tr>
                    <td style="font-size: 16px; text-align: center;">
                        {{$giftcard->giftcard_menu->labels[$place->language]['description']}}
                    </td>
                </tr>
                @endif
                <tr>
                    <td align="center" style="font-size: 16px; font-weight: bold; padding-top: 20px;">
                        Giftcards can be found in the attachments.
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
