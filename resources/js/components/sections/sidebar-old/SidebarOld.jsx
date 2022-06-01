import './sidebarOld.scss';
import { FeaturedPlayListOutlined, SettingsOutlined} from '@mui/icons-material';
import NestedList from "./list";


export default function Sidebar() {
  return (
    <div className='sidebar'>
      <div className="sidebarWrapper">
        <div className="sidebarMenu">
          <ul className='sidebarList'>
            <li className='sidebarListItem active'>
              <FeaturedPlayListOutlined className='sidebarIcon' />
              Daily Use
            </li>
            <li className='sidebarListItem'>
              Day View
            </li>
            <li className='sidebarListItem'>
              Activity
            </li>
            <li className='sidebarListItem'>
              Opening Times
            </li>
            <li className='sidebarListItem'>
              Special Opening Times
            </li>
            <li className='sidebarListItem'>
              Table Plan Setup
            </li>
            <li className='sidebarListItem'>
              Areas
            </li>
            <li className='sidebarListItem'>
              Orders Setup
            </li>
            <li className='sidebarListItem'>
              Manage Feedback
            </li>
            <li className='sidebarListItem'>
              Manage Gift Cards
            </li>
            <li className='sidebarListItem'>
              Send Bulk SMS
            </li>
            <li className='sidebarListItem'>
              Email Campaign
            </li>
          </ul>
        </div>
        <div className="sidebarMenu">
          <ul className='sidebarList'>
            <NestedList />
          </ul>
        </div>
        <div className="sidebarMenu">
          <ul className='sidebarList'>
            <li className='sidebarListItem active'>
              <FeaturedPlayListOutlined className='sidebarIcon' />
              Daily Use
            </li>
            <li className='sidebarListItem'>
              Day View
            </li>
            <li className='sidebarListItem'>
              Activity
            </li>
            <li className='sidebarListItem'>
              Opening Times
            </li>
            <li className='sidebarListItem'>
              Special Opening Times
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
