from django.db import models

# Create your models here.

BUTTON_OPTIONS = (
    ('0', 'PRESSIONADO'),
    ('1', 'NAO PRESSIONADO'),
)


class ServerStatus(models.Model):
    button_one = models.CharField(max_length=1, choices=BUTTON_OPTIONS)
    button_two = models.CharField(max_length=1, choices=BUTTON_OPTIONS)
    data_received = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Server {self.button_one} - {self.button_two} - {self.data_received}"
