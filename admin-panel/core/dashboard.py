from .models import (
    Announcement,
    AuditLog,
    Department,
    Faculty,
    GrantProject,
    Publication,
    Supervision,
    User as PrismaUser,
)


def dashboard_callback(request, context):
    context.update({
        "tiu_kpis": [
            {"title": "Faol olimlar", "value": PrismaUser.objects.filter(role="SCHOLAR", accountStatus="ACTIVE").count(), "url": "/admin/core/user/?accountStatus__exact=ACTIVE"},
            {"title": "Kutilayotgan arizalar", "value": PrismaUser.objects.filter(role="SCHOLAR", accountStatus="PENDING").count(), "url": "/admin/core/user/?accountStatus__exact=PENDING"},
            {"title": "Tasdiqlangan nashrlar", "value": Publication.objects.filter(status="APPROVED").count(), "url": "/admin/core/publication/?status__exact=APPROVED"},
            {"title": "Kutilayotgan nashrlar", "value": Publication.objects.filter(status="PENDING").count(), "url": "/admin/core/publication/?status__exact=PENDING"},
            {"title": "Grantlar / Shogirdlar", "value": GrantProject.objects.count() + Supervision.objects.count(), "url": "/admin/core/grantproject/"},
            {"title": "Fakultet / Kafedralar", "value": f"{Faculty.objects.count()} / {Department.objects.count()}", "url": "/admin/core/faculty/"},
            {"title": "Faol e’lonlar", "value": Announcement.objects.filter(status="PUBLISHED").count(), "url": "/admin/core/announcement/"},
            {"title": "Audit yozuvlari", "value": AuditLog.objects.count(), "url": "/admin/core/auditlog/"},
        ],
    })
    return context
