const express = require('express');
const router = express.Router();
const { Report, Task, User } = require('../models');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');

// Ensure reports directory exists
const reportsDir = path.join(__dirname, '../../reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Get all reports
router.get('/', async (req, res) => {
  try {
    const reports = await Report.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'username'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get report by ID
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'name', 'username'] }]
    });
    
    if (!report) {
      return res.status(404).json({ message: '보고서를 찾을 수 없습니다.' });
    }
    
    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new report
router.post('/', async (req, res) => {
  try {
    const newReport = await Report.create(req.body);
    
    // Fetch the created report with user information
    const report = await Report.findByPk(newReport.id, {
      include: [{ model: User, attributes: ['id', 'name', 'username'] }]
    });
    
    res.status(201).json(report);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a report
router.put('/:id', async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: '보고서를 찾을 수 없습니다.' });
    }
    
    await report.update(req.body);
    
    // Fetch the updated report with user information
    const updatedReport = await Report.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'name', 'username'] }]
    });
    
    res.json(updatedReport);
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a report
router.delete('/:id', async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: '보고서를 찾을 수 없습니다.' });
    }
    
    // Delete the Excel file if it exists
    if (report.filePath && fs.existsSync(report.filePath)) {
      fs.unlinkSync(report.filePath);
    }
    
    await report.destroy();
    res.json({ message: '보고서가 삭제되었습니다.' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate Excel report
router.post('/generate/:id', async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'name', 'username'] }]
    });
    
    if (!report) {
      return res.status(404).json({ message: '보고서를 찾을 수 없습니다.' });
    }
    
    // Fetch tasks for the report period
    const tasks = await Task.findAll({
      where: {
        date: {
          [Op.between]: [report.startDate, report.endDate]
        }
      },
      include: [{ model: User, attributes: ['id', 'name', 'username'] }],
      order: [['date', 'ASC']]
    });
    
    // Create a new Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = report.User.name;
    workbook.lastModifiedBy = report.User.name;
    workbook.created = new Date();
    workbook.modified = new Date();
    
    // Add a worksheet
    const worksheet = workbook.addWorksheet('주간보고서');
    
    // Define columns
    worksheet.columns = [
      { header: '날짜', key: 'date', width: 15 },
      { header: '업무 내용', key: 'content', width: 50 },
      { header: '담당자', key: 'user', width: 15 },
      { header: '상태', key: 'status', width: 10 },
      { header: '비고', key: 'notes', width: 20 }
    ];
    
    // Add header row with styling
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;
    
    // Add report title
    worksheet.mergeCells('A1:E1');
    worksheet.getCell('A1').value = `주간 보고서 (${report.startDate} ~ ${report.endDate})`;
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    
    // Add section headers
    worksheet.mergeCells('A2:E2');
    worksheet.getCell('A2').value = '금주 Plan';
    worksheet.getCell('A2').font = { bold: true, size: 14 };
    worksheet.getCell('A2').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9EAD3' }
    };
    
    // Add weekly plan content
    worksheet.mergeCells('A3:E5');
    worksheet.getCell('A3').value = report.weeklyPlan || '';
    worksheet.getCell('A3').alignment = { wrapText: true, vertical: 'top' };
    
    // Add Do section
    worksheet.mergeCells('A6:E6');
    worksheet.getCell('A6').value = 'Do';
    worksheet.getCell('A6').font = { bold: true, size: 14 };
    worksheet.getCell('A6').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFCE5CD' }
    };
    
    // Add task data
    let rowIndex = 7;
    tasks.forEach(task => {
      const row = worksheet.getRow(rowIndex);
      row.getCell('date').value = task.date;
      row.getCell('content').value = task.content;
      row.getCell('user').value = task.User ? task.User.name : '';
      row.getCell('status').value = task.status;
      row.getCell('notes').value = task.notes || '';
      rowIndex++;
    });
    
    // Add Check section
    rowIndex += 1;
    worksheet.mergeCells(`A${rowIndex}:E${rowIndex}`);
    worksheet.getCell(`A${rowIndex}`).value = 'Check';
    worksheet.getCell(`A${rowIndex}`).font = { bold: true, size: 14 };
    worksheet.getCell(`A${rowIndex}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9D2E9' }
    };
    
    // Add check content
    rowIndex += 1;
    worksheet.mergeCells(`A${rowIndex}:E${rowIndex + 2}`);
    worksheet.getCell(`A${rowIndex}`).value = report.weeklyCheck || '';
    worksheet.getCell(`A${rowIndex}`).alignment = { wrapText: true, vertical: 'top' };
    
    // Add Next Week Plan section
    rowIndex += 3;
    worksheet.mergeCells(`A${rowIndex}:E${rowIndex}`);
    worksheet.getCell(`A${rowIndex}`).value = '다음 주 Plan';
    worksheet.getCell(`A${rowIndex}`).font = { bold: true, size: 14 };
    worksheet.getCell(`A${rowIndex}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDEEAF6' }
    };
    
    // Add next week plan content
    rowIndex += 1;
    worksheet.mergeCells(`A${rowIndex}:E${rowIndex + 2}`);
    worksheet.getCell(`A${rowIndex}`).value = report.nextWeekPlan || '';
    worksheet.getCell(`A${rowIndex}`).alignment = { wrapText: true, vertical: 'top' };
    
    // Save the workbook
    const fileName = `Weekly_Report_${report.startDate}_${report.endDate}.xlsx`;
    const filePath = path.join(reportsDir, fileName);
    await workbook.xlsx.writeFile(filePath);
    
    // Update report with file path
    await report.update({ 
      filePath,
      status: '완료'
    });
    
    res.json({ 
      message: '보고서가 생성되었습니다.',
      filePath,
      fileName
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download report
router.get('/download/:id', async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    
    if (!report || !report.filePath) {
      return res.status(404).json({ message: '보고서 파일을 찾을 수 없습니다.' });
    }
    
    if (!fs.existsSync(report.filePath)) {
      return res.status(404).json({ message: '보고서 파일이 존재하지 않습니다.' });
    }
    
    const fileName = path.basename(report.filePath);
    res.download(report.filePath, fileName);
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
