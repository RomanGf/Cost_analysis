# Generated by Django 4.2.1 on 2023-05-23 20:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_api', '0002_appuser_token_monobank_card'),
    ]

    operations = [
        migrations.AlterField(
            model_name='card',
            name='type_cards',
            field=models.IntegerField(choices=[(0, 'fop'), (1, 'white'), (2, 'black'), (3, 'eAid')]),
        ),
    ]
