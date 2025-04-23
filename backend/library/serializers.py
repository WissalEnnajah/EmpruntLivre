from rest_framework import serializers
from .models import Livre, Emprunt
from authentication.serializers import UserSerializer

class LivreSerializer(serializers.ModelSerializer):
    emprunte_par = serializers.SerializerMethodField()
    class Meta:
        model = Livre
        fields = '__all__'
        read_only_fields = ['disponible']
    
    def get_emprunte_par(self, obj):
        if not obj.disponible:
            emprunt = Emprunt.objects.filter(livre=obj, date_retour__isnull=True).first()
            if emprunt:
                return emprunt.utilisateur.username
        return None

class EmpruntSerializer(serializers.ModelSerializer):
    utilisateur = UserSerializer(read_only=True)
    livre = LivreSerializer(read_only=True)
    livre_id = serializers.PrimaryKeyRelatedField(
        queryset=Livre.objects.all(),  write_only=True
    )
    date_retour_prevue = serializers.DateField(required=True)
    
    class Meta:
        model = Emprunt
        fields = '__all__'
        read_only_fields = ['utilisateur']
    
    def create(self, validated_data):
        livre = validated_data.pop('livre_id', None)
        if not livre:
            raise serializers.ValidationError({"livre_id": "Ce champ est requis."})
        return Emprunt.objects.create(livre=livre, **validated_data)