# Generated by Django 5.2 on 2025-05-05 18:38

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ServerStatus',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('button_one', models.CharField(choices=[('0', 'PRESSIONADO'), ('1', 'NAO PRESSIONADO')], max_length=1)),
                ('button_two', models.CharField(choices=[('0', 'PRESSIONADO'), ('1', 'NAO PRESSIONADO')], max_length=1)),
                ('data_received', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
