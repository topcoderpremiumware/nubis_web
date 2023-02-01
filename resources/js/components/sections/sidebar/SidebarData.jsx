import React from 'react';
import { KeyboardArrowDown, KeyboardArrowUp }from '@mui/icons-material';
import { FeaturedPlayListOutlined, SettingsOutlined, CalendarMonthOutlined, EmailOutlined} from '@mui/icons-material';

import { TiMessages} from 'react-icons/ti';
import { IoIosStats} from 'react-icons/io';
import { BsCreditCard } from 'react-icons/bs';
import { MdOutlineContactSupport } from "react-icons/md";

export const SidebarData = [
  {
    title: 'Restaurant Setup',
    path: '#',
    icon: <SettingsOutlined />,
    iconClosed: <KeyboardArrowDown />,
    iconOpened: <KeyboardArrowUp />,
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
      },
      {
        title: 'Manage Gift Cards',
        path: '/ManageGiftCards',
      },
      {
        title: 'Send Bulk SMS',
        path: '/SendBulkSMS',
      },
      {
        title: 'Email Campaign',
        path: '/EmailCampaign',
      },
    ]
  },
  {
    title: 'Guest Payment',
    path: '#',
    icon: <BsCreditCard />,
    iconClosed: <KeyboardArrowDown />,
    iconOpened: <KeyboardArrowUp />,

    subNav: [
      {
        title: 'Payment Gateaway',
        path: '/PaymentGateway',
        cName: 'sub-nav'
      },
      {
        title: 'Payment Settings',
        path: '/PaymentSettings',
        cName: 'sub-nav'
      },
    ]
  },
  {
    title: 'Online Booking',
    path: '#',
    icon: <CalendarMonthOutlined />,
    iconClosed: <KeyboardArrowDown />,
    iconOpened: <KeyboardArrowUp />,
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
      }
    ]
  },
  {
    title: 'Email Templates',
    path: '#',
    icon: <EmailOutlined/>,
    iconClosed: <KeyboardArrowDown />,
    iconOpened: <KeyboardArrowUp />,
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
        title: 'Reconfirmation',
        path: '/EmailTemplates/reconfirmation'
      },
      {
        title: 'Waiting List',
        path: '/EmailTemplates/waiting-list'
      },
      {
        title: 'Offers',
        path: '/EmailTemplates/offers'
      },
      {
        title: 'Check Credit Card',
        path: '/EmailTemplates/check-credit-card'
      },
      {
        title: 'Payment Request',
        path: '/EmailTemplates/payment-request'
      },
      {
        title: 'Booking Invites',
        path: '/EmailTemplates/booking-invites'
      },
      {
        title: 'Manual',
        path: '/EmailTemplates/manual'
      }
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
    subNav: [
      {
        title: 'Pricing',
        path: '/pricing'
      }
    ]
  },
  {
    title: 'Support',
    path: '#',
    icon: <MdOutlineContactSupport />,
    iconClosed: <KeyboardArrowDown />,
    iconOpened: <KeyboardArrowUp />,
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
    subNav: [
      {
        title: 'SMS Keys',
        path: '/SmsKeys'
      },
      {
        title: 'Video Guide Settings',
        path: '/VideoGuideSettings',
      },
    ]
  }
];
