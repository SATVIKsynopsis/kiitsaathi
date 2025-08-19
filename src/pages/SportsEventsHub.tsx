import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Trophy,
  Target,
  Zap,
  Medal,
  Timer,
  Flag,
  ArrowLeft,
  ArrowRight,
  Play,
  Activity,
  TrendingUp,
  Award
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";

const SportsEventsHub = () => {
  const navigate = useNavigate();
  const [selectedSport, setSelectedSport] = useState("All");

  const sports = ["All", "Football", "Basketball", "Cricket", "Volleyball", "Badminton", "Athletics"];

  const upcomingMatches = [
    {
      id: 1,
      sport: "Football",
      teams: { home: "KIIT Lions", away: "NIT Eagles" },
      date: "2025-02-15",
      time: "4:00 PM",
      venue: "Main Football Ground",
      status: "upcoming",
      homeScore: null,
      awayScore: null,
      tournament: "Inter-College Championship",
      icon: "⚽"
    },
    {
      id: 2,
      sport: "Basketball",
      teams: { home: "KIIT Warriors", away: "IIIT Rockets" },
      date: "2025-02-16",
      time: "6:00 PM", 
      venue: "Indoor Basketball Court",
      status: "live",
      homeScore: 42,
      awayScore: 38,
      tournament: "University League",
      icon: "🏀"
    },
    {
      id: 3,
      sport: "Cricket",
      teams: { home: "KIIT Strikers", away: "VIT Challengers" },
      date: "2025-02-18",
      time: "9:00 AM",
      venue: "Cricket Stadium",
      status: "upcoming",
      homeScore: null,
      awayScore: null,
      tournament: "T20 Cup",
      icon: "🏏"
    },
    {
      id: 4,
      sport: "Volleyball",
      teams: { home: "KIIT Spikers", away: "BIT Blockers" },
      date: "2025-02-17",
      time: "5:00 PM",
      venue: "Volleyball Court A",
      status: "upcoming",
      homeScore: null,
      awayScore: null,
      tournament: "State Championship",
      icon: "🏐"
    },
    {
      id: 5,
      sport: "Badminton",
      teams: { home: "KIIT Shuttlers", away: "KIIT Smashers" },
      date: "2025-02-14",
      time: "3:00 PM",
      venue: "Indoor Sports Complex",
      status: "finished",
      homeScore: 21,
      awayScore: 18,
      tournament: "Intra-College Finals",
      icon: "🏸"
    }
  ];

  const teamRankings = [
    { rank: 1, team: "KIIT Lions", sport: "Football", points: 45, matches: 15, won: 14, lost: 1, icon: "⚽" },
    { rank: 2, team: "KIIT Warriors", sport: "Basketball", points: 42, matches: 14, won: 13, lost: 1, icon: "🏀" },
    { rank: 3, team: "KIIT Strikers", sport: "Cricket", points: 40, matches: 12, won: 12, lost: 0, icon: "🏏" },
    { rank: 4, team: "KIIT Spikers", sport: "Volleyball", points: 38, matches: 13, won: 11, lost: 2, icon: "🏐" },
    { rank: 5, team: "KIIT Shuttlers", sport: "Badminton", points: 35, matches: 11, won: 10, lost: 1, icon: "🏸" }
  ];

  const recentResults = [
    { teams: "KIIT Lions vs NIT Eagles", score: "3-1", sport: "Football", date: "2025-02-10", icon: "⚽" },
    { teams: "KIIT Warriors vs IIIT Rockets", score: "78-65", sport: "Basketball", date: "2025-02-09", icon: "🏀" },
    { teams: "KIIT Strikers vs VIT Challengers", score: "180/6 - 145/9", sport: "Cricket", date: "2025-02-08", icon: "🏏" },
    { teams: "KIIT Spikers vs BIT Blockers", score: "3-0", sport: "Volleyball", date: "2025-02-07", icon: "🏐" }
  ];

  const filteredMatches = upcomingMatches.filter(match => 
    selectedSport === "All" || match.sport === selectedSport
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live": return "bg-red-500 text-white animate-pulse";
      case "upcoming": return "bg-blue-100 text-blue-800";
      case "finished": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "live": return <Play className="w-3 h-3" />;
      case "upcoming": return <Timer className="w-3 h-3" />;
      case "finished": return <Flag className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-orange-50">
      {/* Back Button */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-kiit-green hover:text-kiit-green-dark"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>
      
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 bg-gradient-to-r from-blue-600 via-green-500 to-orange-500">
        <div className="container mx-auto text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              🏆 Sports Events Hub
            </h1>
            <p className="text-xl md:text-2xl mb-4 opacity-90">
              Where champions are made and legends are born!
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8 text-sm md:text-base opacity-80">
              <span>Live scores, match schedules, team rankings & more</span>
              <span className="hidden md:inline">•</span>
              <span>Your ultimate sports companion at KIIT</span>
            </div>
            
            <div className="relative mb-12">
              <div className="w-64 h-64 mx-auto bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-8">
                <div className="text-8xl animate-bounce">🥇</div>
              </div>
            </div>
            
            <Button 
              onClick={() => document.getElementById("matches-section")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-white text-blue-600 hover:bg-white/90 px-8 py-3 text-lg rounded-full font-semibold"
            >
              View Live Matches
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 px-4 bg-white/90 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: "🏟️", number: "15", label: "Sports Venues", color: "text-blue-600" },
              { icon: "🏆", number: "25+", label: "Championships", color: "text-green-600" },
              { icon: "👥", number: "2000+", label: "Student Athletes", color: "text-orange-600" },
              { icon: "🥇", number: "150+", label: "Medals Won", color: "text-purple-600" }
            ].map((stat, index) => (
              <Card key={index} className="text-center group hover:shadow-md transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.number}</div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Tabs */}
      <section id="matches-section" className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <Tabs defaultValue="matches" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 mx-auto">
              <TabsTrigger value="matches" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Matches
              </TabsTrigger>
              <TabsTrigger value="rankings" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Rankings
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Results
              </TabsTrigger>
            </TabsList>

            {/* Matches Tab */}
            <TabsContent value="matches" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">🔥 Live & Upcoming Matches</h2>
                <p className="text-gray-600">Catch all the action as it happens!</p>
              </div>

              {/* Sport Filter */}
              <div className="flex justify-center mb-8">
                <div className="flex gap-2 overflow-x-auto p-1 bg-white rounded-lg shadow-sm">
                  {sports.map(sport => (
                    <Button
                      key={sport}
                      variant={selectedSport === sport ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedSport(sport)}
                      className="whitespace-nowrap"
                    >
                      {sport}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Matches Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMatches.map((match) => (
                  <Card key={match.id} className={`group hover:shadow-lg transition-all duration-300 ${
                    match.status === 'live' ? 'border-2 border-red-500 shadow-lg' : 'border-2 border-transparent hover:border-blue-300'
                  }`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{match.icon}</span>
                          <Badge variant="outline">{match.sport}</Badge>
                        </div>
                        <Badge className={`flex items-center gap-1 ${getStatusColor(match.status)}`}>
                          {getStatusIcon(match.status)}
                          {match.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 font-medium">{match.tournament}</div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Teams & Score */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="font-semibold text-gray-800">{match.teams.home}</div>
                          <div className="text-2xl font-bold text-blue-600">
                            {match.homeScore !== null ? match.homeScore : '-'}
                          </div>
                        </div>
                        <div className="text-center text-xs text-gray-500 font-medium">VS</div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="font-semibold text-gray-800">{match.teams.away}</div>
                          <div className="text-2xl font-bold text-red-600">
                            {match.awayScore !== null ? match.awayScore : '-'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Match Details */}
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(match.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {match.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {match.venue}
                        </div>
                      </div>
                      
                      <Button className="w-full" variant={match.status === 'live' ? 'default' : 'outline'}>
                        {match.status === 'live' ? (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Watch Live
                          </>
                        ) : match.status === 'upcoming' ? (
                          <>
                            <Target className="w-4 h-4 mr-2" />
                            Set Reminder
                          </>
                        ) : (
                          <>
                            <Trophy className="w-4 h-4 mr-2" />
                            View Result
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Rankings Tab */}
            <TabsContent value="rankings" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">🏆 Team Rankings</h2>
                <p className="text-gray-600">See how our teams are performing across different sports</p>
              </div>

              <Card className="max-w-4xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Medal className="w-5 h-5 text-yellow-500" />
                    Current Season Standings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamRankings.map((team) => (
                      <div key={team.rank} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                            team.rank === 1 ? 'bg-yellow-500' : team.rank === 2 ? 'bg-gray-400' : team.rank === 3 ? 'bg-orange-600' : 'bg-blue-500'
                          }`}>
                            {team.rank}
                          </div>
                          <div className="text-2xl">{team.icon}</div>
                          <div>
                            <div className="font-semibold">{team.team}</div>
                            <div className="text-sm text-gray-500">{team.sport}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <div className="font-semibold">{team.points}</div>
                            <div className="text-gray-500">Points</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">{team.won}-{team.lost}</div>
                            <div className="text-gray-500">W-L</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">{Math.round((team.won/team.matches)*100)}%</div>
                            <div className="text-gray-500">Win %</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Calendar Tab */}
            <TabsContent value="calendar" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">📅 Sports Calendar</h2>
                <p className="text-gray-600">Plan your sports viewing schedule</p>
              </div>
              
              <Card className="max-w-4xl mx-auto">
                <CardContent className="p-6">
                  <div className="grid gap-4">
                    {upcomingMatches.filter(match => match.status !== 'finished').map((match) => (
                      <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">{match.icon}</div>
                          <div>
                            <div className="font-semibold">{match.teams.home} vs {match.teams.away}</div>
                            <div className="text-sm text-gray-500">{match.tournament}</div>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-medium">{new Date(match.date).toLocaleDateString()}</div>
                          <div className="text-gray-500">{match.time} • {match.venue}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">🏅 Recent Results</h2>
                <p className="text-gray-600">Latest match outcomes and highlights</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {recentResults.map((result, index) => (
                  <Card key={index} className="group hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{result.icon}</span>
                          <Badge variant="outline">{result.sport}</Badge>
                        </div>
                        <div className="text-sm text-gray-500">{new Date(result.date).toLocaleDateString()}</div>
                      </div>
                      
                      <div className="text-center space-y-2">
                        <div className="font-semibold text-gray-800">{result.teams}</div>
                        <div className="text-2xl font-bold text-green-600">{result.score}</div>
                        <Badge className="bg-green-100 text-green-800">
                          <Trophy className="w-3 h-3 mr-1" />
                          KIIT Won
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SportsEventsHub;