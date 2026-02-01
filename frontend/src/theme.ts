import { createTheme } from '@mui/material/styles';
import type {} from '@mui/x-tree-view/themeAugmentation';

export const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#6366f1' },
    secondary: { main: '#ffd700' },
    background: { default: '#000', paper: '#111' },
    text: { primary: '#fff', secondary: '#9ca3af' },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    fontSize: 16,
  },
  components: {
    MuiRichTreeView: {
      styleOverrides: {
        root: {
          '--TreeView-itemChildrenIndentation': '16px',
        },
      },
    },
  },
});
