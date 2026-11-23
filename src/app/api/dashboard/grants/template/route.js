import { NextResponse } from 'next/server';

export async function GET() {
  const templateText = `TOSHKENT XALQARO UNIVERSITETI (TIU)
ILMIY GRANT VA LOYIHA ARIZA SHABLONI HAMDA KO‘RSATMALARI
========================================================================

1. LOYIHA PASPORTI
- Loyiha nomi: [Qisqa, aniq va ilmiy yangilikni aks ettiruvchi sarlavha]
- Tanlov yo‘nalishi: [Amaliy / Fundamental / Innovatsion / Yosh olimlar]
- Grant beruvchi tashkilot: [Oliy ta'lim vazirligi / Innovatsion agentlik / Xorijiy fond]
- Loyiha rahbari (PI): [F.I.SH, Ilmiy darajasi, Kafedra, Aloqa ma'lumotlari]
- Loyiha davomiyligi: [12 / 24 / 36 oy]
- Jami so‘ralayotgan byudjet: [So‘m yoki Valyuta]

------------------------------------------------------------------------
2. DOLZARBLIK VA MUAMMO (Urgency & Problem Statement)
- Sohadagi mavjud global va mahalliy muammolar nimalardan iborat?
- Ushbu muammo hozirgacha nima uchun to‘liq hal etilmagan (Research Gap)?
- Loyiha dolzarbligi va O‘zbekiston iqtisodiyoti yoki faniga keltiradigan foydasi.

------------------------------------------------------------------------
3. MAQSAD VA VAZIFALAR (Aims & Specific Objectives)
- Loyihaning bosh strategik maqsadi (1 ta asosiy jumla).
- 3-5 ta ketma-ket aniq vazifalar (SMART kriteriyasi bo‘yicha: o‘lchanadigan va aniq).

------------------------------------------------------------------------
4. ILMIY YANGILIK VA KUTILAYOTGAN NATIJALAR (Novelty & Deliverables)
- Loyiha doirasida qanday yangi nazariya, model, dasturiy ta'minot yoki texnologiya yaratiladi?
- Kutilayotgan ilmiy mahsulotlar:
  * Scopus / Web of Science bazasidagi xalqaro maqolalar soni: [kamida 2-3 ta]
  * OAK ro‘yxatidagi maqolalar: [kamida 3 ta]
  * Mualliflik guvohnomasi yoki Patent: [1 ta]
  * Monografiya yoki o‘quv qo‘llanma: [1 ta]

------------------------------------------------------------------------
5. METODOLOGIYA VA ISH REJASI (Methodology & Gantt Schedule)
- Tadqiqotda qaysi ilmiy usullar, eksperimental modellar va tahliliy vositalardan foydalaniladi?
- Ish rejasi (Choraklar va oylar bo‘yicha Gantt diagrammasi):
  * 1-bosqich (1-6 oylar): Adabiyotlar, ma'lumot to‘plash, dastlabki modellar.
  * 2-bosqich (7-12 oylar): Eksperiment, algoritmlarni ishlab chiqish, oraliq hisobot.
  * 3-bosqich (13-24 oylar): Approbatsiya, xalqaro nashrlar, tijoratlashtirish.

------------------------------------------------------------------------
6. IJROCHI JAMOA VA ILMIY SALOHIYAT (Research Team Matrix)
- 1. Loyiha rahbari: [H-indeksi, Scopus maqolalari soni, avvalgi grant tajribasi]
- 2. Katta ilmiy xodim: [Metodologiya va tahlil ijrochisi]
- 3. Yetakchi muhandis / dasturchi: [Texnik ishlanma ijrochisi]
- 4. Yosh olim / Doktorant: [Eksperiment va ma'lumotlar yig‘uvchisi]

------------------------------------------------------------------------
7. SMETA VA MOLIYAVIY ASOSNOMA (Smart Budget Plan)
- 1. Mehnatga haq to‘lash fondi (Soliqlar bilan: 12% daromad + 12% ijtimoiy soliq)
- 2. Asbob-uskunalar va dasturiy ta'minot xaridi (Asoslangan holda)
- 3. Xizmat safarlari va dala tadqiqotlari xarajatlari
- 4. Sarflash materiallari va laboratoriya reaktivlari
- 5. Xalqaro nufuzli jurnallarda nashr qilish va patent to‘lovlari

------------------------------------------------------------------------
8. XAVFLAR VA ULARNI KAMAYTIRISH (Risk Mitigation)
- Ilmiy va texnik xatarlar va ularning muqobil yechimlari.
- Moliyaviy va tashkiliy kafolatlar.

------------------------------------------------------------------------
9. AMALIY AHAMIYATI VA TIJORATLASHTIRISH (Impact & Commercialization)
- Natijalarni qaysi vazirlik, korxona yoki tarmoqlarga joriy etish rejalashtirilgan?
- Kutilayotgan iqtisodiy samara va foydalanuvchilar doirasi.
`;

  return new NextResponse(templateText, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': 'attachment; filename="TIU_Grant_Ariza_Shabloni_va_Korsatmalari.doc"',
    },
  });
}
