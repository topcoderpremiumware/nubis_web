import React from 'react';
import { FeaturedPlayListOutlined, SettingsOutlined, CalendarMonthOutlined, EmailOutlined, Redeem, PointOfSale} from '@mui/icons-material';
import { TiMessages} from 'react-icons/ti';
import { BsCreditCard } from 'react-icons/bs';
import { MdOutlineContactSupport } from "react-icons/md";

export const SidebarData = (data) => { return [
  {
    title: 'Restaurant Setup',
    path: '#',
    icon: <SettingsOutlined />,
    show: ['admin','manager'].includes(data.role),
    subNav: [
      {
        title: 'Basic Information',
        path: '/BasicInformation',
      },
      {
        title: 'Table Plan Setup',
        path: '/TablePlanSetup',
      },
      {
        title: 'Booking Settings',
        path: '/BookingSettings',
      },
      {
        title: 'Areas',
        path: '/Areas',
      },
      {
        title: 'Opening Times',
        path: '/OpeningTimes',
      },
      {
        title: 'Menus setup',
        path: '/CustomBookingLength'
      },
      {
        title: 'Notification Settings',
        path: '/NotificationsSettings',
        cName: 'sub-nav'
      },
      {
        title: 'Roles',
        path: '/Roles',
        cName: 'sub-nav'
      },
    ]
  },
  {
    title: 'Daily Use',
    path: '#',
    icon: <FeaturedPlayListOutlined  className='dailyuse-icon'/>,
    subNav: [
      {
        title: 'Day View',
        path: '/DayView',
      },
      {
        title: 'Month View',
        path: '/MonthView',
      },
      {
        title: 'Manage Feedback',
        path: '/ManageFeedback',
        show: ['admin','manager'].includes(data.role),
      },
      {
        title: 'Send Bulk SMS',
        path: '/SendBulkSMS',
        show: ['admin','manager'].includes(data.role),
      },
    ]
  },
  {
    title: 'Guest Payment',
    path: '#',
    icon: <BsCreditCard />,
    show: ['admin','manager'].includes(data.role),
    subNav: [
      {
        title: 'Payment Gateaway',
        path: '/PaymentGateway',
        cName: 'sub-nav',
        show: ['admin'].includes(data.role),
      },
      {
        title: 'Payment Settings',
        path: '/PaymentSettings',
        cName: 'sub-nav',
        show: ['admin','manager'].includes(data.role),
      },
    ]
  },
  {
    title: 'Online Booking',
    path: '#',
    icon: <CalendarMonthOutlined />,
    show: ['admin','manager'].includes(data.role),
    subNav: [
      {
        title: 'Booking Link Guide',
        path: '/BookingLinkGuide'
      },
    ]
  },
  {
    title: 'Gift card Settings',
    path: '#',
    icon: <Redeem />,
    show: ['admin','manager'].includes(data.role),
    subNav: [
      {
        title: 'General Settings',
        path: '/GiftcardSettings'
      },
      {
        title: 'Experience Settings',
        path: '/ExperienceSettings'
      },
      {
        title: 'Manage Gift Cards',
        path: '/ManageGiftCards',
        show: ['admin','manager'].includes(data.role),
      },
    ]
  },
  {
    title: 'SMS Templates',
    path: '#',
    icon: <TiMessages/>,
    show: ['admin','manager'].includes(data.role),
    subNav: [
      {
        title: 'Confirmation',
        path: '/SmsTemplates/confirmation'
      },
      {
        title: 'Reminder',
        path: '/SmsTemplates/reminder'
      },
      {
        title: 'Change',
        path: '/SmsTemplates/change'
      },
      {
        title: 'Delete',
        path: '/SmsTemplates/delete'
      },
      {
        title: 'Waiting List',
        path: '/SmsTemplates/waiting-list'
      },
      {
        title: 'Notification',
        path: '/SmsTemplates/notification'
      },
      {
        title: 'Payment Request',
        path: '/SmsTemplates/payment-request'
      },
    ]
  },
  {
    title: 'Email Templates',
    path: '#',
    icon: <EmailOutlined/>,
    show: ['admin','manager'].includes(data.role),
    subNav: [
      {
        title: 'Confirmation',
        path: '/EmailTemplates/confirmation'
      },
      {
        title: 'Reminder',
        path: '/EmailTemplates/reminder'
      },
      {
        title: 'Change',
        path: '/EmailTemplates/change'
      },
      {
        title: 'Delete',
        path: '/EmailTemplates/delete'
      },
      {
        title: 'Waiting List',
        path: '/EmailTemplates/waiting-list'
      },
      {
        title: 'Payment Request',
        path: '/EmailTemplates/payment-request'
      },
      {
        title: 'Feedback Request',
        path: '/EmailTemplates/feedback-request'
      },
    ]
  },
  {
    title: 'POS',
    path: '#',
    icon: <PointOfSale />,
    show: ['admin','manager'].includes(data.role),
    subNav: [
      {
        title: 'Receipts',
        path: '/Receipts',
      },
      {
        title: 'Report',
        path: '/POSReport',
      },
      {
        title: 'Sign Settings',
        path: '/SignSettings',
      },
      {
        title: 'QZ Settings',
        path: '/QZSettings',
      },
      {
        title: 'Terminal Settings',
        path: '/TerminalSettings',
      }
    ]
  },
  {
    title: 'Billing',
    path: '#',
    icon: <BsCreditCard/>,
    show: ['admin','manager'].includes(data.role) && localStorage.getItem('place_id') != 37,
    subNav: [
      {
        title: 'Pricing',
        path: '/pricing'
      },
      {
        title: 'Billing Report',
        path: '/billingReport'
      },
      {
        title: 'SMS Pricing',
        path: '/smsPricing'
      },
    ]
  },
  {
    title: 'Support',
    path: '#',
    icon: <MdOutlineContactSupport />,
    show: ['admin','manager'].includes(data.role),
    subNav: [
      {
        title: 'Support',
        path: '/Support'
      },
      {
        title: 'Video Guides',
        path: '/VideoGuides',
      },
    ]
  },
  {
    title: 'Admin setup',
    path: '#',
    icon: <SettingsOutlined />,
    show: data.is_superadmin,
    subNav: [
      // {
      //   title: 'SMS Keys',
      //   path: '/SmsKeys'
      // },
      {
        title: 'Video Guide Settings',
        path: '/VideoGuideSettings',
      },
    ]
  }
];
}
