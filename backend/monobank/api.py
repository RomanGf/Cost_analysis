import requests
from datetime import datetime, timedelta

url_personal_info = 'https://api.monobank.ua/personal/client-info'
url_transaction_info = 'https://api.monobank.ua/personal/statement/{account}/{from_date}/{to_date}'

headers = {'X-Token': 'upfDA1rOspybxdVsNqV55Cw1bTwVh7a29n6Aa8YU1Mcw'}



def get_user_data(token):
    response = requests.get(url_personal_info, headers=token)
    if response.status_code == 200:
        data = response.json()
        accounts = data['accounts']
        
    else:
        print('Помилка запиту:', response.status_code)
        return None
    return accounts

def get_transaction_date(headers, card_id=None, from_date=None, to_date=None):
    
# Отримуємо номер потрібного рахунку
    # accounts = get_user_data(token=headers)
    # account_id = cards_id  # Вибираємо перший рахунок зі списку

    # Визначаємо дати початку та кінця періоду, для якого хочемо отримати витрати та прибутки
    last_month = datetime.now() - timedelta(days=30)
    from_date = int(last_month.timestamp())
    to_date = int(datetime.now().timestamp())

    # Формуємо URL-адресу запиту з необхідними параметрами
    url = url_transaction_info.format(account=card_id, from_date=from_date, to_date=to_date)

    # Виконуємо запит і отримуємо відповідь в форматі JSON
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        data = response.json()
        print(data)
        return data
        # operations = data['operations']
        # for operation in operations:
        #     print(operation)
    else:
        print('Помилка запиту:', response.status_code)
