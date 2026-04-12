# MUI components -- quick reference

Curated for components and patterns used in this project.

## Theme (defined in `frontend/src/theme.ts`)

```typescript
import { createTheme } from '@mui/material/styles';

export const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#6366f1' },
    secondary: { main: '#ffd700' },
    background: { default: '#000', paper: '#111' },
    text: { primary: '#fff', secondary: '#9ca3af' },
  },
  shape: { borderRadius: 8 },
  typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif', fontSize: 16 },
});
```

## Layout components

### Box

General-purpose container. Use `sx` for inline styles with theme access.

```tsx
<Box sx={{ display: 'flex', gap: 2, p: 1, alignItems: 'center' }}>
  {children}
</Box>

<Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400 }}>
  {/* form fields */}
</Box>
```

### Stack

Vertical or horizontal stack with automatic spacing.

```tsx
<Stack direction="row" spacing={2} alignItems="center">
  <Chip label="Tag1" />
  <Chip label="Tag2" />
</Stack>
```

## Typography

```tsx
<Typography variant="h6" sx={{ fontWeight: 600 }}>Title</Typography>
<Typography variant="body2" color="text.secondary">Subtitle</Typography>
```

Common variants: `h1`-`h6`, `body1`, `body2`, `caption`, `subtitle1`, `subtitle2`.

## Input components

### TextField

```tsx
<TextField
  label="Description"
  value={value}
  onChange={handleChange}
  fullWidth
  size="small"
  variant="outlined"
  error={!!error}
  helperText={error}
/>
```

### Button

```tsx
<Button variant="contained" onClick={handleClick} startIcon={<AddIcon />}>
  Create
</Button>

<Button variant="outlined" color="secondary">Cancel</Button>
<Button variant="text" size="small">Details</Button>
```

### IconButton

```tsx
<IconButton onClick={handleClose} aria-label="close" size="small">
  <CloseIcon />
</IconButton>
```

## Data display

### Chip

```tsx
<Chip label="Active" color="primary" size="small" onDelete={handleDelete} />
```

### Alert

```tsx
<Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>
<Alert severity="success">Saved successfully</Alert>
```

Severities: `error`, `warning`, `info`, `success`.

## Navigation

### Tabs

```tsx
<Tabs value={activeTab} onChange={handleTabChange}>
  <Tab label="Overview" />
  <Tab label="Details" />
</Tabs>
```

## Feedback

### CircularProgress

```tsx
{isLoading && <CircularProgress size={24} />}
```

### Skeleton

```tsx
<Skeleton variant="rectangular" width="100%" height={200} />
<Skeleton variant="text" width="60%" />
```

## The `sx` prop -- spacing and sizing

The `sx` prop uses a theme-aware shorthand:

| Prop | CSS property | 1 unit = |
|------|-------------|----------|
| `m`, `mt`, `mb`, `ml`, `mr`, `mx`, `my` | margin | 8px |
| `p`, `pt`, `pb`, `pl`, `pr`, `px`, `py` | padding | 8px |
| `gap` | gap | 8px |
| `width`, `height` | width, height | direct value |
| `minWidth`, `maxWidth` | min/max-width | direct value |

Examples:

```tsx
sx={{ p: 2 }}           // padding: 16px
sx={{ mx: 'auto' }}     // margin-left/right: auto (centering)
sx={{ gap: 1 }}         // gap: 8px
sx={{ mt: 3 }}          // margin-top: 24px
```

## The `sx` prop -- responsive values

```tsx
sx={{
  flexDirection: { xs: 'column', sm: 'row' },
  p: { xs: 1, md: 2 },
  display: { xs: 'none', md: 'block' },
}}
```

Breakpoints: `xs` (0px), `sm` (600px), `md` (900px), `lg` (1200px), `xl` (1536px).

## The `sx` prop -- theme access

```tsx
sx={{
  color: 'text.secondary',
  bgcolor: 'background.paper',
  borderColor: 'divider',
  '&:hover': { bgcolor: 'action.hover' },
}}
```

## CSS Modules alongside MUI

For complex or reusable styles, use CSS Modules. Reference theme tokens via CSS custom properties in `global.scss`:

```tsx
import styles from './MyComponent.module.css';

<Box className={styles.container} sx={{ p: 2 }}>
  {/* sx for quick spacing, className for complex rules */}
</Box>
```

## MUI X -- Tree View

Used in this project for tag trees:

```tsx
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';

<RichTreeView items={treeItems} onItemClick={handleItemClick} />
```

## MUI X -- Date/Time Pickers

If used, wrap in `LocalizationProvider`:

```tsx
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

<LocalizationProvider dateAdapter={AdapterDayjs}>
  <DatePicker label="Due date" value={date} onChange={setDate} />
</LocalizationProvider>
```
