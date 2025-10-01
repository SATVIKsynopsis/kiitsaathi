import { supabase } from "@/integrations/supabase/client";

export async function executeAdminCommand(command: string) {
  try {
    const { data, error } = await supabase.functions.invoke('admin-visibility-command', {
      body: { command },
      headers: {
        'x-admin-secret': 'temp-admin-secret-for-demo'
      }
    });

    if (error) {
      console.error('Admin command error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to execute admin command:', error);
    return { success: false, error: 'Failed to execute command' };
  }
}

// Direct database update as fallback (for demo purposes)
export async function hideServicesDirectly() {
  try {
    // Services to hide
    const servicesToHide = [
      'senior-connect',
      'handwritten-assignments', 
      'tutoring-counselling',
      'campus-tour-booking',
      'carton-packing-hostel-transfers',
      'book-buyback-resale',
      'kiit-saathi-celebrations',
      'kiit-saathi-meetups',
      'food-micro-essentials-delivery',
      'resale-saathi'
    ];

    // Hide the specified services
    const { error: hideError } = await supabase
      .from('service_visibility')
      .update({ 
        visible: false, 
        updated_at: new Date().toISOString() 
      })
      .in('service_id', servicesToHide);

    if (hideError) {
      console.error('Error hiding services:', hideError);
      return { success: false, error: hideError.message };
    }

    // Replace printout service with placeholder
    const { error: printoutError } = await supabase
      .from('service_visibility')
      .update({ 
        visible: false,
        replaced_text: 'More Services Coming Soon....',
        updated_at: new Date().toISOString()
      })
      .eq('service_id', 'printout-on-demand');

    if (printoutError) {
      console.error('Error updating printout service:', printoutError);
      return { success: false, error: printoutError.message };
    }

    // Log the action
    await supabase
      .from('admin_action_logs')
      .insert({
        action: 'hide_services',
        command: 'Hide the next services again',
        details: { 
          services: [...servicesToHide, 'printout-on-demand'],
          method: 'direct_database_update'
        }
      });

    return { 
      success: true, 
      message: 'Services hidden successfully',
      hidden_services: servicesToHide.length + 1
    };
  } catch (error) {
    console.error('Failed to hide services:', error);
    return { success: false, error: 'Database update failed' };
  }
}

export async function restoreServicesDirectly() {
  try {
    // Services to restore
    const servicesToRestore = [
      'senior-connect',
      'handwritten-assignments', 
      'tutoring-counselling',
      'campus-tour-booking',
      'carton-packing-hostel-transfers',
      'book-buyback-resale',
      'kiit-saathi-celebrations',
      'kiit-saathi-meetups',
      'food-micro-essentials-delivery',
      'printout-on-demand',
      'resale-saathi'
    ];

    // Restore all services
    const { error: restoreError } = await supabase
      .from('service_visibility')
      .update({ 
        visible: true,
        replaced_text: null,
        updated_at: new Date().toISOString() 
      })
      .in('service_id', servicesToRestore);

    if (restoreError) {
      console.error('Error restoring services:', restoreError);
      return { success: false, error: restoreError.message };
    }

    // Log the action
    await supabase
      .from('admin_action_logs')
      .insert({
        action: 'restore_services',
        command: 'Get The next services back (Senior Connect, Handwritten Assignments, Tutoring & Counselling, Campus Tour Booking, Carton Packing & Hostel Transfers, Book Buyback & Resale, KIIT Saathi Celebrations ,KIIT Saathi Meetups, Food and micro-essentials delivery)',
        details: { 
          services: servicesToRestore,
          method: 'direct_database_update'
        }
      });

    return { 
      success: true, 
      message: 'Services restored successfully',
      restored_services: servicesToRestore.length
    };
  } catch (error) {
    console.error('Failed to restore services:', error);
    return { success: false, error: 'Database update failed' };
  }
}