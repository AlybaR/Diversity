import type { ReactElement } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Home,
  FolderOpen,
  MessageSquare,
  CalendarDays,
  Users,
  LayoutDashboard,
  Building2,
  Mail,
} from 'lucide-react-native';
import { router, usePathname, type Href } from 'expo-router';
import { COLORS } from '../constants/theme';

interface BottomNavProps {
  variant?: 'parent' | 'mairie' | 'direction';
}

interface NavItem {
  label: string;
  path: Href;
  icon: (color: string, size: number) => ReactElement;
}

const PARENT_ITEMS: NavItem[] = [
  { label: 'Accueil', path: '/parent/home', icon: (c, s) => <Home color={c} size={s} /> },
  {
    label: 'Dossiers',
    path: '/parent/dossiers',
    icon: (c, s) => <FolderOpen color={c} size={s} />,
  },
  {
    label: 'Messages',
    path: '/parent/messages',
    icon: (c, s) => <MessageSquare color={c} size={s} />,
  },
  {
    label: 'Rendez-vous',
    path: '/parent/appointments',
    icon: (c, s) => <CalendarDays color={c} size={s} />,
  },
  { label: 'Annuaire', path: '/parent/directory', icon: (c, s) => <Users color={c} size={s} /> },
];

const MAIRIE_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/mairie/dashboard',
    icon: (c, s) => <LayoutDashboard color={c} size={s} />,
  },
  { label: 'Écoles', path: '/mairie/schools', icon: (c, s) => <Building2 color={c} size={s} /> },
  {
    label: 'Messages',
    path: '/mairie/messages' as Href,
    icon: (c, s) => <Mail color={c} size={s} />,
  },
  {
    label: 'RDV',
    path: '/mairie/rendez-vous' as Href,
    icon: (c, s) => <CalendarDays color={c} size={s} />,
  },
];

const DIRECTION_ITEMS: NavItem[] = [
  {
    label: 'Accueil',
    path: '/direction/home' as Href,
    icon: (c, s) => <Home color={c} size={s} />,
  },
  {
    label: 'Dossiers',
    path: '/direction/dossiers' as Href,
    icon: (c, s) => <FolderOpen color={c} size={s} />,
  },
  {
    label: 'Messages',
    path: '/direction/messages' as Href,
    icon: (c, s) => <MessageSquare color={c} size={s} />,
  },
  {
    label: 'Rendez-vous',
    path: '/direction/appointments' as Href,
    icon: (c, s) => <CalendarDays color={c} size={s} />,
  },
  {
    label: 'Annuaire',
    path: '/direction/directory' as Href,
    icon: (c, s) => <Users color={c} size={s} />,
  },
];

export function BottomNav({ variant = 'parent' }: BottomNavProps) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const items =
    variant === 'parent' ? PARENT_ITEMS : variant === 'mairie' ? MAIRIE_ITEMS : DIRECTION_ITEMS;
  const activeColor =
    variant === 'mairie'
      ? COLORS.mairie[600]
      : variant === 'direction'
        ? COLORS.direction[600]
        : COLORS.primary[500];

  return (
    <View
      className="absolute left-0 right-0 bottom-0 bg-white/95 border-t border-slate-200"
      style={{ paddingBottom: Math.max(insets.bottom, 8), paddingTop: 8 }}
    >
      <View className="flex-row items-center justify-around">
        {items.map((item, index) => {
          const pathStr = typeof item.path === 'string' ? item.path : '';
          const active =
            pathStr !== '' && (pathname === pathStr || pathname.startsWith(pathStr + '/'));
          const color = active ? activeColor : COLORS.slate[400];
          return (
            <Pressable
              key={pathStr}
              onPress={() => router.push(item.path)}
              accessibilityRole="tab"
              accessibilityLabel={`${item.label}, onglet ${index + 1} sur ${items.length}`}
              accessibilityState={{ selected: active }}
              className="flex-1 items-center py-1"
              hitSlop={4}
            >
              {item.icon(color, 22)}
              <Text style={{ color, fontSize: 10, fontWeight: '600', marginTop: 2 }}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
