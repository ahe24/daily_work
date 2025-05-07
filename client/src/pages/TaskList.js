import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

// Mock data - would be replaced with API calls
const mockTasks = [
  { id: 1, date: '2025-04-29', content: '주간 보고서 작성', status: '진행중', priority: '높음', userId: 1, user: { name: '홍길동' } },
  { id: 2, date: '2025-04-29', content: '팀 미팅 준비', status: '계획', priority: '중간', userId: 1, user: { name: '홍길동' } },
  { id: 3, date: '2025-04-28', content: '코드 리뷰', status: '완료', priority: '높음', userId: 2, user: { name: '김철수' } },
  { id: 4, date: '2025-04-27', content: '버그 수정', status: '완료', priority: '높음', userId: 2, user: { name: '김철수' } },
  { id: 5, date: '2025-04-26', content: '문서 작성', status: '지연', priority: '낮음', userId: 3, user: { name: '이영희' } },
  { id: 6, date: '2025-04-25', content: '기능 테스트', status: '완료', priority: '중간', userId: 3, user: { name: '이영희' } },
  { id: 7, date: '2025-04-24', content: '클라이언트 미팅', status: '완료', priority: '높음', userId: 1, user: { name: '홍길동' } },
  { id: 8, date: '2025-04-23', content: '디자인 검토', status: '완료', priority: '중간', userId: 2, user: { name: '김철수' } },
];

const TaskList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    status: '',
    priority: '',
    search: ''
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTasks(mockTasks);
      setFilteredTasks(mockTasks);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, tasks]);

  const applyFilters = () => {
    let filtered = [...tasks];

    if (filters.startDate) {
      filtered = filtered.filter(task => new Date(task.date) >= filters.startDate);
    }

    if (filters.endDate) {
      filtered = filtered.filter(task => new Date(task.date) <= filters.endDate);
    }

    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task => 
        task.content.toLowerCase().includes(searchLower) ||
        task.user.name.toLowerCase().includes(searchLower)
      );
    }

    setFilteredTasks(filtered);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      status: '',
      priority: '',
      search: ''
    });
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    // Would be replaced with API call
    const updatedTasks = tasks.filter(task => task.id !== taskToDelete.id);
    setTasks(updatedTasks);
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

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
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">업무 목록</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ mr: 1 }}
          >
            필터
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/tasks/new')}
          >
            업무 추가
          </Button>
        </Box>
      </Paper>

      {/* Filters */}
      {showFilters && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="시작일"
                value={filters.startDate}
                onChange={(date) => handleFilterChange('startDate', date)}
                renderInput={(params) => <TextField {...params} fullWidth size="small" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="종료일"
                value={filters.endDate}
                onChange={(date) => handleFilterChange('endDate', date)}
                renderInput={(params) => <TextField {...params} fullWidth size="small" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                label="상태"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="">전체</MenuItem>
                <MenuItem value="계획">계획</MenuItem>
                <MenuItem value="진행중">진행중</MenuItem>
                <MenuItem value="완료">완료</MenuItem>
                <MenuItem value="지연">지연</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                label="우선순위"
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="">전체</MenuItem>
                <MenuItem value="높음">높음</MenuItem>
                <MenuItem value="중간">중간</MenuItem>
                <MenuItem value="낮음">낮음</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="검색"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                fullWidth
                size="small"
                placeholder="업무 내용 또는 담당자"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={1}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
                fullWidth
              >
                초기화
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Tasks Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>날짜</TableCell>
                <TableCell>업무 내용</TableCell>
                <TableCell>담당자</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>우선순위</TableCell>
                <TableCell align="right">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTasks.length > 0 ? (
                filteredTasks
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>{task.date}</TableCell>
                      <TableCell>{task.content}</TableCell>
                      <TableCell>{task.user.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={task.status}
                          size="small"
                          color={getStatusColor(task.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={task.priority}
                          size="small"
                          color={getPriorityColor(task.priority)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="수정">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/tasks/${task.id}`)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="삭제">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(task)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    업무가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTasks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="페이지당 행 수:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>업무 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {taskToDelete && `'${taskToDelete.content}' 업무를 삭제하시겠습니까?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskList;
