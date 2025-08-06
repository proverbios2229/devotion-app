from rest_framework.decorators import api_view, permission_classes  # ← 追加
from rest_framework.permissions import IsAuthenticated  # ← 追加
from rest_framework.response import Response
from rest_framework import status  ##「このレスポンスはどういう意味のステータスなのか？」を読みやすく・わかりやすく伝えるための定数集
from .models import Devotion
from .serializers import DevotionSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView ##ユーザー認証用のAPI（ログイン用のエンドポイントを作成
# TokenObtainPairViewは、ログイン時にアクセストークンを返す
# TokenRefreshViewは、アクセストークンをリフレッシュするためのエンドポイント

from django.contrib.auth.models import User  # ユーザーモデルをインポート
from rest_framework import serializers  # シリアライザーをインポート

# ユーザー登録のためのシリアライザー
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password', 'email']
        extra_kwargs = {'password': {'write_only': True}}  # パスワードは保存時にのみ使うようにする

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

# ユーザー登録API
@api_view(['POST'])
def register(request):
    if request.method == 'POST':
        # ユーザー登録用シリアライザーを使用
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()  # ユーザーを保存
            return Response({'username': user.username, 'email': user.email}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])  ##「GETとPOSTのAPIリクエストを受け付けますよ」と宣言 ##一覧表示、新規作成
@permission_classes([IsAuthenticated])  # ← 認証必須にする
def devotion_list(request):
    if request.method == 'GET':
        # Devotionモデルから全てのデボーションを取得し、新しい順に並べ替え
        devotions = Devotion.objects.all().order_by('-date')
        # 取得したデータをシリアライズしてレスポンスに変換
        serializer = DevotionSerializer(devotions, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        print("認証されたユーザー:", request.user)

        serializer = DevotionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)  # ← ここでユーザー紐づけ
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE'])  ##詳細表示、更新、削除
@permission_classes([IsAuthenticated])  # ← 認証必須にする
def devotion_detail(request, pk):
    try:
        # 指定されたIDのデボーションを取得
        devotion = Devotion.objects.get(pk=pk)
    except Devotion.DoesNotExist:
        # もし指定されたデボーションが存在しない場合、404エラーを返す
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        # GETリクエストの場合、デボーションの詳細をシリアライズして返す
        serializer = DevotionSerializer(devotion)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        # PUTリクエストの場合、デボーションを更新
        serializer = DevotionSerializer(devotion, data=request.data)
        if serializer.is_valid():
            # バリデーション成功後、デボーションを保存
            serializer.save()
            return Response(serializer.data)
        # バリデーションに失敗した場合、エラーを返す
        return Response(serializer.errors, status=400)
    
    elif request.method == 'DELETE':
        # DELETEリクエストの場合、デボーションを削除
        devotion.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
