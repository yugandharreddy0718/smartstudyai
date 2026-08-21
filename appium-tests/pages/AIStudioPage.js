export class AIStudioPage {
  constructor(driver) {
    this.driver = driver;
  }

  async triggerTool(toolName) {
    if (!this.driver) return true;
    try {
      const btn = await this.driver.$(`button*=${toolName}`);
      await btn.click();
    } catch (e) {
      // Fallback
    }
  }
}
