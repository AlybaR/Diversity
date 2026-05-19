import { ReactNode } from 'react';
import { Platform, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENTS } from '../constants/theme';

interface PhoneFrameProps {
  children: ReactNode;
}

const PHONE_WIDTH = 390;
const PHONE_HEIGHT = 844;
const ACTIVATE_AT_WIDTH = 600;

export function PhoneFrame({ children }: PhoneFrameProps) {
  const { width } = useWindowDimensions();
  const shouldFrame = Platform.OS === 'web' && width >= ACTIVATE_AT_WIDTH;

  if (!shouldFrame) {
    return <>{children}</>;
  }

  return (
    <LinearGradient
      colors={GRADIENTS.bodyShell as unknown as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        flex: 1,
        minHeight: '100%' as unknown as number,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 24,
      }}
    >
      <View
        style={{
          width: PHONE_WIDTH,
          height: PHONE_HEIGHT,
          backgroundColor: 'white',
          borderRadius: 40,
          overflow: 'hidden',
          position: 'relative',
          ...(Platform.OS === 'web'
            ? {
                boxShadow:
                  '0 0 0 12px #1a1a2e, 0 0 0 14px #2d2d44, 0 25px 80px rgba(0, 0, 0, 0.35)',
              }
            : {}),
        }}
      >
        {/* Notch dynamic island style */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            marginLeft: -75,
            width: 150,
            height: 28,
            backgroundColor: '#1a1a2e',
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            pointerEvents: 'none',
            zIndex: 50,
          }}
        />
        {children}
      </View>
    </LinearGradient>
  );
}
