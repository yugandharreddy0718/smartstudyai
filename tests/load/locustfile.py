import random
from locust import HttpUser, task, between

class SmartStudyWebUser(HttpUser):
    wait_time = between(1, 3)

    @task(5)
    def test_homepage(self):
        self.client.get("/", name="[WEB] Homepage /")

    @task(3)
    def test_login_page(self):
        self.client.get("/login", name="[WEB] Login /login")

    @task(3)
    def test_register_page(self):
        self.client.get("/register", name="[WEB] Register /register")

    @task(4)
    def test_curriculum_page(self):
        self.client.get("/curriculum", name="[WEB] Curriculum Catalog /curriculum")

    @task(4)
    def test_dashboard_page(self):
        self.client.get("/dashboard", name="[WEB] Student Dashboard /dashboard")

    @task(2)
    def test_admin_page(self):
        self.client.get("/admin", name="[WEB] SuperAdmin Console /admin")

class SmartStudyApiUser(HttpUser):
    wait_time = between(0.5, 2)

    @task(6)
    def test_api_health(self):
        self.client.get("/health", name="[API] Health Check /health")

    @task(4)
    def test_api_gemini_chat(self):
        self.client.post("/api/gemini/chat", json={"history": [], "message": "Explain Newton third law"}, name="[API] Gemini Chat /api/gemini/chat")

    @task(3)
    def test_api_mcq_generator(self):
        self.client.post("/api/gemini/mcq-generator", json={"text": "Math content", "count": 5, "difficulty": "Medium"}, name="[API] MCQ Generator /api/gemini/mcq-generator")
