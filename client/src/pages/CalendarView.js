import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box, Button, Typography, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// FullCalendar 기본 이벤트 스타일 무력화 (멀티라인, 배경/글자색 제거)
const calendarCustomStyle = `
  .fc-event .fc-event-title, .fc-event-title-container {
    white-space: pre-line !important;
    overflow: visible !important;
    text-overflow: initial !important;
  }
  .fc-event {
    background: transparent !important;
    border: none !important;
    color: #222 !important;
    padding: 0 !important;
  }
`;


// PDCA 툴팁 포맷 함수
function formatPDCA(plan) {
  return [
    plan.content ? `Plan: ${plan.content}` : '',
    plan.doResult ? `Do: ${plan.doResult}` : '',
    plan.check ? `Check: ${plan.check}` : '',
    plan.action ? `Action: ${plan.action}` : ''
  ].filter(Boolean).join('\n');
}

const CalendarView = () => {
  console.log('[CalendarView] 컴포넌트 함수 실행');
  // 글로벌 에러 핸들러 추가 (디버깅용)
  React.useEffect(() => {
    window.onerror = function(message, source, lineno, colno, error) {
      console.error('window.onerror:', message, source, lineno, colno, error);
    };
    window.addEventListener('error', function(e) {
      console.error('window.addEventListener error:', e);
    });
    return () => {
      window.onerror = null;
      window.removeEventListener('error', () => {});
    };
  }, []);

  // renderEventContent가 호출되는지 추적
  const renderEventContent = React.useCallback((eventInfo) => {
    console.log('renderEventContent called:', eventInfo);
    try {
      const plans = eventInfo.event.extendedProps.plans;
      // 디버깅: plans 배열의 타입과 내용을 출력
      console.log('renderEventContent plans:', plans);
      if (Array.isArray(plans)) {
        for (let i = 0; i < plans.length; i++) {
          const plan = plans[i];
          console.log(`plans[${i}] type:`, typeof plan, plan);
          if (typeof plan === 'object' && plan !== null && plan.$$typeof) {
            console.error('FATAL: plans 배열에 React Element가 포함되어 있습니다!', plan, eventInfo);
            throw new Error('plans 배열에 React Element가 포함되어 있습니다! 해당 이벤트의 콘솔 로그를 참고하세요.');
          }
        }
      }
      // plans 배열에서 React Element가 아닌(plain object) 데이터만 문자열로 안전하게 변환
      const safePlans = Array.isArray(plans)
        ? plans.filter(p => typeof p !== 'object' || !p.$$typeof)
        : [];
      // 각 업무 라인별로 배경색을 번갈아 적용
      const titleLines = eventInfo.event.title.split('\n');
      const bgColors = ['#e3f2fd', '#fffde7']; // 밝은 파랑, 밝은 노랑
      return (
        <Tooltip title={<span style={{ whiteSpace: 'pre-line' }}>{safePlans.map(formatPDCA).join('\n---\n')}</span>} arrow>
          <span style={{ display: 'inline-block' }}>
            {titleLines.map((line, idx) => (
              <div
                key={idx}
                style={{
                  background: bgColors[idx % bgColors.length],
                  color: '#222',
                  padding: '0 2px',
                  borderRadius: 2,
                  marginBottom: 1,
                  minHeight: 18,
                  fontSize: 'inherit',
                  whiteSpace: 'pre-line', // 줄바꿈 허용
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  display: 'block',
                }}
              >
                {line}
              </div>
            ))}
          </span>
        </Tooltip>
      );
    } catch (err) {
      console.error('renderEventContent error:', err, eventInfo);
      return <span style={{ color: 'red' }}>렌더링 에러</span>;
    }
  }, []);
  const [events, setEvents] = useState(() => []);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[CalendarView] useEffect mounted');
    console.log('[CalendarView] Starting fetch for /api/daily-tasks?planType=plan');
    fetch('/api/daily-tasks?planType=plan')
      .then(res => {
        console.log('[CalendarView] fetch response:', res);
        return res.json();
      })
      .then(data => {
        console.log('[CalendarView] Fetched data:', data);
        // 날짜별로 그룹화
        const grouped = data.reduce((acc, plan) => {
          (acc[plan.date] = acc[plan.date] || []).push(plan);
          return acc;
        }, {});
        // FullCalendar 이벤트 변환
        const calendarEvents = Object.entries(grouped).map(([date, plans]) => {
          const maxShow = 4;
          let title = '';
          if (plans.length <= maxShow) {
            title = plans.map(p => p.content || '-').join('\n');
          } else {
            const shown = plans.slice(0, maxShow - 1).map(p => p.content || '-');
            const last = plans[maxShow - 1].content || '-';
            const remain = plans.length - maxShow;
            shown.push(`${last} 외 ${remain}건`);
            title = shown.join('\n');
          }
          return {
            title,
            start: date,
            allDay: true,
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            textColor: '#222',
            extendedProps: { plans }
          };
        });
        console.log('[CalendarView] FullCalendar events:', calendarEvents);
        // Deep clone events and plans to prevent accidental mutation and React element injection
        setEvents(calendarEvents.map(ev => ({
          ...ev,
          extendedProps: {
            plans: Array.isArray(ev.extendedProps.plans)
              ? ev.extendedProps.plans.map(p => (typeof p === 'object' && p !== null && !p.$$typeof ? { ...p } : p))
              : []
          }
        })));
        // Log after deep clone
        console.log('[CalendarView] setEvents (deep cloned):', calendarEvents);
      })
      .catch(err => {
        console.error('[CalendarView] fetch error:', err);
      });
  }, []);

  // 셀 클릭 시 해당 날짜의 일일업무기록으로 이동
  const handleDateClick = (info) => {
    navigate(`/daily?date=${info.dateStr}`);
  };

  // 이벤트(업무) 클릭 시도 동일하게 이동
  const handleEventClick = (info) => {
    const date = info.event.startStr;
    navigate(`/daily?date=${date}`);
  };

  // 렌더링 직전 events 배열 로그 및 React Element 검사
  console.log('[CalendarView] 렌더링 직전 events:', events);
  if (Array.isArray(events)) {
    for (let i = 0; i < events.length; i++) {
      if (typeof events[i] === 'object' && events[i] !== null && events[i].$$typeof) {
        console.error('[CalendarView] FATAL: events 배열에 React Element가 들어가 있습니다!', events[i]);
      }
    }
  }
  // Defensive filter: only allow plain objects as events (not React elements)
  const safeEvents = Array.isArray(events)
    ? events.filter((e, idx) => {
        const isPlain = typeof e === 'object' && e !== null && !e.$$typeof;
        if (!isPlain) {
          console.error(`[CalendarView] Filtered out non-plain event at idx ${idx}:`, e);
        }
        return isPlain;
      })
    : [];
  if (events.length !== safeEvents.length) {
    console.warn(`[CalendarView] Filtered out ${events.length - safeEvents.length} invalid event(s) before rendering.`);
  }
  return (
    <>
      <style>{calendarCustomStyle}</style>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">월간 업무 캘린더</Typography>
        <Box>
          <Button variant="outlined" sx={{ mr: 1 }} onClick={() => navigate('/weekly-summary')}>주간 요약 바로가기</Button>
          <Button variant="contained" onClick={() => navigate('/daily')}>일일업무기록 바로가기</Button>
        </Box>
      </Box>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="ko"
        events={safeEvents}
        eventContent={renderEventContent}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
      />
     </Box>
    </>
  );
};

export default CalendarView;
