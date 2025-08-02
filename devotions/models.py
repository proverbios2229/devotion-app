from django.db import models

# Create your models here.

from django.db import models

from django.utils import timezone

class Devotion(models.Model):
    scripture = models.CharField(max_length=100)  # 聖書箇所（例: John 3:16）
    content = models.TextField()                  # 感想や祈り
    date = models.DateField(default=timezone.now)   # デフォルトで今日の日付が入るように修正

    def __str__(self):
        return f"{self.date} - {self.scripture}"
