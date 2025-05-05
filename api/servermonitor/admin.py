from django.contrib import admin

# Register your models here.

from .models import ServerStatus


class ServerStatusAdmin(admin.ModelAdmin):
    list_display = ['button_one', 'button_two', 'data_received']
    search_fields = ['data_received']


admin.site.register(ServerStatus, ServerStatusAdmin)
