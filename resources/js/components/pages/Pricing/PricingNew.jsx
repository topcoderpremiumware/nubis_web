import React, { useEffect, useState } from 'react'
import './PricingNew.scss'
import { useTranslation } from 'react-i18next';
import eventBus from "../../../eventBus";
import TogglePill from "../../components/TogglePill/TogglePill";
import PriceCategory from "./PriceCategory";

const PricingNew = () => {
  const { t } = useTranslation();
  const [place, setPlace] = useState({})
  const [period, setPeriod] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getPlace()
    function placeChanged(){
      getPlace()
    }
    eventBus.on("placeChanged", placeChanged)
    return () => {
      eventBus.remove("placeChanged", placeChanged)
    }
  }, [])

  const getPlace = () => {
    axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}`).then(response => {
      setPlace(response.data)
    }).catch(error => {
    })
  }

  const getPaymentLink = (price_id,category) => {
    setLoading(true)
    axios.get(`${process.env.MIX_API_URL}/api/billing/get_payment_link`, {
      params: {
        place_id: localStorage.getItem('place_id'),
        price_id: price_id,
        category: category
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setLoading(false)
      window.open(response.data.url, '_blank').focus();
    }).catch(error => { })
  }

  return (
    <div className='pricing_page'>
      <div className="mini_title">{t('Pricing')}</div>
      <div className="title">{t('Flexible Pricing for Your Business Needs')}</div>
      <div>{t('Find the right solution that fits your business and helps you achieve success effortlessly.')}</div>
      <div className="payment_wrapper">
        <TogglePill
          width="357px" height="48px" value={period}
          color="#FF9763" onChange={(e) => setPeriod(e.target.checked ? 1 : 0)}
          labelOff={t('Price annually')} labelOn={t('Price monthly')}/>
        {period ? <div className="categories_wrapper">
          <PriceCategory price="1195 DKK" disabled={loading}
                         title={t('Full Package')} subtitle={t('Billed monthly.')}
                         description={[
                           t('Complete Solution (POS, Booking, Gift Cards)'),
                           t('Tax Authority Approved'),
                           t('Easy Online Reservations'),
                           t('Direct Gift Card Payments'),
                           t('Integrated Payment System'),
                           t('Automated SMS & Email'),
                           t('Full Online Reporting')
                         ]}
                         onClick={() => getPaymentLink('price_1R020sCVi0riU70PwzogV2Vn','full')}
          />
          <PriceCategory price="595 DKK" disabled={loading}
                         title={t('Booking System')} subtitle={t('Billed monthly.')}
                         description={[
                           t('24/7 Online Booking'),
                           t('Automatic SMS & Emails'),
                           t('Custom Table Layouts'),
                           t('Guest Payment Integrated'),
                           t('Custom Menus per Table')
                         ]}
                         onClick={() => getPaymentLink('price_1R024iCVi0riU70Ptuan8wmp','booking')}
          />
          <PriceCategory price="795 DKK" disabled={loading}
                         title={t('Take Away')} subtitle={t('Billed monthly.')}
                         description={[

                         ]}
                         onClick={() => getPaymentLink('price_1RYjIwCVi0riU70Pe6uZ6WE2','take_away')}
          />
          <PriceCategory price="495 DKK" disabled={loading}
                         title={t('POS')} subtitle={t('Billed monthly.')}
                         description={[
                           t('Fast Order Handling'),
                           t('Flexible Payment Methods'),
                           t('Tax Authority Approved'),
                           t('Receipt Printing Included'),
                           t('Easy Setup with Photos'),
                           t('Free Reporting App')
                         ]}
                         onClick={() => getPaymentLink('price_1R02BGCVi0riU70PQDNtSFGE','pos')}
          />
          <PriceCategory price="695 DKK" disabled={loading}
                         title={t('POS + Terminal')} subtitle={t('Billed monthly.')}
                         description={[
                           t('Secure Payment Processing'),
                           t('Low Fees (from 0.6%)'),
                           t('Quick Payment Process'),
                           t('Partial & Group Payments'),
                           t('Swedbank Compatible')
                         ]}
                         onClick={() => getPaymentLink('price_1R02F7CVi0riU70PbFFjyhPQ','pos_terminal')}
          />
          <PriceCategory price="185 DKK" disabled={loading}
                         title={t('Gift Cards')} subtitle={t('Billed monthly.')}
                         description={[
                           t('Direct Payments to Account'),
                           t('Unique Gift Experiences'),
                           t('Easy Balance Management'),
                           t('Online & Physical Sales'),
                           t('Integrated POS Redemption')
                         ]}
                         onClick={() => getPaymentLink('price_1R02HACVi0riU70PwH5ZwMis','giftcards')}
          />
        </div> : <div className="categories_wrapper">
          <PriceCategory discount="25" prev="1195 DKK/Mo." price="895 DKK" disabled={loading}
                         title={t('Full Package')} subtitle={t('Billed annually.')}
                         description={[
                           t('Complete Solution (POS, Booking, Gift Cards)'),
                           t('Tax Authority Approved'),
                           t('Easy Online Reservations'),
                           t('Direct Gift Card Payments'),
                           t('Integrated Payment System'),
                           t('Automated SMS & Email'),
                           t('Full Online Reporting')
                         ]}
                         onClick={() => getPaymentLink('price_1R023UCVi0riU70PeCA2ZKcX','full')}
          />
          <PriceCategory discount="17" prev="595 DKK/Mo." price="495 DKK" disabled={loading}
                         title={t('Booking System')} subtitle={t('Billed annually.')}
                         description={[
                           t('24/7 Online Booking'),
                           t('Automatic SMS & Emails'),
                           t('Custom Table Layouts'),
                           t('Guest Payment Integrated'),
                           t('Custom Menus per Table')
                         ]}
                         onClick={() => getPaymentLink('price_1R029GCVi0riU70PdBVcEO3f','booking')}
          />
          <PriceCategory discount="13" prev="795 DKK/Mo." price="695 DKK" disabled={loading}
                         title={t('Take Away')} subtitle={t('Billed annually.')}
                         description={[

                         ]}
                         onClick={() => getPaymentLink('price_1RYjKaCVi0riU70PnG6Vz1gv','take_away')}
          />
          <PriceCategory discount="20" prev="495 DKK/Mo." price="395 DKK" disabled={loading}
                         title={t('POS')} subtitle={t('Billed annually.')}
                         description={[
                           t('Fast Order Handling'),
                           t('Flexible Payment Methods'),
                           t('Tax Authority Approved'),
                           t('Receipt Printing Included'),
                           t('Easy Setup with Photos'),
                           t('Free Reporting App')
                         ]}
                         onClick={() => getPaymentLink('price_1R02BvCVi0riU70PDbAl7OsL','pos')}
          />
          <PriceCategory discount="14" prev="695 DKK/Mo." price="595 DKK" disabled={loading}
                         title={t('POS + Terminal')} subtitle={t('Billed annually.')}
                         description={[
                           t('Secure Payment Processing'),
                           t('Low Fees (from 0.6%)'),
                           t('Quick Payment Process'),
                           t('Partial & Group Payments'),
                           t('Swedbank Compatible')
                         ]}
                         onClick={() => getPaymentLink('price_1R02G1CVi0riU70PHLR3tJQG','pos_terminal')}
          />
          <PriceCategory discount="22" prev="185 DKK/Mo." price="145 DKK" disabled={loading}
                         title={t('Gift Cards')} subtitle={t('Billed annually.')}
                         description={[
                           t('Direct Payments to Account'),
                           t('Unique Gift Experiences'),
                           t('Easy Balance Management'),
                           t('Online & Physical Sales'),
                           t('Integrated POS Redemption')
                         ]}
                         onClick={() => getPaymentLink('price_1R02HnCVi0riU70PjhBaDkBw','giftcards')}
          />
        </div>}
      </div>
    </div>
  )
}

export default PricingNew
