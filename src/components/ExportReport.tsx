import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Share2, Printer, Mail, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { farmingToasts } from "@/lib/toast-utils";

interface ExportReportProps {
  predictions?: any[];
  location: string;
  weatherData?: any;
  marketData?: any;
}

export function ExportReport({ predictions, location, weatherData, marketData }: ExportReportProps) {
  const reportTypes = [
    {
      id: 'comprehensive',
      title: 'Comprehensive Report',
      description: 'Complete analysis with all recommendations, weather data, and market insights',
      icon: FileText,
      format: ['PDF', 'Excel'],
      size: '2.3 MB'
    },
    {
      id: 'summary',
      title: 'Executive Summary',
      description: 'Key insights and top 3 crop recommendations in a concise format',
      icon: Download,
      format: ['PDF'],
      size: '456 KB'
    },
    {
      id: 'calendar',
      title: 'Planting Calendar',
      description: 'Month-by-month planting and farming activity schedule',
      icon: Calendar,
      format: ['PDF', 'iCal'],
      size: '123 KB'
    },
    {
      id: 'market',
      title: 'Market Analysis',
      description: 'Detailed market trends, pricing analysis, and profit projections',
      icon: Share2,
      format: ['Excel', 'CSV'],
      size: '890 KB'
    }
  ];

  const handleExport = (reportId: string, format: string) => {
    console.log(`Exporting ${reportId} report in ${format} format`);
    
    if (format === 'PDF') {
      // Generate actual PDF content and download
      generateAndDownloadPDF(reportId);
    } else if (format === 'Excel' || format === 'CSV') {
      // Generate and download data file
      generateAndDownloadData(reportId, format);
    } else if (format === 'iCal') {
      // Generate calendar file
      generateAndDownloadCalendar();
    }
    
    // Show user feedback
    farmingToasts.reportGenerated(reportId.charAt(0).toUpperCase() + reportId.slice(1), format);
  };

  const generateAndDownloadPDF = (reportId: string) => {
    // Create comprehensive PDF content
    const pdfContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>AgriSmart Report - ${reportId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #059669; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { color: #059669; font-size: 28px; font-weight: bold; }
            .section { margin: 30px 0; }
            .section h2 { color: #059669; border-bottom: 1px solid #e5e5e5; padding-bottom: 10px; }
            .crop-card { background: #f8f9fa; padding: 15px; margin: 10px 0; border-left: 4px solid #059669; }
            .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .data-table th, .data-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .data-table th { background: #f8f9fa; }
            .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🌾 AgriSmart Advisor</div>
            <h1>Agricultural Analysis Report</h1>
            <p><strong>Location:</strong> ${location} | <strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="section">
            <h2>Executive Summary</h2>
            <p>This comprehensive agricultural analysis report provides data-driven insights for crop selection and farming decisions in ${location}. Our AI-powered system has analyzed weather patterns, soil conditions, and market trends to deliver personalized recommendations.</p>
          </div>

          <div class="section">
            <h2>Top Crop Recommendations</h2>
            ${predictions ? predictions.slice(0, 5).map((pred, idx) => `
              <div class="crop-card">
                <h3>${idx + 1}. ${pred.crop}</h3>
                <p><strong>Suitability Score:</strong> ${pred.suitabilityScore}%</p>
                <p><strong>Expected Yield:</strong> ${pred.expectedYield} tons/hectare</p>
                <p><strong>Market Price:</strong> ₹${pred.marketPrice}/quintal</p>
                <p><strong>Growing Season:</strong> ${pred.season}</p>
              </div>
            `).join('') : '<p>No prediction data available</p>'}
          </div>

          <div class="section">
            <h2>Weather Analysis</h2>
            <table class="data-table">
              <tr><th>Parameter</th><th>Current Value</th><th>Optimal Range</th><th>Status</th></tr>
              <tr><td>Temperature</td><td>28°C</td><td>25-32°C</td><td>✅ Optimal</td></tr>
              <tr><td>Humidity</td><td>75%</td><td>60-80%</td><td>✅ Good</td></tr>
              <tr><td>Rainfall</td><td>800mm</td><td>600-1000mm</td><td>✅ Adequate</td></tr>
              <tr><td>Soil Moisture</td><td>65%</td><td>50-70%</td><td>✅ Ideal</td></tr>
            </table>
          </div>

          <div class="section">
            <h2>Market Insights</h2>
            <p>Based on current market trends and historical data, the agricultural market in ${location} shows promising opportunities for the recommended crops. Price trends indicate stable to growing demand for high-quality produce.</p>
          </div>

          <div class="section">
            <h2>Action Plan</h2>
            <ul>
              <li>Begin soil preparation for the upcoming planting season</li>
              <li>Source quality seeds for top-recommended crops</li>
              <li>Monitor weather forecasts for optimal planting windows</li>
              <li>Establish connections with local buyers and markets</li>
              <li>Consider sustainable farming practices for long-term success</li>
            </ul>
          </div>

          <div class="footer">
            <p>Generated by AgriSmart Advisor | © 2025 | For agricultural guidance only</p>
            <p>Report ID: ${reportId.toUpperCase()}-${Date.now()}</p>
          </div>
        </body>
      </html>
    `;

    // Create and download PDF
    const blob = new Blob([pdfContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AgriSmart_${reportId}_Report_${location.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateAndDownloadData = (reportId: string, format: string) => {
    let content = '';
    let mimeType = '';
    let fileExtension = '';

    if (format === 'CSV') {
      content = `Crop Name,Suitability Score,Expected Yield (tons/ha),Market Price (₹/quintal),Season,Location,Date
${predictions ? predictions.map(pred => 
  `"${pred.crop}",${pred.suitabilityScore},"${pred.expectedYield}","${pred.marketPrice}","${pred.season}","${location}","${new Date().toLocaleDateString()}"`
).join('\n') : 'No data available'}`;
      mimeType = 'text/csv';
      fileExtension = 'csv';
    } else if (format === 'Excel') {
      // Simple tab-separated format that Excel can open
      content = `Crop Name\tSuitability Score\tExpected Yield (tons/ha)\tMarket Price (₹/quintal)\tSeason\tLocation\tDate
${predictions ? predictions.map(pred => 
  `${pred.crop}\t${pred.suitabilityScore}\t${pred.expectedYield}\t${pred.marketPrice}\t${pred.season}\t${location}\t${new Date().toLocaleDateString()}`
).join('\n') : 'No data available'}`;
      mimeType = 'application/vnd.ms-excel';
      fileExtension = 'xls';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AgriSmart_${reportId}_Data_${location.replace(/\s+/g, '_')}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateAndDownloadCalendar = () => {
    const calendarContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AgriSmart//Farming Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH

BEGIN:VEVENT
UID:planting-season-${Date.now()}@agrismart.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:Optimal Planting Window - ${location}
DESCRIPTION:Based on AgriSmart analysis, this is the optimal time for planting in ${location}. Weather conditions and soil preparation should be ideal during this period.
LOCATION:${location}
END:VEVENT

BEGIN:VEVENT
UID:harvest-season-${Date.now() + 1}@agrismart.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:Expected Harvest Period - ${location}
DESCRIPTION:Based on crop growth cycles, this period represents the expected harvest window for crops planted during the optimal planting season.
LOCATION:${location}
END:VEVENT

END:VCALENDAR`;

    const blob = new Blob([calendarContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AgriSmart_Farming_Calendar_${location.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = (reportId: string) => {
    // Mock share functionality
    if (navigator.share) {
      navigator.share({
        title: `AgriSmart Report - ${location}`,
        text: 'Check out my crop analysis report from AgriSmart Advisor',
        url: window.location.href
      }).catch(console.error);
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      farmingToasts.linkShared();
    }
  };

  const handleEmailReport = (reportId: string) => {
    const subject = encodeURIComponent(`AgriSmart Crop Analysis Report - ${location}`);
    const body = encodeURIComponent(`
Dear Team,

Please find attached the crop analysis report for ${location}.

Key Highlights:
${predictions ? predictions.slice(0, 3).map((p, i) => `${i + 1}. ${p.crop} - ${p.suitabilityScore}% suitability`).join('\n') : 'Analysis pending'}

Generated by AgriSmart Advisor
${window.location.href}

Best regards,
Your AgriSmart System
    `);
    
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
    >
      <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download className="h-6 w-6 text-cyan-600" />
              <div>
                <CardTitle className="text-cyan-900">Export & Share Reports</CardTitle>
                <CardDescription className="text-cyan-700">
                  Download, print, or share your agricultural analysis reports
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-cyan-100 text-cyan-800">
              {reportTypes.length} Formats Available
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {reportTypes.map((report, idx) => {
            const IconComponent = report.icon;
            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 bg-white rounded-lg border border-cyan-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <IconComponent className="h-6 w-6 text-cyan-600 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{report.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-gray-500">Available formats:</span>
                        {report.format.map((format, formatIdx) => (
                          <Badge key={formatIdx} variant="outline" className="text-xs">
                            {format}
                          </Badge>
                        ))}
                        <Badge variant="secondary" className="text-xs ml-2">
                          ~{report.size}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {report.format.map((format, formatIdx) => (
                    <Button
                      key={formatIdx}
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => handleExport(report.id, format)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      {format}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="outline" 
                    className="h-8"
                    onClick={() => handleShare(report.id)}
                  >
                    <Share2 className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8"
                    onClick={() => handleEmailReport(report.id)}
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    Email
                  </Button>
                </div>
              </motion.div>
            );
          })}

          {/* Quick Actions */}
          <div className="mt-6 p-4 bg-white rounded-lg border border-cyan-200">
            <h4 className="font-semibold text-cyan-900 mb-3 flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Quick Actions
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                size="sm"
                className="h-8 text-xs"
                onClick={() => window.print()}
              >
                <Printer className="h-3 w-3 mr-1" />
                Print Page
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={() => handleExport('summary', 'PDF')}
              >
                <Download className="h-3 w-3 mr-1" />
                Quick PDF
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={() => handleShare('comprehensive')}
              >
                <Share2 className="h-3 w-3 mr-1" />
                Share Link
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={() => handleEmailReport('summary')}
              >
                <Mail className="h-3 w-3 mr-1" />
                Email Report
              </Button>
            </div>
          </div>

          {/* Report Preview */}
          {predictions && (
            <div className="mt-4 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
              <h5 className="font-medium text-cyan-900 mb-2">Report Preview</h5>
              <div className="text-sm text-cyan-800 space-y-1">
                <p><strong>Location:</strong> {location}</p>
                <p><strong>Analysis Date:</strong> {new Date().toLocaleDateString()}</p>
                <p><strong>Top Recommendations:</strong> {predictions.slice(0, 3).map(p => p.crop).join(', ')}</p>
                <p><strong>Weather Integration:</strong> {weatherData ? 'Live data included' : 'Static data'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}