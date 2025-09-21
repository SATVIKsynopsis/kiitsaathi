import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hideServicesDirectly, restoreServicesDirectly } from "@/utils/adminCommands";
import { useToast } from "@/hooks/use-toast";
import { Shield, EyeOff, Eye, Loader2 } from "lucide-react";

export const AdminPanel = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleHideServices = async () => {
    setLoading(true);
    try {
      const result = await hideServicesDirectly();
      
      if (result.success) {
        toast({
          title: "Services Hidden",
          description: `Successfully hidden ${result.hidden_services} services. Printout on Demand replaced with "More Services Coming Soon...." placeholder.`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to hide services",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute hide command",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreServices = async () => {
    setLoading(true);
    try {
      const result = await restoreServicesDirectly();
      
      if (result.success) {
        toast({
          title: "Services Restored",
          description: `Successfully restored ${result.restored_services} services to their original state.`,
        });
      } else {
        toast({
          title: "Error", 
          description: result.error || "Failed to restore services",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute restore command",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Admin Service Visibility Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={handleHideServices}
            disabled={loading}
            variant="destructive"
            className="w-full"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <EyeOff className="w-4 h-4 mr-2" />
            )}
            Hide Services
          </Button>
          
          <Button
            onClick={handleRestoreServices}
            disabled={loading}
            variant="default"
            className="w-full"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            Restore Services
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>Hide Services:</strong> Hides 9 specified services and replaces Printout on Demand with "More Services Coming Soon...." placeholder.</p>
          <p><strong>Restore Services:</strong> Restores all services to their original visibility state.</p>
          <p><strong>Note:</strong> All internal service pages remain accessible via direct URLs.</p>
        </div>
      </CardContent>
    </Card>
  );
};