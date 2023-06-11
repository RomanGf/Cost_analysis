import datetime
import time
from django.contrib.auth import get_user_model, login, logout, authenticate
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .serializers import UserRegisterSerializer, UserSerializer, UserViewSerializer, CardViewSerializer, TransactionViewSerializer, TransactionViewChatSerializer, UserUpdateViewSerializer, TransactionDetailSerializer
from .validations import custom_validation, validate_email, validate_password
from monobank.api import get_user_data, get_transaction_date
from cards.models import Card
from transactions.models import Transaction
from django.db.models import Sum
from utils.mcc_const import MCC_DICT
from utils.currency_const import CURRENCY_DICT
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse


User = get_user_model()


class UserRegister(APIView):

    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        clean_data = custom_validation(request.data)

        serializer = UserRegisterSerializer(data=clean_data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.create(clean_data)
            if user:
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class UserLogin(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (BasicAuthentication,)

    def post(self, request):
        data = request.data

        assert validate_email(data)
        assert validate_password(data)

        user = authenticate(username=data['email'], password=data['password'])

        if user:
            login(request=request, user=user)
            serializer = UserSerializer(user)
            return Response(serializer.data)

        return Response({'message': 'bad'})


class UserLogout(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_200_OK)


class UserView(APIView):

    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response({'user': serializer.data}, status=status.HTTP_200_OK)


class UsersList(APIView):

    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)

    def get(self, request):
        data = []
        next_page = 1
        previous_page = 1
        customers = User.objects.all()
        page = request.GET.get('page', 1)
        paginator = Paginator(customers, 5)
        try:
            data = paginator.page(page)
        except PageNotAnInteger:
            data = paginator.page(1)
        except EmptyPage:
            data = paginator.page(paginator.num_pages)

        serializer = UserViewSerializer(
            data, context={'request': request}, many=True)
        if data.has_next():
            next_page = data.next_page_number()
        if data.has_previous():
            previous_page = data.previous_page_number()

        return Response({
            'data': serializer.data,
            'count': paginator.count,
            'numpages': paginator.num_pages,
            'nextlink': '/api/users/?page=' + str(next_page),
            'prevlink': '/api/users/?page=' + str(previous_page)
        })

    def post(self, request):
        serializer = UserViewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class UserDetailAPIView(APIView):

    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (BasicAuthentication,)

    # checkhere'

    def get_object(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            return None

    def get(self, request, pk):
        account = self.get_object(pk)
        if not account:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = UserViewSerializer(account, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        account = self.get_object(pk)
        if not account:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = UserUpdateViewSerializer(
            account, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):

        account = self.get_object(pk)
        if not account:
            return Response(status=status.HTTP_404_NOT_FOUND)

        account.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UsersCardsView(APIView):

    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (BasicAuthentication,)

    def get_object(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            return None

    def get(self, request, pk):

        user = self.get_object(pk)

        if not user:
            return Response(status=status.HTTP_404_NOT_FOUND)

        headars = {'X-Token': user.token_monobank}

        cards = get_user_data(token=headars)

        if cards is not None:
            for card in cards:
                try:
                    monobank_id = card['id']
                    currencyCode = card['currencyCode']
                    balance = card['balance']
                    credit_limit = card['creditLimit']
                    type_cards = 0
                    iban = card['iban']
                    Card.objects.create(monobank_id=monobank_id, currencyCode=currencyCode, balance=balance,
                                        creditLimit=credit_limit, type_card=type_cards, iban=iban, user=user)
                except:
                    Card.objects.filter(monobank_id=monobank_id).update(
                        balance=balance, creditLimit=credit_limit)

        cards = Card.objects.filter(user__user_id=pk)
        serializer = CardViewSerializer(
            cards, context={'request': request}, many=True)

        cards_data = serializer.data
        for card in cards_data:
            card['balance'] = str(float(card['balance']) / 100)

        data = {
            'cards': cards_data,
            'currency_constant': CURRENCY_DICT
        }
        return Response(data)


@method_decorator(csrf_exempt, name='dispatch')
class UserCardTransactionsView(APIView):

    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (BasicAuthentication,)

    def get_user(self, pk):
        try:
            return User.objects.filter(pk=pk)[0]
        except User.DoesNotExist:
            return None

    def get_cards(self, monobank_id):
        try:
            return Card.objects.get(monobank_id=monobank_id)
        except Card.DoesNotExist:
            return None

    def get_transactions(self, card_id, mcc=None, start_date=None, end_date=None, amount_gt=None, amount_lt=None):
        transactions = Transaction.objects.filter(card__id=card_id).values(
            'mcc', 'amount', 'id', 'transaction_id', 'time', 'description', 'comment').annotate(total_amount=Sum('amount')).order_by('-time')

        if mcc:
            mcc = [int(x) for x in mcc]
            transactions = transactions.filter(mcc__in=mcc)
        if start_date and end_date:
            transactions = transactions.filter(
                time__range=[start_date, end_date])

        if amount_gt:
            amount_gt = int(amount_gt) * 100
            transactions = transactions.filter(amount__lt=amount_gt)

        if amount_lt:
            amount_lt = int(amount_lt) * 100
            transactions = transactions.filter(amount__gt=amount_lt)

        for transaction in transactions:
            transaction['time'] = datetime.datetime.fromtimestamp(
                transaction['time'])

        return transactions

    def get_transactions_chat_js(self, card_id, mcc=None, start_date=None, end_date=None, amount_gt=None, amount_lt=None):
        query = {}
        if mcc:
            mcc = [int(x) for x in mcc]
            query.update({'mcc__in': mcc})

        if start_date and end_date:
            query.update({'time__range': [start_date, end_date]})

        if amount_gt:
            query.update({'amount__lt': amount_gt})

        if amount_lt:
            query.update({'amount__gt': amount_lt})

        transactions_chat_js = Transaction.objects.filter(**query).filter(
            card__id=card_id).values('mcc').annotate(total_amount=Sum('amount'))

        return transactions_chat_js

    def get_serialized_data(self, transactions, transactions_chat_js):
        serializer_chat_js = TransactionViewChatSerializer(
            transactions_chat_js, context={'request': self.request}, many=True)
        serializer = TransactionViewSerializer(
            transactions, context={'request': self.request}, many=True)

        transactions_chat_js_data = serializer_chat_js.data
        transactions_data = serializer.data
        for transaction in transactions_data:
            transaction['amount'] = str(float(transaction['amount']) / 100)

        for transaction in transactions_chat_js_data:
            transaction['total_amount'] = str(
                float(transaction['total_amount']) / 100)

        data = {
            'transactions': transactions_data,
            'transactions_chat_js': transactions_chat_js_data,
            'mcc_dict': MCC_DICT
        }

        return data

    def get(self, request, pk, id_monobank):
        user = self.get_user(pk=pk)
        card = self.get_cards(monobank_id=id_monobank)

        headers = {'X-Token': user.token_monobank}
        transactions = get_transaction_date(
            headers=headers, card_id=card.monobank_id)
        if transactions is not None:
            for transaction in transactions:
                try:
                    transaction_data = {
                        "transaction_id": transaction.get('id'),
                        "time": transaction.get('time'),
                        "description": transaction.get('description'),
                        "mcc": transaction.get('mcc'),
                        "originalMcc": transaction.get('originalMcc'),
                        "amount": transaction.get('amount'),
                        "operationAmount": transaction.get('operationAmount'),
                        "currencyCode": transaction.get('currencyCode'),
                        "commissionRate": transaction.get('commissionRate'),
                        "cashbackAmount": transaction.get('cashbackAmount'),
                        "balance": transaction.get('balance'),
                        "hold": transaction.get('hold'),
                        "receiptId": transaction.get('receiptId'),
                        "counterEdrpou": transaction.get('counterEdrpou'),
                        "counterIban": transaction.get('counterIban'),
                        "counterName": transaction.get('counterName'),
                        "card": card
                    }
                    Transaction.objects.create_transaction(**transaction_data)
                except:
                    continue

        transactions = self.get_transactions(card_id=card.id)
        transactions_chat_js = self.get_transactions_chat_js(card_id=card.id)

        data = self.get_serialized_data(transactions, transactions_chat_js)

        return Response(data)

    def post(self, request, pk, id_monobank):
        user = self.get_user(pk=pk)
        card = self.get_cards(monobank_id=id_monobank)
        mcc = request.data.get('mcc')
        amount_gt = request.data.get('amountGT')
        amount_lt = request.data.get('amountLT')
        start_date = request.data.get('startDate')
        end_date = request.data.get('endDate')
        date_format = "%Y-%m-%dT%H:%M:%S.%fZ"
        if start_date:
            start_date = datetime.datetime.strptime(
                start_date, date_format).timestamp()
        if end_date:

            end_date = datetime.datetime.strptime(
                end_date, date_format).timestamp()

        transactions = self.get_transactions(
            card_id=card.id, mcc=mcc, amount_gt=amount_gt, amount_lt=amount_lt)
        transactions_chat_js = self.get_transactions_chat_js(
            card_id=card.id, mcc=mcc, amount_gt=amount_gt, amount_lt=amount_lt)

        data = self.get_serialized_data(transactions, transactions_chat_js)

        return Response(data)


@method_decorator(csrf_exempt, name='dispatch')
class TransactionDetail(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (BasicAuthentication,)

    def get(self, request, id):
        transaction = Transaction.objects.filter(id=id)[0]
        transaction.amount = int(transaction.amount) / 100
        transaction.time = datetime.datetime.fromtimestamp(transaction.time).strftime('%Y-%m-%d')

        serializer = TransactionDetailSerializer(
            transaction,  context={'request': request})
        return Response(serializer.data)

    def post(self, request, id):
        comment = request.data.get('comment')
        transaction = Transaction.objects.filter(id=id).first()
        if transaction:
            transaction.comment = comment
            transaction.save()
            serializer = TransactionDetailSerializer(
                transaction, context={'request': request})
            return Response(serializer.data)
        else:
            return Response({'error': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)


@method_decorator(csrf_exempt, name='dispatch')
class TransactionsCompareView(APIView):

    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (BasicAuthentication,)

    def get_cards(self, monobank_id):
        try:
            return Card.objects.get(monobank_id=monobank_id)
        except Card.DoesNotExist:
            return None

    def get_transactions_chat_js(self, card_id, mcc=None, start_date=None, end_date=None):
        query = {}
        if mcc:
            query.update({'mcc': int(mcc)})

        if start_date and end_date:
            query.update({'time__range': [start_date, end_date]})
        print(start_date, end_date)

        transactions_chat_js = Transaction.objects.filter(**query).filter(
            card__id=card_id).values('mcc').annotate(total_amount=Sum('amount'))
        print(transactions_chat_js)
        return transactions_chat_js

    def get_serialized_data(self,  transactions_chat_js, transactions_chat_js_second):
        serializer_chat_js = TransactionViewChatSerializer(
            transactions_chat_js, context={'request': self.request}, many=True)
        serializer_chat_js_second = TransactionViewChatSerializer(
            transactions_chat_js_second, context={'request': self.request}, many=True)

        transactions_chat_js_data = serializer_chat_js.data
        transactions_chat_js_data_second = serializer_chat_js_second.data
        data = {
            'transactions_chat_js': transactions_chat_js_data,
            'transactions_chat_js_second': transactions_chat_js_data_second,
            'mcc_dict': MCC_DICT
        }

        return data

    def get_date(self, start_date=None, end_date=None):
        date_format = "%Y-%m-%dT%H:%M:%S.%fZ"
        if start_date:
            start_date = datetime.datetime.strptime(
                start_date, date_format).timestamp()
            start_date = int(start_date)
        else:
            start_date = timezone.now().date() - datetime.timedelta(days=30)
            start_date = int(time.mktime(start_date.timetuple()))
        if end_date:
            end_date = datetime.datetime.strptime(
                end_date, date_format).timestamp()
            end_date = int(end_date)
        else:
            end_date = timezone.now().date()
            end_date = int(time.mktime(end_date.timetuple()))

        return start_date, end_date

    def get(self, request, pk, id_monobank):

        card = self.get_cards(monobank_id=id_monobank)
        start_date_first, end_date_first = self.get_date()
        start_date_second, end_date_second = self.get_date()

        transactions_chat_js_first = self.get_transactions_chat_js(
            card_id=card.id, start_date=start_date_first, end_date=end_date_first)
        transactions_chat_js_second = self.get_transactions_chat_js(
            card_id=card.id, start_date=start_date_second, end_date=end_date_second)
        data = self.get_serialized_data(
            transactions_chat_js_first, transactions_chat_js_second)

        return Response(data=data)

    def post(self, request, pk, id_monobank):
        start_date_first = request.data.get('startDateFirst')
        end_date_first = request.data.get('endDateFirst')
        start_date_second = request.data.get('startDateSecond')
        end_date_second = request.data.get('endDateSecond')
        card = self.get_cards(monobank_id=id_monobank)
        start_date_first, end_date_first = self.get_date(
            start_date=start_date_first, end_date=end_date_first)
        start_date_second, end_date_second = self.get_date(
            start_date=start_date_second, end_date=end_date_second)
        transactions_chat_js_first = self.get_transactions_chat_js(
            card_id=card.id, start_date=start_date_first, end_date=end_date_first)
        transactions_chat_js_second = self.get_transactions_chat_js(
            card_id=card.id, start_date=start_date_second, end_date=end_date_second)
        data = self.get_serialized_data(
            transactions_chat_js_first, transactions_chat_js_second)
        return Response(data=data)
