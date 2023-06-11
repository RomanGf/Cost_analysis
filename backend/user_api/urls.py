from django.urls import path
from . import views
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    path('register', views.UserRegister.as_view(), name='register'),
    path('login', views.UserLogin.as_view(), name='login'),
    path('logout', views.UserLogout.as_view(), name='logout'),

    path('user', views.UserView.as_view(), name='user'),
    path('users/', views.UsersList.as_view(), name='users_list'),

    path('user/<int:pk>', views.UserDetailAPIView.as_view(), name='user_detail'),

#     path('get_user_cards/<int:pk>',
#          views.UsersCards.as_view(), name='user_cards_create'),
    path('user_cards/<int:pk>', views.UsersCardsView.as_view(), name='user_cards'),

#     path('user_card_transactions/<int:pk>/<str:id_monobank>',
#          views.GetUsersCardTransactions.as_view(), name='user_card_transactions'),
    path('user_card_transactions_view/<int:pk>/<str:id_monobank>',
         csrf_exempt(views.UserCardTransactionsView.as_view()), name='user_card_transactions'),
    path('user_card_transactions_compare/<int:pk>/<str:id_monobank>',
         csrf_exempt(views.TransactionsCompareView.as_view()), name='user_card_transactions_compare'),

     path('transaction_detail/<int:id>', views.TransactionDetail.as_view(), name='transaction_detail')
]
