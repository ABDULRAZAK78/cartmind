from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import RegisterSerializer, UserSerializer

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            # Format first error message cleanly
            err_msg = next(iter(serializer.errors.values()))[0] if serializer.errors else "Invalid data"
            return Response({"error": err_msg, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
        login(request, user)
        return Response({
            "message": "User registered successfully",
            "user": UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username", "").strip()
        password = request.data.get("password", "")

        if not username or not password:
            return Response({"error": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        user = None
        if "@" in username:
            matched = User.objects.filter(email__iexact=username).first()
            if matched:
                user = authenticate(request, username=matched.username, password=password)
        if not user:
            user = authenticate(request, username=username, password=password)

        if not user:
            return Response({"error": "Invalid username or password"}, status=status.HTTP_401_UNAUTHORIZED)

        login(request, user)
        return Response({
            "message": "Logged in successfully",
            "user": UserSerializer(user).data
        })

class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({"message": "Logged out successfully"})

class MeView(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            return Response({"user": UserSerializer(request.user).data})
        return Response({"user": None})
