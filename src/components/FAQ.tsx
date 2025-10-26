import { useState } from "react";
import { Bot, ChevronDown, HelpCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
const faqs = [
  {
    question: "Is this legal? Are you officially affiliated with KIIT?",
    answer:
      "We’re an independent, student-built platform made to serve the KIIT community. While not officially affiliated with the university, we operate within all legal and ethical guidelines. Our goal is to make campus life smoother - built by students, for students!",
  },
  {
    question: "How much does it cost to use KIIT Saathi?",
    answer:
      "Almost everything is completely free! Access study materials, course details, AI chat support, the campus map, and more - all without paying a single rupee. Some upcoming features may have optional paid upgrades later, but for now, KIIT Saathi is 100% free to use.",
  },
  {
    question: "Who are you? Can I trust you with my data and services?",
    answer:
      "Absolutely! KIIT Saathi is created and managed by a team of current KIIT students who faced the same everyday struggles - from finding lost items to managing notes and grades. We respect privacy, ensure transparency, and never collect unnecessary information.",
  },
  {
    question: "How does the KIIT Saathi (AI Assistant) work?",
    answer:
      "Our AI chatbot is available 24×7 to guide you with campus help, lost & found, society events, study resources, and more. Just ask - whether you’re confused, curious, or need quick answers, KIIT Saathi is here for you.",
  },
  {
    question: "How do I use the Study Material section?",
    answer:
      "Simply browse your branch and semester to access curated notes, PYQs, lab manuals, and YouTube playlists shared by seniors. If you ever see a “file not found” error, just reload the page - the content will reappear automatically.",
  },
  {
    question: "What should I do if I lose something on campus?",
    answer:
      "Visit our Lost & Found Portal, enter the item details, and we’ll help you report or claim it safely. Found someone’s AirPods, ID card, or bag? You can easily report those too - we handle it anonymously and securely.",
  },
  {
    question: "What can I find in KIIT Societies, Fests & Sports?",
    answer:
      "Stay updated with all ongoing and upcoming university events! From society recruitments and interviews to fests and tournaments - we bring every official and student-led event to one shared calendar so you never miss an opportunity again.",
  },
  {
    question: "What’s included under Course & Faculty Details?",
    answer:
      "You can view a complete overview of your branch-wise course structure, subject list, and official faculty directory. It’s verified, updated, and easy to navigate for every semester.",
  },
  {
    question: "How does the Campus Map help me?",
    answer:
      "Explore KIIT like never before - find your way around academic blocks, hostels, food spots, and hangout places. The map is interactive and designed specially for new students navigating campus life.",
  },
  {
    question: "How does the SGPA & CGPA Calculator work?",
    answer:
      "Just enter your grades according to KIIT’s official credit system, and our calculator gives you accurate semester-wise (SGPA) and overall (CGPA) results instantly - no manual math needed!",
  },
  {
    question: "What is Resume Saathi?",
    answer:
      "Resume Saathi is your personal resume builder powered by AI. It offers pre-designed templates optimized for ATS systems (like LinkedIn or company portals) and lets you instantly download your resume as a polished PDF.",
  },
  {
    question: "What is SplitSaathi and how does it work?",
    answer:
      "SplitSaathi helps you and your friends manage shared expenses during café visits, trips, or fests. Add your group’s expenses, and it automatically calculates who owes what - making money management stress-free and transparent.",
  },
  {
    question: "What is Donation Saathi?",
    answer:
      "Donation Saathi allows you to give back to the community. You can donate food, books, clothes, and essentials to fellow students in need - fostering a spirit of care and kindness across KIIT.",
  },
  {
    question: "What is Student Mental Wellness?",
    answer:
      "We deeply care about mental health. The Student Mental Wellness section provides verified resources, guidance, and professional helplines to help students find support when they need it the most.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Yes - your privacy is our top priority. All data is encrypted and stored securely. We don’t share personal details or activity logs with anyone. You can delete your data anytime through the app settings.",
  },
];

export const FAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 px-4">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm font-medium text-kiit-green-dark mb-6">
            <HelpCircle className="w-4 h-4" />
            Got Questions?
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-poppins font-bold text-gradient mb-6">
            Frequently Asked
            <span className="block">Questions</span>
          </h2>

          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            Everything you need to know about using KIIT Saathi.
            <span className="font-semibold text-kiit-green-dark shadow-box-dark">
              {" "}
              Still have questions? Just ask our AI assistant!
            </span>
          </p>
        </div>

        {/* FAQ List */}
        <div className="max-w-4xl mx-auto space-y-4 px-4">
          {faqs.map((faq, index) => (
            <div key={index} className="glass-card overflow-hidden">
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-4 sm:px-6 py-4 sm:py-5 text-left flex items-start sm:items-center justify-between hover:bg-kiit-green-soft/50 transition-colors"
              >
                <h3 className="text-base sm:text-lg font-semibold text-foreground pr-4 leading-snug">
                  {faq.question}
                </h3>
                <ChevronDown
                  className={`w-5 h-5 font-semibold text-kiit-green transition-transform duration-300 flex-shrink-0 mt-1 sm:mt-0 ${
                    openItems.includes(index) ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openItems.includes(index) && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-white/20">
                  <p className="text-sm font-semibold sm:text-base text-muted-foreground leading-relaxed pt-4">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12 px-4">
          <div className="glass-card p-6 sm:p-8 max-w-2xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-poppins font-bold text-gradient mb-4">
              Still need help?
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              Our AI assistant is available 24/7, or you can reach out to our
              student support team on WhatsApp!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={()=>navigate("/chatbot")}
                className="px-6 py-3 bg-gradient-to-r from-campus-purple to-campus-orange text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Bot height={20} width={20} />
                Ask AI Assistant
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
