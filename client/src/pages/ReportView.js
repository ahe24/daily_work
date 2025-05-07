import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  FileDownload as FileDownloadIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

// Mock data - would be replaced with API calls
const mockReports = [
  { 
    id: 1, 
    title: '4월 4주차 보고서', 
    startDate: '2025-04-22', 
    endDate: '2025-04-28', 
    status: '완료', 
    userId: 1, 
    user: { name: '홍길동' }, 
    weeklyPlan: '- 주간 보고서 작성\n- 팀 미팅 준비\n- 코드 리뷰',
    weeklyDo: '- 주간 보고서 작성 완료\n- 팀 미팅 진행 및 회의록 작성\n- 코드 리뷰 완료',
    weeklyCheck: '- 모든 업무 정상 완료\n- 다음 주 계획 수립 필요',
    nextWeekPlan: '- 신규 기능 개발\n- 버그 수정\n- 문서 작성',
    completionRate: 85,
    filePath: '/reports/report1.xlsx',
    createdAt: '2025-04-28'
  },
  { 
    id: 5, 
    title: '5월 1주차 보고서', 
    startDate: '2025-04-29', 
    endDate: '2025-05-05', 
    status: '초안', 
    userId: 1, 
    user: { name: '홍길동' }, 
    weeklyPlan: '- 신규 기능 개발\n- 버그 수정\n- 문서 작성',
    weeklyDo: '',
    weeklyCheck: '',
    nextWeekPlan: '',
    completionRate: 0,
    filePath: null,
    createdAt: '2025-04-29'
  }
];

// Mock tasks data
const mockTasks = [
  { id: 1, date: '2025-04-29', content: '주간 보고서 작성', status: '진행중', priority: '높음', userId: 1, user: { name: '홍길동' } },
  { id: 2, date: '2025-04-29', content: '팀 미팅 준비', status: '계획', priority: '중간', userId: 1, user: { name: '홍길동' } },
  { id: 3, date: '2025-04-28', content: '코드 리뷰', status: '완료', priority: '높음', userId: 2, user: { name: '김철수' } },
  { id: 4, date: '2025-04-27', content: '버그 수정', status: '완료', priority: '높음', userId: 2, user: { name: '김철수' } },
  { id: 5, date: '2025-04-26', content: '문서 작성', status: '지연', priority: '낮음', userId: 3, user: { name: '이영희' } },
];

const ReportView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const foundReport = mockReports.find(r => r.id === parseInt(id));
      if (foundReport) {
        setReport(foundReport);
        
        // Get tasks for the report period
        const reportTasks = mockTasks.filter(
          task => task.date >= foundReport.startDate && task.date <= foundReport.endDate
        );
        setTasks(reportTasks);
      }
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleGenerateReport = () => {
    if (!report) return;
    
    setGenerating(true);
    
    // Simulate API call to generate Excel report
    setTimeout(() => {
      setReport(prev => ({
        ...prev,
        status: '완료',
        filePath: `/reports/report${prev.id}.xlsx`,
        completionRate: 85
      }));
      
      setGenerating(false);
      setSnackbar({
        open: true,
        message: '보고서가 성공적으로 생성되었습니다.',
        severity: 'success'
      });
    }, 2000);
  };

  const handleDownloadReport = () => {
    if (!report || !report.filePath) return;
    
    // In a real application, this would trigger a file download
    console.log('Downloading report:', report.filePath);
    
    setSnackbar({
      open: true,
      message: '보고서 다운로드가 시작되었습니다.',
      severity: 'info'
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '완료': return 'success';
      case '배포됨': return 'info';
      case '초안': return 'warning';
      default: return 'default';
    }
  };

  const getStatusChip = (status) => {
    return (
      <Chip
        label={status}
        size="small"
        color={getStatusColor(status)}
        sx={{ ml: 1 }}
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!report) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          보고서를 찾을 수 없습니다.
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/reports')}
          sx={{ mt: 2 }}
        >
          목록으로
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6">{report.title}</Typography>
          {getStatusChip(report.status)}
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/reports')}
            sx={{ mr: 1 }}
          >
            목록으로
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/reports/${report.id}`)}
            sx={{ mr: 1 }}
          >
            수정
          </Button>
          {report.status === '초안' ? (
            <Button
              variant="contained"
              startIcon={<DescriptionIcon />}
              onClick={handleGenerateReport}
              disabled={generating}
            >
              {generating ? '생성 중...' : '보고서 생성'}
            </Button>
          ) : report.filePath ? (
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={handleDownloadReport}
            >
              다운로드
            </Button>
          ) : null}
        </Box>
      </Paper>

      {/* Report Details */}
      <Grid container spacing={3}>
        {/* Report Info */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>보고서 정보</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">기간</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">{`${report.startDate} ~ ${report.endDate}`}</Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">담당자</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">{report.user.name}</Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">상태</Typography>
              </Grid>
              <Grid item xs={8}>
                {getStatusChip(report.status)}
              </Grid>
              
              {report.status !== '초안' && (
                <>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">완료율</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">{`${report.completionRate}%`}</Typography>
                  </Grid>
                </>
              )}
              
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">생성일</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">{report.createdAt}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Tasks */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>기간 내 업무</Typography>
            <Divider sx={{ mb: 2 }} />
            
            {tasks.length > 0 ? (
              <List>
                {tasks.map(task => (
                  <ListItem key={task.id} sx={{ borderBottom: '1px solid #eee', py: 1 }}>
                    <ListItemText
                      primary={task.content}
                      secondary={`${task.date} | ${task.user.name} | ${task.status}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                해당 기간에 등록된 업무가 없습니다.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Report Content */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>보고서 내용</Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              {/* Weekly Plan */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      금주 Plan
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography
                      variant="body2"
                      component="pre"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'inherit',
                        minHeight: 100
                      }}
                    >
                      {report.weeklyPlan || '내용이 없습니다.'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Weekly Do */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" color="warning.main" gutterBottom>
                      Do
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography
                      variant="body2"
                      component="pre"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'inherit',
                        minHeight: 100
                      }}
                    >
                      {report.weeklyDo || '내용이 없습니다.'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Weekly Check */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" color="success.main" gutterBottom>
                      Check
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography
                      variant="body2"
                      component="pre"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'inherit',
                        minHeight: 100
                      }}
                    >
                      {report.weeklyCheck || '내용이 없습니다.'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Next Week Plan */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" color="info.main" gutterBottom>
                      다음 주 Plan
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography
                      variant="body2"
                      component="pre"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'inherit',
                        minHeight: 100
                      }}
                    >
                      {report.nextWeekPlan || '내용이 없습니다.'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportView;
