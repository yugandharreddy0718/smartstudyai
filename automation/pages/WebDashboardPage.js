import WebBasePage from './WebBasePage.js';

export default class WebDashboardPage extends WebBasePage {
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
    await this.click(this.subjectCards);
  }

  async selectFirstLesson() {
    await this.click(this.lessonLinks);
  }

  async isLessonLoaded() {
    return await this.isDisplayed(this.lessonContent);
  }
}
