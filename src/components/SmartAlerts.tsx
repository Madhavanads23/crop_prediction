import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, AlertTriangle, TrendingUp, Cloud, Droplets, Thermometer, Wind } from "lucide-react";
import { motion } from "framer-motion";
import { farmingToasts } from "@/lib/toast-utils";

interface SmartAlert {
  id: string;
  type: 'weather' | 'market' | 'farming' | 'disease';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  actionRequired: boolean;
  timestamp: string;
  icon: any;
}

interface SmartAlertsProps {
  location: string;
  weatherData?: any;
  marketData?: any;
}

export function SmartAlerts({ location, weatherData, marketData }: SmartAlertsProps) {
  // Function to handle viewing alert details
  const handleViewDetails = (alert: SmartAlert) => {
    // Create a modal or detailed view for the alert
    const detailWindow = window.open('', '_blank', 'width=800,height=600');
    if (detailWindow) {
      detailWindow.document.write(`
        <html>
          <head>
            <title>Alert Details - ${alert.title}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; background: #f9fafb; }
              .header { background: #059669; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
              .content { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .priority { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
              .high { background: #fecaca; color: #991b1b; }
              .medium { background: #fde68a; color: #92400e; }
              .low { background: #bfdbfe; color: #1e40af; }
              .action-items { margin-top: 20px; padding: 15px; background: #f0f9ff; border-radius: 8px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${alert.title}</h1>
              <p>Location: ${location} | ${alert.timestamp}</p>
            </div>
            <div class="content">
              <div class="priority ${alert.priority}">${alert.priority.toUpperCase()} PRIORITY</div>
              <h3>Alert Details</h3>
              <p>${alert.message}</p>
              
              <div class="action-items">
                <h4>Recommended Actions:</h4>
                <ul>
                  ${alert.type === 'weather' ? `
                    <li>Check weather forecast for next 72 hours</li>
                    <li>Secure outdoor equipment and materials</li>
                    <li>Adjust irrigation schedule accordingly</li>
                    <li>Consider protective measures for crops</li>
                  ` : alert.type === 'market' ? `
                    <li>Review current inventory levels</li>
                    <li>Contact local buyers and dealers</li>
                    <li>Check transportation availability</li>
                    <li>Consider timing for optimal sales</li>
                  ` : alert.type === 'farming' ? `
                    <li>Prepare seeds and farming equipment</li>
                    <li>Check soil moisture and preparation</li>
                    <li>Schedule planting activities</li>
                    <li>Monitor weather conditions closely</li>
                  ` : `
                    <li>Inspect affected crop areas immediately</li>
                    <li>Consult with agricultural extension officer</li>
                    <li>Apply preventive treatments if needed</li>
                    <li>Monitor for early signs of issues</li>
                  `}
                </ul>
              </div>
            </div>
          </body>
        </html>
      `);
    }
    farmingToasts.alertViewed(alert.title);
  };

  // Function to handle taking action on alerts
  const handleTakeAction = (alert: SmartAlert) => {
    // Create action-specific functionality
    switch (alert.type) {
      case 'weather':
        // Open weather monitoring dashboard or external weather service
        window.open('https://openweathermap.org/', '_blank');
        farmingToasts.actionTaken(`Weather monitoring activated for ${alert.title}`);
        break;
      case 'market':
        // Open market price checking or trading platform
        const marketWindow = window.open('', '_blank', 'width=900,height=700');
        if (marketWindow) {
          marketWindow.document.write(`
            <html>
              <head>
                <title>Market Action Dashboard</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 20px; background: #f9fafb; }
                  .action-panel { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                  .btn { background: #059669; color: white; padding: 10px 20px; border: none; border-radius: 6px; margin: 5px; cursor: pointer; }
                  .btn:hover { background: #047857; }
                </style>
              </head>
              <body>
                <h1>Market Action Center</h1>
                <div class="action-panel">
                  <h3>Quick Actions for: ${alert.title}</h3>
                  <button class="btn" onclick="alert('Contacting local grain market...')">Contact Local Market</button>
                  <button class="btn" onclick="alert('Checking transportation options...')">Book Transportation</button>
                  <button class="btn" onclick="alert('Updating inventory records...')">Update Inventory</button>
                  <button class="btn" onclick="alert('Scheduling quality inspection...')">Schedule Inspection</button>
                </div>
                <div class="action-panel">
                  <h4>Current Market Status</h4>
                  <p><strong>Location:</strong> ${location}</p>
                  <p><strong>Alert:</strong> ${alert.message}</p>
                  <p><strong>Recommended Action:</strong> Monitor prices and prepare for optimal selling opportunity</p>
                </div>
              </body>
            </html>
          `);
        }
        farmingToasts.actionTaken(`Market analysis initiated for ${alert.title}`);
        break;
      case 'farming':
        // Open farming activity planner
        const farmingWindow = window.open('', '_blank', 'width=900,height=700');
        if (farmingWindow) {
          farmingWindow.document.write(`
            <html>
              <head>
                <title>Farming Activity Planner</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 20px; background: #f9fafb; }
                  .planner { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                  .task { padding: 10px; background: #f0fdf4; border-left: 4px solid #10b981; margin: 10px 0; border-radius: 4px; }
                  .btn { background: #059669; color: white; padding: 8px 16px; border: none; border-radius: 4px; margin: 5px; cursor: pointer; }
                </style>
              </head>
              <body>
                <h1>Farming Activity Planner</h1>
                <div class="planner">
                  <h3>${alert.title}</h3>
                  <p>${alert.message}</p>
                  <h4>Recommended Tasks:</h4>
                  <div class="task">🌱 Prepare seeds and planting materials</div>
                  <div class="task">🚜 Check and service farming equipment</div>
                  <div class="task">🌧️ Monitor soil moisture levels</div>
                  <div class="task">📅 Schedule planting timeline</div>
                  <div class="task">🔍 Test soil pH and nutrients</div>
                  <button class="btn" onclick="alert('Task marked as completed!')">Mark Task Complete</button>
                  <button class="btn" onclick="alert('Reminder set successfully!')">Set Reminder</button>
                  <button class="btn" onclick="alert('Equipment inspection scheduled!')">Schedule Equipment Check</button>
                </div>
              </body>
            </html>
          `);
        }
        farmingToasts.actionTaken(`Farming activities planned for ${alert.title}`);
        break;
      case 'disease':
        // Open disease management guide
        const diseaseWindow = window.open('', '_blank', 'width=900,height=700');
        if (diseaseWindow) {
          diseaseWindow.document.write(`
            <html>
              <head>
                <title>Disease Management Center</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 20px; background: #f9fafb; }
                  .management { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                  .treatment { padding: 15px; background: #fef2f2; border-left: 4px solid #ef4444; margin: 10px 0; border-radius: 4px; }
                  .prevention { padding: 15px; background: #f0fdf4; border-left: 4px solid #10b981; margin: 10px 0; border-radius: 4px; }
                  .btn { background: #dc2626; color: white; padding: 8px 16px; border: none; border-radius: 4px; margin: 5px; cursor: pointer; }
                </style>
              </head>
              <body>
                <h1>Disease & Pest Management</h1>
                <div class="management">
                  <h3>${alert.title}</h3>
                  <p><strong>Alert:</strong> ${alert.message}</p>
                  
                  <h4>Immediate Actions:</h4>
                  <div class="treatment">🔍 Inspect crops for early signs of infestation</div>
                  <div class="treatment">📞 Contact agricultural extension officer</div>
                  <div class="treatment">🧪 Apply recommended preventive treatments</div>
                  
                  <h4>Prevention Measures:</h4>
                  <div class="prevention">🌱 Monitor humidity levels regularly</div>
                  <div class="prevention">💧 Adjust irrigation to prevent waterlogging</div>
                  <div class="prevention">🍃 Ensure proper crop spacing for air circulation</div>
                  
                  <button class="btn" onclick="alert('Inspection scheduled for tomorrow!')">Schedule Inspection</button>
                  <button class="btn" onclick="alert('Expert consultation booked!')">Contact Expert</button>
                  <button class="btn" onclick="alert('Treatment plan activated!')">Apply Treatment</button>
                </div>
              </body>
            </html>
          `);
        }
        farmingToasts.actionTaken(`Disease management activated for ${alert.title}`);
        break;
      default:
        farmingToasts.actionTaken(alert.title);
    }
  };

  // Mock smart alerts (would come from AI analysis in real implementation)
  const alerts: SmartAlert[] = [
    {
      id: '1',
      type: 'weather',
      priority: 'high',
      title: 'Heavy Rainfall Alert',
      message: `Predicted 80mm rainfall in next 48 hours in ${location}. Consider harvesting mature crops.`,
      actionRequired: true,
      timestamp: '2 hours ago',
      icon: Droplets
    },
    {
      id: '2',
      type: 'market',
      priority: 'medium',
      title: 'Rice Price Surge',
      message: 'Rice prices increased by 12% in local markets. Good time to sell stored inventory.',
      actionRequired: false,
      timestamp: '6 hours ago',
      icon: TrendingUp
    },
    {
      id: '3',
      type: 'farming',
      priority: 'high',
      title: 'Optimal Planting Window',
      message: 'Weather conditions optimal for wheat sowing in next 5 days. Soil moisture ideal.',
      actionRequired: true,
      timestamp: '1 day ago',
      icon: Cloud
    },
    {
      id: '4',
      type: 'disease',
      priority: 'medium',
      title: 'Pest Risk Assessment',
      message: 'Brown planthopper risk elevated due to humidity levels. Monitor rice fields closely.',
      actionRequired: true,
      timestamp: '1 day ago',
      icon: AlertTriangle
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getPriorityBgColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 border-red-200';
      case 'medium': return 'bg-yellow-50 border-yellow-200';
      case 'low': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
    >
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-amber-600" />
              <div>
                <CardTitle className="text-amber-900">Smart Alerts & Recommendations</CardTitle>
                <CardDescription className="text-amber-700">
                  AI-powered insights and time-sensitive farming alerts
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-amber-100 text-amber-800">
              {alerts.filter(a => a.priority === 'high').length} High Priority
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {alerts.map((alert, idx) => {
            const IconComponent = alert.icon;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Alert className={`${getPriorityBgColor(alert.priority)} border-l-4`}>
                  <div className="flex items-start gap-3">
                    <IconComponent className="h-5 w-5 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{alert.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(alert.priority) as any} className="text-xs">
                            {alert.priority.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-gray-500">{alert.timestamp}</span>
                        </div>
                      </div>
                      <AlertDescription className="text-sm text-gray-700 mb-3">
                        {alert.message}
                      </AlertDescription>
                      {alert.actionRequired && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8"
                            onClick={() => handleViewDetails(alert)}
                          >
                            View Details
                          </Button>
                          <Button 
                            size="sm" 
                            className="h-8"
                            onClick={() => handleTakeAction(alert)}
                          >
                            Take Action
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Alert>
              </motion.div>
            );
          })}

          {/* Quick Weather Summary */}
          <div className="mt-6 p-4 bg-white rounded-lg border border-amber-200">
            <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Quick Weather Summary
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-gray-600">Temperature</p>
                  <p className="font-medium">28°C</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-gray-600">Humidity</p>
                  <p className="font-medium">75%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-gray-600">Rainfall</p>
                  <p className="font-medium">15mm</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-gray-600">Wind Speed</p>
                  <p className="font-medium">12 km/h</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}