import HomeIcon from '@mui/icons-material/Home';
import NoteIcon from '@mui/icons-material/Note';
import ChecklistIcon from '@mui/icons-material/CheckBox';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import TimelineIcon from '@mui/icons-material/Timeline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SettingsIcon from '@mui/icons-material/Settings';

export const navigationItems = [
  {
    label: 'Home',
    path: '/',
    icon: HomeIcon,
  },
  {
    label: 'Memos',
    path: '/memo',
    icon: NoteIcon,
  },
  {
    label: 'CheckLists',
    path: '/checklist',
    icon: ChecklistIcon,
  },
  {
    label: 'Tags',
    path: '/tags',
    icon: LocalOfferIcon,
  },
  {
    label: 'Activity',
    path: '/activity',
    icon: TimelineIcon,
  },
  {
    label: 'Calendar',
    path: '/calendar',
    icon: CalendarTodayIcon,
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: SettingsIcon,
  },
];
