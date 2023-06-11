# Generated by Django 4.2.1 on 2023-06-11 13:52

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('cards', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Transaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('transaction_id', models.CharField(max_length=20, unique=True)),
                ('time', models.IntegerField(null=True)),
                ('description', models.CharField(max_length=100, null=True)),
                ('mcc', models.IntegerField(null=True)),
                ('originalMcc', models.IntegerField(null=True)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10, null=True)),
                ('operationAmount', models.DecimalField(decimal_places=2, max_digits=10, null=True)),
                ('currencyCode', models.IntegerField(null=True)),
                ('commissionRate', models.DecimalField(decimal_places=2, max_digits=5, null=True)),
                ('cashbackAmount', models.DecimalField(decimal_places=2, max_digits=10, null=True)),
                ('balance', models.DecimalField(decimal_places=2, max_digits=10, null=True)),
                ('hold', models.BooleanField(null=True)),
                ('receiptId', models.CharField(max_length=20, null=True)),
                ('counterEdrpou', models.CharField(max_length=20, null=True)),
                ('counterIban', models.CharField(max_length=30, null=True)),
                ('counterName', models.CharField(max_length=100, null=True)),
                ('comment', models.TextField(null=True)),
                ('card', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transactions', to='cards.card')),
            ],
        ),
    ]
