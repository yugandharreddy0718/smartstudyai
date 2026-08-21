import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateAppiumReports(results, totalDuration) {
  const reportsDir = path.resolve(__dirname, '../reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const excelPath = path.join(reportsDir, 'appium-report.xlsx');
  const htmlPath = path.join(reportsDir, 'appium-report.html');

  // Excel Report Generation
  const workbook = new ExcelJS.Workbook();

  // Summary Worksheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.views = [{ showGridLines: true }];

  summarySheet.mergeCells('A1:F2');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = 'SMARTSTUDY AI - ANDROID APPIUM E2E TEST REPORT';
  titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIPPED').length;
  const passRate = results.length > 0 ? ((passed / results.length) * 100).toFixed(1) : '0.0';

  summarySheet.addRow([]);
  summarySheet.addRow(['Metric', 'Value']);
  summarySheet.getRow(4).font = { bold: true };
  summarySheet.addRow(['Total Test Cases', results.length]);
  summarySheet.addRow(['Passed Test Cases', passed]);
  summarySheet.addRow(['Failed Test Cases', failed]);
  summarySheet.addRow(['Skipped Test Cases', skipped]);
  summarySheet.addRow(['Pass Rate', `${passRate}%`]);
  summarySheet.addRow(['Total Execution Time', `${(totalDuration / 1000).toFixed(2)} seconds`]);
  summarySheet.addRow(['Execution Platform', 'Android OS (Capacitor Hybrid / Appium UIAutomator2)']);
  summarySheet.addRow(['Date & Time', new Date().toLocaleString()]);

  // Test Details Worksheet
  const detailsSheet = workbook.addWorksheet('Test Details');
  detailsSheet.views = [{ showGridLines: true }];

  detailsSheet.columns = [
    { header: 'Test ID', key: 'id', width: 12 },
    { header: 'Suite', key: 'suite', width: 22 },
    { header: 'Test Case Name', key: 'name', width: 35 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Duration (ms)', key: 'duration', width: 15 },
    { header: 'Start Time', key: 'startTime', width: 25 },
    { header: 'End Time', key: 'endTime', width: 25 },
    { header: 'Details / Error', key: 'details', width: 50 },
    { header: 'Screenshot', key: 'screenshot', width: 35 }
  ];

  detailsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  detailsSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };

  results.forEach((r) => {
    const row = detailsSheet.addRow({
      id: r.id,
      suite: r.suite,
      name: r.name,
      status: r.status,
      duration: r.duration,
      startTime: r.startTime,
      endTime: r.endTime,
      details: r.errorMessage || r.details || 'PASS',
      screenshot: r.screenshotPath || 'N/A'
    });

    const statusCell = row.getCell('status');
    if (r.status === 'PASS') {
      statusCell.font = { bold: true, color: { argb: '15803D' } };
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } };
    } else {
      statusCell.font = { bold: true, color: { argb: 'B91C1C' } };
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
    }
  });

  await workbook.xlsx.writeFile(excelPath);
  console.log(`Excel Report saved to: ${excelPath}`);

  // HTML Report Generation
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SmartStudy AI - Appium Mobile E2E Test Report</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e293b, #0f172a); border: 1px solid #334155; padding: 24px; border-radius: 12px; margin-bottom: 24px; }
    h1 { margin: 0 0 10px 0; color: #38bdf8; font-size: 24px; }
    .stats { display: flex; gap: 16px; margin-top: 20px; }
    .card { background: #1e293b; border: 1px solid #334155; padding: 16px; border-radius: 8px; flex: 1; text-align: center; }
    .card .val { font-size: 28px; font-weight: bold; margin-top: 6px; }
    .pass-val { color: #4ade80; }
    .fail-val { color: #f87171; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; background: #1e293b; border-radius: 8px; overflow: hidden; }
    th { background: #334155; padding: 12px 16px; text-align: left; font-size: 13px; color: #94a3b8; }
    td { padding: 12px 16px; border-bottom: 1px solid #334155; font-size: 14px; }
    .badge { padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 12px; display: inline-block; }
    .badge-pass { background: rgba(74, 222, 128, 0.2); color: #4ade80; border: 1px solid #4ade80; }
    .badge-fail { background: rgba(248, 113, 113, 0.2); color: #f87171; border: 1px solid #f87171; }
  </style>
</head>
<body>
  <div class="header">
    <h1>SmartStudy AI - Appium Mobile E2E Test Report</h1>
    <p>Target Environment: Android OS Mobile App | Execution Time: ${new Date().toLocaleString()}</p>
    <div class="stats">
      <div class="card"><div>Total Tests</div><div class="val">${results.length}</div></div>
      <div class="card"><div>Passed</div><div class="val pass-val">${passed}</div></div>
      <div class="card"><div>Failed</div><div class="val fail-val">${failed}</div></div>
      <div class="card"><div>Pass Rate</div><div class="val pass-val">${passRate}%</div></div>
      <div class="card"><div>Duration</div><div class="val">${(totalDuration / 1000).toFixed(2)}s</div></div>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Suite</th>
        <th>Test Case Name</th>
        <th>Status</th>
        <th>Duration</th>
        <th>Details</th>
      </tr>
    </thead>
    <tbody>
      ${results.map(r => `
        <tr>
          <td>${r.id}</td>
          <td>${r.suite}</td>
          <td>${r.name}</td>
          <td><span class="badge badge-${r.status.toLowerCase()}">${r.status}</span></td>
          <td>${r.duration}ms</td>
          <td>${r.errorMessage || r.details || 'Verified successfully.'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`;

  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log(`HTML Report saved to: ${htmlPath}`);

  // Populate standardized directory structure: Test Results/Mobile/
  const mobileBaseDir = path.resolve(__dirname, '../../Test Results/Mobile');
  const reportsLatestDir = path.join(mobileBaseDir, 'reports/latest');
  const excelDir = path.join(mobileBaseDir, 'excel');
  const screenshotsDir = path.join(mobileBaseDir, 'screenshots');
  const logsDir = path.join(mobileBaseDir, 'logs');
  const summaryDir = path.join(mobileBaseDir, 'Summary');

  fs.mkdirSync(reportsLatestDir, { recursive: true });
  fs.mkdirSync(excelDir, { recursive: true });
  fs.mkdirSync(screenshotsDir, { recursive: true });
  fs.mkdirSync(logsDir, { recursive: true });
  fs.mkdirSync(summaryDir, { recursive: true });

  // Copy HTML reports
  fs.copyFileSync(htmlPath, path.join(reportsLatestDir, 'appium-report.html'));
  fs.copyFileSync(htmlPath, path.join(reportsLatestDir, 'index.html'));
  fs.copyFileSync(htmlPath, path.join(mobileBaseDir, 'appium-report.html'));

  // Copy Excel reports
  fs.copyFileSync(excelPath, path.join(excelDir, 'appium-report.xlsx'));
  fs.copyFileSync(excelPath, path.join(mobileBaseDir, 'appium-report.xlsx'));

  // Write Summary Markdown
  const summaryMd = `# Android Appium E2E Automation Summary

- **Total Test Cases:** ${results.length}
- **Passed:** ${passed}
- **Failed:** ${failed}
- **Pass Rate:** ${passRate}%
- **Execution Time:** ${(totalDuration / 1000).toFixed(2)} seconds
- **Timestamp:** ${new Date().toLocaleString()}

### Reports Generated
- **HTML Report:** \`Test Results/Mobile/reports/latest/index.html\`
- **Excel Analysis Report:** \`Test Results/Mobile/excel/appium-report.xlsx\`
`;

  fs.writeFileSync(path.join(summaryDir, 'summary.md'), summaryMd, 'utf8');
  fs.writeFileSync(path.join(logsDir, 'summary.md'), summaryMd, 'utf8');
}
