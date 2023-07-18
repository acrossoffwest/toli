import React, { useCallback, useEffect, useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { StackParamList } from '../../../App';

import { Theming, theming } from '../../../utils/theme'
import { ProgressView } from '../../../components/ProgressView/ProgressView';
import { Button } from '../../../components/Button/Button';
import { useDispatch, useSelector } from 'react-redux';
import { State } from '../../../store/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCompletedFlashcards, setCompletedQuiz } from '../../../store/slice/flashcards';
import { questions } from '../Quiz/questions';


type Props = NativeStackScreenProps<StackParamList, 'navigation'>;

const subtitle = {
  quiz: 'Вы прошли тест 🤩',
  flashcards: 'Вы повторили все карточки 🤩 Продолжайте в том же духе!'
}


export function Navigation(props: Props) {
  const dispatch = useDispatch()
  const { items: flashcards, completedFlashcards, completedQuiz } = useSelector((state: State) => state.flashcards)

  const theme = useSelector((state: State) => theming(state.theme.mode));
  const styles = styling(theme);

  const { route: { params: { key, name, swipedLeft, swipedRight, screen } }, navigation } = props;
  const { cards } = useMemo(() => flashcards[key], [key]);

  const headerTitle = useMemo(() => {
    const {length} = screen === 'flashcards' ? cards : questions[key];

    return `${length} / ${length}`
  }, [key, screen, cards])

  useEffect(() => {
    navigation.setOptions({ headerTitle })
  }, []);


  const goBack = useCallback(() => navigation.popToTop(), []);

  const repeat = useCallback(() => navigation.navigate(screen, { name, key }), [name, key]);

  const onComplete = useCallback(async () => {
    if (screen === 'flashcards') {
      const newCompleted = { ...completedFlashcards, [key]: true };

      dispatch(setCompletedFlashcards({ items: newCompleted }));
  
      await AsyncStorage.setItem('completedFlashcards', JSON.stringify(newCompleted))
    }

    if (screen === 'quiz') {
      const newCompleted = { ...completedQuiz, [key]: true };

      dispatch(setCompletedQuiz({ items: newCompleted }));
  
      await AsyncStorage.setItem('completedQuiz', JSON.stringify(newCompleted))
    }

    navigation.popToTop()
  }, [key, completedFlashcards, completedQuiz, screen, dispatch])


  return (
    <View style={styles.container}>
      <ProgressView
        progress={1}
      />
      <View style={styles.result}>
        <Text style={styles.title}>Бэрхэ!</Text>
        <Text style={styles.subtitle}>{subtitle[screen]}</Text>
        <View>
          {screen === 'flashcards' && <View style={styles.numbers}>
            <View style={styles.number}>
              <Text style={styles.secondaryText}>Знаю:</Text>
              <View style={[styles.learnt, styles.count]}>
                <Text style={styles.countText}>{swipedRight}</Text>
              </View>
            </View>
            <View style={styles.number}>
              <Text style={styles.secondaryText}>Еще изучаю:</Text>
              <View style={[styles.stillLearning, styles.count]}>
                <Text style={styles.countText}>{swipedLeft}</Text>
              </View>
            </View>
          </View>}
          <Button onPress={onComplete} label="Отметить как выученное" icon="issue-closed" view="action" className={styles.button} />
          <Button onPress={repeat} label="Повторить" icon="sync" view="default" className={styles.button} />
          <Button onPress={goBack} label="Вернуться назад" view="ghost" className={styles.button} />
        </View>
      </View>
    </View>
  )
}


const styling = (theme: Theming) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  result: {
    paddingHorizontal: theme.spacing.l,
    paddingTop: 180,
    justifyContent: 'center',
    textAlign: 'center'
  },
  title: {
    textTransform: 'uppercase',
    textAlign: 'center',
    fontFamily: 'bold',
    fontSize: 24,
    color: theme.colors.text
  },
  subtitle: {
    marginTop: theme.spacing.xs,
    textTransform: 'uppercase',
    textAlign: 'center',
    fontFamily: 'bold',
    fontSize: 16,
    color: theme.colors.text
  },
  button: {
    marginTop: theme.spacing.s
  },
  numbers: {
    alignSelf: 'center',
    paddingVertical: theme.spacing.l
  },
  number: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs
  },
  secondaryText: {
    minWidth: 120,
    fontFamily: 'medium',
    fontSize: 18,
    color: theme.colors.secondaryText
  },
  count: {
    marginLeft: theme.spacing.xs,
    justifyContent: 'center',
    width: 40,
    padding: theme.spacing.xs,
    opacity: 0.8,
    borderRadius: 8,
  },
  learnt: {
    backgroundColor: '#119179',
  },
  stillLearning: {
    backgroundColor: '#E23053',
  },
  countText: {
    textAlign: 'center',
    color: theme.colors.background,
    fontFamily: 'medium',
    fontSize: 18,
  },
})
