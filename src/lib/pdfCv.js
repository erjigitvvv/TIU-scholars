import jsPDF from 'jspdf'
import 'jspdf-autotable'

export function generatePdfCv(scholar) {
  const doc = new jsPDF()

  // Primary Colors (Academic Navy & Blue)
  const primaryColor = [15, 41, 74] // #0F294A
  const accentColor = [29, 78, 216] // #1D4ED8
  const neutralDark = [30, 41, 59]  // #1E293B

  // Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(0, 0, 210, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text(scholar.fullName, 14, 20)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text('Tashkent International University — Academic Curriculum Vitae', 14, 28)

  let y = 50

  // Contact & Affiliation
  doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2])
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Academic Affiliation & Contact', 14, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  const deptName = scholar.department?.nameEn || 'Department'
  const facultyName = scholar.department?.faculty?.nameEn || 'Faculty'
  doc.text(`Department: ${deptName} (${facultyName})`, 14, y)
  y += 5
  doc.text(`Degree & Title: ${scholar.academicDegree || 'NONE'} • ${scholar.academicTitle || 'NONE'}`, 14, y)
  y += 5
  doc.text(`Email: ${scholar.publicEmail || scholar.user?.email || 'N/A'}`, 14, y)
  y += 5
  doc.text(`ORCID: ${scholar.orcidId || 'N/A'}  |  Scopus ID: ${scholar.scopusId || 'N/A'}`, 14, y)
  y += 10

  // Scientific Metrics Box
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(14, y, 182, 18, 2, 2, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2])
  doc.text(`H-INDEX: ${scholar.hIndex}`, 20, y + 11)
  doc.text(`TOTAL CITATIONS: ${scholar.totalCitations}`, 70, y + 11)
  doc.text(`PUBLICATIONS: ${scholar.publications?.length || 0}`, 130, y + 11)
  doc.text(`TIU SCORE: ${scholar.tiuScore}`, 170, y + 11)
  y += 26

  // Biography
  if (scholar.bioEn || scholar.bioUz) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2])
    doc.text('Biography', 14, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const bioText = scholar.bioEn || scholar.bioUz || ''
    const splitBio = doc.splitTextToSize(bioText, 182)
    doc.text(splitBio, 14, y)
    y += (splitBio.length * 5) + 8
  }

  // Publications Table
  if (scholar.publications && scholar.publications.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(`Approved Publications (${scholar.publications.length})`, 14, y)
    y += 4

    const pubRows = scholar.publications.map((p, idx) => [
      idx + 1,
      p.title,
      p.journalOrPublisher || 'N/A',
      p.year,
      p.type
    ])

    doc.autoTable({
      startY: y,
      head: [['#', 'Title', 'Journal / Publisher', 'Year', 'Type']],
      body: pubRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 41, 74], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
      columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 80 }, 2: { cellWidth: 50 }, 3: { cellWidth: 15 }, 4: { cellWidth: 27 } },
      margin: { left: 14, right: 14 }
    })

    y = doc.lastAutoTable.finalY + 12
  }

  // Grants
  if (scholar.grantProjects && scholar.grantProjects.length > 0) {
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(`Grants & Projects (${scholar.grantProjects.length})`, 14, y)
    y += 4

    const grantRows = scholar.grantProjects.map((g, idx) => [
      idx + 1,
      g.title,
      g.fundingSource,
      `${g.startYear} - ${g.endYear || 'Present'}`
    ])

    doc.autoTable({
      startY: y,
      head: [['#', 'Project Title', 'Funding Source', 'Duration']],
      body: grantRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 41, 74], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
      margin: { left: 14, right: 14 }
    })

    y = doc.lastAutoTable.finalY + 12
  }

  // Supervisions
  if (scholar.supervisions && scholar.supervisions.length > 0) {
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(`PhD / DSc Supervisions (${scholar.supervisions.length})`, 14, y)
    y += 4

    const supRows = scholar.supervisions.map((s, idx) => [
      idx + 1,
      s.studentName,
      s.degreeType,
      s.dissertationTitle,
      s.year
    ])

    doc.autoTable({
      startY: y,
      head: [['#', 'Student', 'Degree', 'Dissertation Title', 'Year']],
      body: supRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 41, 74], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
      margin: { left: 14, right: 14 }
    })
  }

  // Save PDF
  const filename = `${scholar.fullName.replace(/\\s+/g, '_')}_CV.pdf`
  doc.save(filename)
}
