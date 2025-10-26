import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Heart, Sparkles, Music, BookOpen, Gamepad2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const Meetups = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('browse');
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    date: '',
    time: '',
    location: '',
    description: '',
    estimatedAttendees: ''
  });

  // Mock data for upcoming meetups
  const upcomingMeetups = [
    {
      id: 1,
      title: "Future Talks – What's Next After KIIT?",
      date: "14 Aug",
      time: "5:00 PM",
      location: "MBA Garden",
      spotsLeft: 7,
      category: "Learn & Grow",
      tags: ["#CareerTalk", "#OpenDiscussion"],
      description: "Join us for an open discussion about career paths, higher studies, and life after KIIT!"
    },
    {
      id: 2,
      title: "UNO Championship Night 🃏",
      date: "15 Aug",
      time: "7:30 PM",
      location: "Hostel 15 Common Room",
      spotsLeft: 12,
      category: "Chill & Fun",
      tags: ["#Games", "#Fun"],
      description: "Bring your competitive spirit and get ready for some serious UNO battles!"
    },
    {
      id: 3,
      title: "Campus Photography Walk 📸",
      date: "16 Aug",
      time: "6:00 AM",
      location: "Meet at Main Gate",
      spotsLeft: 5,
      category: "Move & Play",
      tags: ["#Photography", "#Morning"],
      description: "Capture the beauty of our campus in the golden morning light!"
    },
    {
      id: 4,
      title: "Music Jam Session 🎵",
      date: "17 Aug",
      time: "8:00 PM",
      location: "Music Room, Student Activity Center",
      spotsLeft: 8,
      category: "Chill & Fun",
      tags: ["#Music", "#Jam"],
      description: "Bring your instruments or just your voice! All skill levels welcome."
    }
  ];

  const categories = [
    { id: 'chill-fun', name: 'Chill & Fun', icon: Heart, description: '🎨 Art Jams, 🎵 Music Sessions, 🃏 UNO & Game Nights' },
    { id: 'learn-grow', name: 'Learn & Grow', icon: BookOpen, description: '🎯 Career Networking, 📚 Study Circles, 💡 Idea Sharing' },
    { id: 'move-play', name: 'Move & Play', icon: Gamepad2, description: '⚽ Sports Meetups, 🚶 Campus Walks, 🧘 Wellness Sessions' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Meetup submitted:', formData);
    // Here you would typically submit to Supabase
    alert('Your meetup has been submitted for approval! 🌟');
    setFormData({
      title: '',
      category: '',
      date: '',
      time: '',
      location: '',
      description: '',
      estimatedAttendees: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Find Your People, Create Your Moments
            </h1>
            <Heart className="h-8 w-8 text-pink-500 animate-pulse" />
          </div>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            From casual chats under the trees to career networking in the library - meetups make KIIT feel like home. 🌿✨
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setActiveTab('browse')}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white px-8 py-6 text-lg"
            >
              <Users className="mr-2 h-5 w-5" />
              Join a Meetup 🌟
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => setActiveTab('create')}
              className="border-2 border-primary/20 hover:bg-primary/5 px-8 py-6 text-lg"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Plan a Meetup ✍️
            </Button>
          </div>
        </div>
      </section>

      {/* What is KIIT Saathi Meetups */}
      <section className="py-12 px-4 bg-card/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6">What is KIIT Saathi Meetups?</h2>
          <div className="bg-card/50 rounded-lg p-8 border border-border/50">
            <p className="text-lg text-muted-foreground leading-relaxed">
              KIIT is big. Like… really big. And sometimes, that makes it hard to bump into the people you vibe with. 🤝
              <br /><br />
              That's why we have <strong>Meetups</strong> - tiny pockets of fun, learning, and connection that bring students together. 
              You can join one or host your own - whether it's about future plans, music jams, UNO battles, or career talks. 💛
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Categories You Can Explore</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card key={category.id} className="text-center hover:shadow-lg transition-shadow border-border/50">
                  <CardHeader>
                    <div className="flex justify-center mb-2">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="bg-muted p-1 rounded-lg">
              <Button 
                variant={activeTab === 'browse' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('browse')}
                className="mx-1"
              >
                Browse Meetups
              </Button>
              <Button 
                variant={activeTab === 'create' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('create')}
                className="mx-1"
              >
                Create Meetup
              </Button>
            </div>
          </div>

          {activeTab === 'browse' && (
            <div>
              <h3 className="text-2xl font-bold text-center mb-8">Upcoming Meetups ✨</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {upcomingMeetups.map((meetup) => (
                  <Card key={meetup.id} className="hover:shadow-lg transition-shadow border-border/50">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg mb-2">{meetup.title}</CardTitle>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {meetup.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          {meetup.spotsLeft} spots left
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{meetup.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{meetup.date}</span>
                          <Clock className="h-4 w-4 text-primary ml-2" />
                          <span>{meetup.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{meetup.location}</span>
                        </div>
                      </div>
                      
                      <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700">
                        Join Now 💛
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'create' && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-center mb-8">Plan Your Own Meetup 🎤</h3>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="title">Meetup Title 🎤</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="e.g., UNO Championship Night"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chill-fun">Chill & Fun</SelectItem>
                          <SelectItem value="learn-grow">Learn & Grow</SelectItem>
                          <SelectItem value="move-play">Move & Play</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date">Date 📅</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => handleInputChange('date', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="time">Time</Label>
                        <Input
                          id="time"
                          type="time"
                          value={formData.time}
                          onChange={(e) => handleInputChange('time', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="location">Location 📍</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="e.g., MBA Garden, Hostel 15 Common Room"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Short Description 📝</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Tell everyone what makes your meetup special!"
                        required
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="attendees">Estimated Attendees 👥</Label>
                      <Input
                        id="attendees"
                        type="number"
                        value={formData.estimatedAttendees}
                        onChange={(e) => handleInputChange('estimatedAttendees', e.target.value)}
                        placeholder="How many people do you expect?"
                        min="1"
                        max="100"
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-lg py-6">
                      Submit for Approval ✨
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Safety Note */}
      <section className="py-12 px-4 bg-card/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Keep It Kind, Keep It KIIT 💛</h2>
          <p className="text-muted-foreground">
            All meetups follow KIIT Saathi's code of respect. No hate, no negativity - just positive vibes, 
            shared ideas, and good memories. ✨
          </p>
        </div>
      </section>

      {/* After You Join Info */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-bold mb-4">After You Join a Meetup 🌟</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>📱 You'll be added to a private group chat with other attendees</p>
                <p>🤝 Use the chat to coordinate before the event and share photos after</p>
                <p>💫 Keep the friendship alive long after the meetup ends!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Meetups;