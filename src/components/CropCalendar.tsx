import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Clock, Leaf, Droplets } from "lucide-react";
import { motion } from "framer-motion";
import { farmingToasts } from "@/lib/toast-utils";

interface CropActivity {
  id: string;
  crop: string;
  activity: string;
  timing: string;
  priority: 'high' | 'medium' | 'low';
  status: 'upcoming' | 'current' | 'completed';
  description: string;
  weatherDependency: boolean;
}

interface CropCalendarProps {
  selectedCrops: string[];
  location: string;
}

export function CropCalendar({ selectedCrops, location }: CropCalendarProps) {
  // Function to handle marking activity as complete
  const handleMarkComplete = (activity: CropActivity) => {
    // Update activity status and provide feedback
    const completionWindow = window.open('', '_blank', 'width=600,height=500');
    if (completionWindow) {
      completionWindow.document.write(`
        <html>
          <head>
            <title>Activity Completed</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 30px; background: #f0fdf4; text-align: center; }
              .success-card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px; margin: 0 auto; }
              .checkmark { color: #10b981; font-size: 48px; margin-bottom: 20px; }
              .btn { background: #10b981; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; margin: 10px; }
              .btn:hover { background: #059669; }
            </style>
          </head>
          <body>
            <div class="success-card">
              <div class="checkmark">✅</div>
              <h2>Activity Completed!</h2>
              <p><strong>${activity.crop} - ${activity.activity}</strong></p>
              <p>Great job! This activity has been marked as completed.</p>
              <p><em>Location: ${location}</em></p>
              <p><small>Completed on: ${new Date().toLocaleDateString()}</small></p>
              <button class="btn" onclick="window.close()">Close</button>
            </div>
          </body>
        </html>
      `);
    }
    farmingToasts.activityCompleted(activity.crop, activity.activity);
  };

  // Function to view activity guide
  const handleViewGuide = (activity: CropActivity) => {
    const guideWindow = window.open('', '_blank', 'width=800,height=700');
    if (guideWindow) {
      guideWindow.document.write(`
        <html>
          <head>
            <title>${activity.activity} Guide - ${activity.crop}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 30px; line-height: 1.6; background: #f9fafb; }
              .guide-header { background: #10b981; color: white; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
              .step { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #10b981; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .warning { background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 15px 0; }
              .tip { background: #dbeafe; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; margin: 15px 0; }
            </style>
          </head>
          <body>
            <div class="guide-header">
              <h1>${activity.crop} - ${activity.activity} Guide</h1>
              <p>Location: ${location} | Priority: ${activity.priority.toUpperCase()}</p>
            </div>

            <div class="step">
              <h3>📋 Overview</h3>
              <p>${activity.description}</p>
              <p><strong>Timing:</strong> ${activity.timing}</p>
              <p><strong>Weather Dependency:</strong> ${activity.weatherDependency ? 'Yes - Monitor weather conditions' : 'No'}</p>
            </div>

            <div class="step">
              <h3>🚀 Step-by-Step Instructions</h3>
              ${activity.activity === 'Land Preparation' ? `
                <ol>
                  <li>Clear the field of weeds and crop residues</li>
                  <li>Test soil pH and nutrient levels</li>
                  <li>Apply organic matter or fertilizers as needed</li>
                  <li>Plow the field to 15-20cm depth</li>
                  <li>Level the field and create proper drainage</li>
                  <li>Allow soil to settle for 7-10 days before planting</li>
                </ol>
              ` : activity.activity === 'Seed Selection' ? `
                <ol>
                  <li>Choose certified seeds from reputable suppliers</li>
                  <li>Select varieties suitable for local climate</li>
                  <li>Check seed germination rate (should be >85%)</li>
                  <li>Treat seeds with appropriate fungicides</li>
                  <li>Store seeds in cool, dry conditions</li>
                  <li>Calculate required seed quantity per hectare</li>
                </ol>
              ` : activity.activity === 'Transplanting' ? `
                <ol>
                  <li>Prepare nursery beds 30 days before transplanting</li>
                  <li>Select healthy seedlings (20-25 days old)</li>
                  <li>Maintain 2-3 cm water level in field</li>
                  <li>Transplant 2-3 seedlings per hill</li>
                  <li>Maintain 20x15 cm spacing between plants</li>
                  <li>Complete transplanting within 7-10 days</li>
                </ol>
              ` : `
                <ol>
                  <li>Follow recommended agricultural practices</li>
                  <li>Monitor weather conditions regularly</li>
                  <li>Maintain proper timing for optimal results</li>
                  <li>Use quality inputs and materials</li>
                  <li>Keep detailed records of activities</li>
                  <li>Consult experts when needed</li>
                </ol>
              `}
            </div>

            ${activity.weatherDependency ? `
              <div class="warning">
                <h4>⚠️ Weather Considerations</h4>
                <p>This activity is weather-dependent. Check forecast and avoid during:</p>
                <ul>
                  <li>Heavy rainfall or storms</li>
                  <li>Extreme temperatures</li>
                  <li>High wind conditions</li>
                  <li>Drought periods (ensure irrigation)</li>
                </ul>
              </div>
            ` : ''}

            <div class="tip">
              <h4>💡 Pro Tips</h4>
              <ul>
                <li>Maintain detailed records of all activities</li>
                <li>Use quality tools and equipment</li>
                <li>Follow integrated pest management practices</li>
                <li>Consider sustainable farming methods</li>
                <li>Network with other farmers for knowledge sharing</li>
              </ul>
            </div>
          </body>
        </html>
      `);
    }
    farmingToasts.alertViewed(`${activity.activity} Guide`);
  };

  // Function to set reminder
  const handleSetReminder = (activity: CropActivity) => {
    // Set browser notification if supported
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          // Schedule notification for near future (demo purposes - 5 seconds)
          setTimeout(() => {
            new Notification(`AgriSmart Reminder: ${activity.crop}`, {
              body: `Time for ${activity.activity}. Location: ${location}`,
              icon: '/logo.png'
            });
          }, 5000);
        }
      });
    }

    // Also create a calendar reminder file
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + 1); // Set for tomorrow

    const calendarContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AgriSmart//Farming Reminder//EN

BEGIN:VEVENT
UID:reminder-${activity.id}-${Date.now()}@agrismart.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${reminderDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${new Date(reminderDate.getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${activity.crop} - ${activity.activity}
DESCRIPTION:${activity.description}\\n\\nLocation: ${location}\\nPriority: ${activity.priority.toUpperCase()}\\n\\nGenerated by AgriSmart Advisor
LOCATION:${location}
BEGIN:VALARM
TRIGGER:-PT1H
DESCRIPTION:Reminder: ${activity.crop} - ${activity.activity}
ACTION:DISPLAY
END:VALARM
END:VEVENT

END:VCALENDAR`;

    const blob = new Blob([calendarContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AgriSmart_Reminder_${activity.crop}_${activity.activity.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    farmingToasts.reminderSet(activity.crop, activity.activity, activity.timing);
  };

  // Mock crop calendar activities (would be dynamically generated based on selected crops)
  const activities: CropActivity[] = [
    {
      id: '1',
      crop: 'Rice',
      activity: 'Land Preparation',
      timing: 'Next 7 days',
      priority: 'high',
      status: 'current',
      description: 'Plow fields and prepare seedbed. Ensure proper drainage.',
      weatherDependency: true
    },
    {
      id: '2',
      crop: 'Wheat',
      activity: 'Seed Selection',
      timing: 'Next 14 days',
      priority: 'medium',
      status: 'upcoming',
      description: 'Choose high-yielding varieties suitable for local conditions.',
      weatherDependency: false
    },
    {
      id: '3',
      crop: 'Rice',
      activity: 'Transplanting',
      timing: '15-20 days',
      priority: 'high',
      status: 'upcoming',
      description: 'Transplant 21-day old seedlings with 20cm spacing.',
      weatherDependency: true
    },
    {
      id: '4',
      crop: 'Cotton',
      activity: 'Fertilizer Application',
      timing: '30 days',
      priority: 'medium',
      status: 'upcoming',
      description: 'Apply basal dose of NPK fertilizer before sowing.',
      weatherDependency: false
    },
    {
      id: '5',
      crop: 'Wheat',
      activity: 'Irrigation Setup',
      timing: 'Next 21 days',
      priority: 'high',
      status: 'upcoming',
      description: 'Prepare irrigation channels and check water availability.',
      weatherDependency: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'bg-green-100 text-green-800 border-green-200';
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const currentActivities = activities.filter(a => a.status === 'current');
  const upcomingActivities = activities.filter(a => a.status === 'upcoming');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-emerald-600" />
              <div>
                <CardTitle className="text-emerald-900">Smart Crop Calendar</CardTitle>
                <CardDescription className="text-emerald-700">
                  Personalized farming schedule for {location}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-emerald-100 text-emerald-800">
              {currentActivities.length} Active Tasks
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Activities */}
          <div>
            <h3 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Current Activities
            </h3>
            <div className="space-y-3">
              {currentActivities.map((activity, idx) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 bg-white rounded-lg border border-emerald-200 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Leaf className="h-5 w-5 text-emerald-600" />
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {activity.crop} - {activity.activity}
                        </h4>
                        <p className="text-sm text-gray-600">{activity.timing}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {activity.weatherDependency && (
                        <Badge variant="outline" className="text-xs bg-blue-50">
                          <Droplets className="h-3 w-3 mr-1" />
                          Weather Dependent
                        </Badge>
                      )}
                      <Badge className={getPriorityColor(activity.priority)}>
                        {activity.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{activity.description}</p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="h-8"
                      onClick={() => handleMarkComplete(activity)}
                    >
                      Mark Complete
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8"
                      onClick={() => handleViewGuide(activity)}
                    >
                      View Guide
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8"
                      onClick={() => handleSetReminder(activity)}
                    >
                      Set Reminder
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Upcoming Activities */}
          <div>
            <h3 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Activities
            </h3>
            <div className="grid gap-3">
              {upcomingActivities.map((activity, idx) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="p-3 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <h5 className="font-medium text-gray-900">
                          {activity.crop} - {activity.activity}
                        </h5>
                        <p className="text-xs text-gray-600">{activity.timing}</p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(activity.status)} text-xs`}>
                      {activity.status.toUpperCase()}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Monthly Overview */}
          <div className="mt-6 p-4 bg-white rounded-lg border border-emerald-200">
            <h4 className="font-semibold text-emerald-900 mb-3">This Month's Focus</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="font-medium">3 Tasks Completed</p>
                  <p className="text-gray-600">Land preparation done</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="font-medium">5 Tasks Pending</p>
                  <p className="text-gray-600">Seed selection, irrigation</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="font-medium">2 Weather Alerts</p>
                  <p className="text-gray-600">Monitor rainfall patterns</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}