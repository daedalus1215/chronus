import HomeIcon from '@mui/icons-material/Home';
import NoteIcon from '@mui/icons-material/Note';
import ChecklistIcon from '@mui/icons-material/CheckBox';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import TimelineIcon from '@mui/icons-material/Timeline';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';

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
    label: 'Quick Log',
    path: '/time-entry',
    icon: MoreTimeIcon,
  },
  {
    label: 'Yearly Notes',
    path: '/yearly-notes',
    icon: HistoryIcon,
  },
  {
    label: 'Search',
    path: '/search',
    icon: SearchIcon,
  },
  {
    label: 'Explorer',
    path: '/explorer',
    icon: FolderIcon,
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: SettingsIcon,
  },
];
