import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Text,
  View,
  TextStyle,
  ViewStyle,
  StyleProp,
  Easing,
  AccessibilityProps,
} from 'react-native';

type SplitBy = 'word' | 'char';

interface SplitTextProps extends AccessibilityProps {
  text: string;
  splitBy?: SplitBy;
  duration?: number; // duration for each item's animation (ms)
  stagger?: number; // delay between items (ms)
  translateY?: number; // start translateY px
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  loop?: boolean;
  onComplete?: () => void;
  preserveWhitespace?: boolean; // keep whitespace when splitting by char (defaults true)
}

/**
 * SplitText component
 * - Splits the input by words or chars
 * - Animates each piece with fade + translateY
 */
export default function SplitText({
  text,
  splitBy = 'word',
  duration = 350,
  stagger = 40,
  translateY = 8,
  style,
  containerStyle,
  loop = false,
  onComplete,
  accessibilityLabel,
  accessible,
  preserveWhitespace = true,
}: SplitTextProps) {
  // Prepare tokens
  const tokens = useMemo(() => {
    if (splitBy === 'word') {
      // keep spaces as separators but include them after words for correct spacing
      const words = text.split(/(\s+)/).filter(Boolean);
      return words;
    } else {
      // char splitting: keep spaces as non-collapsing spaces if preserveWhitespace
      const chars = text.split('');
      if (preserveWhitespace) {
        return chars.map(c => (c === ' ' ? '\u00A0' : c));
      }
      return chars;
    }
  }, [text, splitBy, preserveWhitespace]);

  // Animated values per token
  const animValuesRef = useRef<Animated.Value[]>([]);
  if (animValuesRef.current.length !== tokens.length) {
    animValuesRef.current = tokens.map(() => new Animated.Value(0));
  }
  const animValues = animValuesRef.current;

  // run animation
  useEffect(() => {
    let isMounted = true;

    const createAnim = () =>
      Animated.stagger(
        stagger,
        animValues.map(v =>
          Animated.timing(v, {
            toValue: 1,
            duration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ),
      );

    const reset = Animated.parallel(
      animValues.map(v =>
        Animated.timing(v, {
          toValue: 0,
          duration: 120,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ),
    );

    const runSequence = () => {
      const seq = Animated.sequence([createAnim()]);

      if (loop) {
        // loop: animate in, wait a little, animate out, repeat
        const loopSeq = Animated.sequence([
          createAnim(),
          Animated.delay(400),
          reset,
          Animated.delay(200),
        ]);
        Animated.loop(loopSeq).start();
      } else {
        seq.start(() => {
          if (isMounted && onComplete) {
            onComplete();
          }
        });
      }
    };

    runSequence();

    return () => {
      isMounted = false;
      animValues.forEach(v => v.stopAnimation());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, tokens.length, duration, stagger, loop, onComplete]);

  return (
    <View
      accessible={accessible}
      accessibilityLabel={accessibilityLabel ?? text}
      style={[{ flexDirection: 'row', flexWrap: 'wrap'}, containerStyle]}
    >
      {tokens.map((tok, i) => {
        const anim = animValues[i];
        const translate = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [translateY, 0],
        });
        const opacity = anim.interpolate({
          inputRange: [0, 0.6, 1],
          outputRange: [0, 0.85, 1],
        });

        // keep token's own key
        // For word-splitting we render a Text that preserves a trailing space if token is a space chunk
        return (
          <Animated.View
            key={`${tok}-${i}`}
            style={{
              opacity,
              transform: [{ translateY: translate }],
              // inline style used for animation container only
            }}
          >
            <Text
              selectable={false}
              allowFontScaling
              style={style as TextStyle}
            >
              {tok}
            </Text>
          </Animated.View>
        );
      })}
    </View>
  );
}
