import { useState } from 'react';
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';
import usePromise from 'react-use-promise';
import {
  CircularProgress,
  Container,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { Folder, InsertDriveFileOutlined } from '@mui/icons-material';

declare global {
  interface Window {
    api: Record<string, any>;
  }
}

interface File {
  type: string;
  name: string;
  meta: {
    modify: Date;
    change: Date;
    access: Date;
  };
}

const Hello = () => {
  const [directory, setDirectory] = useState(window.api?.currentDirectory());
  const isRoot = directory === '/';

  let [files, filesError, filesState] = usePromise(
    () => window.api?.directoryContents(directory),
    [directory]
  );

  if (files) {
    files = files.sort((a: File, b: File) => {
      if (a.type === 'directory' && b.type !== 'directory') {
        return -1;
      }
      if (b.type === 'directory' && a.type !== 'directory') {
        return 1;
      }
      return 0;
    });
  }

  const navigate = (path: string) => {
    if (directory === '/') {
      setDirectory(`/${path}`);
    } else {
      setDirectory(`${directory}/${path}`);
    }
  };
  const navigateUp = () => {
    setDirectory(directory.split('/').slice(0, -1).join('/') || '/');
  };

  if (filesState === 'rejected') {
    console.error(filesError);
  }

  return (
    <Container
      sx={{ display: 'flex', flexDirection: 'column' }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDragEnter={() => {
        console.log('File is in the drop zone');
      }}
      onDragLeave={() => {
        console.log('File left the drop zone');
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();

        Array.from(e.dataTransfer.files).forEach((file) => {
          console.log('File Path of dragged files: ', file.path);
        });
      }}
    >
      <Typography variant="h5" component="h1">
        {directory}
      </Typography>
      {filesState === 'resolved' && (
        <List
          dense
          sx={{ overflow: 'auto', maxHeight: '100%', width: 300, flexGrow: 1 }}
        >
          {!isRoot && (
            <>
              <ListItem disablePadding onClick={() => navigateUp()}>
                <ListItemButton>..</ListItemButton>
              </ListItem>
              <Divider />
            </>
          )}
          {files &&
            files.map((entry: File, i: number) =>
              entry.type === 'directory' ? (
                <ListItem disablePadding key={`${entry.name}-${i.toString()}`}>
                  <ListItemButton onClick={() => navigate(entry.name)}>
                    <ListItemIcon>
                      <Folder />
                    </ListItemIcon>
                    <ListItemText>{entry.name}</ListItemText>
                  </ListItemButton>
                </ListItem>
              ) : (
                <ListItem key={`${entry.name}-${i.toString()}`}>
                  <ListItemIcon>
                    <InsertDriveFileOutlined />
                  </ListItemIcon>
                  <ListItemText
                    secondary={<>{entry.meta.change.toDateString()}</>}
                  >
                    {entry.name}
                  </ListItemText>
                </ListItem>
              )
            )}
        </List>
      )}
      {filesState === 'pending' && <CircularProgress />}
      {filesState === 'rejected' && 'Something went wrong'}
    </Container>
  );
};

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/">
          <Hello />
        </Route>
      </Switch>
    </Router>
  );
}
