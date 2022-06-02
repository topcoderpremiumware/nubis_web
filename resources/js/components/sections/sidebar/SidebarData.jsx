import React from 'react';
import { KeyboardArrowDown, KeyboardArrowUp }from '@mui/icons-material';
import { FeaturedPlayListOutlined, SettingsOutlined, CalendarMonthOutlined, EmailOutlined} from '@mui/icons-material';

import { TiMessages} from 'react-icons/ti';
import { IoIosStats} from 'react-icons/io';
import { BsCreditCard } from 'react-icons/bs';


export const SidebarData = [
  {
    title: 'Daily Use',
    path: '',
    icon: <FeaturedPlayListOutlined  className='dailyuse-icon'/>,
    iconClosed: <KeyboardArrowDown />,
    iconOpened: <KeyboardArrowUp />,

    subNav: [
      {
        title: 'Day View',
        path: '/DayView',
      },
      {
        title: 'Week View',
        path: '/WeekView',
      },
      {
        title: 'Activity',
        path: '/Activity',
      },
      {
        title: 'Opening Times',
        path: '/OpeningTimes',
      },
      {
        title: 'Special Opening Times',
        path: '/SpecialOpeningTimes',
      },
      {
        title: 'Table Plan Setup',
        path: '/TablePlanSetup',
      },
      {
        title: 'Areas',
        path: '/Areas',
      },
      {
        title: 'Orders Setup',
        path: '/OrdersSetup',
      },
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
    title: 'General Settings',
    path: '/Settings',
    icon: <SettingsOutlined />,
    iconClosed: <KeyboardArrowDown />,
    iconOpened: <KeyboardArrowUp />,

    subNav: [
      {
        title: 'Subnav',
        path: '',
        cName: 'sub-nav'
      }
    ]
  },
  {
    title: 'Online Booking',
    path: '/OnlineBooking',
    icon: <CalendarMonthOutlined />,
    iconClosed: <KeyboardArrowDown />,
    iconOpened: <KeyboardArrowUp />,
    subNav: [
      {
        title: 'Subnav',
        path: '',
        cName: 'sub-nav'
      }
    ]
  },
  {
    title: 'Online Booking Templ',
    path: '/OnlineBookingTempl',
    icon: <CalendarMonthOutlined />,
    iconClosed: <KeyboardArrowDown />,
    iconOpened: <KeyboardArrowUp />,
    subNav: [
      {
        title: 'sub-nav',
        path: '',
        cName: 'sub-nav'
      }
    ]
  },
  {
    title: 'SMS Templates',
    path: '/SmsTemplates',
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
      }
    ]
  },
  {
    title: 'Email Templates',
    path: '/EmailTemplates',
    icon: <EmailOutlined/>,
    iconClosed: <KeyboardArrowDown />,
    iconOpened: <KeyboardArrowUp />,
    subNav: [
      {
        title: 'sub-nav',
        path: '',
        cName: 'sub-nav'
      }
    ]
  },
  {
    title: 'Statistics',
    path: '/Statistics',
    icon: <IoIosStats />,
    iconClosed: <KeyboardArrowDown />,
    iconOpened: <KeyboardArrowUp />,
    subNav: [
      {
        title: 'sub-nav',
        path: '',
        cName: 'sub-nav'
      }
    ]
  },
  {
    title: 'Billing',
    path: '/Billing',
    icon: <BsCreditCard/>,
    iconClosed: <KeyboardArrowDown />,
    iconOpened: <KeyboardArrowUp />,
    subNav: [
      {
        title: 'sub-nav',
        path: '',
        cName: 'sub-nav'
      }
    ]
  }
];
