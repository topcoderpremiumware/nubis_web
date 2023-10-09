import React from 'react';
import { KeyboardArrowDown, KeyboardArrowUp }from '@mui/icons-material';
import { FeaturedPlayListOutlined, SettingsOutlined, CalendarMonthOutlined, EmailOutlined} from '@mui/icons-material';

import { TiMessages} from 'react-icons/ti';
import { IoIosStats} from 'react-icons/io';
import { BsCreditCard } from 'react-icons/bs';
import { MdOutlineContactSupport } from "react-icons/md";

export const SidebarData = (data) => { return [
  {
    title: 'Restaurant Setup',
    path: '#',
    icon: <SettingsOutlined />,
    iconClosed: <KeyboardArrowDown />,
    iconOpened: <KeyboardArrowUp />,
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
        title: 'Pictures',
        path: '/Pictures',
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
    iconClosed: <KeyboardArrowDown />,
    iconOpened: <KeyboardArrowUp />,

    subNav: [
      {
        title: 'Day View',
        path: '/DayView',
      },
      {
        title: 'Month View',
        path: '/MonthView',
      },
      // {
      //   title: 'Special Opening Times',
      //   path: '/SpecialOpeningTimes',
      // },
      {
        title: 'Manage Feedback',
        path: '/ManageFeedback',
        show: ['admin','manager'].includes(data.role),
      },
      {
        title: 'Manage Gift Cards',
        path: '/ManageGiftCards',
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
    iconClosed: <KeyboardArrowDown />,
    iconOpened: <KeyboardArrowUp />,
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
    iconClosed: <KeyboardArrowDown />,
    iconOpened: <KeyboardArrowUp />,
    show: ['admin','manager'].includes(data.role),
    subNav: [
      {
        title: 'Booking Link Guide',
        path: '/BookingLinkGuide'
      },
    ]
  },
  // {
  //   title: 'Online Booking Templates',
  //   path: '#',
  //   icon: <CalendarMonthOutlined />,
  //   iconClosed: <KeyboardArrowDown />,
  //   iconOpened: <KeyboardArrowUp />,
  //   subNav: [
  //     {
  //       title: 'sub-nav',
  //       path: '',
  //       cName: 'sub-nav'
  //     }
  //   ]
  // },
  {
    title: 'SMS Templates',
    path: '#',
    icon: <TiMessages/>,
    iconClosed: <KeyboardArrowDown />,
    iconOpened: <KeyboardArrowUp />,
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
    iconClosed: <KeyboardArrowDown />,
    iconOpened: <KeyboardArrowUp />,
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
  // {
  //   title: 'Statistics',
  //   path: '#',
  //   icon: <IoIosStats />,
  //   iconClosed: <KeyboardArrowDown />,
  //   iconOpened: <KeyboardArrowUp />,
  //   subNav: [
  //     {
  //       title: 'sub-nav',
  //       path: '',
  //       cName: 'sub-nav'
  //     }
  //   ]
  // },
  {
    title: 'Billing',
    path: '#',
    icon: <BsCreditCard/>,
    iconClosed: <KeyboardArrowDown />,
    iconOpened: <KeyboardArrowUp />,
    show: false, //['admin','manager'].includes(data.role),
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
    iconClosed: <KeyboardArrowDown />,
    iconOpened: <KeyboardArrowUp />,
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
    iconClosed: <KeyboardArrowDown />,
    iconOpened: <KeyboardArrowUp />,
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
