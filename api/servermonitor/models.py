from django.db import models

# Create your models here.

BUTTON_OPTIONS = (
    ('0', 'PRESSIONADO'),
    ('1', 'NAO PRESSIONADO'),
)

JOYSTICK_DIRECTION = (
    ('Centro', 'Centro'),
    ('Norte', 'Norte'),
    ('Sul', 'Sul'),
    ('Leste', 'Leste'),
    ('Oeste', 'Oeste'),
    ('Nordeste', 'Nordeste'),
    ('Noroeste', 'Noroeste'),
    ('Sudeste', 'Sudeste'),
    ('Sudoeste', 'Sudoeste'),
)


class ServerStatus(models.Model):
    button_one = models.CharField(max_length=1, choices=BUTTON_OPTIONS)
    button_two = models.CharField(max_length=1, choices=BUTTON_OPTIONS)
    joystick_x = models.IntegerField(default=2000)
    joystick_y = models.IntegerField(default=2000)
    direction = models.CharField(
        max_length=10, choices=JOYSTICK_DIRECTION, default='Centro')
    data_received = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Server {self.button_one} - {self.button_two} - {self.direction} - {self.data_received}"


class Temperature(models.Model):
    temperature = models.FloatField()
    data_received = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Temperature: {self.temperature} - {self.data_received}"
