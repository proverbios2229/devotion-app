from django.urls import path
from .views import devotion_list, register  # ← register関数をインポート
from . import views  # ← これがないと views.devotion_detail が使えない
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView  # TokenRefreshViewもインポート

urlpatterns = [
    # JWT認証関連のエンドポイントを追加
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # ログイン用
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # トークンリフレッシュ用

    # devotionsに関するエンドポイント
    path('devotions/', devotion_list),   ##アクセスURL「http://localhost:8000/devotions/」で devotion_list 関数が呼ばれる
    path('devotions/<int:pk>/', views.devotion_detail),  ##編集・削除用のURL

    path('api/register/', register, name='register'),  # ユーザー登録
]