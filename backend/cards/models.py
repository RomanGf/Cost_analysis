from django.db import models


class CardManager(models.Manager):
    def create(self, monobank_id, currencyCode, balance, creditLimit, type_card,
               iban, user):
        card = self.model(monobank_id=monobank_id, currencyCode=currencyCode, balance=balance,
                                    creditLimit=creditLimit, type_cards=0, iban=iban,
                                    user=user)
        card.save()
        return card

class Card(models.Model):
    FOP = 0
    WHITE = 1
    BLACK = 2 
    EAID = 3
    CARDS_TYPE = (
		(FOP, 'fop'),   
		(WHITE, 'white'),   
		(BLACK, 'black'),   
		(EAID, 'eAid'),   
	)


    id = models.AutoField(primary_key=True)
    monobank_id = models.CharField(max_length=124, null=True, unique=True)
    currencyCode = models.CharField(max_length=10)
    balance = models.DecimalField(max_digits=10, decimal_places=2)
    creditLimit = models.DecimalField(max_digits=10, decimal_places=2)
    type_cards = models.IntegerField(choices=CARDS_TYPE)
    iban = models.CharField(max_length=50)
    user = models.ForeignKey(
        "user_api.AppUser", related_name='cards', on_delete=models.CASCADE)
    objects = CardManager()
    
    def __str__(self):
        return f"Card {self.id}"
