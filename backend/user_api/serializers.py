import datetime
from django.forms import ValidationError
from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from .models import AppUser
from cards.models import Card
from transactions.models import Transaction


UserModel = get_user_model()

class UserRegisterSerializer(serializers.ModelSerializer):
	class Meta:
		model = UserModel
		fields = '__all__'
	def create(self, clean_data):
		user_obj = UserModel.objects.create_user(email=clean_data['email'], password=clean_data['password'], username=clean_data['username'])
		user_obj.username = clean_data['username']
		user_obj.save()	
		return user_obj

class UserLoginSerializer(serializers.Serializer):
	email = serializers.EmailField()
	password = serializers.CharField()
	# id = serializers.IntegerField()
	##
	def check_user(self, clean_data):
		pass
		# user = authenticate(username=clean_data['email'], password=clean_data['password'])
		# if not user:
			# raise ValidationError('user not found')
# /		return user


class UserSerializer(serializers.ModelSerializer):
	id = serializers.SerializerMethodField('get_id')	
	email = serializers.EmailField()	
	username = serializers.CharField()	
	class Meta:
		model = AppUser
		fields = ('id', 'email', 'username')
	
	def get_id(self, obj):
		return obj.pk



class UserViewSerializer(serializers.ModelSerializer):
	class Meta:
		model = UserModel
		fields = ('pk', 'email', 'username', 'token_monobank')

class UserUpdateViewSerializer(serializers.ModelSerializer):
	class Meta:
		model = UserModel
		fields = ('token_monobank', 'pk')


class CardViewSerializer(serializers.ModelSerializer):
    currencyCode = serializers.CharField()  
    class Meta:
        model = Card
        fields = ('id', 'monobank_id', 'currencyCode', 'balance', 'creditLimit')
	
class TransactionViewSerializer(serializers.ModelSerializer):
    time = serializers.DateTimeField()

    class Meta:
        model = Transaction
        fields = ('mcc', 'amount', 'id', 'transaction_id', 'time', 'description', 'comment')
	

class TransactionViewChatSerializer(serializers.ModelSerializer):
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2) 

    class Meta:
        model = Transaction
        fields = ('mcc', 'total_amount', 'time')
	
class TransactionDetailSerializer(serializers.ModelSerializer):
    time = serializers.SerializerMethodField('get_formatted_time')	

    class Meta:
        model = Transaction
        fields = ('__all__')

    def get_formatted_time(self, obj):
        timestamp = obj.time
        date_format = "%Y-%m-%d %H:%M:%S"
        formatted_time = datetime.datetime.fromtimestamp(timestamp).strftime(date_format)
        return formatted_time
