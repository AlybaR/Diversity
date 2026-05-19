import { ReactNode } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { AppHeader } from './AppHeader';
import { Badge } from './Badge';
import { BottomNav } from './BottomNav';
import { Card } from './Card';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';

export interface BlueprintMetric {
  label: string;
  value: string | number;
  tone?: 'primary' | 'success' | 'danger' | 'warning' | 'slate' | 'indigo' | 'emerald';
}

export interface BlueprintRow {
  title: string;
  detail?: string;
  badge?: string;
  tone?: BlueprintMetric['tone'];
}

export interface BlueprintSection {
  title: string;
  rows: BlueprintRow[];
}

export interface BlueprintAction {
  label: string;
  path?: Href;
  message?: string;
}

interface BlueprintScreenProps {
  title: string;
  subtitle?: string;
  summary: string;
  metrics?: BlueprintMetric[];
  sections: BlueprintSection[];
  primaryAction?: BlueprintAction;
  secondaryAction?: BlueprintAction;
  bottomNav?: 'parent' | 'mairie';
  rightElement?: ReactNode;
}

function runAction(action: BlueprintAction) {
  if (action.path) {
    router.push(action.path);
    return;
  }
  Alert.alert(action.label, action.message ?? 'Action simulée dans la maquette.');
}

export function BlueprintScreen({
  title,
  subtitle,
  summary,
  metrics = [],
  sections,
  primaryAction,
  secondaryAction,
  bottomNav,
  rightElement,
}: BlueprintScreenProps) {
  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title={title} subtitle={subtitle} rightElement={rightElement} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: bottomNav ? 140 : 40 }}>
        <Card className="mb-3">
          <Text className="text-slate-800 text-base font-bold mb-2">{title}</Text>
          <Text className="text-slate-500 text-sm leading-relaxed">{summary}</Text>
        </Card>

        {metrics.length > 0 && (
          <View className="flex-row flex-wrap mb-3" style={{ gap: 8 }}>
            {metrics.map((metric) => (
              <View
                key={metric.label}
                className="bg-white rounded-2xl border border-slate-100 p-3 items-center"
                style={{ flex: 1, minWidth: '47%' }}
              >
                <Text className="text-slate-800 text-xl font-bold">{metric.value}</Text>
                <Text className="text-slate-500 text-[10px] text-center mt-0.5">
                  {metric.label}
                </Text>
                {metric.tone && (
                  <View className="mt-2">
                    <Badge label={metric.tone} tone={metric.tone} />
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <View className="gap-3">
          {sections.map((section) => (
            <Card key={section.title}>
              <Text className="text-slate-400 text-xs font-bold uppercase mb-3">
                {section.title}
              </Text>
              <View className="gap-2">
                {section.rows.map((row) => (
                  <View
                    key={`${section.title}-${row.title}`}
                    className="bg-slate-50 rounded-xl p-3"
                  >
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1">
                        <Text className="text-slate-800 text-sm font-bold">{row.title}</Text>
                        {row.detail && (
                          <Text className="text-slate-500 text-xs leading-relaxed mt-1">
                            {row.detail}
                          </Text>
                        )}
                      </View>
                      {row.badge && <Badge label={row.badge} tone={row.tone ?? 'slate'} />}
                    </View>
                  </View>
                ))}
              </View>
            </Card>
          ))}
        </View>

        {(primaryAction || secondaryAction) && (
          <View className="gap-3 mt-5">
            {primaryAction && (
              <PrimaryButton label={primaryAction.label} onPress={() => runAction(primaryAction)} />
            )}
            {secondaryAction && (
              <SecondaryButton
                label={secondaryAction.label}
                onPress={() => runAction(secondaryAction)}
              />
            )}
          </View>
        )}
      </ScrollView>
      {bottomNav && <BottomNav variant={bottomNav} />}
    </View>
  );
}
