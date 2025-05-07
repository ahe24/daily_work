import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Card,
  CardContent,
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

const DailyTaskForm = () => {
  const [searchParams] = useSearchParams();
  const paramDate = searchParams.get('date');
  // 모든 state, useEffect, 변수 선언
  // ... (기존 state, useEffect 등)

  const today = new Date().toISOString().split('T')[0];
  // Use date from query param if exists, otherwise today
  const initialDate = paramDate || today;
  // Inline edit state for plan content
  const [editPlanId, setEditPlanId] = useState(null);
  const [editPlanContent, setEditPlanContent] = useState('');

  // Edit button click handler
  const handleEdit = (planId, content) => {
    setEditPlanId(planId);
    setEditPlanContent(content);
  };

  // Save edited plan content
  const handleEditSave = async (planId) => {
    try {
      const res = await fetch(`/api/daily-tasks/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editPlanContent })
      });
      if (res.ok) {
        setSnackbar({ open: true, message: '계획이 수정되었습니다.', severity: 'success' });
        setEditPlanId(null);
        setEditPlanContent('');
        // Reload plans
        const plansRes = await fetch(`/api/daily-tasks?date=${currentDate}&planType=plan`);
        const plans = await plansRes.json();
        setTaskData(prev => ({ ...prev, plans: Array.isArray(plans) ? plans : [] }));
      } else {
        throw new Error('수정 실패');
      }
    } catch (e) {
      setSnackbar({ open: true, message: '계획 수정 중 오류 발생', severity: 'error' });
    }
  };

  // Delete plan handler
  const handleDelete = async (planId) => {
    try {
      const res = await fetch(`/api/daily-tasks/${planId}`, { method: 'DELETE' });
      if (res.ok) {
        setSnackbar({ open: true, message: '계획이 삭제되었습니다.', severity: 'success' });
        // Reload plans
        const plansRes = await fetch(`/api/daily-tasks?date=${currentDate}&planType=plan`);
        const plans = await plansRes.json();
        setTaskData(prev => ({ ...prev, plans: Array.isArray(plans) ? plans : [] }));
      } else {
        throw new Error('삭제 실패');
      }
    } catch (e) {
      setSnackbar({ open: true, message: '계획 삭제 중 오류 발생', severity: 'error' });
    }
  };

  const [currentDate, setCurrentDate] = useState(initialDate);
  const [taskData, setTaskData] = useState({
    date: currentDate,
    plans: []
  });
  // 신규 계획 입력 상태
  const [newPlanContent, setNewPlanContent] = useState('');
  // 신규 Check/Action 입력 상태
  const [newCheckContent, setNewCheckContent] = useState('');
  const [newActionContent, setNewActionContent] = useState('');
  // 실행 결과(Do), Check, Action 입력 임시 상태 (플랜별)
  const [editFields, setEditFields] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Do/Check/Action 저장 핸들러(서버 업데이트)
  const handleSaveAllFields = async (planId) => {
    const edit = editFields[planId] || {};
    // 아무것도 바뀌지 않았으면 리턴
    if (
      (edit.doResult === undefined || edit.doResult === taskData.plans.find(p => p.id === planId)?.doResult) &&
      (edit.content === undefined || edit.content === taskData.plans.find(p => p.id === planId)?.content) &&
      (edit.doResult === undefined || edit.doResult === taskData.plans.find(p => p.id === planId)?.doResult) &&
      (edit.check === undefined || edit.check === taskData.plans.find(p => p.id === planId)?.check) &&
      (edit.action === undefined || edit.action === taskData.plans.find(p => p.id === planId)?.action)
    ) return;
    try {
      const res = await fetch(`/api/daily-tasks/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(edit.content !== undefined ? { content: edit.content } : {}),
          ...(edit.doResult !== undefined ? { doResult: edit.doResult } : {}),
          ...(edit.check !== undefined ? { check: edit.check } : {}),
          ...(edit.action !== undefined ? { action: edit.action } : {})
        })
      });
      if (res.ok) {
        setSnackbar({ open: true, message: '저장되었습니다.', severity: 'success' });
        // setEditFields(prev => { const copy = { ...prev }; delete copy[planId]; return copy; }); // 삭제하지 않음: 임시 상태 유지
        // 변경 후 다시 불러오기
        const plansRes = await fetch(`/api/daily-tasks?date=${currentDate}&planType=plan`);
        const plans = await plansRes.json();
        setTaskData(prev => ({ ...prev, plans: Array.isArray(plans) ? plans : [] }));
      } else {
        throw new Error('저장 실패');
      }
      // 저장 성공 시 미리보기 갱신
      fetchWeekPlans();
    } catch (e) {
      setSnackbar({ open: true, message: '저장 중 오류 발생', severity: 'error' });
    }
  };


  // 날짜 이동 핸들러
  const handleMoveDate = async (planId, newDate) => {
    try {
      const res = await fetch(`/api/daily-tasks/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movedToDate: newDate, date: newDate })
      });
      if (res.ok) {
        setSnackbar({ open: true, message: '날짜가 이동되었습니다.', severity: 'success' });
        // 이동 후 다시 불러오기(이동된 업무는 현재 날짜에서 사라짐)
        const plansRes = await fetch(`/api/daily-tasks?date=${currentDate}&planType=plan`);
        const plans = await plansRes.json();
        setTaskData(prev => ({ ...prev, plans: Array.isArray(plans) ? plans : [] }));
      } else {
        throw new Error('날짜 이동 실패');
      }
    } catch (e) {
      setSnackbar({ open: true, message: '날짜 이동 중 오류 발생', severity: 'error' });
    }
  };

  // Do 기록 및 상태/날짜/취소 변경 핸들러
  const handlePlanUpdate = async (id, updates) => {
    try {
      const res = await fetch(`/api/daily-tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        setSnackbar({ open: true, message: '업데이트 완료', severity: 'success' });
        // 변경 후 다시 불러오기
        const plansRes = await fetch(`/api/daily-tasks?date=${currentDate}&planType=plan`);
        const plans = await plansRes.json();
        setTaskData(prev => ({ ...prev, plans: Array.isArray(plans) ? plans : [] }));
      } else {
        throw new Error('업데이트 실패');
      }
    } catch (error) {
      setSnackbar({ open: true, message: '업데이트 중 오류 발생', severity: 'error' });
    }
  };

  // Load tasks for the selected date from API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`/api/daily-tasks?date=${currentDate}&planType=plan`);
        const data = await res.json();
        setTaskData({
          date: currentDate,
          plans: Array.isArray(data) ? data : []
        });
      } catch (error) {
        setSnackbar({ open: true, message: '계획을 불러오는 중 오류가 발생했습니다.', severity: 'error' });
      }
    };
    fetchPlans();
  }, [currentDate]);

  // 오늘~금요일까지의 계획 미리보기 데이터
  useEffect(() => {
    fetchWeekPlans();
  }, [currentDate]);

  const [weekPlans, setWeekPlans] = useState([]);

  const handleDateChange = (e) => {
    setCurrentDate(e.target.value);
  };

  // 신규 계획 추가 핸들러
  const handleAddPlan = async () => {
    if (!newPlanContent.trim()) return;
    try {
      const res = await fetch('/api/daily-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: currentDate,
          content: newPlanContent,
          check: newCheckContent,
          action: newActionContent,
          status: '계획',
          planType: 'plan'
        })
      });
      if (res.ok) {
        setNewPlanContent('');
        setNewCheckContent('');
        setNewActionContent('');
        setSnackbar({ open: true, message: '계획이 추가되었습니다.', severity: 'success' });
        // 추가 후 다시 불러오기
        const plansRes = await fetch(`/api/daily-tasks?date=${currentDate}&planType=plan`);
        const plans = await plansRes.json();
        setTaskData(prev => ({ ...prev, plans: Array.isArray(plans) ? plans : [] }));
        // 계획 추가 성공 시 미리보기 갱신
        fetchWeekPlans();
      } else {
        throw new Error('추가 실패');
      }
    } catch (e) {
      setSnackbar({ open: true, message: '계획 추가 중 오류 발생', severity: 'error' });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const navigate = useNavigate();

  const fetchWeekPlans = async () => {
    try {
      const today = new Date(currentDate);
      const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // 1=월~7=일
      const monday = new Date(today);
      monday.setDate(today.getDate() - dayOfWeek + 1); // 월요일
      const friday = new Date(monday);
      friday.setDate(monday.getDate() + 4); // 금요일
      const from = monday.toISOString().split('T')[0];
      const to = friday.toISOString().split('T')[0];
      const res = await fetch(`/api/daily-tasks?from=${from}&to=${to}&planType=plan`);
      const data = await res.json();
      setWeekPlans(Array.isArray(data) ? data : []);
    } catch {}
  };
  return (
    <Box sx={{ mt: 2 }}>
      {/* 입력 및 계획 리스트 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Button variant="outlined" color="secondary" onClick={() => navigate('/')} sx={{ mr: 2 }}>
            메인으로
          </Button>
          <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
            일일 업무 기록
          </Typography>
        </Box>
        <Grid container spacing={1} alignItems="center" sx={{ mb: 2 }}>
          {/* 날짜 + 신규 계획 입력 + 추가 버튼 한 줄 배치 */}
          <Grid item xs={3} sm={2} md={2} lg={2} xl={2}>
            <TextField
              label="날짜"
              type="date"
              value={currentDate}
              onChange={handleDateChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              required
              size="small"
            />
          </Grid>
          <Grid item xs={7} sm={8} md={8} lg={8} xl={8}>
            <TextField
              label="새 업무 계획 입력"
              value={newPlanContent}
              onChange={e => setNewPlanContent(e.target.value)}
              fullWidth
              size="small"
              onKeyDown={e => { if (e.key === 'Enter') handleAddPlan(); }}
            />
          </Grid>
          <Grid item xs={2} sm={2} md={2} lg={2} xl={2} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddPlan}
              disabled={!newPlanContent.trim()}
              sx={{ width: '100%', minWidth: 0, px: 2 }}
              size="large"
            >
              계획 추가
            </Button>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            오늘의 계획 업무
          </Typography>
        </Grid>
        {/* Plan 리스트 (Do 기록/상태/날짜/취소) */}
        <Grid container spacing={1}>
          {taskData.plans && taskData.plans.length > 0 ? taskData.plans.map((plan, idx) => (
            <Grid item xs={12} key={plan.id || idx}>
              <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
                {/* 업무내용 */}
                <Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
                  <TextField
                    label="업무내용"
                    value={editFields[plan.id]?.content ?? plan.content ?? ''}
                    onChange={e => setEditFields(prev => ({
                      ...prev,
                      [plan.id]: {
                        ...prev[plan.id],
                        content: e.target.value
                      }
                    }))}
                    fullWidth
                    size="small"
                    multiline
                    minRows={1}
                    maxRows={2}
                    sx={{ pr: 0.5 }}
                  />
                </Grid>
                {/* Do */}
                <Grid item xs={12} sm={2} md={1.5} lg={1.5} xl={1.5}>
                  <TextField
                    label="Do"
                    value={editFields[plan.id]?.doResult ?? plan.doResult ?? ''}
                    onChange={e => setEditFields(prev => ({
                      ...prev,
                      [plan.id]: {
                        ...prev[plan.id],
                        doResult: e.target.value
                      }
                    }))}
                    fullWidth
                    size="small"
                    multiline
                    minRows={1}
                    maxRows={2}
                    sx={{ pr: 0.5 }}
                  />
                </Grid>
                {/* Check */}
                <Grid item xs={12} sm={2} md={1.5} lg={1.5} xl={1.5}>
                  <TextField
                    label="Check"
                    value={editFields[plan.id]?.check ?? plan.check ?? ''}
                    onChange={e => setEditFields(prev => ({
                      ...prev,
                      [plan.id]: {
                        ...prev[plan.id],
                        check: e.target.value
                      }
                    }))}
                    fullWidth
                    size="small"
                    multiline
                    minRows={1}
                    maxRows={2}
                    sx={{ pr: 0.5 }}
                  />
                </Grid>
                {/* Action */}
                <Grid item xs={12} sm={2} md={1.5} lg={1.5} xl={1.5}>
                  <TextField
                    label="Action"
                    value={editFields[plan.id]?.action ?? plan.action ?? ''}
                    onChange={e => setEditFields(prev => ({
                      ...prev,
                      [plan.id]: {
                        ...prev[plan.id],
                        action: e.target.value
                      }
                    }))}
                    fullWidth
                    size="small"
                    multiline
                    minRows={1}
                    maxRows={2}
                    sx={{ pr: 0.5 }}
                  />
                </Grid>
                {/* 상태 */}
                <Grid item xs={6} sm={1.2} md={1} lg={1} xl={1}>
                  <FormControl fullWidth size="small">
                    <InputLabel>상태</InputLabel>
                    <Select
                      value={plan.status}
                      onChange={e => handlePlanUpdate(plan.id, { status: e.target.value })}
                      label="상태"
                      size="small"
                    >
                      <MenuItem value="계획">계획</MenuItem>
                      <MenuItem value="진행중">진행중</MenuItem>
                      <MenuItem value="완료">완료</MenuItem>
                      <MenuItem value="지연">지연</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {/* 날짜 이동 */}
                <Grid item xs={6} sm={1.4} md={1.2} lg={1.2} xl={1.2}>
                  <TextField
                    label="날짜"
                    type="date"
                    value={plan.date}
                    onChange={e => handleMoveDate(plan.id, e.target.value)}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                {/* 저장 버튼 */}
                <Grid item xs={6} sm={0.8} md={0.7} lg={0.7} xl={0.7}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleSaveAllFields(plan.id)}
                    disabled={
                      (editFields[plan.id]?.content === undefined || editFields[plan.id]?.content === plan.content) &&
                      (editFields[plan.id]?.doResult === undefined || editFields[plan.id]?.doResult === plan.doResult) &&
                      (editFields[plan.id]?.check === undefined || editFields[plan.id]?.check === plan.check) &&
                      (editFields[plan.id]?.action === undefined || editFields[plan.id]?.action === plan.action)
                    }
                    sx={{ minWidth: 0, px: 1 }}
                  >
                    저장
                  </Button>
                </Grid>
                {/* 삭제 버튼 */}
                <Grid item xs={6} sm={0.7} md={0.6} lg={0.6} xl={0.6}>
                  <IconButton color="error" onClick={() => handleDelete(plan.id)} size="small">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
          )) : (
            <Grid item xs={12}><Typography color="text.secondary">등록된 계획이 없습니다.</Typography></Grid>
          )}
        </Grid>
      </Paper>
      {/* 오늘~금요일까지의 계획 미리보기 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ mr: 1 }}>
            {(() => {
              const dateObj = new Date(currentDate);
              const year = dateObj.getFullYear();
              const month = dateObj.getMonth() + 1;
              // 주차 계산: 이번 달 1일이 무슨 요일인지
              const firstDayOfMonth = new Date(year, month - 1, 1);
              const dayOfWeek = firstDayOfMonth.getDay() === 0 ? 7 : firstDayOfMonth.getDay(); // 1=월~7=일
              const currentDateNum = dateObj.getDate();
              // 이번 달 1일~현재 날짜까지 지난 일수
              const daysPassed = currentDateNum + (dayOfWeek - 1);
              const weekNum = Math.ceil(daysPassed / 7);
              return `${year}년 ${month}월 ${weekNum}주차 계획 미리보기`;
            })()}
          </Typography>
          <IconButton aria-label="미리보기 새로고침" size="small" onClick={fetchWeekPlans}>
            <span role="img" aria-label="새로고침">🔄</span>
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {/* 날짜별로 그룹핑 */}
          {weekPlans && weekPlans.length > 0 ? (
            Object.entries(
              weekPlans.reduce((acc, plan) => {
                (acc[plan.date] = acc[plan.date] || []).push(plan);
                return acc;
              }, {})
            ).map(([date, plans]) => (
              <Grid item xs={12} md={6} key={date}>
                <Card
                  sx={{ cursor: 'pointer', transition: '0.2s', '&:hover': { boxShadow: 6 } }}
                  onClick={() => {
                    setCurrentDate(date);
                    // 오늘의 계획 업무 섹션으로 스크롤 이동
                    const target = document.getElementById('today-plan-section');
                    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle2" color="primary.main" sx={{ mb: 1 }}>{date}</Typography>
                    {plans.map((plan, idx) => (
                      <Box key={plan.id || idx} sx={{ mb: 1, p: 1, borderRadius: 1, bgcolor: '#f9f9f9' }}>
                        <Typography variant="body1">{plan.content}</Typography>
                        <Typography variant="body2" color="text.secondary">상태: {plan.status}{plan.isCanceled ? ' (취소됨)' : ''}</Typography>
                        {plan.doResult && <Typography variant="body2" color="success.main">결과: {plan.doResult}</Typography>}
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}><Typography color="text.secondary">이번 주 계획이 없습니다.</Typography></Grid>
          )}
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
}

export default DailyTaskForm;
