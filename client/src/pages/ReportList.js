import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
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
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

// Mock data - would be replaced with API calls
const mockReports = [
  { id: 1, title: '4월 4주차 보고서', startDate: '2025-04-22', endDate: '2025-04-28', status: '완료', userId: 1, user: { name: '홍길동' }, completionRate: 85, filePath: '/reports/report1.xlsx', createdAt: '2025-04-28' },
  { id: 2, title: '4월 3주차 보고서', startDate: '2025-04-15', endDate: '2025-04-21', status: '완료', userId: 1, user: { name: '홍길동' }, completionRate: 90, filePath: '/reports/report2.xlsx', createdAt: '2025-04-21' },
  { id: 3, title: '4월 2주차 보고서', startDate: '2025-04-08', endDate: '2025-04-14', status: '완료', userId: 2, user: { name: '김철수' }, completionRate: 75, filePath: '/reports/report3.xlsx', createdAt: '2025-04-14' },
  { id: 4, title: '4월 1주차 보고서', startDate: '2025-04-01', endDate: '2025-04-07', status: '완료', userId: 3, user: { name: '이영희' }, completionRate: 80, filePath: '/reports/report4.xlsx', createdAt: '2025-04-07' },
  { id: 5, title: '5월 1주차 보고서', startDate: '2025-04-29', endDate: '2025-05-05', status: '초안', userId: 1, user: { name: '홍길동' }, completionRate: 0, filePath: null, createdAt: '2025-04-29' },
];

const ReportList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [reportToGenerate, setReportToGenerate] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setReports(mockReports);
      setLoading(false);
    }, 1000);
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (report) => {
    setReportToDelete(report);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    // Would be replaced with API call
    const updatedReports = reports.filter(report => report.id !== reportToDelete.id);
    setReports(updatedReports);
    setDeleteDialogOpen(false);
    setReportToDelete(null);
  };

  const handleGenerateClick = (report) => {
    setReportToGenerate(report);
    setGenerateDialogOpen(true);
  };

  const handleGenerateConfirm = () => {
    setGenerating(true);
    
    // Simulate API call to generate report
    setTimeout(() => {
      const updatedReports = reports.map(r => {
        if (r.id === reportToGenerate.id) {
          return {
            ...r,
            status: '완료',
            filePath: `/reports/report${r.id}.xlsx`,
            completionRate: 85
          };
        }
        return r;
      });
      
      setReports(updatedReports);
      setGenerating(false);
      setGenerateDialogOpen(false);
      setReportToGenerate(null);
    }, 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '완료': return 'success';
      case '배포됨': return 'info';
      case '초안': return 'warning';
      default: return 'default';
    }
  };

  const getCompletionColor = (rate) => {
    if (rate >= 80) return 'success';
    if (rate >= 50) return 'warning';
    return 'error';
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
        <Typography variant="h6">보고서 목록</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/reports/new')}
        >
          보고서 생성
        </Button>
      </Paper>

      {/* Reports Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>제목</TableCell>
                <TableCell>기간</TableCell>
                <TableCell>담당자</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>완료율</TableCell>
                <TableCell>생성일</TableCell>
                <TableCell align="right">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.length > 0 ? (
                reports
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.title}</TableCell>
                      <TableCell>{`${report.startDate} ~ ${report.endDate}`}</TableCell>
                      <TableCell>{report.user.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={report.status}
                          size="small"
                          color={getStatusColor(report.status)}
                        />
                      </TableCell>
                      <TableCell>
                        {report.status === '초안' ? (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        ) : (
                          <Chip
                            label={`${report.completionRate}%`}
                            size="small"
                            color={getCompletionColor(report.completionRate)}
                          />
                        )}
                      </TableCell>
                      <TableCell>{report.createdAt}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="보기">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/reports/view/${report.id}`)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="수정">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/reports/${report.id}`)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {report.status === '초안' && (
                          <Tooltip title="보고서 생성">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleGenerateClick(report)}
                            >
                              <DescriptionIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {report.filePath && (
                          <Tooltip title="다운로드">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => console.log('Download report:', report.filePath)}
                            >
                              <FileDownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="삭제">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(report)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    보고서가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={reports.length}
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
        <DialogTitle>보고서 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {reportToDelete && `'${reportToDelete.title}' 보고서를 삭제하시겠습니까?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      {/* Generate Report Dialog */}
      <Dialog
        open={generateDialogOpen}
        onClose={() => !generating && setGenerateDialogOpen(false)}
      >
        <DialogTitle>보고서 생성</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {reportToGenerate && `'${reportToGenerate.title}' 보고서를 생성하시겠습니까?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setGenerateDialogOpen(false)} 
            disabled={generating}
          >
            취소
          </Button>
          <Button 
            onClick={handleGenerateConfirm} 
            color="primary" 
            autoFocus
            disabled={generating}
          >
            {generating ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                생성 중...
              </>
            ) : '생성'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportList;
