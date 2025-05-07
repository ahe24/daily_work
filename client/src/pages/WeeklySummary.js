import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { format, addWeeks, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const WeeklySummary = () => {
  const handleExportExcel = () => {
    // plans 배열을 엑셀 데이터로 가공
    const data = plans.map(plan => ({
      날짜: plan.date,
      업무내용: plan.content,
      결과: plan.doResult,
      Check: plan.check,
      Action: plan.action,
      상태: plan.status
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    // 셀 너비 자동 조정
    const colNames = Object.keys(data[0] || {});
    ws['!cols'] = colNames.map(key => {
      const maxLen = Math.max(
        key.length,
        ...data.map(row => (row[key] ? String(row[key]).length : 0))
      );
      // 한글은 2배, 영문/숫자는 1배 정도로 가정
      const width = Math.ceil(maxLen * 1.7);
      return { wch: width < 10 ? 10 : width };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'WeeklySummary');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    // 파일명에 날짜범위 포함
    const startStr = format(weekStart, 'yyyy-MM-dd');
    const endStr = format(weekEnd, 'yyyy-MM-dd');
    const filename = `weekly-summary_${startStr}~${endStr}.xlsx`;
    saveAs(blob, filename);
  };
  const navigate = useNavigate();
  const [selectedWeek, setSelectedWeek] = useState(0); // 0: this week, -1: prev, 1: next
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  // Calculate week range
  const baseDate = addWeeks(new Date(), selectedWeek);
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(baseDate, { weekStartsOn: 1 });

  useEffect(() => {
    const fetchWeeklyData = async () => {
      setLoading(true);
      try {
        const start = format(weekStart, 'yyyy-MM-dd');
        const end = format(addDays(weekEnd, 7), 'yyyy-MM-dd'); // 이번주~차주까지 범위 확장
        const plansRes = await fetch(`/api/daily-tasks?from=${start}&to=${end}&planType=plan`);
        const allPlans = await plansRes.json();
        console.log('plans:', allPlans);
        console.log('selectedWeek:', selectedWeek);
        console.log('weekStart:', weekStart, 'weekEnd:', weekEnd);
        // 모든 plan의 date를 'yyyy-MM-dd' 문자열로 강제 변환
        allPlans.forEach(plan => {
          if (plan.date instanceof Date) {
            plan.date = format(plan.date, 'yyyy-MM-dd');
          }
          if (typeof plan.date === 'string' && plan.date.length > 10) {
            plan.date = plan.date.slice(0, 10);
          }
        });
        allPlans.forEach(plan => {
          console.log('plan.date:', plan.date, 'planType:', plan.planType, 'doResult:', plan.doResult);
        });
        setPlans(Array.isArray(allPlans) ? allPlans : []);
      } catch (e) {
        setPlans([]);
      }
      setLoading(false);
    };
    fetchWeeklyData();
  }, [selectedWeek]);

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button variant="outlined" color="primary" onClick={() => navigate('/')} sx={{ mr: 2 }}>
                메인 캘린더 바로가기
              </Button>
              <Button variant="outlined" color="primary" onClick={() => navigate('/daily')} sx={{ mr: 2 }}>
                일일 업무기록 바로가기
              </Button>
              <Typography variant="h5" sx={{ mb: 0, mr: 2 }}>
                {format(weekStart, 'yyyy년 MM월 dd일', { locale: ko })} ~ {format(weekEnd, 'MM월 dd일', { locale: ko })} 요약
              </Typography>
              <Button variant="contained" color="success" onClick={handleExportExcel} sx={{ ml: 2 }}>
                Excel로 내보내기
              </Button>
            </Box>
          </Grid>
          <Grid item>
            <FormControl size="small">
              <InputLabel>차주 선택</InputLabel>
              <Select
                value={selectedWeek}
                label="차주 선택"
                onChange={e => setSelectedWeek(e.target.value)}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value={-1}>이전 주</MenuItem>
                <MenuItem value={0}>이번 주</MenuItem>
                <MenuItem value={1}>다음 주</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      <Grid container spacing={3}>
        {/* 왼쪽 패널: 금주 계획/한일 */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              금주 계획/한일 ({format(weekStart, 'MM월 dd일', { locale: ko })} ~ {format(weekEnd, 'MM월 dd일', { locale: ko })})
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <Box sx={{ overflowX: 'auto' }}>
              <Grid container spacing={2}>
  {loading ? (
    <Grid item xs={12}><Typography align="center">로딩 중...</Typography></Grid>
  ) : (
    Array.from({ length: 7 }).map((_, i) => {
      const dateObj = addDays(weekStart, i);
      const dayDate = format(dateObj, 'yyyy-MM-dd');
      const label = format(dateObj, 'MM/dd', { locale: ko }) + ` (${['일','월','화','수','목','금','토'][dateObj.getDay()]})`;
      const dayPlans = plans.filter(plan => plan.date === dayDate && plan.planType === 'plan');
      return (
        <Grid item xs={12} key={dayDate}>
          <Paper elevation={3} sx={{ p: 2, minHeight: 150, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>{label}</Typography>
            {dayPlans.length === 0 ? (
              <Typography color="text.secondary">계획 없음</Typography>
            ) : (
              dayPlans
                .filter(plan => typeof plan !== 'object' || !plan.$$typeof)
                .map((plan, idx) => {
                  // 디버깅: plan의 타입과 내용을 출력
                  if (typeof plan === 'object' && plan !== null && plan.$$typeof) {
                    console.warn('경고: dayPlans에 React Element가 포함되어 있습니다!', plan);
                    return null;
                  }
                  return (
                    <Box key={plan.id || idx} sx={{ mb: 1, p: 1, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                      <Typography>{plan.content || '-'}</Typography>
                      <Typography color="success.main">한일: {plan.doResult || '-'}</Typography>
                      <Typography color="info.main">Check: {plan.check || '-'}</Typography>
                      <Typography color="warning.main">Action: {plan.action || '-'}</Typography>
                    </Box>
                  );
                })
            )}
          </Paper>
        </Grid>
      );
    })
  )}
            </Grid>
          </Box>
        </Paper>
      </Grid>
        {/* 오른쪽 패널: 차주 계획 */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, bgcolor: '#f6f9ff' }}>
            {(() => {
              // 차주 날짜 범위 계산
              const nextWeekBase = addWeeks(new Date(), selectedWeek + 1);
              const nextWeekStart = startOfWeek(nextWeekBase, { weekStartsOn: 1 });
              const nextWeekEnd = endOfWeek(nextWeekBase, { weekStartsOn: 1 });
              const nextWeekStartStr = format(nextWeekStart, 'yyyy-MM-dd');
              const nextWeekEndStr = format(nextWeekEnd, 'yyyy-MM-dd');
              const flatPlans = plans.flat ? plans.flat() : plans;
              const nextWeekPlans = flatPlans.filter(plan => {
                return (
                  plan.date >= nextWeekStartStr &&
                  plan.date <= nextWeekEndStr &&
                  (!plan.doResult || plan.doResult.trim() === '')
                );
              });
              console.log('nextWeekPlans:', nextWeekPlans);
              console.log('nextWeekStart:', nextWeekStart, 'nextWeekEnd:', nextWeekEnd);
              return (
                <React.Fragment>
                  <Typography variant="h6" gutterBottom>
                    차주 계획 ({format(nextWeekStart, 'MM월 dd일', { locale: ko })} ~ {format(nextWeekEnd, 'MM월 dd일', { locale: ko })})
                  </Typography>
                  <Divider sx={{ mb: 1 }} />
                  <Box sx={{ overflowX: 'auto' }}>
                    <Grid container spacing={2}>
                      {loading ? (
                        <Grid item xs={12}><Typography align="center">로딩 중...</Typography></Grid>
                      ) : (
                        Array.from({ length: 7 }).map((_, i) => {
                          const dateObj = addDays(nextWeekStart, i);
                          const dayDate = format(dateObj, 'yyyy-MM-dd');
                          const label = format(dateObj, 'MM/dd', { locale: ko }) + ` (${['일','월','화','수','목','금','토'][dateObj.getDay()]})`;
                          const dayPlans = nextWeekPlans.filter(plan => format(new Date(plan.date), 'yyyy-MM-dd') === dayDate);
                          return (
                            <Grid item xs={12} key={dayDate}>
                              <Paper elevation={2} sx={{ p: 2, minHeight: 100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', bgcolor: '#fafdff' }}>
                                <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>{label}</Typography>
                                {dayPlans.length === 0 ? (
                                  <Typography color="text.secondary">데이터 없음</Typography>
                                ) : (
                                  dayPlans.slice(0,4).map(plan => (
                                    <Box key={plan.id} sx={{ mb: 1, p: 1, bgcolor: '#f5f6fa', borderRadius: 1 }}>
                                      <Typography>{plan.content || '-'}</Typography>
                                    </Box>
                                  ))
                                )}
                                {dayPlans.length > 4 && <Typography color="text.secondary">외 {dayPlans.length-4}건 더 있음</Typography>}
                              </Paper>
                            </Grid>
                          );
                        })
                      )}
                    </Grid>
                  </Box>
                </React.Fragment>
              );
            })()}
          </Paper>
        </Grid>
      </Grid>
      <Box sx={{ mt: 4, textAlign: 'right' }}>
        <Button variant="contained" color="primary" onClick={() => navigate('/daily')}>일일 업무 기록 바로가기</Button>
      </Box>
    </Box>
  );
};

export default WeeklySummary;
