import math
from .models import ScoringConfig, PublicationAuthor

TYPE_WEIGHTS = {
    'SCOPUS': 10,
    'WOS': 10,
    'OAK': 5,
    'INTERNATIONAL_JOURNAL': 6,
    'LOCAL_JOURNAL': 3,
    'CONFERENCE': 2,
    'MONOGRAPH': 7,
    'TEXTBOOK': 6,
    'PATENT': 6,
}

def recalculate_scholar_metrics(scholar):
    try:
        config = ScoringConfig.objects.first()
        if not config:
            config = ScoringConfig(
                scopusWeight=10,
                q1Q2Bonus=5,
                wosWeight=10,
                oakWeight=5,
                monographWeight=7,
                patentWeight=6,
                conferenceWeight=2,
                citationWeight=0.2
            )

        pub_authors = PublicationAuthor.objects.filter(scholar=scholar).select_related('publication')
        approved_pubs = [pa.publication for pa in pub_authors if pa.publication and pa.publication.status == 'APPROVED']

        total_citations = 0
        citation_counts = sorted([p.citationsCount or 0 for p in approved_pubs], reverse=True)

        h_index = 0
        for i, c in enumerate(citation_counts):
            if c >= i + 1:
                h_index = i + 1
            else:
                break

        raw_score_sum = 0
        for pub in approved_pubs:
            total_citations += (pub.citationsCount or 0)
            base_weight = TYPE_WEIGHTS.get(pub.type, 3)

            if pub.type == 'SCOPUS': base_weight = config.scopusWeight
            elif pub.type == 'WOS': base_weight = config.wosWeight
            elif pub.type == 'OAK': base_weight = config.oakWeight
            elif pub.type == 'MONOGRAPH': base_weight = config.monographWeight
            elif pub.type == 'PATENT': base_weight = config.patentWeight
            elif pub.type == 'CONFERENCE': base_weight = config.conferenceWeight

            bonus = config.q1Q2Bonus if pub.quartile in ['Q1', 'Q2'] else 0
            raw_score_sum += (base_weight + bonus)

        tiu_score = raw_score_sum + (total_citations * config.citationWeight)

        # Update fields directly using update() to bypass Django NOT NULL constraints on SQLite managed=False model save()
        from core.models import ScholarProfile
        ScholarProfile.objects.filter(pk=scholar.pk).update(
            hIndex=h_index,
            totalCitations=total_citations,
            tiuScore=round(float(tiu_score), 2)
        )
        scholar.refresh_from_db()
    except Exception as e:
        print(f"Error recalculating scholar metrics for {scholar.fullName}: {e}")
