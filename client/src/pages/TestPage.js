import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';

const TestPage = () => {
  const [reportData, setReportData] = useState({
    title: '2025년 04월 5주차 보고서',
    startDate: '2025-04-29',
    endDate: '2025-05-05',
    weeklyPlan: '- 주간 보고서 작성\n- 팀 미팅 준비\n- 코드 리뷰',
    weeklyDo: '- 주간 보고서 작성 완료\n- 팀 미팅 진행 및 회의록 작성\n- 코드 리뷰 완료',
    weeklyCheck: '- 모든 업무 정상 완료\n- 다음 주 계획 수립 필요',
    nextWeekPlan: '- 신규 기능 개발\n- 버그 수정\n- 문서 작성'
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleChange = (field, value) => {
    setReportData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Report data submitted:', reportData);
    
    // Show success message
    setSnackbar({
      open: true,
      message: '보고서가 성공적으로 저장되었습니다.',
      severity: 'success'
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          업무 보고서 테스트 페이지
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          이 페이지는 업무 기록 및 보고 자동화 시스템의 기본 기능을 테스트하기 위한 간소화된 페이지입니다.
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Title */}
            <Grid item xs={12}>
              <TextField
                label="보고서 제목"
                value={reportData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                fullWidth
                required
              />
            </Grid>
            
            {/* Date Range */}
            <Grid item xs={12} md={6}>
              <TextField
                label="시작일"
                type="date"
                value={reportData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="종료일"
                type="date"
                value={reportData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                보고서 내용
              </Typography>
            </Grid>
            
            {/* Weekly Plan */}
            <Grid item xs={12} md={6}>
              <TextField
                label="금주 Plan"
                multiline
                rows={4}
                value={reportData.weeklyPlan}
                onChange={(e) => handleChange('weeklyPlan', e.target.value)}
                fullWidth
                placeholder="이번 주 계획을 입력하세요."
              />
            </Grid>
            
            {/* Weekly Do */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Do"
                multiline
                rows={4}
                value={reportData.weeklyDo}
                onChange={(e) => handleChange('weeklyDo', e.target.value)}
                fullWidth
                placeholder="이번 주 실행한 업무를 입력하세요."
              />
            </Grid>
            
            {/* Weekly Check */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Check"
                multiline
                rows={4}
                value={reportData.weeklyCheck}
                onChange={(e) => handleChange('weeklyCheck', e.target.value)}
                fullWidth
                placeholder="이번 주 체크 사항을 입력하세요."
              />
            </Grid>
            
            {/* Next Week Plan */}
            <Grid item xs={12} md={6}>
              <TextField
                label="다음 주 Plan"
                multiline
                rows={4}
                value={reportData.nextWeekPlan}
                onChange={(e) => handleChange('nextWeekPlan', e.target.value)}
                fullWidth
                placeholder="다음 주 계획을 입력하세요."
              />
            </Grid>
            
            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
              >
                보고서 저장
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {/* Preview */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          보고서 미리보기
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
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
                  {reportData.weeklyPlan || '내용이 없습니다.'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
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
                  {reportData.weeklyDo || '내용이 없습니다.'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
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
                  {reportData.weeklyCheck || '내용이 없습니다.'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
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
                  {reportData.nextWeekPlan || '내용이 없습니다.'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
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

export default TestPage;
