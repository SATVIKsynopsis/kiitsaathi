import { Card, CardContent } from "@/components/ui/card";

interface Mentor {
  name: string;
  designation: string;
  photo: string;
}

const mentors: Mentor[] = [
  {
    name: "Dr. Ajit Pasayat",
    designation: "Associate Dean KSAC",
    photo: "/mentors/ajit.jpg",
  },
  {
    name: "Dr. Vikas Hassija",
    designation: "Associate Professor,SCE",
    photo: "/mentors/vikas.jpg",
  },
  {
    name: "Mr. Satyananda Champati Rai",
    designation: "Associate Professor,SCE",
    photo: "/mentors/rai.jpg",
  },
];

const OurMentors = () => {
  return (
    <section className="py-16 px-4 relative overflow-hidden">
      {/* Premium Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-blue-50/60 to-purple-50/70 dark:from-amber-950/20 dark:via-blue-950/20 dark:to-purple-950/20" />
      
      {/* Abstract Shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-amber-200/20 to-orange-200/20 dark:from-amber-800/10 dark:to-orange-800/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-purple-200/20 dark:from-blue-800/10 dark:to-purple-800/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Our Mentors
          </h2>
          <p className="text-muted-foreground text-lg italic">
            Guiding us every step of the way.
          </p>
        </div>

        {/* Mentor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mentors.map((mentor, index) => (
            <Card
              key={index}
              className="group bg-card/80 backdrop-blur-sm border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 cursor-pointer"
            >
              <CardContent className="flex flex-col items-center p-8">
                {/* Circular Photo */}
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                    <img
                      src={mentor.photo}
                      alt={mentor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Subtle glow effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:via-accent/10 group-hover:to-primary/10 transition-all duration-300" />
                </div>

                {/* Name and Designation */}
                <h3 className="text-xl font-bold text-center mb-2 text-foreground">
                  {mentor.name}
                </h3>
                <p className="text-muted-foreground text-center text-sm">
                  {mentor.designation}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurMentors;
