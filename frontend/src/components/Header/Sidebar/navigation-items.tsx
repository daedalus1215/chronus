import {
  Home,
  StickyNote,
  ListChecks,
  Tag,
  Activity,
  Timer,
  History,
  Settings,
  Search,
  Folder,
} from 'lucide-react';

export const navigationItems = [
  {
    label: 'Home',
    path: '/',
    icon: Home,
  },
  {
    label: 'Memos',
    path: '/memo',
    icon: StickyNote,
  },
  {
    label: 'CheckLists',
    path: '/checklist',
    icon: ListChecks,
  },
  {
    label: 'Tags',
    path: '/tags',
    icon: Tag,
  },
  {
    label: 'Activity',
    path: '/activity',
    icon: Activity,
  },
  {
    label: 'Quick Log',
    path: '/time-entry',
    icon: Timer,
  },
  {
    label: 'Yearly Notes',
    path: '/yearly-notes',
    icon: History,
  },
  {
    label: 'Search',
    path: '/search',
    icon: Search,
  },
  {
    label: 'Explorer',
    path: '/explorer',
    icon: Folder,
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
  },
];
