from django.db import models

class User(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    email = models.CharField(max_length=255, unique=True)
    passwordHash = models.CharField(max_length=255)
    role = models.CharField(max_length=50, default="SCHOLAR")
    accountStatus = models.CharField(max_length=50, default="PENDING")
    rejectionReason = models.TextField(blank=True, null=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'User'

    def __str__(self):
        return self.email


class Faculty(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    code = models.CharField(max_length=50, unique=True)
    nameUz = models.CharField(max_length=255)
    nameRu = models.CharField(max_length=255)
    nameEn = models.CharField(max_length=255)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'Faculty'

    def __str__(self):
        return self.nameEn


class Department(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, db_column='facultyId')
    nameUz = models.CharField(max_length=255)
    nameRu = models.CharField(max_length=255)
    nameEn = models.CharField(max_length=255)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'Department'

    def __str__(self):
        return self.nameEn


class ScholarProfile(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, db_column='userId')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, db_column='departmentId')
    fullName = models.CharField(max_length=255)
    academicDegree = models.CharField(max_length=50, default="NONE")
    academicTitle = models.CharField(max_length=50, default="NONE")
    bioUz = models.TextField(blank=True, null=True)
    bioRu = models.TextField(blank=True, null=True)
    bioEn = models.TextField(blank=True, null=True)
    researchInterests = models.TextField(default="[]")
    photoUrl = models.TextField(blank=True, null=True)
    publicEmail = models.CharField(max_length=255, blank=True, null=True)
    orcidId = models.CharField(max_length=100, blank=True, null=True)
    scopusId = models.CharField(max_length=100, blank=True, null=True)
    googleScholarUrl = models.TextField(blank=True, null=True)
    hIndex = models.IntegerField(default=0)
    totalCitations = models.IntegerField(default=0)
    tiuScore = models.FloatField(default=0.0)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'ScholarProfile'

    def __str__(self):
        return self.fullName


class Publication(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    title = models.TextField()
    type = models.CharField(max_length=50)
    journalOrPublisher = models.TextField()
    year = models.IntegerField()
    doi = models.CharField(max_length=255, blank=True, null=True, unique=True)
    url = models.TextField(blank=True, null=True)
    isbnOrPatentNo = models.CharField(max_length=100, blank=True, null=True)
    quartile = models.CharField(max_length=50, default="NONE")
    citationsCount = models.IntegerField(default=0)
    status = models.CharField(max_length=50, default="PENDING")
    rejectionReason = models.TextField(blank=True, null=True)
    submittedBy = models.ForeignKey(User, on_delete=models.CASCADE, db_column='submittedById', related_name='submitted_publications')
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'Publication'

    def __str__(self):
        return self.title


class PublicationAuthor(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    publication = models.ForeignKey(Publication, on_delete=models.CASCADE, db_column='publicationId', related_name='authors')
    scholar = models.ForeignKey(ScholarProfile, on_delete=models.CASCADE, db_column='scholarId', related_name='publications')
    authorOrder = models.IntegerField(default=1)

    class Meta:
        managed = False
        db_table = 'PublicationAuthor'


class GrantProject(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    scholar = models.ForeignKey(ScholarProfile, on_delete=models.CASCADE, db_column='scholarId')
    title = models.TextField()
    role = models.CharField(max_length=100)
    fundingSource = models.CharField(max_length=255)
    startYear = models.IntegerField()
    endYear = models.IntegerField(blank=True, null=True)
    status = models.CharField(max_length=50, default="PENDING")
    rejectionReason = models.TextField(blank=True, null=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'GrantProject'

    def __str__(self):
        return self.title


class Supervision(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    scholar = models.ForeignKey(ScholarProfile, on_delete=models.CASCADE, db_column='scholarId')
    studentName = models.CharField(max_length=255)
    degreeType = models.CharField(max_length=50, default="PHD")
    dissertationTitle = models.TextField()
    year = models.IntegerField()
    status = models.CharField(max_length=50, default="PENDING")
    rejectionReason = models.TextField(blank=True, null=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'Supervision'

    def __str__(self):
        return self.studentName


class KpiTarget(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    year = models.IntegerField()
    department = models.ForeignKey(Department, on_delete=models.CASCADE, db_column='departmentId', blank=True, null=True)
    scholar = models.ForeignKey(ScholarProfile, on_delete=models.CASCADE, db_column='scholarId', blank=True, null=True)
    targetPublications = models.IntegerField()
    targetScopus = models.IntegerField()
    targetScore = models.FloatField()
    createdAt = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'KpiTarget'


class ScoringConfig(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    scopusWeight = models.FloatField(default=10.0)
    q1Q2Bonus = models.FloatField(default=5.0)
    wosWeight = models.FloatField(default=10.0)
    oakWeight = models.FloatField(default=5.0)
    monographWeight = models.FloatField(default=7.0)
    patentWeight = models.FloatField(default=6.0)
    conferenceWeight = models.FloatField(default=2.0)
    citationWeight = models.FloatField(default=0.2)

    class Meta:
        managed = False
        db_table = 'ScoringConfig'


class AuditLog(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    actor = models.ForeignKey(User, on_delete=models.CASCADE, db_column='actorId')
    action = models.CharField(max_length=255)
    entityType = models.CharField(max_length=100)
    entityId = models.CharField(max_length=50)
    details = models.TextField(blank=True, null=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'AuditLog'
