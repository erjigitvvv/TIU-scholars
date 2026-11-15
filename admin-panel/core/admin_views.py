import io
import shutil
import tempfile
from datetime import datetime
from django.conf import settings
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.decorators import user_passes_test
from django.db.models import Avg
from django.http import FileResponse, HttpResponse
import openpyxl
from openpyxl.styles import Font, PatternFill

from .models import Department, Faculty, ScholarProfile


@staff_member_required
def export_excel_report(request):
    wb = openpyxl.Workbook()

    # Sheet 1: Faculties
    ws1 = wb.active
    ws1.title = "Fakultetlar"
    headers1 = ["Kod", "Fakultet nomi (UZ)", "Kafedralar soni", "Faol olimlar", "O'rtacha TIU Ball"]
    ws1.append(headers1)

    header_fill = PatternFill(start_color="0F294A", end_color="0F294A", fill_type="solid")
    header_font = Font(color="FFFFFF", bold=True)
    for col in range(1, len(headers1) + 1):
        cell = ws1.cell(row=1, column=col)
        cell.fill = header_fill
        cell.font = header_font

    for fac in Faculty.objects.all().order_by("nameUz"):
        depts = Department.objects.filter(faculty=fac)
        scholars = ScholarProfile.objects.filter(department__in=depts, user__accountStatus="ACTIVE")
        avg_score = scholars.aggregate(avg=Avg("tiuScore"))["avg"] or 0.0
        ws1.append([fac.code, fac.nameUz, depts.count(), scholars.count(), round(avg_score, 2)])

    ws1.column_dimensions["A"].width = 14
    ws1.column_dimensions["B"].width = 42
    ws1.column_dimensions["C"].width = 18
    ws1.column_dimensions["D"].width = 16
    ws1.column_dimensions["E"].width = 20

    # Sheet 2: Scholars Ranking
    ws2 = wb.create_sheet("Olimlar reytingi")
    headers2 = ["F.I.Sh", "Email", "Kafedra", "Ilmiy daraja", "Ilmiy unvon", "H-Index", "Iqtiboslar", "TIU Ball"]
    ws2.append(headers2)
    for col in range(1, len(headers2) + 1):
        cell = ws2.cell(row=1, column=col)
        cell.fill = header_fill
        cell.font = header_font

    for s in ScholarProfile.objects.select_related("user", "department").order_by("-tiuScore"):
        ws2.append([
            s.fullName,
            s.user.email if s.user else "",
            s.department.nameUz if s.department else "",
            s.academicDegree,
            s.academicTitle,
            s.hIndex,
            s.totalCitations,
            round(s.tiuScore, 2),
        ])

    ws2.column_dimensions["A"].width = 30
    ws2.column_dimensions["B"].width = 28
    ws2.column_dimensions["C"].width = 34
    ws2.column_dimensions["D"].width = 15
    ws2.column_dimensions["E"].width = 15
    ws2.column_dimensions["F"].width = 12
    ws2.column_dimensions["G"].width = 12
    ws2.column_dimensions["H"].width = 14

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)

    filename = f"tiu-scholars-report-{datetime.now().strftime('%Y-%m-%d')}.xlsx"
    response = HttpResponse(
        buffer.getvalue(),
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    return response


@user_passes_test(lambda u: u.is_authenticated and u.is_superuser, login_url="/admin/login/")
def download_db_backup(request):
    db_path = settings.DATABASES["default"]["NAME"]
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
    tmp.close()
    shutil.copy2(db_path, tmp.name)

    filename = f"tiu-scholars-backup-{datetime.now().strftime('%Y-%m-%d_%H-%M')}.db"
    return FileResponse(open(tmp.name, "rb"), as_attachment=True, filename=filename)
