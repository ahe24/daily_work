import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { format } from 'date-fns';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

// Mock data - would be replaced with API calls
const mockTasks = [
  { id: 1, date: '2025-04-29', content: '주간 보고서 작성', status: '진행중', priority: '높음', userId: 1, user: { name: '홍길동' }, startTime: '09:00', endTime: '12:00', notes: '금요일까지 완료 필요' },
  { id: 2, date: '2025-04-29', content: '팀 미팅 준비', status: '계획', priority: '중간', userId: 1, user: { name: '홍길동' }, startTime: '13:00', endTime: '15:00', notes: '' },
  { id: 3, date: '2025-04-28', content: '코드 리뷰', status: '완료', priority: '높음', userId: 2, user: { name: '김철수' }, startTime: '10:00', endTime: '11:30', notes: '프론트엔드 코드 검토' },
];

const mockUsers = [
  { id: 1, name: '홍길동' },
  { id: 2, name: '김철수' },
  { id: 3, name: '이영희' },
];

const mockTemplates = [
  { id: 1, name: '주간 보고서', content: '주간 보고서 작성', defaultStatus: '계획', defaultPriority: '높음' },
  { id: 2, name: '팀 미팅', content: '팀 미팅 준비 및 참석', defaultStatus: '계획', defaultPriority: '중간' },
  { id: 3, name: '코드 리뷰', content: '코드 리뷰 진행', defaultStatus: '계획', defaultPriority: '높음' },
];

const TaskForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [task, setTask] = useState({
    date: new Date(),
    content: '',
    status: '계획',
    priority: '중간',
    userId: '',
    startTime: null,
    endTime: null,
    notes: '',
    attachments: []
  });
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // Simulate API call for users and templates
    setUsers(mockUsers);
    setTemplates(mockTemplates);

    // If in edit mode, fetch task data
    if (isEditMode) {
      setTimeout(() => {
        const foundTask = mockTasks.find(t => t.id === parseInt(id));
        if (foundTask) {
          setTask({
            ...foundTask,
            date: new Date(foundTask.date),
            startTime: foundTask.startTime ? new Date(`2025-01-01T${foundTask.startTime}`) : null,
            endTime: foundTask.endTime ? new Date(`2025-01-01T${foundTask.endTime}`) : null,
          });
        }
        setLoading(false);
      }, 1000);
    }
  }, [id, isEditMode]);

  const handleChange = (field, value) => {
    setTask(prev => ({ ...prev, [field]: value }));
    
    // Clear error for the field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleTemplateChange = (event) => {
    const templateId = event.target.value;
    if (!templateId) return;

    const selectedTemplate = templates.find(t => t.id === templateId);
    if (selectedTemplate) {
      setTask(prev => ({
        ...prev,
        content: selectedTemplate.content,
        status: selectedTemplate.defaultStatus,
        priority: selectedTemplate.defaultPriority
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!task.date) newErrors.date = '날짜를 선택해주세요.';
    if (!task.content.trim()) newErrors.content = '업무 내용을 입력해주세요.';
    if (!task.userId) newErrors.userId = '담당자를 선택해주세요.';
    
    if (task.startTime && task.endTime && task.startTime > task.endTime) {
      newErrors.endTime = '종료 시간은 시작 시간보다 이후여야 합니다.';
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
    
    // Format the task data for API submission
    const formattedTask = {
      ...task,
      date: format(task.date, 'yyyy-MM-dd'),
      startTime: task.startTime ? format(task.startTime, 'HH:mm') : null,
      endTime: task.endTime ? format(task.endTime, 'HH:mm') : null,
    };
    
    // Simulate API call
    setTimeout(() => {
      console.log('Saving task:', formattedTask);
      setSaving(false);
      setSnackbar({
        open: true,
        message: isEditMode ? '업무가 수정되었습니다.' : '업무가 추가되었습니다.',
        severity: 'success'
      });
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/tasks');
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
        <Typography variant="h6">{isEditMode ? '업무 수정' : '업무 추가'}</Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/tasks')}
        >
          목록으로
        </Button>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Template Selection */}
            {!isEditMode && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="template-label">템플릿 선택</InputLabel>
                  <Select
                    labelId="template-label"
                    label="템플릿 선택"
                    value=""
                    onChange={handleTemplateChange}
                  >
                    <MenuItem value="">
                      <em>템플릿 선택 (선택사항)</em>
                    </MenuItem>
                    {templates.map(template => (
                      <MenuItem key={template.id} value={template.id}>
                        {template.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>템플릿을 선택하면 기본 내용이 자동으로 채워집니다.</FormHelperText>
                </FormControl>
              </Grid>
            )}

            {/* Date */}
            <Grid item xs={12} md={6}>
              <DatePicker
                label="날짜"
                value={task.date}
                onChange={(date) => handleChange('date', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.date,
                    helperText: errors.date
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
                  value={task.userId}
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

            {/* Content */}
            <Grid item xs={12}>
              <TextField
                label="업무 내용"
                value={task.content}
                onChange={(e) => handleChange('content', e.target.value)}
                fullWidth
                multiline
                rows={3}
                error={!!errors.content}
                helperText={errors.content}
              />
            </Grid>

            {/* Status and Priority */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="status-label">상태</InputLabel>
                <Select
                  labelId="status-label"
                  label="상태"
                  value={task.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <MenuItem value="계획">계획</MenuItem>
                  <MenuItem value="진행중">진행중</MenuItem>
                  <MenuItem value="완료">완료</MenuItem>
                  <MenuItem value="지연">지연</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="priority-label">우선순위</InputLabel>
                <Select
                  labelId="priority-label"
                  label="우선순위"
                  value={task.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                >
                  <MenuItem value="높음">높음</MenuItem>
                  <MenuItem value="중간">중간</MenuItem>
                  <MenuItem value="낮음">낮음</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Time */}
            <Grid item xs={12} md={6}>
              <TimePicker
                label="시작 시간"
                value={task.startTime}
                onChange={(time) => handleChange('startTime', time)}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TimePicker
                label="종료 시간"
                value={task.endTime}
                onChange={(time) => handleChange('endTime', time)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.endTime,
                    helperText: errors.endTime
                  }
                }}
              />
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                label="비고"
                value={task.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>

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

export default TaskForm;
