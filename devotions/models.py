from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class Devotion(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # ← 認証ユーザーと紐づける
    scripture = models.CharField(max_length=255)              # 聖書箇所（例: John 3:16）
    content = models.TextField()                              # 感想や祈り
    date = models.DateField(default=timezone.now)             # デフォルトで今日の日付
    favorite = models.BooleanField(default=False)             # お気に入りかどうか

    def __str__(self):
        return f"{self.date} - {self.scripture}"
