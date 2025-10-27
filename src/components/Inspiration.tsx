import React from 'react';
import { ArrowRight } from 'lucide-react';
import founderImg from '../assets/founder.jpg';
import kissImg from '../assets/kiss.jpg';
import kimsImg from '../assets/kims.jpg';
import aogImg from '../assets/aog.jpg';

interface InspirationCardProps {
  title: string;
  description: string;
  imageUrl: string;
  link: string;
}

const InspirationCard: React.FC<InspirationCardProps> = ({ title, description, imageUrl, link }) => {
  return (
    <div className="group w-full bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 h-full flex flex-col transform hover:-translate-y-2 ring-2 ring-green-400/20 hover:ring-green-400/40 hover:ring-offset-2 hover:ring-offset-green-100">
      {/* Image section with zoom + overlay */}
      <div className="relative overflow-hidden h-36">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Text section */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-900 mb-1 font-poppins group-hover:text-blue-600 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-gray-600 text-md mb-2 leading-relaxed flex-1 font-poppins">
          {description}
        </p>

        {link && (
          <div className="mt-auto">
            <a
              href={link}
              target="_blank"
              className="inline-flex items-center text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors duration-300"
            >
              Learn More
              <svg
                className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};



const FounderCard: React.FC = () => {
  return (
    <div className="group w-full bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-500 h-full flex flex-col items-center transform hover:-translate-y-2 ring-2 ring-green-400/20 hover:ring-green-400/40 hover:ring-offset-2 hover:ring-offset-green-100">
      <div className="p-3 flex flex-col items-center flex-1 justify-center relative">
        {/* Blue glowing background behind image */}
        <div className="absolute top-6">
          <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 w-32 h-32" />
        </div>

        <img
          src={founderImg}
          alt="Prof. (Dr.) Achyuta Samanta"
          className="relative w-32 h-32 object-cover rounded-full shadow-lg border-4 border-blue-100 mb-2 group-hover:scale-105 transition-transform duration-500"
        />

        <h2 className="text-lg font-bold text-gray-900 text-center mb-1">
          Prof. (Dr.) Achyuta Samanta
        </h2>
        <p className="text-sm text-blue-600 font-semibold mb-2 text-center">
          Founder KIIT, KISS, KIMS & Art of Giving
        </p>
        <div className="w-12 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mb-3" />
        <p className="text-gray-700 leading-relaxed text-md font-poppins text-center">
          Dr. Achyuta Samanta is an educationalist, philanthropist, humanitarian, social worker, and writer.
          He is the founder of KIIT & KISS, both educational institutions of global repute and recognition.
        </p>
      </div>
      <div className="mt-auto p-4">
          <a
            href="https://achyutasamanta.com/"
            className="inline-flex items-center text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors duration-300"
            target="_blank"
          >
            Learn More
            <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
    </div>
  );
};


const InspirationSection: React.FC = () => {
  const cards = [
    {
      title: "KISS: Educating the Marginalised",
      description: "KISS is the world's largest fully residential institution for tribal children. Founded with love and compassion, it empowers 80,000 lives with free education, food, and care.",
      imageUrl: kissImg,
      link: "https://kiss.ac.in/"
    },
    {
      title: "KIMS: Compassionate Healthcare",
      description: "KIMS is more than a hospital — it's a temple of healing. With cutting-edge technology and a human touch, KIMS serves thousands every day, rooted in service to all.",
      imageUrl: kimsImg,
      link: "https://kims.kiit.ac.in/"
    },
    {
      title: "AOG: Art of Giving ",
      description: "AOG is global movement that promotes selfless service and spreading smiles. AOG encourages individuals to give—not just wealth, but time, empathy, and love.",
      imageUrl: aogImg,
      link: "https://artofgiving.in.net/"
    }
  ];

  return (
    <div className="w-screen py-8 bg-gradient-to-br from-campus-blue/10 to-kiit-green/10">
      {/* Our Inspiration as the heading, then the following divs (cards) */}
      <div className="w-full max-w-full mx-auto px-6">
        <header className="mb-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-poppins font-bold text-gradient">
            Our Inspiration
          </h2>
        </header>

        <section className="w-full h-auto px-0 py-4">
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 items-stretch">
            <FounderCard />
            {cards.map((card, index) => (
              <InspirationCard key={index} {...card} />
            ))}
            
          </div>
        </section>
      </div>
    </div>
  );
};

export default InspirationSection;