import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';

// Target URL parameter, defaults to local backend API server
const API_URL = (__ENV.API_URL || 'http://localhost:3000').replace(/\/+$/, '');
const MODE = __ENV.MODE || (__ENV.SMOKE === 'true' ? 'smoke' : 'baseline');
const isSmoke = MODE === 'smoke';

const VUS = parseInt(__ENV.VUS || (isSmoke ? '5' : '100'), 10);
const DURATION = __ENV.DURATION || (isSmoke ? '10s' : '1m');

const apiReqDuration = new Trend('api_health_req_duration', true);
const successfulApiReqs = new Counter('successful_api_requests');
const failedApiReqs = new Counter('failed_api_requests');

export const options = {
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
  scenarios: {
    backend_api_load: {
      executor: 'constant-vus',
      vus: VUS,
      duration: DURATION,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.02'], // API error rate < 2%
    http_req_duration: ['p(95)<250', 'p(99)<500'], // P95 < 250ms, P99 < 500ms
    api_health_req_duration: ['p(95)<250'],
  },
};

export function setup() {
  console.log('====================================================');
  console.log(`SMARTSTUDY AI — BACKEND API PERFORMANCE PRE-CHECK`);
  console.log(`API URL:          ${API_URL}`);
  console.log(`Execution Mode:   ${MODE.toUpperCase()} (${VUS} VUs for ${DURATION})`);
  console.log('====================================================');

  const res = http.get(`${API_URL}/health`, { timeout: '5s' });
  if (res.status !== 200) {
    throw new Error(
      `\n\n❌ [FATAL PRE-CHECK ERROR] Backend API health endpoint unreachable at ${API_URL}/health\n` +
      `   Status: ${res.status} | Error: ${res.error || 'Server not responding'}\n` +
      `   Ensure backend server is running on port 3000.\n`
    );
  }

  console.log(`✅ Backend API pre-check PASSED: ${API_URL}/health is healthy.`);
  return { apiUrl: API_URL };
}

export default function () {
  const res = http.get(`${API_URL}/health`, { timeout: '5s' });
  const ok = res.status === 200;

  if (ok) {
    successfulApiReqs.add(1);
    apiReqDuration.add(res.timings.duration);
  } else {
    failedApiReqs.add(1);
  }

  check(res, {
    'API health status is 200': () => ok,
    'API health response time < 250ms': (r) => ok && r.timings.duration < 250,
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    'reports/performance/k6-api-summary.json': JSON.stringify(data, null, 2),
    'reports/performance/k6-api-raw-output.json': JSON.stringify(data, null, 2),
  };
}
