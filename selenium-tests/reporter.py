"""
SmartStudy AI - Comprehensive Selenium Test Reporter
Generates:
1. Excel Report: reports/selenium/Selenium_Test_Report.xlsx (Summary & 14-column Test Details)
2. Standalone HTML Dashboard: reports/selenium/selenium-report.html
3. Machine-readable JSON: reports/selenium/selenium-results.json
4. JUnit XML Report: reports/selenium/selenium-junit.xml
"""

import os
import sys
import json
import datetime
from xml.sax.saxutils import escape

import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# Paths
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SELENIUM_DIR = os.path.join(BASE_DIR, 'selenium-tests')
CATALOG_PATH = os.path.join(SELENIUM_DIR, 'data', 'test_catalog.json')

REPORTS_DIR = os.path.join(BASE_DIR, 'reports', 'selenium')
SCREENSHOTS_DIR = os.path.join(REPORTS_DIR, 'screenshots')
ALT_REPORTS_DIR = os.path.join(SELENIUM_DIR, 'reports')

def ensure_directories():
    for d in [REPORTS_DIR, SCREENSHOTS_DIR, ALT_REPORTS_DIR]:
        os.makedirs(d, exist_ok=True)

def load_catalog():
    if os.path.exists(CATALOG_PATH):
        with open(CATALOG_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    # Fallback import if json doesn't exist
    sys.path.insert(0, os.path.join(SELENIUM_DIR, 'data'))
    import test_catalog
    return test_catalog.WEB_TEST_CATALOG

def load_raw_results():
    candidates = [
        os.path.join(REPORTS_DIR, 'raw_results.json'),
        os.path.join(SELENIUM_DIR, 'logs', 'raw_results.json'),
        os.path.join(ALT_REPORTS_DIR, 'raw_results.json')
    ]
    for c in candidates:
        if os.path.exists(c):
            try:
                with open(c, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"[!] Error reading {c}: {e}")
    return []

def build_merged_test_records(catalog, raw_results):
    results_map = {r['id']: r for r in raw_results}
    records = []
    
    for case in catalog:
        cid = case['id']
        exec_info = results_map.get(cid)
        
        steps_str = "\n".join(f"{i+1}. {s}" for i, s in enumerate(case.get('steps', [])))
        
        if exec_info:
            status = exec_info.get('status', 'FAIL')
            duration_ms = exec_info.get('duration', 0)
            duration_str = f"{duration_ms:,} ms"
            err_msg = exec_info.get('errorMessage', 'N/A')
            actual_res = exec_info.get('details', 'Verified successfully.') if status == 'PASS' else f"Execution failed: {err_msg}"
            evidence = exec_info.get('screenshotPath', 'N/A')
            remarks = 'Automated E2E test execution against deployed application'
            is_executable = True
        else:
            is_executable = case.get('executable', False)
            duration_str = 'N/A'
            err_msg = 'N/A'
            evidence = 'N/A'
            
            # Check for blocked cases (e.g. requires live backend admin token, direct database write)
            if 'admin role' in case.get('name', '').lower() or 'payment' in case.get('name', '').lower():
                status = 'BLOCKED'
                actual_res = 'Blocked: Requires pre-configured live administrative credentials or external mock'
                remarks = 'Documented test case; blocked pending external staging configuration'
            elif is_executable:
                # Marked as executable in catalog but not executed in this run
                status = 'SKIPPED'
                actual_res = 'Test was skipped or not scheduled in this batch'
                remarks = 'Executable test not targeted in current smoke run'
            else:
                status = 'NOT AUTOMATED'
                actual_res = 'Case fully documented in master test catalog; scheduled for automated phase'
                remarks = 'Documented test specification'

        records.append({
            'id': cid,
            'category': case.get('category', 'General'),
            'name': case.get('name', ''),
            'objective': case.get('objective', ''),
            'preconditions': case.get('preconditions', ''),
            'steps': steps_str,
            'expected_result': case.get('expected_result', ''),
            'actual_result': actual_res,
            'status': status,
            'severity': case.get('severity', 'Medium'),
            'execution_time': duration_str,
            'failure_details': err_msg,
            'evidence_path': evidence,
            'remarks': remarks,
            'executable': is_executable
        })
        
    return records

def generate_excel_report(records, target_url, output_path):
    wb = openpyxl.Workbook()
    
    # Border & Fills
    thin_border = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='thin', color='CBD5E1')
    )
    header_fill = PatternFill(start_color='1E293B', end_color='1E293B', fill_type='solid')
    header_font = Font(name='Segoe UI', size=11, bold=True, color='FFFFFF')
    
    status_styles = {
        'PASS': (PatternFill(start_color='DCFCE7', end_color='DCFCE7', fill_type='solid'),
                 Font(name='Segoe UI', size=10, bold=True, color='166534')),
        'FAIL': (PatternFill(start_color='FEE2E2', end_color='FEE2E2', fill_type='solid'),
                 Font(name='Segoe UI', size=10, bold=True, color='991B1B')),
        'BLOCKED': (PatternFill(start_color='FEF3C7', end_color='FEF3C7', fill_type='solid'),
                    Font(name='Segoe UI', size=10, bold=True, color='92400E')),
        'NOT AUTOMATED': (PatternFill(start_color='F1F5F9', end_color='F1F5F9', fill_type='solid'),
                          Font(name='Segoe UI', size=10, bold=True, color='475569')),
        'SKIPPED': (PatternFill(start_color='EDE9FE', end_color='EDE9FE', fill_type='solid'),
                    Font(name='Segoe UI', size=10, bold=True, color='5B21B6')),
    }
    
    # ----------------------------------------------------
    # SHEET 1: Summary
    # ----------------------------------------------------
    ws_sum = wb.active
    ws_sum.title = 'Summary'
    ws_sum.views.sheetView[0].showGridLines = True
    
    # Header Banner
    ws_sum.merge_cells('A1:G2')
    banner = ws_sum['A1']
    banner.value = "SMARTSTUDY AI - SELENIUM WEB AUTOMATION TEST REPORT"
    banner.font = Font(name='Segoe UI', size=16, bold=True, color='FFFFFF')
    banner.alignment = Alignment(horizontal='center', vertical='center')
    banner.fill = PatternFill(start_color='0F172A', end_color='0F172A', fill_type='solid')
    
    total_cases = len(records)
    executable_count = sum(1 for r in records if r['executable'])
    passed_count = sum(1 for r in records if r['status'] == 'PASS')
    failed_count = sum(1 for r in records if r['status'] == 'FAIL')
    blocked_count = sum(1 for r in records if r['status'] == 'BLOCKED')
    not_auto_count = sum(1 for r in records if r['status'] == 'NOT AUTOMATED')
    skipped_count = sum(1 for r in records if r['status'] == 'SKIPPED')
    
    exec_tested = passed_count + failed_count
    pass_rate = f"{(passed_count / exec_tested * 100):.1f}%" if exec_tested > 0 else "0.0%"
    
    ws_sum['A4'] = "Executive Metric"
    ws_sum['B4'] = "Value"
    ws_sum['A4'].font = header_font
    ws_sum['B4'].font = header_font
    ws_sum['A4'].fill = header_fill
    ws_sum['B4'].fill = header_fill
    
    metrics = [
        ("Target Application URL", target_url),
        ("Browser Automation Engine", "Google Chrome (Headless / Selenium WebDriver)"),
        ("Execution Date & Time", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")),
        ("Total Documented Test Cases", total_cases),
        ("Executable / Automated Tests", executable_count),
        ("Passed Tests", passed_count),
        ("Failed Tests", failed_count),
        ("Blocked Tests", blocked_count),
        ("Not Automated Tests", not_auto_count),
        ("Skipped Tests", skipped_count),
        ("Executable Pass Rate", pass_rate),
    ]
    
    for row_idx, (m_label, m_val) in enumerate(metrics, start=5):
        c1 = ws_sum.cell(row=row_idx, column=1, value=m_label)
        c2 = ws_sum.cell(row=row_idx, column=2, value=m_val)
        c1.font = Font(name='Segoe UI', size=10, bold=True)
        c2.font = Font(name='Segoe UI', size=10)
        c1.border = thin_border
        c2.border = thin_border
        
    # Category Breakdown Table
    cat_start = len(metrics) + 7
    cat_headers = ["Category / Functional Module", "Total Cases", "Executable", "Passed", "Failed", "Blocked", "Not Automated", "Pass Rate"]
    for col_idx, h_text in enumerate(cat_headers, start=1):
        cell = ws_sum.cell(row=cat_start, column=col_idx, value=h_text)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal='center' if col_idx > 1 else 'left', vertical='center')
        cell.border = thin_border
        
    categories = sorted(list(set(r['category'] for r in records)))
    curr_row = cat_start + 1
    
    for cat in categories:
        cat_recs = [r for r in records if r['category'] == cat]
        c_tot = len(cat_recs)
        c_exec = sum(1 for r in cat_recs if r['executable'])
        c_pass = sum(1 for r in cat_recs if r['status'] == 'PASS')
        c_fail = sum(1 for r in cat_recs if r['status'] == 'FAIL')
        c_block = sum(1 for r in cat_recs if r['status'] == 'BLOCKED')
        c_na = sum(1 for r in cat_recs if r['status'] == 'NOT AUTOMATED')
        c_tested = c_pass + c_fail
        c_rate = f"{(c_pass / c_tested * 100):.1f}%" if c_tested > 0 else "N/A"
        
        row_vals = [cat, c_tot, c_exec, c_pass, c_fail, c_block, c_na, c_rate]
        for col_idx, val in enumerate(row_vals, start=1):
            cell = ws_sum.cell(row=curr_row, column=col_idx, value=val)
            cell.font = Font(name='Segoe UI', size=10)
            cell.alignment = Alignment(horizontal='center' if col_idx > 1 else 'left', vertical='center')
            cell.border = thin_border
        curr_row += 1
        
    # Total row
    ws_sum.cell(row=curr_row, column=1, value="TOTAL").font = Font(name='Segoe UI', size=10, bold=True)
    ws_sum.cell(row=curr_row, column=2, value=total_cases).font = Font(name='Segoe UI', size=10, bold=True)
    ws_sum.cell(row=curr_row, column=3, value=executable_count).font = Font(name='Segoe UI', size=10, bold=True)
    ws_sum.cell(row=curr_row, column=4, value=passed_count).font = Font(name='Segoe UI', size=10, bold=True)
    ws_sum.cell(row=curr_row, column=5, value=failed_count).font = Font(name='Segoe UI', size=10, bold=True)
    ws_sum.cell(row=curr_row, column=6, value=blocked_count).font = Font(name='Segoe UI', size=10, bold=True)
    ws_sum.cell(row=curr_row, column=7, value=not_auto_count).font = Font(name='Segoe UI', size=10, bold=True)
    ws_sum.cell(row=curr_row, column=8, value=pass_rate).font = Font(name='Segoe UI', size=10, bold=True)
    for c in range(1, 9):
        ws_sum.cell(row=curr_row, column=c).border = thin_border
        ws_sum.cell(row=curr_row, column=c).alignment = Alignment(horizontal='center' if c > 1 else 'left', vertical='center')

    ws_sum.column_dimensions['A'].width = 38
    ws_sum.column_dimensions['B'].width = 16
    ws_sum.column_dimensions['C'].width = 16
    ws_sum.column_dimensions['D'].width = 14
    ws_sum.column_dimensions['E'].width = 14
    ws_sum.column_dimensions['F'].width = 14
    ws_sum.column_dimensions['G'].width = 16
    ws_sum.column_dimensions['H'].width = 14

    # ----------------------------------------------------
    # SHEET 2: Test Details (All 14 Required Columns)
    # ----------------------------------------------------
    ws_det = wb.create_sheet('Test Details')
    ws_det.views.sheetView[0].showGridLines = True
    
    columns_def = [
        ('Test ID', 12, 'id'),
        ('Category', 22, 'category'),
        ('Test Name', 38, 'name'),
        ('Objective', 45, 'objective'),
        ('Preconditions', 35, 'preconditions'),
        ('Execution Steps', 45, 'steps'),
        ('Expected Result', 45, 'expected_result'),
        ('Actual Result', 45, 'actual_result'),
        ('Status', 16, 'status'),
        ('Severity', 14, 'severity'),
        ('Execution Time', 16, 'execution_time'),
        ('Failure Details', 45, 'failure_details'),
        ('Evidence Path', 25, 'evidence_path'),
        ('Remarks', 32, 'remarks')
    ]
    
    for col_idx, (col_name, col_width, _) in enumerate(columns_def, start=1):
        cell = ws_det.cell(row=1, column=col_idx, value=col_name)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal='center' if col_idx in [1, 9, 10, 11] else 'left', vertical='center')
        cell.border = thin_border
        ws_det.column_dimensions[get_column_letter(col_idx)].width = col_width
        
    for row_idx, r in enumerate(records, start=2):
        for col_idx, (_, _, field_key) in enumerate(columns_def, start=1):
            val = r.get(field_key, '')
            cell = ws_det.cell(row=row_idx, column=col_idx, value=val)
            cell.font = Font(name='Segoe UI', size=9)
            cell.border = thin_border
            
            # Alignments & Wrap
            if col_idx in [1, 10, 11]:
                cell.alignment = Alignment(horizontal='center', vertical='top')
            elif col_idx == 9: # Status
                cell.alignment = Alignment(horizontal='center', vertical='top')
                status_val = r['status']
                if status_val in status_styles:
                    cell.fill, cell.font = status_styles[status_val]
            elif col_idx in [4, 5, 6, 7, 8, 12]:
                cell.alignment = Alignment(horizontal='left', vertical='top', wrap_text=True)
            else:
                cell.alignment = Alignment(horizontal='left', vertical='top')
                
    wb.save(output_path)
    print(f"[+] Excel report generated: {output_path}")

def generate_html_report(records, target_url, output_path):
    total_cases = len(records)
    executable_count = sum(1 for r in records if r['executable'])
    passed_count = sum(1 for r in records if r['status'] == 'PASS')
    failed_count = sum(1 for r in records if r['status'] == 'FAIL')
    blocked_count = sum(1 for r in records if r['status'] == 'BLOCKED')
    not_auto_count = sum(1 for r in records if r['status'] == 'NOT AUTOMATED')
    skipped_count = sum(1 for r in records if r['status'] == 'SKIPPED')
    
    exec_tested = passed_count + failed_count
    pass_rate = f"{(passed_count / exec_tested * 100):.1f}%" if exec_tested > 0 else "0.0%"
    
    rows_html = []
    for r in records:
        status_cls = {
            'PASS': 'badge-pass',
            'FAIL': 'badge-fail',
            'BLOCKED': 'badge-blocked',
            'NOT AUTOMATED': 'badge-notauto',
            'SKIPPED': 'badge-skipped'
        }.get(r['status'], 'badge-notauto')
        
        sev_cls = {
            'Critical': 'sev-critical',
            'High': 'sev-high',
            'Medium': 'sev-medium',
            'Low': 'sev-low'
        }.get(r['severity'], 'sev-medium')
        
        steps_clean = escape(r['steps']).replace('\n', '<br>')
        actual_clean = escape(r['actual_result'])
        fail_clean = escape(r['failure_details']) if r['failure_details'] != 'N/A' else '<span class="text-slate-500">N/A</span>'
        
        rows_html.append(f"""
        <tr class="test-row" data-status="{r['status']}" data-category="{r['category']}">
            <td class="font-mono font-bold text-sky-400">{r['id']}</td>
            <td><span class="category-pill">{r['category']}</span></td>
            <td class="font-semibold text-slate-100">{escape(r['name'])}</td>
            <td class="text-slate-300 text-sm">{escape(r['objective'])}</td>
            <td class="text-xs text-slate-300">{steps_clean}</td>
            <td class="text-xs text-slate-200">{actual_clean}</td>
            <td class="text-center"><span class="badge {status_cls}">{r['status']}</span></td>
            <td class="text-center"><span class="badge {sev_cls}">{r['severity']}</span></td>
            <td class="text-center font-mono text-xs text-slate-300">{r['execution_time']}</td>
            <td class="text-xs text-rose-300">{fail_clean}</td>
        </tr>
        """)
        
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SmartStudy AI - Selenium Web Automation Report</title>
    <style>
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #0b0f19;
            color: #f1f5f9;
            padding: 24px;
            line-height: 1.5;
        }}
        .header {{
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 24px 32px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
        }}
        .title-area h1 {{
            font-size: 24px;
            font-weight: 800;
            color: #38bdf8;
            letter-spacing: -0.5px;
        }}
        .title-area p {{
            color: #94a3b8;
            font-size: 14px;
            margin-top: 4px;
        }}
        .target-url {{
            font-family: ui-monospace, monospace;
            background: #0f172a;
            padding: 4px 10px;
            border-radius: 6px;
            color: #7dd3fc;
            border: 1px solid #1e293b;
        }}
        .kpi-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }}
        .kpi-card {{
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 10px;
            padding: 16px;
            text-align: center;
        }}
        .kpi-val {{
            font-size: 28px;
            font-weight: 800;
            line-height: 1.1;
        }}
        .kpi-lbl {{
            font-size: 12px;
            font-weight: 600;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 6px;
        }}
        .filter-bar {{
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 10px;
            padding: 16px 20px;
            margin-bottom: 20px;
            display: flex;
            gap: 16px;
            align-items: center;
            flex-wrap: wrap;
        }}
        .search-box {{
            flex: 1;
            min-width: 250px;
            background: #0f172a;
            border: 1px solid #475569;
            color: #f8fafc;
            padding: 10px 14px;
            border-radius: 6px;
            font-size: 14px;
            outline: none;
        }}
        .search-box:focus {{
            border-color: #38bdf8;
        }}
        .filter-btn {{
            background: #0f172a;
            border: 1px solid #475569;
            color: #cbd5e1;
            padding: 8px 14px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
            transition: all 0.2s;
        }}
        .filter-btn.active {{
            background: #38bdf8;
            color: #0f172a;
            border-color: #38bdf8;
        }}
        .table-container {{
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 10px;
            overflow-x: auto;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }}
        th {{
            background: #0f172a;
            color: #94a3b8;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 11px;
            padding: 12px 14px;
            text-align: left;
            border-bottom: 1px solid #334155;
            position: sticky;
            top: 0;
        }}
        td {{
            padding: 12px 14px;
            border-bottom: 1px solid #334155;
            vertical-align: top;
        }}
        tr:hover td {{
            background: rgba(56, 189, 248, 0.04);
        }}
        .badge {{
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.3px;
            text-transform: uppercase;
        }}
        .badge-pass {{ background: #14532d; color: #86efac; border: 1px solid #166534; }}
        .badge-fail {{ background: #7f1d1d; color: #fca5a5; border: 1px solid #991b1b; }}
        .badge-blocked {{ background: #78350f; color: #fde68a; border: 1px solid #92400e; }}
        .badge-notauto {{ background: #334155; color: #cbd5e1; border: 1px solid #475569; }}
        .badge-skipped {{ background: #3b0764; color: #d8b4fe; border: 1px solid #581c87; }}
        
        .sev-critical {{ background: #450a0a; color: #f87171; border: 1px solid #7f1d1d; }}
        .sev-high {{ background: #431407; color: #fb923c; border: 1px solid #7c2d12; }}
        .sev-medium {{ background: #1e1b4b; color: #a5b4fc; border: 1px solid #312e81; }}
        .sev-low {{ background: #064e3b; color: #6ee7b7; border: 1px solid #065f46; }}
        
        .category-pill {{
            background: #0f172a;
            color: #38bdf8;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            border: 1px solid #1e293b;
            white-space: nowrap;
        }}
    </style>
</head>
<body>
    <div class="header">
        <div class="title-area">
            <h1>SmartStudy AI — Selenium Web Automation Report</h1>
            <p>Target Deployment: <span class="target-url">{target_url}</span> | Generated: {datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")}</p>
        </div>
    </div>

    <div class="kpi-grid">
        <div class="kpi-card">
            <div class="kpi-val" style="color: #38bdf8;">{total_cases}</div>
            <div class="kpi-lbl">Total Documented</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-val" style="color: #a855f7;">{executable_count}</div>
            <div class="kpi-lbl">Executable Suite</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-val" style="color: #22c55e;">{passed_count}</div>
            <div class="kpi-lbl">Passed</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-val" style="color: #ef4444;">{failed_count}</div>
            <div class="kpi-lbl">Failed</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-val" style="color: #f59e0b;">{blocked_count}</div>
            <div class="kpi-lbl">Blocked</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-val" style="color: #94a3b8;">{not_auto_count}</div>
            <div class="kpi-lbl">Not Automated</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-val" style="color: #38bdf8;">{pass_rate}</div>
            <div class="kpi-lbl">Pass Rate</div>
        </div>
    </div>

    <div class="filter-bar">
        <input type="text" id="searchInput" class="search-box" placeholder="Search test cases by ID, name, category, or steps...">
        <button class="filter-btn active" onclick="filterStatus('ALL')">All ({total_cases})</button>
        <button class="filter-btn" onclick="filterStatus('PASS')">Passed ({passed_count})</button>
        <button class="filter-btn" onclick="filterStatus('FAIL')">Failed ({failed_count})</button>
        <button class="filter-btn" onclick="filterStatus('BLOCKED')">Blocked ({blocked_count})</button>
        <button class="filter-btn" onclick="filterStatus('NOT AUTOMATED')">Not Automated ({not_auto_count})</button>
    </div>

    <div class="table-container">
        <table id="testTable">
            <thead>
                <tr>
                    <th style="width: 90px;">Test ID</th>
                    <th style="width: 140px;">Category</th>
                    <th style="width: 220px;">Test Name</th>
                    <th>Objective</th>
                    <th style="width: 240px;">Execution Steps</th>
                    <th style="width: 200px;">Actual Result</th>
                    <th style="width: 95px; text-align: center;">Status</th>
                    <th style="width: 90px; text-align: center;">Severity</th>
                    <th style="width: 95px; text-align: center;">Duration</th>
                    <th style="width: 180px;">Failure Details</th>
                </tr>
            </thead>
            <tbody>
                {''.join(rows_html)}
            </tbody>
        </table>
    </div>

    <script>
        let currentFilter = 'ALL';
        const searchInput = document.getElementById('searchInput');
        const rows = document.querySelectorAll('.test-row');

        function filterStatus(status) {{
            currentFilter = status;
            document.querySelectorAll('.filter-btn').forEach(btn => {{
                btn.classList.toggle('active', btn.innerText.startsWith(status) || (status === 'ALL' && btn.innerText.startsWith('All')));
            }});
            applyFilters();
        }}

        searchInput.addEventListener('input', applyFilters);

        function applyFilters() {{
            const term = searchInput.value.toLowerCase();
            rows.forEach(r => {{
                const status = r.getAttribute('data-status');
                const text = r.innerText.toLowerCase();
                const matchesStatus = (currentFilter === 'ALL' || status === currentFilter);
                const matchesSearch = (!term || text.includes(term));
                r.style.display = (matchesStatus && matchesSearch) ? '' : 'none';
            }});
        }}
    </script>
</body>
</html>"""

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"[+] HTML report generated: {output_path}")

def generate_json_report(records, target_url, output_path):
    total_cases = len(records)
    executable_count = sum(1 for r in records if r['executable'])
    passed_count = sum(1 for r in records if r['status'] == 'PASS')
    failed_count = sum(1 for r in records if r['status'] == 'FAIL')
    blocked_count = sum(1 for r in records if r['status'] == 'BLOCKED')
    not_auto_count = sum(1 for r in records if r['status'] == 'NOT AUTOMATED')
    skipped_count = sum(1 for r in records if r['status'] == 'SKIPPED')
    
    exec_tested = passed_count + failed_count
    pass_rate = (passed_count / exec_tested * 100) if exec_tested > 0 else 0.0

    payload = {
        "metadata": {
            "suite": "SmartStudy AI Selenium Web Automation",
            "targetUrl": target_url,
            "browser": "Chrome (Headless)",
            "timestamp": datetime.datetime.now().isoformat() + "Z",
            "summary": {
                "totalCases": total_cases,
                "executableCount": executable_count,
                "passed": passed_count,
                "failed": failed_count,
                "blocked": blocked_count,
                "notAutomated": not_auto_count,
                "skipped": skipped_count,
                "passRate": f"{pass_rate:.1f}%"
            }
        },
        "tests": records
    }

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(payload, f, indent=2)
    print(f"[+] JSON report generated: {output_path}")

def generate_junit_xml(records, target_url, output_path):
    total_cases = len(records)
    failures = sum(1 for r in records if r['status'] == 'FAIL')
    skipped = sum(1 for r in records if r['status'] in ['NOT AUTOMATED', 'BLOCKED', 'SKIPPED'])
    
    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        f'<testsuites name="Selenium_Web_Suite" tests="{total_cases}" failures="{failures}" skipped="{skipped}" time="0.0">',
        f'  <testsuite name="SmartStudy_Web_E2E" tests="{total_cases}" failures="{failures}" skipped="{skipped}">'
    ]
    
    for r in records:
        cid = r['id']
        name = escape(f"{cid}: {r['name']}")
        classname = escape(f"SmartStudy.Web.{r['category'].replace(' ', '_')}")
        status = r['status']
        
        xml_lines.append(f'    <testcase classname="{classname}" name="{name}" time="0.0">')
        if status == 'FAIL':
            err_msg = escape(r.get('failure_details', 'Assertion failure'))
            xml_lines.append(f'      <failure message="{err_msg}">{err_msg}</failure>')
        elif status in ['NOT AUTOMATED', 'BLOCKED', 'SKIPPED']:
            reason = escape(r.get('remarks', 'Not executed'))
            xml_lines.append(f'      <skipped message="{reason}"/>')
        xml_lines.append('    </testcase>')
        
    xml_lines.append('  </testsuite>')
    xml_lines.append('</testsuites>')
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(xml_lines))
    print(f"[+] JUnit XML report generated: {output_path}")

def main():
    ensure_directories()
    target_url = os.environ.get('BASE_URL', 'https://yugandharreddy0718.github.io/smartstudyai')
    
    catalog = load_catalog()
    raw_results = load_raw_results()
    
    print(f"[*] Processing {len(catalog)} catalog cases with {len(raw_results)} execution results...")
    records = build_merged_test_records(catalog, raw_results)
    
    # Primary output paths
    excel_path = os.path.join(REPORTS_DIR, 'Selenium_Test_Report.xlsx')
    html_path = os.path.join(REPORTS_DIR, 'selenium-report.html')
    json_path = os.path.join(REPORTS_DIR, 'selenium-results.json')
    xml_path = os.path.join(REPORTS_DIR, 'selenium-junit.xml')
    
    generate_excel_report(records, target_url, excel_path)
    generate_html_report(records, target_url, html_path)
    generate_json_report(records, target_url, json_path)
    generate_junit_xml(records, target_url, xml_path)
    
    # Mirror copies to selenium-tests/reports/
    import shutil
    try:
        shutil.copyfile(excel_path, os.path.join(ALT_REPORTS_DIR, 'Selenium_Test_Report.xlsx'))
        shutil.copyfile(html_path, os.path.join(ALT_REPORTS_DIR, 'selenium-report.html'))
        shutil.copyfile(json_path, os.path.join(ALT_REPORTS_DIR, 'selenium-results.json'))
        shutil.copyfile(xml_path, os.path.join(ALT_REPORTS_DIR, 'selenium-junit.xml'))
        print(f"[+] Mirrored reports to {ALT_REPORTS_DIR}")
    except Exception as e:
        print(f"[!] Warning mirroring reports: {e}")
        
    print("\n[+] All Selenium reports successfully generated!")

if __name__ == '__main__':
    main()
