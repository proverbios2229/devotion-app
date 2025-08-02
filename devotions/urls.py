from django.urls import path
from .views import devotion_list
from . import views  # ← これがないと views.devotion_detail が使えない

urlpatterns = [
    path('devotions/', devotion_list),   ##アクセスURL「http://localhost:8000/devotions/」で devotion_list 関数が呼ばれる
    path('devotions/<int:pk>/', views.devotion_detail),  ##編集・削除用のURL
]
