// Author: Senior Frontend Engineer
// OS support: Windows, macOS, Linux
// Description: Section de sensibilisation aux réalités des Antilles françaises (Guadeloupe & Martinique)

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  TrendingUp, 
  Droplets, 
  Briefcase, 
  Hospital, 
  Wind, 
  Share2, 
  ChevronRight, 
  Info, 
  ArrowLeft,
  ExternalLink,
  Users,
  Lightbulb,
  BarChart3,
  Play,
  Volume2,
  Sun,
  Moon,
  Eye,
  BookOpen,
  Anchor,
  CloudRain
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  AreaChart,
  Area
} from 'recharts';

// Données fictives basées sur des tendances réelles pour l'illustration pédagogique
const delinquencyData = [
  { year: '2019', homicides: 25 },
  { year: '2020', homicides: 28 },
  { year: '2021', homicides: 32 },
  { year: '2022', homicides: 45 },
  { year: '2023', homicides: 48 },
];

const priceComparisonData = [
  { category: 'Alimentaire', metropole: 100, antilles: 138 },
  { category: 'Carburant', metropole: 100, antilles: 115 },
  { category: 'Logement', metropole: 100, antilles: 110 },
  { category: 'Santé', metropole: 100, antilles: 105 },
];

const unemploymentData = [
  { region: 'Métropole', rate: 7.5 },
  { region: 'Guadeloupe', rate: 18.2 },
  { region: 'Martinique', rate: 14.5 },
  { region: 'La Réunion', rate: 17.1 },
  { region: 'Jeunes (DROM)', rate: 42.0 },
];

const territoryData = {
  guadeloupe: {
    name: "Guadeloupe",
    homicides: 52,
    waterLoss: 61,
    unemployment: 18.2,
    priceGap: 16,
    crimeReason: "En Guadeloupe, la vie chère (+16% global, +38% alimentaire) crée une fracture sociale explosive. Face à un chômage des jeunes de 45%, la criminalité devient une stratégie de survie. L'achat d'armes illégales est perçu comme une nécessité de 'protection' dans un environnement où la précarité alimente une violence structurelle.",
    waterReason: "Des décennies de sous-investissement et une gestion fragmentée ont laissé le réseau dans un état critique, avec des fuites massives atteignant parfois 60%.",
    delinquencyHistory: [
      { year: '2019', homicides: 25 },
      { year: '2020', homicides: 28 },
      { year: '2021', homicides: 32 },
      { year: '2022', homicides: 45 },
      { year: '2023', homicides: 48 },
      { year: '2024', homicides: 50 },
      { year: '2025', homicides: 52 },
    ],
  },
  martinique: {
    name: "Martinique",
    homicides: 38,
    waterLoss: 45,
    unemployment: 14.5,
    priceGap: 14,
    crimeReason: "La Martinique subit une pression économique étouffante. Les difficultés d'accès aux produits de base poussent certains jeunes vers les réseaux de trafic. L'insécurité grandissante incite à l'armement préventif, créant un cercle vicieux où la peur justifie la possession d'armes à feu.",
    waterReason: "Le relief accidenté et la vétusté des canalisations rendent la distribution complexe et sujette à de nombreuses ruptures quotidiennes.",
    delinquencyHistory: [
      { year: '2019', homicides: 20 },
      { year: '2020', homicides: 22 },
      { year: '2021', homicides: 26 },
      { year: '2022', homicides: 30 },
      { year: '2023', homicides: 35 },
      { year: '2024', homicides: 37 },
      { year: '2025', homicides: 38 },
    ],
  },
  reunion: {
    name: "La Réunion",
    homicides: 14,
    waterLoss: 25,
    unemployment: 17.1,
    priceGap: 10,
    crimeReason: "À La Réunion, bien que le taux d'homicide soit plus faible, la précarité (36% sous le seuil de pauvreté) génère une délinquance de proximité. Les jeunes, confrontés à un horizon bouché, peuvent glisser vers des comportements à risque, bien que l'armement soit moins systématique qu'aux Antilles.",
    waterReason: "La gestion de la ressource est un défi face à la croissance démographique et aux épisodes de sécheresse de plus en plus fréquents.",
    delinquencyHistory: [
      { year: '2019', homicides: 8 },
      { year: '2020', homicides: 9 },
      { year: '2021', homicides: 10 },
      { year: '2022', homicides: 11 },
      { year: '2023', homicides: 12 },
      { year: '2024', homicides: 13 },
      { year: '2025', homicides: 14 },
    ],
  }
};

const documentarySteps = [
  {
    id: 'morning',
    time: '07:00',
    title: 'Le réveil sans eau',
    icon: <Droplets className="w-8 h-8 text-blue-500" />,
    description: "Le robinet est sec. C'est le deuxième jour de 'tour d'eau' cette semaine. Cette situation est due à la vétusté extrême des réseaux (fuites massives) et à un manque d'investissement structurel depuis des décennies. En Guadeloupe, plus de 60% de l'eau produite n'arrive jamais au robinet, se perdant dans le sol à cause de tuyaux percés. Imaginez préparer vos enfants pour l'école sans pouvoir tirer la chasse d'eau ou prendre une douche.",
    stat: 'Jusqu\'à 60% de fuites',
    bg: 'https://images.unsplash.com/photo-1518005020250-675f0f0fd17b?auto=format&fit=crop&q=80&w=1920'
  },
  {
    id: 'noon',
    time: '12:30',
    title: 'Le choc du panier',
    icon: <TrendingUp className="w-8 h-8 text-emerald-500" />,
    description: "Au supermarché, le prix du lait ou de l'huile est presque le double de celui de l'hexagone. Cette vie chère rend le quotidien insupportable pour les plus précaires. Un yaourt coûte 40% de plus qu'à Paris. Pour une famille au SMIC, se nourrir sainement est devenu un luxe. Cette injustice économique nourrit une colère sourde qui explose régulièrement lors de crises sociales majeures.",
    stat: '+38% sur l\'alimentaire',
    bg: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1920'
  },
  {
    id: 'evening',
    time: '19:00',
    title: 'L\'ombre de l\'insécurité',
    icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
    description: "Le climat social difficile et le manque de perspectives poussent certains jeunes vers le trafic de drogue, seule 'issue' financière visible. Pour se 'protéger' dans ce milieu violent, beaucoup s'arment illégalement. La circulation d'armes à feu a explosé, transformant des quartiers autrefois paisibles en zones de tension. Le sentiment d'abandon par l'État renforce l'idée que chacun doit faire sa propre loi.",
    stat: 'Hausse des homicides',
    bg: 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?auto=format&fit=crop&q=80&w=1920'
  },
  {
    id: 'night',
    time: '22:00',
    title: 'Perspectives d\'avenir',
    icon: <Briefcase className="w-8 h-8 text-amber-500" />,
    description: "Le chômage massif et le sentiment d'impasse économique forcent les talents à l'exil. Un jeune sur deux est sans emploi. Cette fuite des cerveaux appauvrit le territoire et laisse derrière elle une population vieillissante et désabusée. Sans un plan Marshall pour la jeunesse et une réelle autonomie économique, le cycle de la précarité et de la violence semble sans fin.",
    stat: '1 jeune sur 2 au chômage',
    bg: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1920'
  }
];

interface SectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  color: string;
  theme: 'dark' | 'light';
}

const Section: React.FC<SectionProps> = ({ title, icon, children, color, id, theme }) => (
  <motion.section 
    id={id}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`rounded-[2.5rem] border p-8 md:p-12 shadow-2xl relative overflow-hidden group transition-all duration-500 ${
      color.includes('red') ? 'hover:border-red-600/50' : 
      color.includes('emerald') ? 'hover:border-emerald-600/50' : 
      color.includes('blue') ? 'hover:border-blue-600/50' : 
      color.includes('amber') ? 'hover:border-amber-600/50' : 
      color.includes('indigo') ? 'hover:border-indigo-600/50' : 
      'hover:border-cyan-600/50'
    } ${
      theme === 'dark' ? 'bg-[#111] border-white/5' : 'bg-white border-black/5'
    }`}
  >
    <div className={`absolute top-0 right-0 w-64 h-64 ${color} opacity-5 blur-[80px] -mr-32 -mt-32 transition-opacity group-hover:opacity-10`}></div>
    <div className="flex items-center gap-4 mb-8 relative z-10">
      <div className={`p-4 rounded-2xl ${color.replace('bg-', 'bg-opacity-20 ')} bg-opacity-20 shadow-lg`}>
        {icon}
      </div>
      <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">{title}</h3>
    </div>
    <div className="relative z-10">
      {children}
    </div>
  </motion.section>
);

export const AntillesAwareness: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'guadeloupe' | 'martinique' | 'reunion'>('guadeloupe');
  const [mode, setMode] = useState<'info' | 'immersive'>('info');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const shareContent = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Sensibilisation – Réalités des Antilles françaises',
        text: 'Découvrez les enjeux et réalités de la Guadeloupe et de la Martinique.',
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('Lien copié dans le presse-papier !');
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0a0a0a] text-white' : 'bg-gray-50 text-gray-900'} font-sans selection:bg-red-600 selection:text-white`}>
      {/* Top Controls */}
      <div className="fixed top-6 right-6 z-[100] flex gap-3">
        <button 
          onClick={toggleTheme}
          className={`p-3 rounded-full border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/5 border-black/10 hover:bg-black/10'}`}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button 
          onClick={() => setMode(prev => prev === 'info' ? 'immersive' : 'info')}
          className={`px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 border ${
            mode === 'info' 
              ? (theme === 'dark' ? 'bg-red-600 border-red-600 text-white' : 'bg-red-600 border-red-600 text-white')
              : (theme === 'dark' ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
          }`}
        >
          {mode === 'info' ? <Play className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
          {mode === 'info' ? 'Mode Immersif' : 'Mode Classique'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'info' ? (
          <motion.div 
            key="info-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header Immersif */}
            <header className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1589394815804-964ed962eb33?auto=format&fit=crop&q=80&w=1920" 
            className="w-full h-full object-cover opacity-40 scale-105 animate-slow-zoom"
            alt="Antilles Landscape"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/60 to-[#0a0a0a]"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="absolute top-[-100px] left-0 md:left-[-100px] bg-white/5 hover:bg-white/10 p-4 rounded-full transition-all group"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1 rounded-full bg-red-600/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-red-600/30">
              Espace Pédagogique
            </span>
            <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-none mb-8 drop-shadow-2xl">
              Sensibilisation <br />
              <span className="text-red-600">Réalités Antilles</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed italic">
              Comprendre les problématiques structurelles de la Guadeloupe et de la Martinique pour une meilleure solidarité nationale.
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
          <ChevronRight className="w-8 h-8 rotate-90" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-32 space-y-24">
        
        {/* Mention d'objectif */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] flex items-start gap-6 italic">
          <Info className="w-8 h-8 text-red-600 shrink-0 mt-1" />
          <p className="text-sm text-gray-400 leading-relaxed">
            <span className="text-white font-black uppercase">Note d'intention :</span> Cette section a pour unique but la sensibilisation et la compréhension des réalités locales. Elle repose sur des faits documentés et des statistiques officielles pour offrir un regard objectif sur les défis quotidiens des populations antillaises.
          </p>
        </div>

        {/* Navigation Territoriale */}
        <div className="flex justify-center flex-wrap gap-4">
          <button 
            onClick={() => setActiveTab('guadeloupe')}
            className={`px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${activeTab === 'guadeloupe' ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' : (theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10')}`}
          >
            Guadeloupe
          </button>
          <button 
            onClick={() => setActiveTab('martinique')}
            className={`px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${activeTab === 'martinique' ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' : (theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10')}`}
          >
            Martinique
          </button>
          <button 
            onClick={() => setActiveTab('reunion')}
            className={`px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${activeTab === 'reunion' ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' : (theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10')}`}
          >
            La Réunion
          </button>
        </div>

        {/* Sections Thématiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Délinquance */}
          <Section id="delinquance" title="Délinquance & Insécurité" icon={<AlertTriangle />} color="bg-red-600" theme={theme}>
            <div className="space-y-6">
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
                {territoryData[activeTab].crimeReason}
              </p>
              <div className="h-64 w-full mt-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={territoryData[activeTab].delinquencyHistory}>
                    <defs>
                      <linearGradient id="colorHomicides" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="year" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                      itemStyle={{ color: '#dc2626', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="homicides" stroke="#dc2626" strokeWidth={3} fillOpacity={1} fill="url(#colorHomicides)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-black text-red-600 uppercase">Homicides / an</span>
                  <p className="text-sm font-bold mt-1">~{territoryData[activeTab].homicides}</p>
                </div>
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-black text-red-600 uppercase">Sentiment d'insécurité</span>
                  <p className="text-sm font-bold mt-1">72% de la population</p>
                </div>
              </div>
            </div>
          </Section>

          {/* Vie Chère */}
          <Section id="vie-chere" title="Vie Chère & Inflation" icon={<TrendingUp />} color="bg-emerald-600" theme={theme}>
            <div className="space-y-6">
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
                L'éloignement géographique et la dépendance aux importations créent un différentiel de prix massif. Le panier moyen est nettement plus onéreux qu'en France hexagonale.
              </p>
              <div className="h-64 w-full mt-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { category: 'Alimentaire', metropole: 100, local: 100 + territoryData[activeTab].priceGap * 2.5 },
                    { category: 'Global', metropole: 100, local: 100 + territoryData[activeTab].priceGap },
                    { category: 'Santé', metropole: 100, local: 110 },
                  ]} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="category" type="category" stroke="#666" fontSize={10} width={80} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                    />
                    <Bar dataKey="metropole" name="Métropole (Base 100)" fill="#333" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="local" name={territoryData[activeTab].name} fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <blockquote className="border-l-4 border-emerald-600 pl-4 py-2 italic text-sm text-gray-400">
                "L'écart de prix sur l'alimentaire atteint +{territoryData[activeTab].priceGap * 2.5}% par rapport à l'hexagone."
              </blockquote>
            </div>
          </Section>

          {/* Eau Potable */}
          <Section id="eau" title="Crise de l'Eau" icon={<Droplets />} color="bg-blue-600" theme={theme}>
            <div className="space-y-6">
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
                {territoryData[activeTab].waterReason}
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></div>
                    <span className="text-xs font-bold uppercase">Pertes en réseau</span>
                  </div>
                  <span className="text-xl font-black italic text-blue-600">~{territoryData[activeTab].waterLoss}%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    <span className="text-xs font-bold uppercase">Coupures hebdomadaires</span>
                  </div>
                  <span className="text-xl font-black italic text-blue-600">2 à 4 jours</span>
                </div>
              </div>
              <div className="bg-blue-600/10 p-6 rounded-3xl border border-blue-600/20">
                <h5 className="text-[10px] font-black uppercase text-blue-600 mb-2">Impact Sanitaire</h5>
                <p className="text-xs text-gray-400 leading-relaxed">
                  L'accès irrégulier à l'eau potable favorise le stockage domestique, augmentant les risques de prolifération de moustiques et de contamination.
                </p>
              </div>
            </div>
          </Section>

          {/* Chômage */}
          <Section id="economie" title="Économie & Emploi" icon={<Briefcase />} color="bg-amber-600" theme={theme}>
            <div className="space-y-6">
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
                Le chômage structurel, particulièrement chez les moins de 25 ans, pousse de nombreux talents vers l'hexagone. À {territoryData[activeTab].name}, le taux de chômage atteint {territoryData[activeTab].unemployment}%, soit plus du double de la moyenne nationale.
              </p>
              <div className="h-64 w-full mt-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { region: 'Métropole', rate: 7.5 },
                    { region: territoryData[activeTab].name, rate: territoryData[activeTab].unemployment },
                    { region: 'Jeunes (DROM)', rate: 42.0 },
                  ]}>
                    <XAxis dataKey="region" stroke="#666" fontSize={9} axisLine={false} tickLine={false} />
                    <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                    />
                    <Bar dataKey="rate" name="Taux de chômage (%)" fill="#d97706" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="p-6 bg-amber-600/5 rounded-3xl border border-amber-600/10">
                <h5 className="text-[10px] font-black uppercase text-amber-600 mb-2">Fuite des Talents</h5>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Chaque année, des milliers de jeunes diplômés quittent {territoryData[activeTab].name} faute d'opportunités locales, appauvrissant le capital humain du territoire.
                </p>
              </div>
            </div>
          </Section>

          {/* Santé */}
          <Section id="sante" title="Santé & Infrastructures" icon={<Hospital />} color="bg-indigo-600" theme={theme}>
            <div className="space-y-6">
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
                Les CHU d'outre-mer sont sous tension permanente. Le manque de spécialistes et la vétusté de certains plateaux techniques imposent souvent des évacuations sanitaires (EVASAN).
              </p>
              <div className="grid grid-cols-1 gap-4">
                <div className="p-6 bg-indigo-600/10 rounded-3xl border border-indigo-600/20 flex items-center gap-6">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black uppercase text-indigo-600 mb-1">Déserts Médicaux</h5>
                    <p className="text-xs text-gray-400">Délai moyen pour un spécialiste : 6 à 12 mois.</p>
                  </div>
                </div>
                <div className="p-6 bg-indigo-600/10 rounded-3xl border border-indigo-600/20 flex items-center gap-6">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black uppercase text-indigo-600 mb-1">Évacuations Sanitaires</h5>
                    <p className="text-xs text-gray-400">+20% d'augmentation des transferts vers la métropole.</p>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* Climat */}
          <Section id="climat" title="Vulnérabilité Climatique" icon={<Wind />} color="bg-cyan-600" theme={theme}>
            <div className="space-y-6">
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
                Situés en zones sensibles, les DROM subissent de plein fouet le dérèglement climatique : ouragans plus intenses, montée des eaux et érosion côtière.
              </p>
              <div className="relative aspect-video rounded-3xl overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&q=80&w=800" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  alt="Hurricane impact"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                  <p className="text-[10px] font-bold uppercase italic text-white/80">
                    L'ouragan Maria (2017) a causé des dommages estimés à plusieurs milliards d'euros.
                  </p>
                </div>
              </div>
              <div className="bg-cyan-600/10 p-6 rounded-3xl border border-cyan-600/20">
                <h5 className="text-[10px] font-black uppercase text-cyan-600 mb-2">Sargasses</h5>
                <p className="text-xs text-gray-400 leading-relaxed">
                  L'échouage massif d'algues sargasses toxiques impacte l'économie touristique et la santé des riverains.
                </p>
              </div>
            </div>
          </Section>
        </div>

        {/* Comprendre les causes */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="bg-gradient-to-br from-[#111] to-[#0a0a0a] p-12 md:p-20 rounded-[4rem] border border-white/10 shadow-3xl text-center"
        >
          <Lightbulb className="w-16 h-16 text-yellow-500 mx-auto mb-8" />
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-12">Analyse des causes profondes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
            <div className="space-y-4">
              <h4 className="text-red-600 font-black uppercase italic text-sm">L'Insularité & Dépendance</h4>
              <p className="text-xs text-gray-400 leading-relaxed">L'éloignement géographique impose des coûts de transport massifs. La dépendance aux importations (80% des produits) rend les territoires vulnérables aux crises mondiales et aux monopoles de distribution.</p>
            </div>
            <div className="space-y-4">
              <h4 className="text-red-600 font-black uppercase italic text-sm">Désinvestissement Public</h4>
              <p className="text-xs text-gray-400 leading-relaxed">Le manque d'entretien des infrastructures (eau, santé, routes) depuis 40 ans a créé une dette structurelle. Les services publics sont souvent en sous-effectif face à des besoins croissants.</p>
            </div>
            <div className="space-y-4">
              <h4 className="text-red-600 font-black uppercase italic text-sm">Fracture Sociale</h4>
              <p className="text-xs text-gray-400 leading-relaxed">Un taux de pauvreté 3 fois supérieur à la métropole. Le sentiment d'être des 'citoyens de seconde zone' nourrit une colère sociale profonde et une perte de confiance envers les institutions.</p>
            </div>
          </div>
        </motion.div>

        {/* Pistes d'amélioration */}
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Pistes d'amélioration</h2>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Vers un avenir plus résilient</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "Souveraineté Alimentaire", desc: "Développer l'agriculture locale pour réduire la dépendance aux importations." },
              { title: "Rénovation des Réseaux", desc: "Plan massif d'investissement pour l'eau et l'assainissement." },
              { title: "Énergies Renouvelables", desc: "Exploiter le potentiel solaire et géothermique pour l'autonomie énergétique." },
              { title: "Économie Bleue", desc: "Valoriser les ressources marines de manière durable et responsable." }
            ].map((item, idx) => (
              <div key={idx} className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5 flex items-center gap-8 group hover:border-red-600 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-black text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                  0{idx + 1}
                </div>
                <div>
                  <h4 className="font-black uppercase italic text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer de la section */}
        <footer className={`pt-20 border-t flex flex-col md:flex-row items-center justify-between gap-12 ${theme === 'dark' ? 'border-white/5' : 'border-black/5'}`}>
          <div className="space-y-4 text-center md:text-left">
            <h4 className="text-xl font-black italic uppercase tracking-tighter">Sources & Ressources</h4>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <a href="https://www.insee.fr" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 hover:text-red-600 transition-colors">
                <ExternalLink className="w-3 h-3" /> INSEE DROM
              </a>
              <a href="https://www.iedom.fr" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 hover:text-red-600 transition-colors">
                <ExternalLink className="w-3 h-3" /> IEDOM
              </a>
              <a href="https://www.outre-mer.gouv.fr" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 hover:text-red-600 transition-colors">
                <ExternalLink className="w-3 h-3" /> Ministère Outre-Mer
              </a>
            </div>
            <p className="text-[9px] text-gray-500 uppercase font-bold mt-4 italic">
              Mention légale : Les données présentées sont issues de sources publiques officielles (INSEE, IEDOM, Ministères).
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={shareContent}
              className="flex items-center gap-3 bg-red-600 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 text-white"
            >
              <Share2 className="w-4 h-4" /> Partager l'espace
            </button>
          </div>
        </footer>

      </main>
          </motion.div>
        ) : (
          <motion.div 
            key="immersive-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            {/* Intro Screen */}
            <section className="h-screen flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <img 
                  src="https://images.unsplash.com/photo-1589394815804-964ed962eb33?auto=format&fit=crop&q=80&w=1920" 
                  className="w-full h-full object-cover opacity-30"
                  alt="Intro"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/60"></div>
              </div>
              <div className="relative z-10 text-center px-6">
                <motion.h2 
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter mb-6"
                >
                  Bienvenue dans le quotidien <br />
                  <span className="text-red-600">de milliers d'habitants.</span>
                </motion.h2>
                <p className="text-gray-400 uppercase tracking-[0.3em] text-xs animate-pulse">Scrollez pour commencer l'expérience</p>
              </div>
            </section>

            {/* Journey Steps */}
            {documentarySteps.map((step, index) => (
              <section key={step.id} className="min-h-screen relative flex items-center justify-center py-20">
                <div className="absolute inset-0 z-0">
                  <img 
                    src={step.bg} 
                    className="w-full h-full object-cover opacity-20"
                    alt={step.title}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
                </div>
                
                <div className="max-w-4xl mx-auto px-6 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-4xl font-black text-red-600/50 italic">{step.time}</span>
                      <div className="h-px flex-1 bg-red-600/20"></div>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      {step.icon}
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter">{step.title}</h3>
                    </div>
                    <p className="text-lg text-gray-300 leading-relaxed italic mb-8">
                      {step.description}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] text-center"
                  >
                    <h4 className="text-5xl font-black text-red-600 mb-2 italic">{step.stat.split(' ')[0]}</h4>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                      {step.stat.split(' ').slice(1).join(' ')}
                    </p>
                  </motion.div>
                </div>
              </section>
            ))}

            {/* Special Sequence: Traffic & Climate */}
            <section className="min-h-screen bg-red-950/20 py-32 flex flex-col items-center justify-center">
              <div className="max-w-6xl mx-auto px-6 w-full space-y-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <Anchor className="w-10 h-10 text-red-600" />
                      <h3 className="text-4xl font-black uppercase italic tracking-tighter">Les routes du trafic</h3>
                    </div>
                    <p className="text-gray-400 leading-relaxed italic">
                      La position stratégique des DROM dans la Caraïbe et l'Océan Indien en fait des points de transit clés pour les trafics illicites. Cette réalité alimente directement l'insécurité locale.
                    </p>
                    <div className="aspect-video bg-black/40 rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden relative group">
                       <img src="https://images.unsplash.com/photo-1524522173746-f628baad3644?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-1000" alt="Routes" />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <CloudRain className="w-10 h-10 text-cyan-500" />
                      <h3 className="text-4xl font-black uppercase italic tracking-tighter">Changement Climatique</h3>
                    </div>
                    <p className="text-gray-400 leading-relaxed italic">
                      Montée des eaux, ouragans dévastateurs, blanchiment des coraux. Les territoires d'outre-mer sont en première ligne face à l'urgence climatique mondiale.
                    </p>
                    <div className="aspect-video bg-black/40 rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden relative group">
                       <img src="https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-1000" alt="Climate" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Ending Screen */}
            <section className="h-screen flex flex-col items-center justify-center text-center px-6 bg-gradient-to-t from-emerald-950/20 to-transparent">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                className="max-w-3xl space-y-8"
              >
                <Lightbulb className="w-20 h-20 text-emerald-500 mx-auto" />
                <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">Un avenir possible</h2>
                <p className="text-xl text-gray-400 leading-relaxed italic">
                  La résilience des populations et les initiatives locales montrent qu'un changement est possible. Solidarité, investissement et autonomie sont les clés de demain.
                </p>
                <div className="flex flex-wrap justify-center gap-4 pt-8">
                  <button onClick={() => setMode('info')} className="bg-white text-black px-10 py-5 rounded-full font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all">
                    Approfondir les chiffres
                  </button>
                  <button onClick={onBack} className="bg-red-600 text-white px-10 py-5 rounded-full font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all">
                    Retour au Dashboard
                  </button>
                </div>
                <p className="text-[9px] text-gray-600 uppercase font-bold mt-12 italic">
                  Mention légale : Les données présentées sont issues de sources publiques officielles.
                </p>
              </motion.div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Back Button for Mobile */}
      <button 
        onClick={onBack}
        className="fixed bottom-8 right-8 z-[100] md:hidden bg-red-600 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl shadow-red-600/40"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
    </div>
  );
};

// --- End of AntillesAwareness.tsx ---
