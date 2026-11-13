from django.core.management.base import BaseCommand
from django.contrib.auth.models import User as DjangoUser, Group, Permission
from django.contrib.contenttypes.models import ContentType
from core.models import User as PrismaUser, ScholarProfile, Publication, GrantProject, Supervision, KpiTarget, ScoringConfig, AuditLog

class Command(BaseCommand):
    help = 'Seed Django groups, permissions, and demo staff logins for Super Admin, Ilmiy Bolim, and Kafedra Masuli'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Seeding Django Roles & Groups...'))

        # 1. Groups & Permissions
        super_admin_group, _ = Group.objects.get_or_create(name='Super Admin')
        ilmiy_group, _ = Group.objects.get_or_create(name='Ilmiy Bolim')
        kafedra_group, _ = Group.objects.get_or_create(name='Kafedra Masuli')

        # Ilmiy Bolim permissions (view/change User, ScholarProfile; view/add/change Publication, GrantProject, Supervision, KpiTarget; view AuditLog/ScoringConfig)
        content_types = ContentType.objects.all()
        for ct in content_types:
            model_cls = ct.model_class()
            if not model_cls:
                continue
            model_name = model_cls.__name__

            # Ilmiy Bolim permissions
            if model_name in ['User', 'ScholarProfile']:
                for perm in Permission.objects.filter(content_type=ct, codename__in=[f'view_{model_name.lower()}', f'change_{model_name.lower()}']):
                    ilmiy_group.permissions.add(perm)
            elif model_name in ['Publication', 'GrantProject', 'Supervision', 'KpiTarget']:
                for perm in Permission.objects.filter(content_type=ct, codename__in=[f'view_{model_name.lower()}', f'add_{model_name.lower()}', f'change_{model_name.lower()}']):
                    ilmiy_group.permissions.add(perm)
            elif model_name in ['Faculty', 'Department', 'ScoringConfig', 'AuditLog']:
                for perm in Permission.objects.filter(content_type=ct, codename=f'view_{model_name.lower()}'):
                    ilmiy_group.permissions.add(perm)

            # Kafedra Masuli (view-only on academic models)
            if model_name in ['ScholarProfile', 'Publication', 'GrantProject', 'Supervision', 'KpiTarget']:
                for perm in Permission.objects.filter(content_type=ct, codename=f'view_{model_name.lower()}'):
                    kafedra_group.permissions.add(perm)

        # 2. Create Django Staff Logins matching Prisma / Demo users
        # Super Admin
        sa_user, created = DjangoUser.objects.get_or_create(
            username='superadmin@tiu.uz',
            defaults={
                'email': 'superadmin@tiu.uz',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        sa_user.set_password('Admin123!')
        sa_user.save()
        sa_user.groups.add(super_admin_group)

        # Ilmiy Bolim Moderator
        mod_user, created = DjangoUser.objects.get_or_create(
            username='moderator@tiu.uz',
            defaults={
                'email': 'moderator@tiu.uz',
                'is_staff': True,
                'is_superuser': False,
            }
        )
        mod_user.set_password('Moderator123!')
        mod_user.save()
        mod_user.groups.add(ilmiy_group)

        # Kafedra Masuli (Department Viewer)
        kaf_user, created = DjangoUser.objects.get_or_create(
            username='kafedra@tiu.uz',
            defaults={
                'email': 'kafedra@tiu.uz',
                'is_staff': True,
                'is_superuser': False,
            }
        )
        kaf_user.set_password('Kafedra123!')
        kaf_user.save()
        kaf_user.groups.add(kafedra_group)

        self.stdout.write(self.style.SUCCESS('Successfully seeded roles, permissions, and staff accounts!'))
