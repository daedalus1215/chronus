import HomeIcon from '@mui/icons-material/Home';
import NoteIcon from '@mui/icons-material/Note';
import ChecklistIcon from '@mui/icons-material/CheckBox';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import TimelineIcon from '@mui/icons-material/Timeline';

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
];
