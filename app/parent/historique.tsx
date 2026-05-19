import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  CalendarDays,
  CheckCircle2,
  FileText,
  FolderOpen,
  MessageSquare,
  Users,
} from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { BottomNav } from '../../components/BottomNav';
import { Card } from '../../components/Card';

type TimelineType = 'dossier' | 'message' | 'rdv' | 'decision' | 'event' | 'report';

interface TimelineItem {
  type: TimelineType;
  text: string;
  detail: string;
}

const YEARS = ['2026-2027', '2025-2026', '2024-2025'];
const FILTERS: { label: string; type?: TimelineType }[] = [
  { label: 'Tout' },
  { label: 'Dossiers', type: 'dossier' },
  { label: 'Messages', type: 'message' },
  { label: 'RDV', type: 'rdv' },
  { label: 'Décisions', type: 'decision' },
];

const TIMELINE: Record<string, { month: string; items: TimelineItem[] }[]> = {
  '2026-2027': [
    {
      month: 'Septembre',
      items: [
        {
          type: 'event',
          text: 'Nouveaux représentants élus',
          detail: 'Mandat école Jean Jaurès renouvelé',
        },
      ],
    },
    {
      month: 'Octobre',
      items: [
        {
          type: 'dossier',
          text: 'Passage piéton dangereux',
          detail: 'Dossier transmis au service Voirie',
        },
        {
          type: 'dossier',
          text: 'Sanitaires hors service bâtiment B',
          detail: 'Analyse en cours côté bâtiment',
        },
      ],
    },
    {
      month: 'Mai',
      items: [
        {
          type: 'rdv',
          text: 'Point sécurité abords école',
          detail: 'Rendez-vous confirmé avec la mairie',
        },
        {
          type: 'message',
          text: 'Message mairie - Travaux rue de l’École',
          detail: 'Information diffusée aux représentants',
        },
      ],
    },
  ],
  '2025-2026': [
    {
      month: 'Septembre',
      items: [
        { type: 'event', text: 'Renouvellement des représentants', detail: '4 accès actifs' },
      ],
    },
    {
      month: 'Octobre',
      items: [
        { type: 'dossier', text: 'Demande sur les sanitaires', detail: 'Signalement collectif' },
        { type: 'message', text: 'Information travaux cantine', detail: 'Diffusé par la mairie' },
      ],
    },
    {
      month: 'Janvier',
      items: [
        {
          type: 'decision',
          text: 'Réponse mairie - travaux programmés T2',
          detail: 'Décision publiée et archivée',
        },
      ],
    },
    {
      month: 'Juin',
      items: [{ type: 'report', text: 'Bilan annuel transmis', detail: 'Synthèse école générée' }],
    },
  ],
  '2024-2025': [
    {
      month: 'Mars',
      items: [
        { type: 'decision', text: 'Dossier restauration résolu', detail: 'Suivi clôturé' },
        { type: 'rdv', text: 'Réunion sectorisation', detail: 'Compte rendu partagé' },
      ],
    },
  ],
};

function TimelineIcon({ type }: { type: TimelineType }) {
  const iconProps = { size: 14, color: '#64748b' };
  if (type === 'dossier') return <FolderOpen {...iconProps} />;
  if (type === 'message') return <MessageSquare {...iconProps} />;
  if (type === 'rdv') return <CalendarDays {...iconProps} />;
  if (type === 'decision') return <CheckCircle2 {...iconProps} />;
  if (type === 'report') return <FileText {...iconProps} />;
  return <Users {...iconProps} />;
}

function timelineColor(type: TimelineType) {
  if (type === 'dossier') return '#2563eb';
  if (type === 'message') return '#6366f1';
  if (type === 'rdv') return '#10b981';
  if (type === 'decision') return '#0d9488';
  if (type === 'report') return '#d97706';
  return '#7c3aed';
}

export default function HistoriqueScreen() {
  const [selectedYear, setSelectedYear] = useState('2026-2027');
  const [activeFilter, setActiveFilter] = useState('Tout');

  const months = useMemo(() => {
    const selectedType = FILTERS.find((filter) => filter.label === activeFilter)?.type;
    return (TIMELINE[selectedYear] ?? []).map((month) => ({
      ...month,
      items: selectedType ? month.items.filter((item) => item.type === selectedType) : month.items,
    }));
  }, [activeFilter, selectedYear]);

  const flatItems = months.flatMap((month) => month.items);

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="Historique" subtitle="École élémentaire Jean Jaurès" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 12 }}
        >
          {YEARS.map((year) => {
            const active = year === selectedYear;
            return (
              <Pressable
                key={year}
                onPress={() => setSelectedYear(year)}
                className={`rounded-xl px-4 py-2 ${active ? 'bg-primary-500' : 'bg-white border border-slate-200'}`}
              >
                <Text
                  className={`text-xs font-semibold ${active ? 'text-white' : 'text-slate-500'}`}
                >
                  {year}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 16 }}
        >
          {FILTERS.map((filter) => {
            const active = filter.label === activeFilter;
            return (
              <Pressable
                key={filter.label}
                onPress={() => setActiveFilter(filter.label)}
                className={`rounded-full px-3 py-1.5 border ${active ? 'bg-primary-50 border-primary-200' : 'bg-white border-slate-200'}`}
              >
                <Text
                  className={`text-xs font-semibold ${active ? 'text-primary-700' : 'text-slate-500'}`}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="relative pl-8">
          <View className="absolute left-[11px] top-0 bottom-0 w-px bg-slate-200" />
          {months.map((month) => {
            if (month.items.length === 0) return null;
            return (
              <View key={month.month} className="mb-6">
                <View className="relative flex-row items-center gap-3 mb-3">
                  <View className="absolute -left-8 w-6 h-6 bg-primary-100 rounded-full items-center justify-center">
                    <CalendarDays color="#2563eb" size={12} />
                  </View>
                  <Text className="text-slate-700 font-bold text-sm">{month.month}</Text>
                </View>

                <View className="gap-2">
                  {month.items.map((item) => (
                    <View key={`${month.month}-${item.text}`} className="relative">
                      <View
                        className="absolute -left-8 mt-4 w-3 h-3 rounded-full border-2 border-white"
                        style={{ backgroundColor: timelineColor(item.type) }}
                      />
                      <Card className="p-3">
                        <View className="flex-row items-start gap-2">
                          <TimelineIcon type={item.type} />
                          <View className="flex-1">
                            <Text className="text-slate-700 text-sm font-semibold">
                              {item.text}
                            </Text>
                            <Text className="text-slate-400 text-xs mt-0.5">{item.detail}</Text>
                          </View>
                        </View>
                      </Card>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>

        <View className="bg-primary-50 rounded-2xl p-4 border border-primary-100">
          <Text className="text-primary-700 text-xs font-bold uppercase mb-3">
            Résumé {selectedYear}
          </Text>
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            <SummaryCell label="Événements" value={flatItems.length} />
            <SummaryCell
              label="Dossiers"
              value={flatItems.filter((item) => item.type === 'dossier').length}
            />
            <SummaryCell
              label="RDV"
              value={flatItems.filter((item) => item.type === 'rdv').length}
            />
            <SummaryCell
              label="Décisions"
              value={flatItems.filter((item) => item.type === 'decision').length}
            />
          </View>
        </View>
      </ScrollView>
      <BottomNav variant="parent" />
    </View>
  );
}

function SummaryCell({ label, value }: { label: string; value: number }) {
  return (
    <View className="bg-white/70 rounded-xl p-3 items-center" style={{ flex: 1, minWidth: '47%' }}>
      <Text className="text-slate-800 text-lg font-bold">{value}</Text>
      <Text className="text-slate-500 text-[10px] font-medium">{label}</Text>
    </View>
  );
}
