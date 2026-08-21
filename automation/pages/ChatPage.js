import BasePage from './BasePage.js';

export default class ChatPage extends BasePage {
  constructor(driver) {
    super(driver);
  }

  // Selectors
  get chatInput() { return 'input[placeholder*="Ask"], textarea, .chat-input'; }
  get sendButton() { return 'button[type="submit"], button.send-btn'; }
  get messageBubbles() { return '.message-bubble, .chat-message'; }

  // Actions
  async sendMessage(text) {
    await this.setValue(this.chatInput, text);
    await this.click(this.sendButton);
  }

  async getMessageCount() {
    await this.driver.pause(2000); // Allow elements to sync
    const bubbles = await this.driver.$$(this.messageBubbles);
    return bubbles.length;
  }
}
