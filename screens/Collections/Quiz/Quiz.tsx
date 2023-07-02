import React, { useState, useEffect } from 'react';
import { View, Alert, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { ImageMultipleChoiceQuestion } from './components/ImageMultipleChoiceQuestion/ImageMultipleChoiceQuestion';
import { OpenEndedQuestion } from './components/OpenEndedQuestion/OpenEndedQuestion';
import { FillInTheBlank } from './components/FillInTheBlank/FillInTheBlank';

import questions from './questions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theming, theming } from '../../../utils/theme';
import { useSelector } from 'react-redux';
import { State } from '../../../store/store';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StackParamList } from '../../../App';
import { ProgressView } from '../../../components/ProgressView/ProgressView';
import { Octicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<StackParamList, 'quiz'>;

type QuestionType = 'FILL_IN_THE_BLANK' | 'IMAGE_MULTIPLE_CHOICE' | 'OPEN_ENDED';

export type Question = {
  id: string;
  type: QuestionType;
  question?: string;
  parts: {
    text: string;
    isBlank: boolean;
    selected?: string | null;
  }[]
  options: string[]
}

export const Quiz = (props: Props) => {
  const { route: { params: { key, name } }, navigation } = props;

  const theme = useSelector((state: State) => theming(state.theme.mode));
  const styles = styling(theme);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(
    questions[currentQuestionIndex]
  );

  const [lives, setLives] = useState(5);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (currentQuestionIndex >= questions.length) {
      Alert.alert('You won');
      setCurrentQuestionIndex(0);
    } else {
      setCurrentQuestion(questions[currentQuestionIndex]);
    }
  }, [currentQuestionIndex]);



  useEffect(() => {
    loadData();
  }, []);

  // todo
  useEffect(() => {
    navigation.setOptions({ 
      headerTitle: `${currentQuestionIndex} / ${questions.length}`,
      headerRight: () => (
        <View style={styles.lives}>
        <Octicons name="heart-fill" size={24} color="#E23053" />
        <Text style={styles.livesText}> {lives}</Text>
      </View>
      )
    })
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (hasLoaded) {
      saveData();
    }
  }, [lives, currentQuestionIndex, hasLoaded]);

  const onCorrect = () => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const restart = () => {
    setLives(5);
    setCurrentQuestionIndex(0);
  };

  const onWrong = () => {
    if (lives <= 1) {
      Alert.alert('Game over', 'Try again', [
        {
          text: 'Try again',
          onPress: restart,
        },
      ]);
    } else {
      Alert.alert('Wroooong');
      setLives(lives - 1);
    }
  };

  const saveData = async () => {
    await AsyncStorage.setItem('lives', lives.toString());
    await AsyncStorage.setItem(
      'currentQuestionIndex',
      currentQuestionIndex.toString()
    );
  };

  const loadData = async () => {
    const loadedLives = await AsyncStorage.getItem('lives');
    if (loadedLives) {
      setLives(parseInt(loadedLives));
    }
    const currentQuestionIndex = await AsyncStorage.getItem(
      'currentQuestionIndex'
    );
    if (currentQuestionIndex) {
      setCurrentQuestionIndex(parseInt(currentQuestionIndex));
    }

    setHasLoaded(true);
  };

  if (!hasLoaded) {
    return <ActivityIndicator />;
  }

  return (
    <View style={styles.root}>
      <ProgressView progress={currentQuestionIndex / questions.length} />

      {currentQuestion.type === 'FILL_IN_THE_BLANK' && (
        <FillInTheBlank
          question={currentQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      )}

      {currentQuestion.type === 'IMAGE_MULTIPLE_CHOICE' && (
        <ImageMultipleChoiceQuestion
          question={currentQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      )}
      {currentQuestion.type === 'OPEN_ENDED' ? (
        <OpenEndedQuestion
          question={currentQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      ) : null}
    </View>
  );
};

const styling = (theme: Theming) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.l,
  },
  lives: {
    flexDirection: 'row'
  },
  livesText: {
    fontFamily: 'bold',
    fontSize: 18,
    color: '#E23053',
  },
});