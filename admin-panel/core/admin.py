from django.contrib import admin
from unfold.admin import ModelAdmin
from import_export.admin import ImportExportModelAdmin
from .models import (
    User, Faculty, Department, ScholarProfile, Publication,
    PublicationAuthor, GrantProject, Supervision, KpiTarget, ScoringConfig, AuditLog
)
from .utils import recalculate_scholar_metrics
import uuid
import json

@admin.action(description="Approve selected scholars (Active)")
def approve_scholars(modeladmin, request, queryset):
    for scholar in queryset:
        user = scholar.user
        user.accountStatus = "ACTIVE"
        user.save()
        AuditLog.objects.create(
            id=str(uuid.uuid4()),
            actor=request.user,
            action="APPROVE_SCHOLAR",
            entityType="ScholarProfile",
            entityId=scholar.id,
            details=json.dumps({"fullName": scholar.fullName})
        )
    modeladmin.message_user(request, "Selected scholars approved successfully.")

@admin.action(description="Reject selected scholars")
def reject_scholars(modeladmin, request, queryset):
    for scholar in queryset:
        user = scholar.user
        user.accountStatus = "REJECTED"
        user.rejectionReason = "Rejected by admin moderation"
        user.save()
        AuditLog.objects.create(
            id=str(uuid.uuid4()),
            actor=request.user,
            action="REJECT_SCHOLAR",
            entityType="ScholarProfile",
            entityId=scholar.id
        )
    modeladmin.message_user(request, "Selected scholars rejected.")

@admin.action(description="Approve selected publications & recalculate metrics")
def approve_publications(modeladmin, request, queryset):
    for pub in queryset:
        pub.status = "APPROVED"
        pub.rejectionReason = None
        pub.save()

        # Recalculate metrics for all co-authors
        authors = PublicationAuthor.objects.filter(publication=pub).select_related('scholar')
        for auth in authors:
            if auth.scholar:
                recalculate_scholar_metrics(auth.scholar)

        AuditLog.objects.create(
            id=str(uuid.uuid4()),
            actor=request.user,
            action="APPROV_PUBLICATION",
            entityType="Publication",
            entityId=pub.id,
            details=json.dumps({"title": pub.title})
        )
    modeladmin.message_user(request, "Selected publications approved and scholar metrics updated.")

@admin.action(description="Reject selected publications")
def reject_publications(modeladmin, request, queryset):
    for pub in queryset:
        pub.status = "REJECTED"
        pub.rejectionReason = "Did not meet academic standards"
        pub.save()
        AuditLog.objects.create(
            id=str(uuid.uuid4()),
            actor=request.user,
            action="REJECT_PUBLICATION",
            entityType="Publication",
            entityId=pub.id
        )
    modeladmin.message_user(request, "Selected publications rejected.")

@admin.action(description="Recalculate All Scholars' Scores")
def recalculate_all_scores(modeladmin, request, queryset):
    scholars = ScholarProfile.objects.all()
    count = 0
    for s in scholars:
        recalculate_scholar_metrics(s)
        count += 1
    AuditLog.objects.create(
        id=str(uuid.uuid4()),
        actor=request.user,
        action="RECALCULATE_ALL_SCORES",
        entityType="ScoringConfig",
        entityId="global"
    )
    modeladmin.message_user(request, f"Successfully recalculated scores for {count} scholars.")


@admin.register(User)
class UserAdmin(ModelAdmin):
    list_display = ('email', 'role', 'accountStatus', 'createdAt')
    list_filter = ('role', 'accountStatus')
    search_fields = ('email',)


@admin.register(Faculty)
class FacultyAdmin(ModelAdmin):
    list_display = ('code', 'nameEn', 'createdAt')
    search_fields = ('code', 'nameEn', 'nameUz')


@admin.register(Department)
class DepartmentAdmin(ModelAdmin):
    list_display = ('nameEn', 'faculty', 'createdAt')
    list_filter = ('faculty',)
    search_fields = ('nameEn', 'nameUz')


@admin.register(ScholarProfile)
class ScholarProfileAdmin(ImportExportModelAdmin, ModelAdmin):
    list_display = ('fullName', 'department', 'academicDegree', 'academicTitle', 'hIndex', 'tiuScore')
    list_filter = ('academicDegree', 'academicTitle', 'department__faculty')
    search_fields = ('fullName', 'publicEmail', 'orcidId', 'scopusId')
    actions = [approve_scholars, reject_scholars]


@admin.register(Publication)
class PublicationAdmin(ImportExportModelAdmin, ModelAdmin):
    list_display = ('title', 'type', 'year', 'quartile', 'citationsCount', 'status')
    list_filter = ('status', 'type', 'quartile', 'year')
    search_fields = ('title', 'doi', 'journalOrPublisher')
    actions = [approve_publications, reject_publications]


@admin.register(GrantProject)
class GrantProjectAdmin(ImportExportModelAdmin, ModelAdmin):
    list_display = ('title', 'scholar', 'fundingSource', 'startYear', 'status')
    list_filter = ('status', 'startYear')
    search_fields = ('title', 'fundingSource', 'scholar__fullName')


@admin.register(Supervision)
class SupervisionAdmin(ModelAdmin):
    list_display = ('studentName', 'scholar', 'degreeType', 'year', 'status')
    list_filter = ('status', 'degreeType', 'year')
    search_fields = ('studentName', 'dissertationTitle', 'scholar__fullName')


@admin.register(KpiTarget)
class KpiTargetAdmin(ModelAdmin):
    list_display = ('year', 'department', 'scholar', 'targetPublications', 'targetScore')
    list_filter = ('year',)


@admin.register(ScoringConfig)
class ScoringConfigAdmin(ModelAdmin):
    list_display = ('scopusWeight', 'wosWeight', 'oakWeight', 'q1Q2Bonus', 'citationWeight')
    actions = [recalculate_all_scores]


@admin.register(AuditLog)
class AuditLogAdmin(ModelAdmin):
    list_display = ('actor', 'action', 'entityType', 'entityId', 'createdAt')
    list_filter = ('action', 'entityType')
    search_fields = ('actor__email', 'entityId')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
