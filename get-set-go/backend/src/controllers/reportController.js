const PDFDocument = require('pdfkit');
const timeEntryRepository = require('../repositories/timeEntryRepository');

const exportPdf = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const entries = await timeEntryRepository.findByUserAndDateRange(req.user._id, startDate, endDate);

    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=GetSetGo_Report.pdf');
    
    doc.pipe(res);

    doc.fontSize(20).text('Get Set Go - Time Report', { align: 'center' });
    doc.moveDown();

    let totalEarned = 0;
    let totalSeconds = 0;

    entries.forEach(entry => {
      const durationHours = entry.duration / 3600;
      const rate = entry.project ? entry.project.hourlyRate : 0;
      const earned = durationHours * rate;
      
      totalEarned += earned;
      totalSeconds += entry.duration;

      doc.fontSize(12).text(`Date: ${new Date(entry.startTime).toLocaleDateString()}`);
      doc.text(`Company: ${entry.company ? entry.company.name : 'N/A'}`);
      doc.text(`Project: ${entry.project ? entry.project.name : 'N/A'} (Rate: €${rate}/hr)`);
      doc.text(`Task: ${entry.task ? entry.task.name : 'N/A'}`);
      doc.text(`Description: ${entry.description}`);
      doc.text(`Duration: ${(durationHours).toFixed(2)} hrs`);
      doc.text(`Earned: €${earned.toFixed(2)}`);
      doc.moveDown();
    });

    doc.moveDown();
    doc.fontSize(16).text(`Total Time: ${(totalSeconds / 3600).toFixed(2)} hrs`, { align: 'right' });
    doc.text(`Total Earned: €${totalEarned.toFixed(2)}`, { align: 'right' });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Error generating PDF' });
  }
};

module.exports = { exportPdf };
