from django.contrib import admin, messages
from unfold.admin import ModelAdmin
from import_export.admin import ImportExportModelAdmin
from .models import (
    User, Faculty, Department, ScholarProfile, Publication,
    PublicationAuthor, GrantProject, Supervision, KpiTarget,
    ScoringConfig, AuditLog, Announcement, Notification,
)
from .utils import recalculate_scholar_metrics
import uuid
import json


def _resolve_prisma_actor(request):
    email = getattr(request.user, "email", None)
    if email:
        actor = User.objects.filter(email=email).first()
        if actor:
            return actor
    return User.objects.filter(role="SUPER_ADMIN").first() or User.objects.first()


def _create_audit(request, action, entity_type, entity_id, details=None):
    actor = _resolve_prisma_actor(request)
    if not actor:
        return
    AuditLog.objects.create(
        id=str(uuid.uuid4()),
        actor=actor,
        action=action,
        entityType=entity_type,
        entityId=str(entity_id),
        details=json.dumps(details or {}),
    )


def _notify(user, notif_type, title, message, link="/dashboard"):
    if not user:
        return
    Notification.objects.create(
        id=str(uuid.uuid4()),
        user=user,
        type=notif_type,
        title=title,
        message=message,
        link=link,
    )


@admin.action(description="Foydalanuvchilarni faollashtirish (ACTIVE)")
def activate_users(modeladmin, request, queryset):
    for u in queryset:
        u.accountStatus = "ACTIVE"
        u.rejectionReason = None
        u.save()
        _notify(u, "ACCOUNT_APPROVED", "Hisobingiz tasdiqlandi", "SuperAdmin tomonidan hisobingiz faollashtirildi.")
        _create_audit(request, "ADMIN_ACTIVATE_USER", "User", u.id, {"email": u.email})
    modeladmin.message_user(request, "Tanlangan foydalanuvchilar faollashtirildi.")


@admin.action(description="Foydalanuvchilarni bloklash (SUSPENDED)")
def suspend_users(modeladmin, request, queryset):
    for u in queryset:
        if u.role == "SUPER_ADMIN":
            active_sa = User.objects.filter(role="SUPER_ADMIN", accountStatus="ACTIVE").exclude(pk=u.pk).count()
            if active_sa == 0:
                messages.error(request, "Yagona faol SUPER_ADMIN ni bloklash mumkin emas!")
                continue
        u.accountStatus = "SUSPENDED"
        u.save()
        _notify(u, "ACCOUNT_SUSPENDED", "Hisobingiz bloklandi", "Hisobingiz vaqtincha to‘xtatildi.", "/dashboard/profile")
        _create_audit(request, "ADMIN_SUSPEND_USER", "User", u.id, {"email": u.email})


@admin.action(description="Moderator rolini berish (MODERATOR)")
def make_moderator(modeladmin, request, queryset):
    for u in queryset:
        if u.role == "SUPER_ADMIN":
            active_sa = User.objects.filter(role="SUPER_ADMIN", accountStatus="ACTIVE").exclude(pk=u.pk).count()
            if active_sa == 0:
                messages.error(request, "Yagona faol SUPER_ADMIN rolini pasaytirish mumkin emas!")
                continue
        u.role = "MODERATOR"
        u.accountStatus = "ACTIVE"
        u.save()
        _create_audit(request, "ADMIN_MAKE_MODERATOR", "User", u.id, {"email": u.email})
    modeladmin.message_user(request, "Tanlangan foydalanuvchilar Moderator etib belgilandi.")


@admin.action(description="Tanlangan olimlarni tasdiqlash (ACTIVE)")
def approve_scholars(modeladmin, request, queryset):
    for scholar in queryset.select_related("user"):
        user = scholar.user
        user.accountStatus = "ACTIVE"
        user.rejectionReason = None
        user.save()
        _notify(user, "ACCOUNT_APPROVED", "Hisobingiz tasdiqlandi", "Ilmiy bo‘lim / SuperAdmin tomonidan arizangiz tasdiqlandi.")
        _create_audit(request, "APPROVE_SCHOLAR", "ScholarProfile", scholar.id, {"fullName": scholar.fullName})
    modeladmin.message_user(request, "Tanlangan olimlar tasdiqlandi.")


@admin.action(description="Tanlangan olimlarni rad etish (REJECTED)")
def reject_scholars(modeladmin, request, queryset):
    for scholar in queryset.select_related("user"):
        user = scholar.user
        user.accountStatus = "REJECTED"
        user.rejectionReason = "Rejected by admin moderation"
        user.save()
        _notify(user, "ACCOUNT_REJECTED", "Arizangiz rad etildi", user.rejectionReason, "/dashboard/profile")
        _create_audit(request, "REJECT_SCHOLAR", "ScholarProfile", scholar.id)
    modeladmin.message_user(request, "Tanlangan olimlar rad etildi.")


@admin.action(description="Tanlangan olimlar ballarini qayta hisoblash")
def recalculate_selected_scores(modeladmin, request, queryset):
    count = 0
    for s in queryset:
        recalculate_scholar_metrics(s)
        count += 1
    modeladmin.message_user(request, f"{count} nafar olimning ballari qayta hisoblandi.")


@admin.action(description="Tanlangan nashrlarni tasdiqlash va ballarni hisoblash")
def approve_publications(modeladmin, request, queryset):
    for pub in queryset.select_related("submittedBy"):
        pub.status = "APPROVED"
        pub.rejectionReason = None
        pub.save()
        for auth in PublicationAuthor.objects.filter(publication=pub).select_related("scholar"):
            if auth.scholar:
                recalculate_scholar_metrics(auth.scholar)
        _notify(
            pub.submittedBy,
            "PUBLICATIONS_APPROVED",
            "Nashr tasdiqlandi",
            f'"{pub.title}" tasdiqlandi va reytingingiz yangilandi.',
            "/dashboard/publications",
        )
        _create_audit(request, "APPROVE_PUBLICATION", "Publication", pub.id, {"title": pub.title})
    modeladmin.message_user(request, "Tanlangan nashrlar tasdiqlandi va ballar yangilandi.")


@admin.action(description="Tanlangan nashrlarni rad etish")
def reject_publications(modeladmin, request, queryset):
    for pub in queryset.select_related("submittedBy"):
        pub.status = "REJECTED"
        pub.rejectionReason = "Did not meet academic standards"
        pub.save()
        _notify(
            pub.submittedBy,
            "PUBLICATIONS_REJECTED",
            "Nashr rad etildi",
            f'"{pub.title}" rad etildi. Sabab: {pub.rejectionReason}',
            "/dashboard/publications",
        )
        _create_audit(request, "REJECT_PUBLICATION", "Publication", pub.id)
    modeladmin.message_user(request, "Tanlangan nashrlar rad etildi.")


@admin.action(description="Grantlarni tasdiqlash (APPROVED)")
def approve_grants(modeladmin, request, queryset):
    for grant in queryset.select_related("scholar", "scholar__user"):
        grant.status = "APPROVED"
        grant.rejectionReason = None
        grant.save()
        if grant.scholar:
            recalculate_scholar_metrics(grant.scholar)
            _notify(grant.scholar.user, "GRANTS_APPROVED", "Grant loyihasi tasdiqlandi", f'"{grant.title}" tasdiqlandi.', "/dashboard/grants")
        _create_audit(request, "APPROVE_GRANT", "GrantProject", grant.id)
    modeladmin.message_user(request, "Tanlangan grantlar tasdiqlandi.")


@admin.action(description="Grantlarni rad etish (REJECTED)")
def reject_grants(modeladmin, request, queryset):
    for grant in queryset.select_related("scholar", "scholar__user"):
        grant.status = "REJECTED"
        grant.rejectionReason = "Rejected by admin moderation"
        grant.save()
        if grant.scholar:
            _notify(grant.scholar.user, "GRANTS_REJECTED", "Grant loyihasi rad etildi", f'"{grant.title}" rad etildi.', "/dashboard/grants")
        _create_audit(request, "REJECT_GRANT", "GrantProject", grant.id)
    modeladmin.message_user(request, "Tanlangan grantlar rad etildi.")


@admin.action(description="Ilmiy rahbarliklarni tasdiqlash (APPROVED)")
def approve_supervisions(modeladmin, request, queryset):
    for sup in queryset.select_related("scholar", "scholar__user"):
        sup.status = "APPROVED"
        sup.rejectionReason = None
        sup.save()
        if sup.scholar:
            recalculate_scholar_metrics(sup.scholar)
            _notify(sup.scholar.user, "SUPERVISIONS_APPROVED", "Ilmiy rahbarlik tasdiqlandi", f'"{sup.studentName}" tasdiqlandi.', "/dashboard/supervisions")
        _create_audit(request, "APPROVE_SUPERVISION", "Supervision", sup.id)
    modeladmin.message_user(request, "Tanlangan ilmiy rahbarliklar tasdiqlandi.")


@admin.action(description="Ilmiy rahbarliklarni rad etish (REJECTED)")
def reject_supervisions(modeladmin, request, queryset):
    for sup in queryset.select_related("scholar", "scholar__user"):
        sup.status = "REJECTED"
        sup.rejectionReason = "Rejected by admin moderation"
        sup.save()
        if sup.scholar:
            _notify(sup.scholar.user, "SUPERVISIONS_REJECTED", "Ilmiy rahbarlik rad etildi", f'"{sup.studentName}" rad etildi.', "/dashboard/supervisions")
        _create_audit(request, "REJECT_SUPERVISION", "Supervision", sup.id)
    modeladmin.message_user(request, "Tanlangan ilmiy rahbarliklar rad etildi.")


@admin.action(description="Chop etish va faol olimlarga bildirishnoma yuborish")
def publish_and_notify_scholars(modeladmin, request, queryset):
    active_scholars = list(User.objects.filter(role="SCHOLAR", accountStatus="ACTIVE"))
    for ann in queryset:
        ann.status = "PUBLISHED"
        ann.save()
        Notification.objects.bulk_create([
            Notification(
                id=str(uuid.uuid4()),
                user=s,
                type="ANNOUNCEMENT",
                title=f"Yangi e'lon: {ann.title}",
                message=ann.content[:140],
                link="/dashboard/announcements",
            )
            for s in active_scholars
        ])
        _create_audit(request, "PUBLISH_ANNOUNCEMENT", "Announcement", ann.id, {"title": ann.title})
    modeladmin.message_user(request, f"E'lon chop etildi va {len(active_scholars)} nafar olimga bildirishnoma yuborildi.")


@admin.action(description="Barcha olimlar ballarini qayta hisoblash")
def recalculate_all_scores(modeladmin, request, queryset):
    scholars = ScholarProfile.objects.all()
    count = 0
    for s in scholars:
        recalculate_scholar_metrics(s)
        count += 1
    _create_audit(request, "RECALCULATE_ALL_SCORES", "ScoringConfig", "global", {"count": count})
    modeladmin.message_user(request, f"{count} nafar olimning ballari qayta hisoblandi.")


@admin.register(User)
class UserAdmin(ModelAdmin):
    list_display = ("email", "role", "accountStatus", "createdAt")
    list_filter = ("role", "accountStatus")
    search_fields = ("email",)
    ordering = ("-createdAt",)
    list_per_page = 30
    readonly_fields = ("id", "createdAt", "updatedAt")
    actions = [activate_users, suspend_users, make_moderator]

    def save_model(self, request, obj, form, change):
        if change and obj.pk:
            old = User.objects.filter(pk=obj.pk).first()
            if old and old.role == "SUPER_ADMIN" and (obj.role != "SUPER_ADMIN" or obj.accountStatus != "ACTIVE"):
                active_sa_count = User.objects.filter(role="SUPER_ADMIN", accountStatus="ACTIVE").exclude(pk=obj.pk).count()
                if active_sa_count == 0:
                    messages.error(request, "Tizimdagi yagona faol SUPER_ADMIN hisobini o'chirish yoki pasaytirish mumkin emas!")
                    return
        super().save_model(request, obj, form, change)
        _create_audit(request, "ADMIN_SAVE_USER", "User", obj.id, {"role": obj.role, "accountStatus": obj.accountStatus})


@admin.register(Faculty)
class FacultyAdmin(ModelAdmin):
    list_display = ("code", "nameUz", "nameEn", "createdAt")
    search_fields = ("code", "nameEn", "nameUz")
    ordering = ("nameUz",)
    readonly_fields = ("id", "createdAt", "updatedAt")

    def save_model(self, request, obj, form, change):
        if not obj.id:
            obj.id = str(uuid.uuid4())
        super().save_model(request, obj, form, change)

    def delete_model(self, request, obj):
        if Department.objects.filter(faculty=obj).exists():
            messages.error(request, f'"{obj.nameUz}" fakultetida kafedralar mavjud — avval ularni ko‘chiring!')
            return
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            self.delete_model(request, obj)


@admin.register(Department)
class DepartmentAdmin(ModelAdmin):
    list_display = ("nameUz", "faculty", "createdAt")
    list_filter = ("faculty",)
    list_select_related = ("faculty",)
    search_fields = ("nameEn", "nameUz")
    ordering = ("nameUz",)
    readonly_fields = ("id", "createdAt", "updatedAt")

    def save_model(self, request, obj, form, change):
        if not obj.id:
            obj.id = str(uuid.uuid4())
        super().save_model(request, obj, form, change)

    def delete_model(self, request, obj):
        if ScholarProfile.objects.filter(department=obj).exists():
            messages.error(request, f'"{obj.nameUz}" kafedrasida olimlar mavjud — o‘chirib bo‘lmaydi!')
            return
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            self.delete_model(request, obj)


@admin.register(ScholarProfile)
class ScholarProfileAdmin(ImportExportModelAdmin, ModelAdmin):
    list_display = ("fullName", "department", "academicDegree", "academicTitle", "hIndex", "tiuScore")
    list_filter = ("academicDegree", "academicTitle", "department__faculty")
    list_select_related = ("user", "department", "department__faculty")
    search_fields = ("fullName", "publicEmail", "orcidId", "scopusId", "user__email")
    ordering = ("-tiuScore",)
    list_per_page = 30
    actions = [approve_scholars, reject_scholars, recalculate_selected_scores]


@admin.register(Publication)
class PublicationAdmin(ImportExportModelAdmin, ModelAdmin):
    list_display = ("title", "type", "year", "quartile", "citationsCount", "status")
    list_filter = ("status", "type", "quartile", "year")
    list_select_related = ("submittedBy",)
    search_fields = ("title", "doi", "journalOrPublisher")
    ordering = ("-createdAt",)
    list_per_page = 30
    actions = [approve_publications, reject_publications]


@admin.register(GrantProject)
class GrantProjectAdmin(ImportExportModelAdmin, ModelAdmin):
    list_display = ("title", "scholar", "fundingSource", "startYear", "status")
    list_filter = ("status", "startYear")
    list_select_related = ("scholar",)
    search_fields = ("title", "fundingSource", "scholar__fullName")
    ordering = ("-createdAt",)
    list_per_page = 30
    actions = [approve_grants, reject_grants]


@admin.register(Supervision)
class SupervisionAdmin(ModelAdmin):
    list_display = ("studentName", "scholar", "degreeType", "year", "status")
    list_filter = ("status", "degreeType", "year")
    list_select_related = ("scholar",)
    search_fields = ("studentName", "dissertationTitle", "scholar__fullName")
    ordering = ("-createdAt",)
    list_per_page = 30
    actions = [approve_supervisions, reject_supervisions]


@admin.register(KpiTarget)
class KpiTargetAdmin(ModelAdmin):
    list_display = ("year", "department", "scholar", "targetPublications", "targetScore")
    list_filter = ("year",)
    list_select_related = ("department", "scholar")
    ordering = ("-year",)


@admin.register(ScoringConfig)
class ScoringConfigAdmin(ModelAdmin):
    list_display = ("scopusWeight", "wosWeight", "oakWeight", "q1Q2Bonus", "citationWeight")
    actions = [recalculate_all_scores]


@admin.register(Announcement)
class AnnouncementAdmin(ModelAdmin):
    list_display = ("title", "category", "visibility", "status", "isPinned", "createdAt")
    list_filter = ("category", "visibility", "status", "isPinned")
    list_select_related = ("author",)
    search_fields = ("title", "content")
    ordering = ("-isPinned", "-createdAt")
    list_per_page = 30
    readonly_fields = ("id", "createdAt", "updatedAt")
    actions = [publish_and_notify_scholars]

    def save_model(self, request, obj, form, change):
        if not obj.id:
            obj.id = str(uuid.uuid4())
        if not obj.author_id:
            obj.author = _resolve_prisma_actor(request)
        super().save_model(request, obj, form, change)


@admin.register(Notification)
class NotificationAdmin(ModelAdmin):
    list_display = ("user", "type", "title", "isRead", "createdAt")
    list_filter = ("type", "isRead")
    list_select_related = ("user",)
    search_fields = ("user__email", "title", "message")
    ordering = ("-createdAt",)
    list_per_page = 30


@admin.register(AuditLog)
class AuditLogAdmin(ModelAdmin):
    list_display = ("actor", "action", "entityType", "entityId", "createdAt")
    list_filter = ("action", "entityType")
    list_select_related = ("actor",)
    search_fields = ("actor__email", "entityId")
    ordering = ("-createdAt",)
    list_per_page = 50

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
