// Import des images
import clio5 from '../assets/images/cars-png/renault-clio-5.png';
import accent from '../assets/images/cars-png/hyundai-accent.png';
import sanderoStepway from '../assets/images/cars-png/dacia-sandero-stepway.png';
import duster from '../assets/images/cars-png/dacia-duster.png';
import peugeot208 from '../assets/images/cars-png/peugeot-208.png';
import golf from '../assets/images/cars-png/volkswagen-golf.png';
import tucson from '../assets/images/cars-png/hyundai-tucson.png';
import troc from '../assets/images/cars-png/volkswagen-t-roc.png';

export const cars = {
  featured: [
    {
      id: 1,
      name: 'Renault Clio 5',
      type: 'Citadine',
      image: clio5,
      price: 250,
      specs: {
        portes: '5',
        passagers: '5',
        transmission: 'Automatique',
        climatisation: 'Oui',
        carburant: 'Essence'
      }
    },
    {
      id: 2,
      name: 'Hyundai Accent',
      type: 'Berline',
      image: accent,
      price: 280,
      specs: {
        portes: '4',
        passagers: '5',
        transmission: 'Manuelle',
        climatisation: 'Oui',
        carburant: 'Diesel'
      }
    },
    {
      id: 3,
      name: 'Dacia Sandero Stepway',
      type: 'Crossover',
      image: sanderoStepway,
      price: 230,
      specs: {
        portes: '5',
        passagers: '5',
        transmission: 'Manuelle',
        climatisation: 'Oui',
        carburant: 'Diesel'
      }
    },
    {
      id: 4,
      name: 'Dacia Duster',
      type: 'SUV',
      image: duster,
      price: 300,
      specs: {
        portes: '5',
        passagers: '5',
        transmission: 'Manuelle',
        climatisation: 'Oui',
        carburant: 'Diesel'
      }
    },
    {
      id: 5,
      name: 'Peugeot 208',
      type: 'Citadine',
      image: peugeot208,
      price: 250,
      specs: {
        portes: '5',
        passagers: '5',
        transmission: 'Automatique',
        climatisation: 'Oui',
        carburant: 'Essence'
      }
    },
    {
      id: 6,
      name: 'Volkswagen Golf',
      type: 'Compacte',
      image: golf,
      price: 320,
      specs: {
        portes: '5',
        passagers: '5',
        transmission: 'Automatique',
        climatisation: 'Oui',
        carburant: 'Essence'
      }
    },
    {
      id: 7,
      name: 'Hyundai Tucson',
      type: 'SUV',
      image: tucson,
      price: 350,
      specs: {
        portes: '5',
        passagers: '5',
        transmission: 'Automatique',
        climatisation: 'Oui',
        carburant: 'Hybride'
      }
    },
    {
      id: 8,
      name: 'Volkswagen T-Roc',
      type: 'SUV Compact',
      image: troc,
      price: 330,
      specs: {
        portes: '5',
        passagers: '5',
        transmission: 'Automatique',
        climatisation: 'Oui',
        carburant: 'Essence'
      }
    }
  ]
};
