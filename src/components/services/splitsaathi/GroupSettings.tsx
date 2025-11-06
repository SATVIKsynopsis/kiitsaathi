import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Users, Plus, Trash2, Save, UserPlus } from "lucide-react";

interface Group {
  id: string;
  name: string;
  description: string;
  currency: string;
  created_by: string;
}

interface Member {
  id: string;
  name: string;
  email_phone: string;
}

interface GroupSettingsProps {
  groupId: string;
  currentUser: any;
  onGroupUpdated: () => void;
}

export const GroupSettings = ({ groupId, currentUser, onGroupUpdated }: GroupSettingsProps) => {
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const { toast } = useToast();
  
  const [groupForm, setGroupForm] = useState({
    name: "",
    description: "",
    currency: "₹"
  });
  
  const [newMember, setNewMember] = useState({
    name: "",
    email_phone: ""
  });

  useEffect(() => {
    loadGroupSettings();
  }, [groupId]);

  const loadGroupSettings = async () => {
    try {
      setLoading(true);
      
      // Load group details
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();
      
      if (groupError) throw groupError;
      
      setGroup(groupData);
      setGroupForm({
        name: groupData.name,
        description: groupData.description || "",
        currency: groupData.currency
      });

      // Load members
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId);
      
      if (membersError) throw membersError;
      setMembers(membersData);

    } catch (error: any) {
      toast({
        title: "Error loading settings",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateGroup = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('groups')
        .update({
          name: groupForm.name,
          description: groupForm.description,
          currency: groupForm.currency
        })
        .eq('id', groupId);

      if (error) throw error;

      toast({
        title: "Group updated! ✅",
        description: "Group settings have been saved successfully."
      });
      
      onGroupUpdated();
      
    } catch (error: any) {
      toast({
        title: "Error updating group",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addMember = async () => {
    if (!newMember.name || !newMember.email_phone) {
      toast({
        title: "Missing information",
        description: "Please provide both name and email/phone.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          name: newMember.name,
          email_phone: newMember.email_phone
        });

      if (error) throw error;

      toast({
        title: "Member added! 👥",
        description: `${newMember.name} has been added to the group.`
      });
      
      setNewMember({ name: "", email_phone: "" });
      setIsAddingMember(false);
      loadGroupSettings();
      
    } catch (error: any) {
      toast({
        title: "Error adding member",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const removeMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from the group? This cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Member removed",
        description: `${memberName} has been removed from the group.`
      });
      
      loadGroupSettings();
      
    } catch (error: any) {
      toast({
        title: "Error removing member",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const isGroupCreator = group && currentUser && group.created_by === currentUser.id;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Group Settings
          </CardTitle>
          <CardDescription>Loading settings...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Group Settings
        </CardTitle>
        <CardDescription>
          Manage group information and members
          {!isGroupCreator && " (View only - you're not the group creator)"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Group Information */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            Group Information
            {isGroupCreator && <Badge variant="outline" className="text-xs">Creator</Badge>}
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                value={groupForm.name}
                onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                disabled={!isGroupCreator}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="groupDescription">Description (optional)</Label>
              <Textarea
                id="groupDescription"
                value={groupForm.description}
                onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                disabled={!isGroupCreator}
                placeholder="What's this group for?"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={groupForm.currency}
                onChange={(e) => setGroupForm(prev => ({ ...prev, currency: e.target.value }))}
                disabled={!isGroupCreator}
                maxLength={3}
              />
            </div>
            
            {isGroupCreator && (
              <Button onClick={updateGroup} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </div>
        </div>

        {/* Members */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" />
              Members ({members.length})
            </h3>
            
            {isGroupCreator && (
              <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Member</DialogTitle>
                    <DialogDescription>
                      Add a new person to this expense group
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="memberName">Name</Label>
                      <Input
                        id="memberName"
                        value={newMember.name}
                        onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Member's name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="memberContact">Email or Phone</Label>
                      <Input
                        id="memberContact"
                        value={newMember.email_phone}
                        onChange={(e) => setNewMember(prev => ({ ...prev, email_phone: e.target.value }))}
                        placeholder="email@example.com or +91XXXXXXXXXX"
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={addMember} className="flex-1">
                        Add Member
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddingMember(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{member.name}</h4>
                  <p className="text-sm text-muted-foreground">{member.email_phone}</p>
                </div>
                
                {isGroupCreator && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMember(member.id, member.name)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};