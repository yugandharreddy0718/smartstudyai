import { AIStudioPage } from '../../pages/AIStudioPage.js';

export async function runAIStudioTests(driver) {
  const ai = new AIStudioPage(driver);
  await ai.triggerTool('summary');
  await ai.triggerTool('question');
  await ai.triggerTool('mcq');
  await ai.triggerTool('quiz');
  await ai.triggerTool('tutor');
}
