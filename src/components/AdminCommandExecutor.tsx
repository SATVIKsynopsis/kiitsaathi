import { useEffect, useState } from "react";
import { hideServicesDirectly } from "@/utils/adminCommands";

export const AdminCommandExecutor = () => {
  const [executed, setExecuted] = useState(false);

  useEffect(() => {
    if (!executed) {
      const executeHideCommand = async () => {
        try {
          console.log('🔧 Executing admin command: Hide the next services again');
          const result = await hideServicesDirectly();
          
          if (result.success) {
            console.log('✅ Services hidden successfully:', {
              hiddenServices: result.hidden_services,
              message: result.message
            });
            console.log('📋 The following services are now hidden from homepage:');
            console.log('- Senior Connect');
            console.log('- Handwritten Assignments');
            console.log('- Tutoring & Counselling');
            console.log('- Campus Tour Booking');
            console.log('- Carton Packing & Hostel Transfers');
            console.log('- Book Buyback & Resale');
            console.log('- KIIT Saathi Celebrations');
            console.log('- KIIT Saathi Meetups');
            console.log('- Food and micro-essentials delivery');
            console.log('- Resale Saathi');
            console.log('🔄 Printout on Demand replaced with placeholder');
            console.log('🔗 Services hidden but still accessible via direct URLs');
          } else {
            console.error('❌ Admin command failed:', result.error);
          }
          
          setExecuted(true);
        } catch (error) {
          console.error('💥 Failed to execute admin command:', error);
          setExecuted(true);
        }
      };

      executeHideCommand();
    }
  }, [executed]);

  return null; // This component doesn't render anything
};