import React from 'react';
import { FedKIITCard, KIITECellCard, USCKIITCard } from './SocietyCards';

export const SocietyCardsShowcase: React.FC = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-background to-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gradient mb-4">
            KIIT Society Cards
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Interactive society cards with brand-specific designs, hover effects, and seamless navigation to official pages.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FedKIITCard />
          <KIITECellCard />
          <USCKIITCard />
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Each card reflects the society's brand colors, typography, and identity
          </p>
        </div>
      </div>
    </section>
  );
};