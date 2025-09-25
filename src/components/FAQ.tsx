import { useState } from "react";
import { Bot, ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Is this legal? Are you officially affiliated with KIIT?",
    answer: "We are building a student-focused platform serving the KIIT community. While not officially affiliated with the university, we operate within all legal guidelines and focus on helping students with legitimate campus needs. We're students, for students! 👨‍🎓"
  },
  {
    question: "How much does it cost to use the app?",
    answer: "Many services are completely free (like our AI assistant, fest updates, campus map). Paid services have transparent pricing - printouts start at ₹2/page, assignments at ₹5/page, mentorship at ₹99/session. No hidden fees, ever! 💰"
  },
  {
    question: "Who are you? Can I trust you with my assignments?",
    answer: "We are building a student-focused platform with current KIIT students who faced the same problems you do! Our team includes seniors from various branches who understand academic integrity. For assignments, we provide handwriting services, not academic dishonesty. You still need to understand the content! 📚"
  },
  {
    question: "How fast is the delivery for printouts and assignments?",
    answer: "Printouts: Usually within 2-3 hours during campus hours. Assignments: 24-48 hours depending on length and complexity. Urgent orders available for extra charges. We're faster than your friend who 'will definitely help' but never does! ⚡"
  },
  {
    question: "What if something goes wrong with my order?",
    answer: "We've got you covered! Every order comes with our student-friendly guarantee. Issues with quality? We'll fix it free. Late delivery? You get service credits. Not satisfied? We'll work it out together or provide a refund. Our support team is always here to help make things right! 🛡️"
  },
  {
    question: "Can my parents track my usage or payments?",
    answer: "We respect your privacy completely. Parents can't see your order history or usage patterns. Payments are discreet (shows as 'Campus Services'). Your hostel transfer and assignment needs stay between us! 🤐"
  },
  {
    question: "Do you work during exams and holidays?",
    answer: "Yes! We know that's when you need us most. Limited services during major holidays, but our AI assistant and emergency services (like printouts) are always available. Because deadlines don't take breaks! 📅"
  },
  {
    question: "How do I know which seniors are good for mentorship?",
    answer: "All our mentors are verified with academic records and student reviews. You can see their CGPA, branch, placement status, and previous mentee feedback. Plus, first 15 minutes are free to check compatibility! ⭐"
  },
];

export const FAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm font-medium text-kiit-green-dark mb-6">
            <HelpCircle className="w-4 h-4" />
            Got Questions?
          </div>
          
          <h2 className="text-4xl lg:text-6xl font-poppins font-bold text-gradient mb-6">
            Frequently Asked
            <span className="block">Questions</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Everything you need to know about using KIIT Buddy. 
            <span className="font-semibold text-kiit-green"> Still have questions? Just ask our AI assistant!</span>
          </p>
        </div>

        {/* FAQ List */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="glass-card overflow-hidden">
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-kiit-green-soft/50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-foreground pr-4">
                  {faq.question}
                </h3>
                <ChevronDown 
                  className={`w-5 h-5 text-kiit-green transition-transform duration-300 ${
                    openItems.includes(index) ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              
              {openItems.includes(index) && (
                <div className="px-6 pb-6 border-t border-white/20">
                  <p className="text-muted-foreground leading-relaxed pt-4">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-poppins font-bold text-gradient mb-4">
              Still need help?
            </h3>
            <p className="text-muted-foreground mb-6">
              Our AI assistant is available 24/7, or you can reach out to our student support team on WhatsApp!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-gradient-to-r from-campus-purple to-campus-orange text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                <Bot height={20} width={20} /> Ask AI Assistant
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};