# Generated by Django 4.2.1 on 2023-05-27 10:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_api', '0006_alter_transaction_receiptid_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='transaction',
            name='counterEdrpou',
            field=models.CharField(max_length=20, null=True),
        ),
    ]
