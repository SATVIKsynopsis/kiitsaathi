import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Aditya Sharma",
    year: "B.Tech CSE, 2nd Year",
    content: "The KIIT Saathi AI Assistant is incredible! Available 24/7 to answer any question about campus life, academics, or procedures. It's like having a personal guide!",
    rating: 5,
    avatar: "👩‍💻"
  },
  {
    name: "Krishna Mohanty",
    year: "B.Tech, 3rd Year",
    content: "Found all my study materials in one place! PYQs, notes, and curated YouTube playlists - everything I need for exam prep.",
    rating: 5,
    avatar: "👨‍🎓"
  },
  {
    name: "Anushka Gupta",
    year: "B.Tech ETC, 3rd Year",
    content: "Lost my Key during fest week and found it through the Lost & Found Portal within hours! So relieved I didn't have to go through the hassle of getting a duplicate.",
    rating: 5,
    avatar: "👩‍🔬"
  },
  {
    name: "Prajjwal Patel",
    year: "B.Tech CSE, 2nd Year",
    content: "The Campus Map feature helped me navigate KIIT so easily as a fresher! No more getting lost between buildings or missing classes due to wrong directions.",
    rating: 5,
    avatar: "👨‍🔧"
  },
  {
    name: "Diya Dasgupta",
    year: "BDS, 2nd Year",
    content: "Never miss any society events or sports competitions now! The KIIT Societies calendar keeps me updated on everything happening on campus. One place for all events!",
    rating: 5,
    avatar: "👩‍💼"
  },
  {
    name: "Satvik",
    year: "B.Tech CSE, 2nd Year",
    content: "The Resume Saathi is a lifesaver for placements! AI-powered optimization with multiple templates and instant PDF download.",
    rating: 5,
    avatar: "👨‍💻"
  }
];

export const Testimonials = () => {
  return (
    <section id="testimonials" className="py-10 bg-gradient-to-br from-white to-kiit-green-soft">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm font-medium text-kiit-green-dark mb-6">
            <Star className="w-4 h-4" />
            Student Love
          </div>
          
          <h2 className="text-4xl lg:text-6xl font-poppins font-bold text-gradient mb-6">
            What KIIT Students
            <span className="block">Are Saying</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Don't just take our word for it — hear from your fellow KIITians who've made their campus life easier!
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="glass-card p-6 hover-lift"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Quote Icon */}
              <div className="mb-4">
                <Quote className="w-8 h-8 text-kiit-green opacity-50" />
              </div>

              {/* Content */}
              <p className="text-foreground mb-6 leading-relaxed">
                {testimonial.content}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-campus-orange text-campus-orange" />
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-kiit-green to-campus-blue rounded-full flex items-center justify-center text-white text-lg">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.year}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 flex justify-around ">
          {/* <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-gradient mb-2">2000+</div>
            <div className="text-muted-foreground font-medium">Happy Students</div>
          </div> */}
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-gradient mb-2">4.9⭐</div>
            <div className="text-muted-foreground font-medium">Average Rating</div>
          </div>
          {/* <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-gradient mb-2">50K+</div>
            <div className="text-muted-foreground font-medium">Services Delivered</div>
          </div> */}
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-gradient mb-2">24/7</div>
            <div className="text-muted-foreground font-medium">Support Available</div>
          </div>
        </div>
      </div>
    </section>
  );
};