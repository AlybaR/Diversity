/**
 * <DemoQrCode /> — modal qui affiche un QR code pointant sur l'URL actuelle.
 *
 * Usage : pendant une présentation depuis un PC, ouvrir le modal pour que le
 * public puisse scanner et ouvrir la démo sur leur propre téléphone.
 *
 * Détails techniques :
 *   - Sur web : l'URL est `window.location.origin` (= https://passerelle-demo.pages.dev
 *     ou autre déploiement).
 *   - Sur natif : on retombe sur un fallback texte (le QR code n'a pas de sens
 *     si on présente depuis le téléphone — on n'aura qu'à dicter l'URL).
 *   - QR généré côté client par `react-native-qrcode-svg` (pas d'appel réseau).
 */

import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, Text, View } from 'react-native';
import { Copy, X } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { COLORS } from '../constants/theme';

interface DemoQrCodeProps {
  visible: boolean;
  onClose: () => void;
  /** URL à encoder. Si non fourni : window.location.origin sur web, fallback générique sinon. */
  url?: string;
}

const FALLBACK_URL = 'https://passerelle-demo.pages.dev';

export function DemoQrCode({ visible, onClose, url }: DemoQrCodeProps) {
  const [resolvedUrl, setResolvedUrl] = useState<string>(url ?? FALLBACK_URL);
  const [copied, setCopied] = useState(false);

  // Calculer l'URL côté client (window n'est pas accessible côté SSR/natif).
  useEffect(() => {
    if (url) {
      setResolvedUrl(url);
      return;
    }
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      setResolvedUrl(window.location.origin);
    } else {
      setResolvedUrl(FALLBACK_URL);
    }
  }, [url]);

  const handleCopy = async () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(resolvedUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center bg-slate-950/60 px-4">
        <View className="bg-white rounded-3xl p-6 w-full max-w-md">
          {/* En-tête */}
          <View className="flex-row items-start justify-between gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                Démo Passerelle
              </Text>
              <Text className="text-slate-800 font-bold text-base">
                Scanne pour ouvrir sur ton téléphone
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <X color={COLORS.slate[600]} size={20} />
            </Pressable>
          </View>

          {/* QR code */}
          <View className="items-center bg-slate-50 rounded-2xl p-6 mb-4">
            <View className="bg-white rounded-xl p-3">
              <QRCode value={resolvedUrl} size={220} backgroundColor="white" color="#0f172a" />
            </View>
          </View>

          {/* URL en clair + bouton copier */}
          <View className="bg-slate-50 rounded-xl border border-slate-100 p-3 flex-row items-center gap-2">
            <Text className="flex-1 text-slate-700 text-xs font-mono" numberOfLines={1}>
              {resolvedUrl}
            </Text>
            {Platform.OS === 'web' && (
              <Pressable
                onPress={handleCopy}
                className="flex-row items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200"
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              >
                <Copy color={COLORS.slate[600]} size={12} />
                <Text className="text-slate-600 text-[11px] font-semibold">
                  {copied ? 'Copié' : 'Copier'}
                </Text>
              </Pressable>
            )}
          </View>

          <Text className="text-slate-400 text-[11px] text-center mt-4 leading-relaxed">
            La démo fonctionne dans n’importe quel navigateur. Aucune donnée n’est envoyée à un
            serveur — tout reste local côté téléphone.
          </Text>
        </View>
      </View>
    </Modal>
  );
}
