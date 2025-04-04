# Generated by Django 5.1.7 on 2025-03-15 18:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='bonds',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=15),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='insurance',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=15),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='stocks',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=15),
        ),
    ]
