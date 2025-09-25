import { toast } from "sonner";

export const showToast = {
  success: (message: string) => {
    toast.success(message);
  },
  
  info: (message: string) => {
    toast.info(message);
  },
  
  warning: (message: string) => {
    toast.warning(message);
  },
  
  error: (message: string) => {
    toast.error(message);
  }
};

export const farmingToasts = {
  activityCompleted: (crop: string, activity: string) => {
    toast.success(`✅ ${crop} - ${activity} completed!`, {
      description: "Your farming schedule has been updated."
    });
  },
  
  reminderSet: (crop: string, activity: string, timing: string) => {
    toast.info(`⏰ Reminder set for ${crop} - ${activity}`, {
      description: `You'll be notified ${timing}`
    });
  },
  
  alertViewed: (title: string) => {
    toast.info(`📋 Viewing details: ${title}`, {
      description: "Check the alert for more information"
    });
  },
  
  actionTaken: (title: string) => {
    toast.success(`✅ Action initiated: ${title}`, {
      description: "Your farming action has been recorded"
    });
  },
  
  reportGenerated: (type: string, format: string) => {
    toast.success(`📊 ${type} report generated!`, {
      description: `Your ${format} report is ready for download`
    });
  },
  
  linkShared: () => {
    toast.success("🔗 Link copied to clipboard!", {
      description: "Share your agricultural analysis with others"
    });
  }
};