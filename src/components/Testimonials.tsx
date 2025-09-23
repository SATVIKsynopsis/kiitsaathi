import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    year: "B.Tech CSE, 3rd Year",
    content: "Finally! No more running around campus for printouts. The delivery is super quick and the quality is exactly what I need. Saved me so much time during exams! 🙌",
    rating: 5,
    avatar: "👩‍💻"
  },
  {
    name: "Rahul Das",
    year: "MBA, 1st Year",
    content: "The senior connect feature is a game-changer! Got amazing advice about placements and even found a study buddy. The mentorship sessions are totally worth it! 🎯",
    rating: 5,
    avatar: "👨‍🎓"
  },
  {
    name: "Sneha Patel",
    year: "B.Tech ETC, 2nd Year",
    content: "Moving hostels was such a pain until I found this app. They packed everything professionally and delivered safely. The carton service is brilliant! 📦",
    rating: 5,
    avatar: "👩‍🔬"
  },
  {
    name: "Arjun Kumar",
    year: "B.Tech Mech, 4th Year",
    content: "The handwritten assignment service literally saved my semester! Perfect handwriting, delivered on time, and at such reasonable rates. Highly recommend! ✍️",
    rating: 5,
    avatar: "👨‍🔧"
  },
  {
    name: "Ananya Roy",
    year: "BBA, 2nd Year",
    content: "Love the safety map feature! As a girl, feeling secure while walking around campus at night is so important. The SOS feature gives me confidence. 🌟",
    rating: 5,
    avatar: "👩‍💼"
  },
  {
    name: "Vikash Singh",
    year: "B.Tech IT, 3rd Year",
    content: "The AI assistant knows everything about KIIT! From mess timings to society deadlines, it's like having a super senior in your pocket 24/7! 🤖",
    rating: 5,
    avatar: "👨‍💻"
  }
];

export const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 bg-gradient-to-br from-white to-kiit-green-soft">
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
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-gradient mb-2">2000+</div>
            <div className="text-muted-foreground font-medium">Happy Students</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-gradient mb-2">4.9⭐</div>
            <div className="text-muted-foreground font-medium">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-gradient mb-2">50K+</div>
            <div className="text-muted-foreground font-medium">Services Delivered</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-gradient mb-2">24/7</div>
            <div className="text-muted-foreground font-medium">Support Available</div>
          </div>
        </div>
      </div>
    </section>
  );
};