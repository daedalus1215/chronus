import React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useQuery } from "@tanstack/react-query";
import { Tag } from "../../../../api/dtos/tag";
import { fetchTags } from "../../../../api/requests/fetchTags";
import { useNavigate } from "react-router-dom";

export type TagListViewProps = {
  isLoading?: boolean;
  error?: string | null;
  onTagClick?: (tag: Tag) => void;
};

export const TagListView: React.FC<TagListViewProps> = () => {
  const navigate = useNavigate();
  const { data: tags, isLoading: tagsLoading, error: tagsError } = useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: fetchTags,
  });

  const loading = tagsLoading;
  const errMsg = tagsError;

  return (
    <Box display="flex" flexDirection="column" height="100%">
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress size={28} />
        </Box>
      )}
      {!loading && !errMsg && tags?.length === 0 && (
        <Typography color="text.secondary" align="center" py={4}>
          No tags
        </Typography>
      )}
      <Box sx={{ overflowY: 'auto', flex: 1 }}>
        <List>
          {tags && tags.map(tag => (
            <ListItem key={tag.id} disablePadding>
              <ListItemButton
                onClick={() => navigate(`/tag-notes/${tag.id}`)}
                tabIndex={0}
                role="button"
                aria-label={`Tag: ${tag.name}`}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  boxShadow: 1,
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'primary.50' },
                  '&:focus': { outline: '2px solid', outlineColor: 'primary.main' },
                }}
                onKeyDown={e => {
                  if ((e.key === 'Enter' || e.key === ' ')) {
                    navigate(`/tag-notes/${tag.id}`);
                  }
                }}
              >
                <ListItemText
                  primary={<Typography fontWeight={600} color="text.primary">{tag.name}</Typography>}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
}; 