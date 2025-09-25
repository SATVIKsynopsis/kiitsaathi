import { useEffect, useState } from "react";
import { restoreServicesDirectly } from "@/utils/adminCommands";

export const AdminCommandExecutor = () => {
  const [executed, setExecuted] = useState(false);

  useEffect(() => {
    if (!executed) {
      const executeRestoreCommand = async () => {
        try {
          console.log('🔧 Executing admin command: Restore the hidden services');
          const result = await restoreServicesDirectly();
          
          if (result.success) {
            console.log('✅ Services restored successfully:', {
              restoredServices: result.restored_services,
              message: result.message
            });
            console.log('📋 The following services are now visible on homepage:');
            console.log('- Senior Connect');
            console.log('- Handwritten Assignments');
            console.log('- Tutoring & Counselling');
            console.log('- Campus Tour Booking');
            console.log('- Carton Packing & Hostel Transfers');
            console.log('- Book Buyback & Resale');
            console.log('- KIIT Saathi Celebrations');
            console.log('- KIIT Saathi Meetups');
            console.log('- Food and micro-essentials delivery');
            console.log('🔄 Printout on Demand restored to normal functionality');
            console.log('🔗 All services are now accessible and visible');
          } else {
            console.error('❌ Admin command failed:', result.error);
          }
          
          setExecuted(true);
        } catch (error) {
          console.error('💥 Failed to execute admin command:', error);
          setExecuted(true);
        }
      };

      executeRestoreCommand();
    }
  }, [executed]);

  return null; // This component doesn't render anything
};