# serializers.py
from rest_framework import serializers
from .models import Devotion

class DevotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Devotion
        fields = ['id', 'user', 'scripture', 'content', 'date', 'favorite']
        read_only_fields = ['id', 'user']  # ← これが大事！


## ModelSerializer を使うことで、モデルと連動したJSON変換が簡単にできます。
## fields = '__all__' は、モデル内のすべての項目をJSONに含める指定です。
