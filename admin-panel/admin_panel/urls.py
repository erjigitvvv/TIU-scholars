from django.contrib import admin
from django.shortcuts import redirect
from django.urls import path
from core.admin_views import download_db_backup, export_excel_report

urlpatterns = [
    path('', lambda request: redirect('/admin/')),
    path('admin/export-excel/', export_excel_report, name='admin_export_excel'),
    path('admin/download-backup/', download_db_backup, name='admin_download_backup'),
    path('admin/', admin.site.urls),
]
