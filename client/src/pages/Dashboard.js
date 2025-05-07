import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// This would be replaced with actual API calls
const mockTasks = [
  { id: 1, date: '2025-04-29', content: '주간 보고서 작성', status: '진행중', priority: '높음' },
  { id: 2, date: '2025-04-29', content: '팀 미팅 준비', status: '계획', priority: '중간' },
  { id: 3, date: '2025-04-28', content: '코드 리뷰', status: '완료', priority: '높음' },
];

const mockReports = [
  { id: 1, title: '4월 4주차 보고서', startDate: '2025-04-22', endDate: '2025-04-28', status: '완료' },
  { id: 2, title: '4월 3주차 보고서', startDate: '2025-04-15', endDate: '2025-04-21', status: '완료' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalReports: 0
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTasks(mockTasks);
      setReports(mockReports);
      setStats({
        totalTasks: mockTasks.length,
        completedTasks: mockTasks.filter(task => task.status === '완료').length,
        pendingTasks: mockTasks.filter(task => task.status !== '완료').length,
        totalReports: mockReports.length
      });
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case '완료': return 'success';
      case '진행중': return 'warning';
      case '계획': return 'info';
      case '지연': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case '높음': return 'error';
      case '중간': return 'warning';
      case '낮음': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                전체 업무
              </Typography>
              <Typography variant="h4" component="div">
                {stats.totalTasks}
              </Typography>
              <AssignmentIcon color="primary" sx={{ fontSize: 40, mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                완료된 업무
              </Typography>
              <Typography variant="h4" component="div">
                {stats.completedTasks}
              </Typography>
              <CheckCircleIcon color="success" sx={{ fontSize: 40, mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                대기 중인 업무
              </Typography>
              <Typography variant="h4" component="div">
                {stats.pendingTasks}
              </Typography>
              <PendingIcon color="warning" sx={{ fontSize: 40, mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                보고서
              </Typography>
              <Typography variant="h4" component="div">
                {stats.totalReports}
              </Typography>
              <DescriptionIcon color="info" sx={{ fontSize: 40, mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Date */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">
              {format(new Date(), 'yyyy년 MM월 dd일 EEEE', { locale: ko })}
            </Typography>
            <Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/tasks/new')}
                sx={{ mr: 1 }}
              >
                업무 추가
              </Button>
              <Button
                variant="outlined"
                startIcon={<DescriptionIcon />}
                onClick={() => navigate('/reports/new')}
              >
                보고서 생성
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Tasks */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">최근 업무</Typography>
              <Button size="small" onClick={() => navigate('/tasks')}>
                모두 보기
              </Button>
            </Box>
            <Divider />
            <List>
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <ListItem
                    key={task.id}
                    sx={{ borderBottom: '1px solid #eee', py: 1 }}
                    secondaryAction={
                      <Box>
                        <Chip
                          label={task.status}
                          size="small"
                          color={getStatusColor(task.status)}
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={task.priority}
                          size="small"
                          color={getPriorityColor(task.priority)}
                        />
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={task.content}
                      secondary={format(new Date(task.date), 'yyyy-MM-dd')}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="등록된 업무가 없습니다." />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Recent Reports */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">최근 보고서</Typography>
              <Button size="small" onClick={() => navigate('/reports')}>
                모두 보기
              </Button>
            </Box>
            <Divider />
            <List>
              {reports.length > 0 ? (
                reports.map((report) => (
                  <ListItem
                    key={report.id}
                    sx={{ borderBottom: '1px solid #eee', py: 1 }}
                    secondaryAction={
                      <Chip
                        label={report.status}
                        size="small"
                        color={getStatusColor(report.status)}
                      />
                    }
                  >
                    <ListItemText
                      primary={report.title}
                      secondary={`${report.startDate} ~ ${report.endDate}`}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="등록된 보고서가 없습니다." />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Weekly Calendar */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              이번 주 일정
            </Typography>
            <Divider />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                <ScheduleIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                이번 주 일정을 확인하려면 업무 관리 페이지로 이동하세요.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/tasks')}
              >
                업무 관리로 이동
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
