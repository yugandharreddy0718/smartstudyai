import WebBasePage from './WebBasePage.js';
import { By } from 'selenium-webdriver';

export default class WebChatPage extends WebBasePage {
  constructor(driver) {
    super(driver);
  }

  // Selectors
  get chatInput() { return 'input[placeholder*="Ask"], textarea, .chat-input'; }
  get sendButton() { return 'button[type="submit"], button.send-btn'; }
  get messageBubbles() { return '.message-bubble, .chat-message'; }

  // Actions
  async sendMessage(text) {
    await this.sendKeys(this.chatInput, text);
    await this.click(this.sendButton);
  }

  async getMessageCount() {
    await this.pause(2000); // Wait for DOM changes
    const bubbles = await this.driver.findElements(By.css(this.messageBubbles));
    return bubbles.length;
  }
}
