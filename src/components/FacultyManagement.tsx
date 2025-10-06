import { useState } from 'react';
import { useFacultyManagement, FacultyMember } from '@/hooks/useFacultyManagement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Upload, Search, Users, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

export function FacultyManagement() {
  const { faculty, loading, uploading, uploadPhoto } = useFacultyManagement();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ [key: string]: File | null }>({});

  const filteredFaculty = faculty.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileSelect = (facultyId: string, file: File | null) => {
    setSelectedFile(prev => ({ ...prev, [facultyId]: file }));
  };

  const handleUpload = async (facultyId: string) => {
    const file = selectedFile[facultyId];
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    try {
      await uploadPhoto(facultyId, file);
      setSelectedFile(prev => ({ ...prev, [facultyId]: null }));
    } catch (error) {
      // Error already handled in hook
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Faculty & Contact Person Management</h2>
          <p className="text-muted-foreground mt-1">
            Upload and manage profile photos for all faculty members
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Users className="mr-2 h-4 w-4" />
          {faculty.length} Members
        </Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search by name, email, or designation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {filteredFaculty.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={member.photo_url} alt={member.name} />
                  <AvatarFallback className="text-lg">
                    {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">{member.name}</h3>
                      <Badge variant={member.category === 'faculty' ? 'default' : 'secondary'}>
                        {member.category === 'faculty' ? 'Faculty' : 'Contact Person'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{member.designation}</p>
                    {member.department && (
                      <p className="text-sm text-muted-foreground">{member.department}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => handleFileSelect(member.id, e.target.files?.[0] || null)}
                      className="max-w-xs"
                    />
                    <Button
                      onClick={() => handleUpload(member.id)}
                      disabled={!selectedFile[member.id] || uploading}
                      size="sm"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploading ? 'Uploading...' : 'Upload Photo'}
                    </Button>
                  </div>

                  {selectedFile[member.id] && (
                    <p className="text-xs text-muted-foreground">
                      Selected: {selectedFile[member.id]?.name} 
                      ({(selectedFile[member.id]!.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFaculty.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No faculty members found</h3>
          <p className="text-sm text-muted-foreground">
            {searchTerm ? 'Try adjusting your search terms' : 'No faculty members in the database yet'}
          </p>
        </div>
      )}
    </div>
  );
}
