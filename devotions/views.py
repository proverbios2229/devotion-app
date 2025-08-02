from django.shortcuts import render

# Create your views here.

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status  ##「このレスポンスはどういう意味のステータスなのか？」を読みやすく・わかりやすく伝えるための定数集
from .models import Devotion
from .serializers import DevotionSerializer

@api_view(['GET', 'POST'])  ##「GETとPOSTのAPIリクエストを受け付けますよ」と宣言 ##一覧表示、新規作成
def devotion_list(request):
    if request.method == 'GET':
        devotions = Devotion.objects.all().order_by('-date')
        serializer = DevotionSerializer(devotions, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = DevotionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


@api_view(['GET', 'PUT', 'DELETE'])  ##詳細表示、更新、削除
def devotion_detail(request, pk):
    try:
        devotion = Devotion.objects.get(pk=pk)
    except Devotion.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = DevotionSerializer(devotion)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = DevotionSerializer(devotion, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    elif request.method == 'DELETE':
        devotion.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)