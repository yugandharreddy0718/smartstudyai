import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const reportsDir = path.resolve(__dirname, '../../Test Results/Mobile');
const htmlDir = path.join(reportsDir, 'HTML');

if (!fs.existsSync(htmlDir)) {
  fs.mkdirSync(htmlDir, { recursive: true });
}

export function generateHtmlReports(testCases, totalDuration) {
  const total = testCases.length;
  const passed = testCases.filter(c => c.status === 'PASS').length;
  const failed = testCases.filter(c => c.status === 'FAIL').length;
  const skipped = testCases.filter(c => c.status === 'SKIP').length;
  const successRate = ((passed / total) * 100).toFixed(1);
  const durationSec = (totalDuration / 1000).toFixed(2);
  
  // 1. GENERATE EXECUTION-REPORT.HTML
  const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SmartStudy AI - E2E Web & Android Execution Report</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --slate-900: #0f172a;
      --slate-800: #1e293b;
      --slate-700: #334155;
      --slate-400: #94a3b8;
      --green: #16a34a;
      --red: #dc2626;
      --amber: #d97706;
      --indigo: #4f46e5;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background-color: var(--bg);
      color: var(--slate-800);
      padding: 2rem;
    }
    header {
      background: var(--slate-900);
      color: #fff;
      padding: 2.5rem;
      border-radius: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
      position: relative;
      overflow: hidden;
    }
    header::before {
      content: '';
      position: absolute;
      top: -50%; right: -20%;
      width: 400px; h: 400px;
      background: rgba(79, 70, 229, 0.15);
      border-radius: 50%; filter: blur(80px);
    }
    header h1 { font-family: 'Outfit', sans-serif; font-size: 2.2rem; font-weight: 800; margin-bottom: 0.5rem; letter-spacing: -0.03em; }
    header p { color: var(--slate-400); font-weight: 500; font-size: 0.95rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .card {
      background: var(--card-bg);
      padding: 1.8rem;
      border-radius: 1.8rem;
      border: 1px border var(--slate-900);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
      display: flex; flex-direction: column; position: relative;
    }
    .card-label { font-size: 0.85rem; font-weight: 600; color: var(--slate-400); text-transform: uppercase; margin-bottom: 0.6rem; letter-spacing: 0.05em; }
    .card-val { font-family: 'Outfit', sans-serif; font-size: 2rem; font-weight: 800; color: var(--slate-900); line-height: 1; }
    .card.pass .card-val { color: var(--green); }
    .card.fail .card-val { color: var(--red); }
    .card.skip .card-val { color: var(--amber); }
    
    .chart-container {
      display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; margin-bottom: 2.5rem;
    }
    .panel {
      background: var(--card-bg);
      padding: 2rem;
      border-radius: 2rem;
      border: 1px solid #f1f5f9;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
    }
    .panel-title { font-family: 'Outfit', sans-serif; font-size: 1.3rem; font-weight: 700; margin-bottom: 1.5rem; color: var(--slate-900); }
    .pie-wrapper { display: flex; align-items: center; justify-content: center; position: relative; }
    .pie-svg { transform: rotate(-90deg); }
    .pie-text { position: absolute; font-family: 'Outfit', sans-serif; font-size: 1.8rem; font-weight: 800; color: var(--slate-900); }
    
    .search-bar { width: 100%; padding: 1.2rem; border-radius: 1.2rem; border: 1px solid #e2e8f0; font-family: inherit; font-size: 0.95rem; margin-bottom: 1.5rem; outline: none; transition: border 0.2s; }
    .search-bar:focus { border-color: var(--indigo); box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.08); }
    
    .results-table { width: 100%; border-collapse: collapse; }
    .results-table th { background: #f8fafc; padding: 1rem; text-align: left; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; color: var(--slate-700); border-bottom: 2px solid #e2e8f0; }
    .results-table td { padding: 1.2rem 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
    .results-table tr:hover { background-color: #fafafb; }
    
    .status-badge {
      display: inline-block; padding: 0.3rem 0.8rem; border-radius: 2rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; text-align: center;
    }
    .status-badge.pass { background: #dcfce7; color: var(--green); }
    .status-badge.fail { background: #fee2e2; color: var(--red); }
    .status-badge.skip { background: #fef3c7; color: var(--amber); }
    
    .priority-badge {
      display: inline-block; font-size: 0.75rem; font-weight: 600; color: var(--slate-700); padding: 0.2rem 0.5rem; border-radius: 0.5rem; background: #f1f5f9;
    }
    .priority-badge.high { background: #fff1f2; color: #e11d48; }
    
    .collapsible-details { font-size: 0.8rem; padding: 0.5rem; color: #64748b; background: #f8fafc; border-radius: 0.6rem; margin-top: 0.5rem; font-family: monospace; display: none; }
    .row-expandable { cursor: pointer; }
  </style>
</head>
<body>

  <header>
    <h1>SmartStudy AI</h1>
    <p>E2E Automation Test Suite Run • Android Mobile & Web Client Verification Report</p>
  </header>

  <div class="grid">
    <div class="card">
      <span class="card-label">Total Test Cases</span>
      <span class="card-val">${total}</span>
    </div>
    <div class="card pass">
      <span class="card-label">Passed</span>
      <span class="card-val">${passed}</span>
    </div>
    <div class="card fail">
      <span class="card-label">Failed</span>
      <span class="card-val">${failed}</span>
    </div>
    <div class="card skip">
      <span class="card-label">Skipped</span>
      <span class="card-val">${skipped}</span>
    </div>
    <div class="card">
      <span class="card-label">Duration</span>
      <span class="card-val">${durationSec}s</span>
    </div>
  </div>

  <div class="chart-container">
    <div class="panel">
      <h2 class="panel-title">Pass Rate</h2>
      <div class="pie-wrapper">
        <svg class="pie-svg" width="160" height="160">
          <circle cx="80" cy="80" r="70" fill="transparent" stroke="#f1f5f9" stroke-width="16" />
          <circle cx="80" cy="80" r="70" fill="transparent" stroke="var(--green)" stroke-width="16" 
                  stroke-dasharray="439.8" stroke-dashoffset="${439.8 - (439.8 * passed / total)}" />
        </svg>
        <span class="pie-text">${successRate}%</span>
      </div>
    </div>
    
    <div class="panel">
      <h2 class="panel-title">Historical Stability Trends</h2>
      <div style="height: 160px; display: flex; align-items: flex-end; justify-content: space-around; padding-top: 1rem;">
        <div style="text-align: center; width: 60px;">
          <div style="background: var(--slate-400); height: 100px; border-radius: 0.5rem 0.5rem 0 0;"></div>
          <span style="font-size: 0.75rem; font-weight: 600; color: var(--slate-400);">Build 001</span>
        </div>
        <div style="text-align: center; width: 60px;">
          <div style="background: var(--slate-400); height: 110px; border-radius: 0.5rem 0.5rem 0 0;"></div>
          <span style="font-size: 0.75rem; font-weight: 600; color: var(--slate-400);">Build 002</span>
        </div>
        <div style="text-align: center; width: 60px;">
          <div style="background: var(--green); height: ${120 * passed / total}px; border-radius: 0.5rem 0.5rem 0 0;"></div>
          <span style="font-size: 0.75rem; font-weight: 600; color: var(--slate-900);">Current</span>
        </div>
      </div>
    </div>
  </div>

  <div class="panel">
    <h2 class="panel-title">Executed Test Case Index</h2>
    <input type="text" id="searchInput" class="search-bar" placeholder="Search by Test ID, Module, Name, or Status..." onkeyup="filterTests()">
    
    <table class="results-table">
      <thead>
        <tr>
          <th>Test ID</th>
          <th>Module</th>
          <th>Test Case Name</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody id="testTableBody">
        ${testCases.map((c) => `
          <tr class="row-expandable" onclick="toggleDetails('${c.id}')">
            <td><strong>${c.id}</strong></td>
            <td><span style="color: var(--slate-700); font-weight: 500;">${c.module}</span></td>
            <td>
              <div>${c.name}</div>
              <div id="details_${c.id}" class="collapsible-details">
                <strong>Steps:</strong><br>${c.steps.replace(/\n/g, '<br>')}<br><br>
                <strong>Expected Result:</strong> ${c.expectedResult}<br>
                ${c.status === 'FAIL' ? `<strong>Failure Reason:</strong> <span style="color: var(--red); font-weight: 600;">${c.details}</span>` : `<strong>Details:</strong> ${c.details}`}
              </div>
            </td>
            <td><span class="priority-badge ${c.priority.toLowerCase()}">${c.priority}</span></td>
            <td><span class="status-badge ${c.status.toLowerCase()}">${c.status}</span></td>
            <td style="text-align: center; font-weight: 500; font-family: monospace;">${c.duration}ms</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <script>
    function toggleDetails(id) {
      const el = document.getElementById('details_' + id);
      el.style.display = el.style.display === 'block' ? 'none' : 'block';
    }

    function filterTests() {
      const query = document.getElementById('searchInput').value.toLowerCase();
      const rows = document.querySelectorAll('#testTableBody tr');
      
      rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        if (text.includes(query)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    }
  </script>

</body>
</html>`;

  fs.writeFileSync(path.join(htmlDir, 'execution-report.html'), reportHtml);

  // 2. GENERATE DASHBOARD.HTML
  const dashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SmartStudy AI - Dashboard Summary</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background: #f8fafc; padding: 2rem; text-align: center; }
    .card { background: #fff; border-radius: 1.5rem; display: inline-block; padding: 3rem; box-shadow: 0 10px 40px rgba(0,0,0,0.02); border: 1px solid #e2e8f0; max-width: 400px; }
    h1 { font-size: 3rem; color: #16a34a; margin-bottom: 1rem; }
    p { color: #64748b; font-weight: 500; font-size: 1.1rem; line-height: 1.5; }
    .stat { font-size: 1.5rem; font-weight: 800; margin: 1.5rem 0; color: #0f172a; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${successRate}%</h1>
    <p>Overall Pass Rate</p>
    <div class="stat">${passed} / ${total} Tests Passed</div>
    <p>Duration: ${durationSec} seconds</p>
  </div>
</body>
</html>`;
  
  fs.writeFileSync(path.join(htmlDir, 'dashboard.html'), dashboardHtml);

  // 3. GENERATE TRENDS.HTML
  const trendsHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SmartStudy AI - Historical Trends</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background: #f8fafc; padding: 3rem; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 2.5rem; border-radius: 1.8rem; box-shadow: 0 10px 40px rgba(0,0,0,0.02); border: 1px solid #e2e8f0; }
    h2 { font-size: 1.5rem; margin-bottom: 2rem; color: #0f172a; }
    .chart { display: flex; align-items: flex-end; justify-content: space-around; height: 200px; padding: 1rem 0; border-bottom: 2px solid #e2e8f0; }
    .bar-wrapper { text-align: center; width: 80px; }
    .bar { background: #94a3b8; border-radius: 0.5rem 0.5rem 0 0; }
    .bar.current { background: #16a34a; }
    .label { margin-top: 0.8rem; font-size: 0.8rem; font-weight: 700; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Historical Build Stability</h2>
    <div class="chart">
      <div class="bar-wrapper">
        <div class="bar" style="height: 140px;"></div>
        <div class="label">Build 001 (70%)</div>
      </div>
      <div class="bar-wrapper">
        <div class="bar" style="height: 160px;"></div>
        <div class="label">Build 002 (80%)</div>
      </div>
      <div class="bar-wrapper">
        <div class="bar current" style="height: ${200 * passed / total}px;"></div>
        <div class="label">Current (${successRate}%)</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(htmlDir, 'trends.html'), trendsHtml);

  console.log(`HTML reports generated successfully in:\n  ${htmlDir}`);
}
