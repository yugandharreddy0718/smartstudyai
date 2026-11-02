import http from 'k6/http';
import { sleep, check } from 'k6';

// k6 Load Test Configuration Scenarios
export const options = {
  scenarios: {
    // 1. Baseline Load Test (100 VU, 1 minute)
    baseline: {
      executor: 'constant-vus',
      vus: 100,
      duration: '1m',
      exec: 'runTest',
    },
    // 2. Stress Test Scenario (Ramping up to 500 VUs)
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 200 },
        { duration: '30s', target: 500 },
        { duration: '30s', target: 0 },
      ],
      exec: 'runTest',
      startTime: '1m10s',
    },
    // 3. Spike Test Scenario (Sudden jump to 1000 VUs)
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5s', target: 1000 }, // sudden spike
        { duration: '15s', target: 1000 }, // hold
        { duration: '10s', target: 0 },
      ],
      exec: 'runTest',
      startTime: '2m50s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete under 500ms
    http_req_failed: ['rate<0.01'],    // Error rate must be less than 1%
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3000';

export function runTest() {
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const payload = JSON.stringify({
    text: 'Analyze the concepts of baseline load testing and API metrics.',
  });

  // Target standard summary endpoint
  const res = http.post(`${BASE_URL}/api/gemini/summary`, payload, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'transaction time OK': (r) => r.timings.duration < 1500,
  });

  sleep(0.5); // 500ms pacing between requests
}
