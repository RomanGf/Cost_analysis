from django.db import models


class TransactionsManager(models.Manager):
    def create_transaction(self, **kwargs):
        transaction = self.create(**kwargs)
        return transaction


class Transaction(models.Model):
    transaction_id = models.CharField(max_length=20, unique=True)
    time = models.IntegerField(null=True)
    description = models.CharField(max_length=100, null=True)
    mcc = models.IntegerField(null=True)
    originalMcc = models.IntegerField(null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    operationAmount = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    currencyCode = models.IntegerField(null=True)
    commissionRate = models.DecimalField(max_digits=5, decimal_places=2,null=True)
    cashbackAmount = models.DecimalField(max_digits=10, decimal_places=2,null=True)
    balance = models.DecimalField(max_digits=10, decimal_places=2,null=True)
    hold = models.BooleanField(null=True)
    receiptId = models.CharField(max_length=20, null=True)
    counterEdrpou = models.CharField(max_length=20, null=True)
    counterIban = models.CharField(max_length=30,null=True)
    counterName = models.CharField(max_length=100,null=True)
    card = models.ForeignKey(
        'cards.Card', related_name='transactions', on_delete=models.CASCADE
    )
    comment = models.TextField(null=True)
    objects = TransactionsManager()