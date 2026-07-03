import { createTheme } from '@mui/material/styles';
import type {} from '@mui/x-tree-view/themeAugmentation';

const ACCENT_GRADIENT =
  'linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #a855f7 100%)';
const ACCENT_GRADIENT_HOVER =
  'linear-gradient(135deg, #6d70f5 0%, #966ef8 55%, #b366fa 100%)';

export const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#6366f1' },
    secondary: { main: '#8b5cf6' },
    background: { default: '#08080c', paper: '#101017' },
    text: { primary: '#fff', secondary: '#9ca3af' },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    fontSize: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          colorScheme: 'dark',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 600,
          letterSpacing: '0.01em',
          transition:
            'transform 0.18s var(--ease-spring, ease), box-shadow 0.2s ease, background 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedPrimary: {
          background: ACCENT_GRADIENT,
          boxShadow: '0 4px 20px -8px rgba(99, 102, 241, 0.55)',
          '&:hover': {
            background: ACCENT_GRADIENT_HOVER,
            boxShadow:
              '0 0 0 1px rgba(99, 102, 241, 0.35), 0 8px 24px -6px rgba(99, 102, 241, 0.5)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.14)',
          '&:hover': {
            borderColor: 'rgba(99, 102, 241, 0.6)',
            background: 'rgba(99, 102, 241, 0.08)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        },
        elevation1: {
          boxShadow: 'var(--elevation-2)',
        },
        elevation3: {
          boxShadow: 'var(--elevation-3)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: '1px solid rgba(255, 255, 255, 0.07)',
          boxShadow: 'var(--elevation-3)',
          transition: 'transform 0.2s var(--ease-out, ease), box-shadow 0.2s ease',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        primary: {
          background: ACCENT_GRADIENT,
          boxShadow: '0 6px 22px -6px rgba(99, 102, 241, 0.6)',
          transition:
            'transform 0.18s var(--ease-spring, ease), box-shadow 0.2s ease',
          '&:hover': {
            background: ACCENT_GRADIENT_HOVER,
            boxShadow: '0 10px 28px -6px rgba(99, 102, 241, 0.7)',
            transform: 'translateY(-2px) scale(1.03)',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.12)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.22)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6366f1',
            borderWidth: 1,
          },
          '&.Mui-focused': {
            boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.18)',
          },
        },
      },
    },
    MuiMenu: {
      defaultProps: {
        transitionDuration: 180,
      },
      styleOverrides: {
        paper: {
          backgroundColor: 'var(--glass-bg-strong)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
          borderRadius: 12,
          boxShadow: 'var(--elevation-4)',
        },
        list: {
          padding: 6,
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          border: '1px solid var(--glass-border)',
          backgroundColor: 'var(--glass-bg-strong)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          boxShadow: 'var(--elevation-4)',
          transformOrigin: 'top center',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 4px',
          padding: '8px 12px',
          transition:
            'background-color 0.15s ease, transform 0.15s var(--ease-out, ease), color 0.15s ease',
          '&:hover': {
            backgroundColor: 'var(--accent-soft)',
            transform: 'translateX(3px)',
          },
          '&.Mui-selected': {
            backgroundColor: 'var(--accent-soft)',
          },
          '&.Mui-selected:hover': {
            backgroundColor: 'var(--accent-soft-2)',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition:
            'background-color 0.15s ease, transform 0.15s var(--ease-out, ease)',
          '&:hover': {
            backgroundColor: 'var(--accent-soft)',
          },
        },
      },
    },
    MuiDialog: {
      defaultProps: {
        transitionDuration: 220,
      },
      styleOverrides: {
        paper: {
          borderRadius: 16,
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--elevation-4)',
          backgroundImage: 'none',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(20, 20, 30, 0.92)',
          backdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
          fontSize: '0.75rem',
        },
      },
    },
    MuiRichTreeView: {
      styleOverrides: {
        root: {
          '--TreeView-itemChildrenIndentation': '16px',
        },
      },
    },
  },
});
