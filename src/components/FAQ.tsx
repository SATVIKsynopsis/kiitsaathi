import { useState } from "react";
import { Bot, ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Is this legal? Are you officially affiliated with KIIT?",
    answer: "We are building a student-focused platform serving the KIIT community. While not officially affiliated with the university, we operate within all legal guidelines and focus on helping students with legitimate campus needs. We're students, for students! 👨‍🎓"
  },
  {
    question: "How much does it cost to use KIIT Saathi?",
    answer: "Many services are completely free (like Senior Connect chat, Book Exchange, AI assistant, campus map, Split Saathi). Paid services have transparent pricing - printouts start at ₹2/page, assignments at ₹5/page, celebrations from ₹299. No hidden fees, ever! 💰"
  },
  {
    question: "Who are you? Can I trust you with my services?",
    answer: "We are building a student-focused platform with current KIIT students who faced the same problems you do! Our team includes seniors from various branches who understand student needs. All services prioritize privacy and security. 📚"
  },
  {
    question: "How fast is delivery for services like printouts and assignments?",
    answer: "Printouts: Usually within 2-3 hours during campus hours. Assignments: 24-48 hours depending on complexity. Celebrations: 2-4 hours notice for same-day setup. Book Exchange: Instant matching with other students! ⚡"
  },
  {
    question: "What if something goes wrong with my order?",
    answer: "We've got you covered! Every service comes with our student-friendly guarantee. Issues with quality? We'll fix it free. Late delivery? You get service credits. Not satisfied? We'll work it out together. Our support team is always here! 🛡️"
  },
  {
    question: "Is my data safe? What about privacy?",
    answer: "Absolutely! We respect your privacy completely. Your personal data is encrypted and secure. For Resume Saathi, you can delete all data after downloading. Senior Connect uses demo names only. Book exchanges are anonymous until you choose to connect. 🔒"
  },
  {
    question: "Do services work during exams and holidays?",
    answer: "Yes! We know that's when you need us most. Emergency services like printouts are always available. Senior Connect, Book Exchange, and Split Saathi work 24/7. Celebrations and assignments have limited availability during major holidays. 📅"
  },
  {
    question: "How does the free Book Exchange work?",
    answer: "Simply list books you want to give away and books you need. Our system matches you with other students. Exchange directly - no money involved! It's completely free and helps reduce textbook costs for everyone. 📖"
  },
  {
    question: "Is Senior Connect really anonymous and safe?",
    answer: "Yes! You only use demo names like 'TechGuru' or 'MathWhiz'. Our AI monitors chats and blocks any phone numbers or personal info sharing. Everything stays anonymous until you choose otherwise. Perfect for getting academic help safely! 💬"
  },
  {
    question: "How does Split Saathi simplify group expenses?",
    answer: "Add your group expenses and we calculate who owes what. Our 'Simplify Debts' feature shows the minimum transactions needed to settle everything. Export summaries to share with your group. Makes group trips and shared expenses super easy! 💸"
  }
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
            Everything you need to know about using KIIT Saathi. 
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