import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { config } from '../config/test.config.js';

export async function generateSeleniumReports(results, totalDuration) {
  if (!fs.existsSync(config.reportsDir)) {
    fs.mkdirSync(config.reportsDir, { recursive: true });
  }

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;
  const total = results.length;
  const passPercentage = total > 0 ? ((passed / total) * 100).toFixed(1) + '%' : '0%';

  // 1. GENERATE EXCEL REPORT (selenium-report.xlsx)
  const workbook = new ExcelJS.Workbook();

  // --- Sheet 1: Summary ---
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.views = [{ showGridLines: true }];

  summarySheet.mergeCells('A1:E2');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = 'SMARTSTUDY AI - SELENIUM E2E TEST SUMMARY';
  titleCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };

  const summaryData = [
    ['Metric Name', 'Metric Value'],
    ['Total Test Cases', total],
    ['Passed Tests', passed],
    ['Failed Tests', failed],
    ['Skipped Tests', skipped],
    ['Pass Percentage', passPercentage],
    ['Total Execution Time', `${(totalDuration / 1000).toFixed(2)}s`],
    ['Execution Date', new Date().toLocaleString()]
  ];

  summaryData.forEach((row, idx) => {
    const r = summarySheet.getRow(4 + idx);
    r.height = 22;
    r.values = [row[0], row[1], '', '', ''];
    summarySheet.mergeCells(`A${4 + idx}:B${4 + idx}`);

    r.eachCell((cell, colNum) => {
      cell.font = { name: 'Segoe UI', size: 10 };
      cell.border = {
        top: { style: 'thin', color: { argb: 'CBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'CBD5E1' } },
        left: { style: 'thin', color: { argb: 'CBD5E1' } },
        right: { style: 'thin', color: { argb: 'CBD5E1' } }
      };

      if (idx === 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };
        cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFF' } };
      } else {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 0 ? 'F8FAFC' : 'FFFFFF' } };
        if (colNum === 2) {
          cell.font = { bold: true };
          if (row[0] === 'Pass Percentage') {
            cell.font.color = passed === total ? { argb: '16A34A' } : { argb: 'D97706' };
          }
        }
      }
      cell.alignment = { vertical: 'middle' };
    });
  });

  summarySheet.columns = [{ width: 25 }, { width: 25 }, { width: 15 }, { width: 15 }, { width: 15 }];

  // --- Sheet 2: Test Details ---
  const detailsSheet = workbook.addWorksheet('Test Details');
  detailsSheet.views = [{ showGridLines: true }];

  const headers = [
    'Test ID', 'Test Suite', 'Test Case', 'Description', 'Browser',
    'URL', 'Start Time', 'End Time', 'Duration (ms)', 'Expected Result',
    'Actual Result', 'Status', 'Error Message', 'Screenshot Path'
  ];

  const headerRow = detailsSheet.getRow(1);
  headerRow.height = 25;
  headerRow.values = headers;

  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '334155' } };
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      bottom: { style: 'medium', color: { argb: '0F172A' } }
    };
  });

  results.forEach((res, idx) => {
    const row = detailsSheet.addRow([
      res.id,
      res.suite,
      res.name,
      res.description || res.name,
      config.browser,
      config.baseUrl,
      res.startTime,
      res.endTime,
      res.duration,
      res.expected || 'Operation completes successfully.',
      res.actual || res.details || 'Verified cleanly.',
      res.status,
      res.errorMessage || 'None',
      res.screenshotPath || 'N/A'
    ]);
    row.height = 20;

    const isEven = idx % 2 === 0;
    const rowBg = isEven ? 'FFFFFF' : 'F1F5F9';

    row.eachCell((cell, colNum) => {
      cell.font = { name: 'Segoe UI', size: 9 };
      cell.alignment = { vertical: 'middle' };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
        left: { style: 'thin', color: { argb: 'E2E8F0' } },
        right: { style: 'thin', color: { argb: 'E2E8F0' } }
      };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };

      if (colNum === 12) { // Status
        cell.alignment.horizontal = 'center';
        cell.font = { bold: true };
        if (res.status === 'PASS') {
          cell.font.color = { argb: '15803D' };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } };
        } else if (res.status === 'FAIL') {
          cell.font.color = { argb: 'B91C1C' };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
        } else {
          cell.font.color = { argb: 'D97706' };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } };
        }
      }
    });
  });

  detailsSheet.columns = [
    { width: 12 }, { width: 22 }, { width: 35 }, { width: 35 }, { width: 12 },
    { width: 22 }, { width: 22 }, { width: 22 }, { width: 15 }, { width: 30 },
    { width: 30 }, { width: 14 }, { width: 35 }, { width: 35 }
  ];

  await workbook.xlsx.writeFile(config.excelReportPath);
  console.log(`\nExcel Report saved to: ${config.excelReportPath}`);

  // 2. GENERATE HTML REPORT (selenium-report.html)
  generateHtmlReport(results, totalDuration, passed, failed, skipped, passPercentage);
}

function generateHtmlReport(results, totalDuration, passed, failed, skipped, passPercentage) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SmartStudy AI - Selenium E2E Web Execution Report</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F8FAFC; color: #0F172A; margin: 0; padding: 24px; }
    .header { background: #0F172A; color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px; text-align: center; }
    .header h1 { margin: 0 0 8px 0; font-size: 24px; }
    .header p { margin: 0; opacity: 0.8; font-size: 14px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .metric-card { background: white; padding: 16px; border-radius: 8px; border: 1px solid #E2E8F0; text-align: center; }
    .metric-val { font-size: 22px; font-weight: bold; margin-top: 4px; }
    .pass { color: #16A34A; } .fail { color: #DC2626; } .skip { color: #D97706; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; border: 1px solid #E2E8F0; }
    th { background: #334155; color: white; text-align: left; padding: 12px; font-size: 13px; }
    td { padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-size: 13px; }
    tr:nth-child(even) { background: #F1F5F9; }
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
    .badge-pass { background: #DCFCE7; color: #15803D; }
    .badge-fail { background: #FEE2E2; color: #B91C1C; }
  </style>
</head>
<body>
  <div class="header">
    <h1>SmartStudy AI — Selenium Web E2E Test Report</h1>
    <p>Target URL: ${config.baseUrl} | Engine: Selenium WebDriver (Chrome Headless) | Executed: ${new Date().toLocaleString()}</p>
  </div>

  <div class="metrics-grid">
    <div class="metric-card"><div>Total Tests</div><div class="metric-val">${results.length}</div></div>
    <div class="metric-card"><div>Passed</div><div class="metric-val pass">${passed}</div></div>
    <div class="metric-card"><div>Failed</div><div class="metric-val fail">${failed}</div></div>
    <div class="metric-card"><div>Skipped</div><div class="metric-val skip">${skipped}</div></div>
    <div class="metric-card"><div>Pass Rate</div><div class="metric-val pass">${passPercentage}</div></div>
    <div class="metric-card"><div>Duration</div><div class="metric-val">${(totalDuration / 1000).toFixed(2)}s</div></div>
  </div>

  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Test Suite</th>
        <th>Test Case Name</th>
        <th>Status</th>
        <th>Duration (ms)</th>
        <th>Details / Failure Reason</th>
      </tr>
    </thead>
    <tbody>
      ${results.map(r => `
        <tr>
          <td><b>${r.id}</b></td>
          <td>${r.suite}</td>
          <td>${r.name}</td>
          <td><span class="badge ${r.status === 'PASS' ? 'badge-pass' : 'badge-fail'}">${r.status}</span></td>
          <td>${r.duration}</td>
          <td>${r.errorMessage || r.details || 'Step completed successfully.'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`;

  fs.writeFileSync(config.htmlReportPath, html);
  console.log(`HTML Report saved to: ${config.htmlReportPath}`);
}
