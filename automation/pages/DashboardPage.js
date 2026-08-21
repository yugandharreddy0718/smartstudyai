import BasePage from './BasePage.js';

export default class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver);
  }

  // Selectors
  get subjectsLink() { return 'a[href="/subjects"], button=Subjects'; }
  get profileLink() { return 'a[href="/profile"], button=Profile'; }
  get uploadLink() { return 'a[href="/upload"], button=Upload'; }
  get chatLink() { return 'a[href="/chat"], button=Chat'; }
  get subjectCards() { return '.subject-card, a[href^="/subjects/"]'; }
  get lessonLinks() { return 'a[href^="/lessons/"]'; }
  get lessonContent() { return 'article, .lesson-content'; }

  // Actions
  async navigateToSubjects() {
    await this.click(this.subjectsLink);
  }

  async navigateToProfile() {
    await this.click(this.profileLink);
  }

  async navigateToChat() {
    await this.click(this.chatLink);
  }

  async selectFirstSubject() {
    const card = await this.getElement(this.subjectCards);
    await card.waitForDisplayed({ timeout: 10000 });
    await card.click();
  }

  async selectFirstLesson() {
    const lesson = await this.getElement(this.lessonLinks);
    await lesson.waitForDisplayed({ timeout: 10000 });
    await lesson.click();
  }

  async isLessonContentDisplayed() {
    return await this.isDisplayed(this.lessonContent);
  }
}
