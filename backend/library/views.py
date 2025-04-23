from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Livre, Emprunt
from .serializers import LivreSerializer, EmpruntSerializer
from django.utils.timezone import now

class LivreListCreateAPIView(generics.ListCreateAPIView):
    queryset = Livre.objects.all()
    serializer_class = LivreSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.is_staff:
            return Livre.objects.all()
        return Livre.objects.filter(disponible=True)

class LivreRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Livre.objects.all()
    serializer_class = LivreSerializer
    permission_classes = [permissions.IsAuthenticated]

class EmpruntListCreateAPIView(generics.ListCreateAPIView):
    queryset = Emprunt.objects.all()
    serializer_class = EmpruntSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return Emprunt.objects.all()
        return Emprunt.objects.filter(utilisateur=user)

    def perform_create(self, serializer):
        livre = serializer.validated_data['livre_id']
        livre.disponible = False
        livre.save()
        serializer.save(utilisateur=self.request.user)

class EmpruntRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Emprunt.objects.all()
    serializer_class = EmpruntSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_update(self, serializer):
        instance = serializer.save()
        if instance.date_retour:
            instance.livre.disponible = True
            instance.livre.save()

class RendreLivreAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            emprunt = Emprunt.objects.get(pk=pk, utilisateur=request.user)
        except Emprunt.DoesNotExist:
            return Response({"detail": "Emprunt non trouvé ou non autorisé."}, status=status.HTTP_404_NOT_FOUND)
        if emprunt.date_retour:
                return Response({"detail": "Ce livre a déjà été rendu."}, status=status.HTTP_400_BAD_REQUEST)

        emprunt.date_retour = now().date()
        emprunt.livre.disponible = True
        emprunt.livre.save()
        emprunt.save()

        return Response({"detail": "Livre rendu avec succès."}, status=status.HTTP_200_OK)
