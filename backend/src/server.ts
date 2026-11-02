import app from './app.js';
import { config, printEnvDiagnostics } from './config/env.js';

printEnvDiagnostics();

app.listen(Number(config.port), '0.0.0.0', () => {
  console.log(`SmartStudy API Backend running on http://0.0.0.0:${config.port}`);
});
