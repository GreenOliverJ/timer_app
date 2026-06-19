const PDFDocument = require('pdfkit');
const timeEntryRepository = require('../repositories/timeEntryRepository');

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const colors = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3',
  '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39',
  '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
];

const fetchImage = async (config) => {
  const url = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(config))}&w=800&h=400&bkg=white&f=png`;
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

const exportPdf = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const entries = await timeEntryRepository.findByUserAndDateRange(req.user._id, startDate, endDate);

    // Data Aggregation
    let totalSeconds = 0;
    let totalEarned = 0;
    const projectMap = {}; // name -> { duration, color, earned, tasks }
    const dailyMap = {}; // dateString -> { projectName: durationHours }
    
    // Sort chronologically
    const sortedEntries = [...entries].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    const allDatesSet = new Set();
    
    sortedEntries.forEach(entry => {
      totalSeconds += entry.duration;
      const durationHours = entry.duration / 3600;
      const projName = entry.project ? entry.project.name : 'Without Project';
      const rate = entry.project ? entry.project.hourlyRate : 0;
      const earned = durationHours * rate;
      totalEarned += earned;
      
      if (!projectMap[projName]) {
        projectMap[projName] = { duration: 0, color: colors[Object.keys(projectMap).length % colors.length], earned: 0, tasks: {} };
      }
      projectMap[projName].duration += entry.duration;
      projectMap[projName].earned += earned;
      
      const taskName = entry.task ? entry.task.name : 'Without Task';
      if (!projectMap[projName].tasks[taskName]) {
        projectMap[projName].tasks[taskName] = 0;
      }
      projectMap[projName].tasks[taskName] += entry.duration;
      
      const dateStr = new Date(entry.startTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      allDatesSet.add(dateStr);
      
      if (!dailyMap[dateStr]) dailyMap[dateStr] = {};
      if (!dailyMap[dateStr][projName]) dailyMap[dateStr][projName] = 0;
      dailyMap[dateStr][projName] += durationHours;
    });

    const allDates = Array.from(allDatesSet);

    let barImageBuffer = null;
    let donutImageBuffer = null;

    if (totalSeconds > 0) {
      // Bar Chart Config
      const barDatasets = Object.keys(projectMap).map(projName => {
        return {
          label: projName,
          backgroundColor: projectMap[projName].color,
          data: allDates.map(d => dailyMap[d]?.[projName] || 0)
        }
      });

      const barChartConfig = {
        type: 'bar',
        data: { labels: allDates, datasets: barDatasets },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: { stacked: true, grid: { display: false } },
            y: { stacked: true, beginAtZero: true, border: { display: false } }
          }
        }
      };

      // Donut Chart Config
      const donutConfig = {
        type: 'doughnut',
        data: {
          labels: Object.keys(projectMap),
          datasets: [{
            data: Object.keys(projectMap).map(p => projectMap[p].duration / 3600),
            backgroundColor: Object.keys(projectMap).map(p => projectMap[p].color),
            borderWidth: 0
          }]
        },
        options: {
          plugins: {
            legend: { display: false },
            doughnutlabel: {
              labels: [{ text: formatDuration(totalSeconds), font: { size: '20', weight: 'bold' } }]
            }
          },
          cutoutPercentage: 65
        }
      };

      // Fetch images in parallel
      [barImageBuffer, donutImageBuffer] = await Promise.all([
        fetchImage(barChartConfig),
        fetchImage(donutConfig)
      ]);
    }

    // Generate PDF Document
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=GetSetGo_Report.pdf');
    doc.pipe(res);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#000000').text('Summary report', 50, 50);
    doc.fontSize(24).fillColor('#78909C').text('Get Set Go', 400, 50, { align: 'right' });
    
    doc.fillColor('#666666').fontSize(12).font('Helvetica').text(`${startDate || 'All Time'} - ${endDate || 'Now'}`, 50, 85);
    doc.fillColor('#000000').fontSize(16).text(`Total: ${formatDuration(totalSeconds)}    Amount: ${totalEarned.toFixed(2)}€`, 50, 115);
    
    // Embed Bar Chart
    if (totalSeconds > 0 && barImageBuffer) {
      doc.image(barImageBuffer, 50, 150, { width: 500 });
      
      // Middle section (Project list)
      doc.fontSize(16).font('Helvetica-Bold').text('Project', 50, 420);
      doc.moveTo(50, 440).lineTo(540, 440).strokeColor('#dddddd').stroke();
      
      // Embed Donut Chart
      if (donutImageBuffer) {
        doc.image(donutImageBuffer, 50, 460, { width: 180 });
      }
      
      // Project Legend
      let y = 470;
      Object.keys(projectMap).forEach(projName => {
        const proj = projectMap[projName];
        const percentage = ((proj.duration / totalSeconds) * 100).toFixed(2);
        
        doc.circle(260, y + 4, 4).fill(proj.color);
        doc.fillColor('#000000').font('Helvetica-Bold').fontSize(10).text(projName, 275, y);
        
        doc.font('Helvetica-Bold').text(`${proj.earned.toFixed(2)}€`, 350, y, { width: 60, align: 'right' });
        doc.font('Helvetica').text(formatDuration(proj.duration), 420, y, { width: 60, align: 'right' });
        doc.fillColor('#666666').text(`${percentage}%`, 490, y, { width: 50, align: 'right' });
        
        y += 15;
        
        // Print Tasks
        Object.keys(proj.tasks).forEach(taskName => {
          const taskDuration = proj.tasks[taskName];
          doc.fillColor('#666666').font('Helvetica').fontSize(9).text(`- ${taskName}`, 285, y);
          doc.text(formatDuration(taskDuration), 420, y, { width: 60, align: 'right' });
          y += 12;
        });

        y += 5;
        doc.moveTo(260, y).lineTo(540, y).strokeColor('#eeeeee').stroke();
        y += 10;
        
        // Add new page if list gets too long
        if (y > 750) {
          doc.addPage();
          y = 50;
        }
      });
    } else {
      doc.moveDown(5);
      doc.fontSize(14).font('Helvetica').text('No time entries found for this period.', { align: 'center' });
    }

    // Footer
    const pages = doc.bufferedPageRange ? doc.bufferedPageRange().count : 1;
    doc.fontSize(10).fillColor('#333333').text(`Oliver Green's workspace   Created with Get Set Go   1`, 50, 780, { align: 'right' });

    doc.end();
  } catch (error) {
    console.error("PDF Generation Error:", error);
    res.status(500).json({ message: 'Error generating PDF' });
  }
};

module.exports = { exportPdf };
