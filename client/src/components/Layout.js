import React from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
} from '@mui/material';

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginTop: theme.spacing(8),
}));

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            업무 기록 및 보고 자동화 시스템
          </Typography>
        </Toolbar>
      </AppBar>
      <Main>
        <Container maxWidth="xl">{children}</Container>
      </Main>
    </Box>
  );
};

export default Layout;
