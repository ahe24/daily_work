import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Snackbar,
  Alert,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

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
    completionRate: 85
  }
];

const mockUsers = [
  { id: 1, name: '홍길동' },
  { id: 2, name: '김철수' },
  { id: 3, name: '이영희' },
];

const ReportForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState({
    title: '',
    startDate: startOfWeek(new Date(), { weekStartsOn: 1 }),
    endDate: endOfWeek(new Date(), { weekStartsOn: 1 }),
    status: '초안',
    userId: '',
    weeklyPlan: '',
    weeklyDo: '',
    weeklyCheck: '',
    nextWeekPlan: '',
    completionRate: 0
  });
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // Simulate API call for users
    setUsers(mockUsers);

    // If in edit mode, fetch report data
    if (isEditMode) {
      setTimeout(() => {
        const foundReport = mockReports.find(r => r.id === parseInt(id));
        if (foundReport) {
          setReport({
            ...foundReport,
            startDate: new Date(foundReport.startDate),
            endDate: new Date(foundReport.endDate),
          });
        }
        setLoading(false);
      }, 1000);
    }
  }, [id, isEditMode]);

  const handleChange = (field, value) => {
    setReport(prev => ({ ...prev, [field]: value }));
    
    // Clear error for the field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleStartDateChange = (date) => {
    setReport(prev => ({
      ...prev,
      startDate: date,
      endDate: addDays(date, 6), // Automatically set end date to 7 days after start date
      title: `${format(date, 'yyyy년 MM월')} ${getWeekOfMonth(date)}주차 보고서`
    }));
    
    if (errors.startDate) {
      setErrors(prev => ({ ...prev, startDate: null }));
    }
  };

  // Helper function to get week of month
  const getWeekOfMonth = (date) => {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstWeekday = firstDayOfMonth.getDay() || 7; // Convert Sunday (0) to 7
    const offsetDate = date.getDate() + firstWeekday - 1;
    return Math.floor(offsetDate / 7) + 1;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!report.title.trim()) newErrors.title = '제목을 입력해주세요.';
    if (!report.startDate) newErrors.startDate = '시작일을 선택해주세요.';
    if (!report.endDate) newErrors.endDate = '종료일을 선택해주세요.';
    if (!report.userId) newErrors.userId = '담당자를 선택해주세요.';
    
    if (report.startDate && report.endDate && report.startDate > report.endDate) {
      newErrors.endDate = '종료일은 시작일보다 이후여야 합니다.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: '입력 정보를 확인해주세요.',
        severity: 'error'
      });
      return;
    }
    
    setSaving(true);
    
    // Format the report data for API submission
    const formattedReport = {
      ...report,
      startDate: format(report.startDate, 'yyyy-MM-dd'),
      endDate: format(report.endDate, 'yyyy-MM-dd'),
    };
    
    // Simulate API call
    setTimeout(() => {
      console.log('Saving report:', formattedReport);
      setSaving(false);
      setSnackbar({
        open: true,
        message: isEditMode ? '보고서가 수정되었습니다.' : '보고서가 생성되었습니다.',
        severity: 'success'
      });
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/reports');
      }, 1500);
    }, 1000);
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
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
      <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{isEditMode ? '보고서 수정' : '보고서 생성'}</Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/reports')}
        >
          목록으로
        </Button>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Title */}
            <Grid item xs={12}>
              <TextField
                label="보고서 제목"
                value={report.title}
                onChange={(e) => handleChange('title', e.target.value)}
                fullWidth
                error={!!errors.title}
                helperText={errors.title}
              />
            </Grid>

            {/* Date Range */}
            <Grid item xs={12} md={6}>
              <DatePicker
                label="시작일"
                value={report.startDate}
                onChange={handleStartDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.startDate,
                    helperText: errors.startDate
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="종료일"
                value={report.endDate}
                onChange={(date) => handleChange('endDate', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.endDate,
                    helperText: errors.endDate
                  }
                }}
              />
            </Grid>

            {/* User */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.userId}>
                <InputLabel id="user-label">담당자</InputLabel>
                <Select
                  labelId="user-label"
                  label="담당자"
                  value={report.userId}
                  onChange={(e) => handleChange('userId', e.target.value)}
                >
                  <MenuItem value="">
                    <em>담당자 선택</em>
                  </MenuItem>
                  {users.map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.userId && <FormHelperText>{errors.userId}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="status-label">상태</InputLabel>
                <Select
                  labelId="status-label"
                  label="상태"
                  value={report.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <MenuItem value="초안">초안</MenuItem>
                  <MenuItem value="완료">완료</MenuItem>
                  <MenuItem value="배포됨">배포됨</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>보고서 내용</Typography>
            </Grid>

            {/* Weekly Plan */}
            <Grid item xs={12}>
              <TextField
                label="금주 Plan"
                value={report.weeklyPlan}
                onChange={(e) => handleChange('weeklyPlan', e.target.value)}
                fullWidth
                multiline
                rows={4}
                placeholder="이번 주 계획을 입력하세요."
              />
            </Grid>

            {/* Weekly Do */}
            <Grid item xs={12}>
              <TextField
                label="Do"
                value={report.weeklyDo}
                onChange={(e) => handleChange('weeklyDo', e.target.value)}
                fullWidth
                multiline
                rows={4}
                placeholder="이번 주 실행한 업무를 입력하세요."
              />
            </Grid>

            {/* Weekly Check */}
            <Grid item xs={12}>
              <TextField
                label="Check"
                value={report.weeklyCheck}
                onChange={(e) => handleChange('weeklyCheck', e.target.value)}
                fullWidth
                multiline
                rows={4}
                placeholder="이번 주 체크 사항을 입력하세요."
              />
            </Grid>

            {/* Next Week Plan */}
            <Grid item xs={12}>
              <TextField
                label="다음 주 Plan"
                value={report.nextWeekPlan}
                onChange={(e) => handleChange('nextWeekPlan', e.target.value)}
                fullWidth
                multiline
                rows={4}
                placeholder="다음 주 계획을 입력하세요."
              />
            </Grid>

            {/* Completion Rate */}
            {report.status !== '초안' && (
              <Grid item xs={12} md={6}>
                <TextField
                  label="완료율 (%)"
                  type="number"
                  value={report.completionRate}
                  onChange={(e) => handleChange('completionRate', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  fullWidth
                  InputProps={{
                    inputProps: { min: 0, max: 100 }
                  }}
                />
              </Grid>
            )}

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={saving}
                >
                  {saving ? '저장 중...' : (isEditMode ? '수정' : '저장')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
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

export default ReportForm;
