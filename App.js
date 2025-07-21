import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import {
  TextInput,
  Button,
  Text,
  Appbar,
  Card,
  Provider as PaperProvider,
  Appbar as PaperAppbar,
  Avatar,
} from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { Audio } from 'expo-av';

const MODEL_NAME = 'google/gemma-3n-e2b-it:free';
const STORAGE_KEY = '@chat_messages';
const MUTE_KEY = '@mute_state';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(false);
  const flatListRef = useRef(null);
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const chatOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loadInitialData = async () => {
      const savedMessages = await AsyncStorage.getItem(STORAGE_KEY);
      const savedMute = await AsyncStorage.getItem(MUTE_KEY);
      if (savedMessages) setMessages(JSON.parse(savedMessages));
      if (savedMute !== null) setMuted(savedMute === 'true');
    };

    loadInitialData();

    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const playStartupSound = async () => {
      if (muted) return;
      const { sound } = await Audio.Sound.createAsync(
        require('./assets/startup.mp3')
      );
      await sound.playAsync();
    };

    playStartupSound();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    const timeout = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages]);

  useEffect(() => {
    AsyncStorage.setItem(MUTE_KEY, muted.toString());
  }, [muted]);

  const playSendSound = async () => {
    if (muted) return;
    const { sound } = await Audio.Sound.createAsync(
      require('./assets/send.mp3')
    );
    await sound.playAsync();
  };

  const playReceiveSound = async () => {
    if (muted) return;
    const { sound } = await Audio.Sound.createAsync(
      require('./assets/receive.mp3')
    );
    await sound.playAsync();
  };

  const playDeleteSound = async () => {
    if (muted) return;
    const { sound } = await Audio.Sound.createAsync(
      require('./assets/delete.mp3')
    );
    await sound.playAsync();
  };

  const playGoodbyeSound = async () => {
    if (muted) return;
    const { sound } = await Audio.Sound.createAsync(
      require('./assets/goodbye.mp3')
    );
    await sound.playAsync();
  };

  const toggleMute = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMuted(prev => !prev);
  };

  const clearChat = async () => {
    const confirm = await new Promise((resolve) => {
      Alert.alert(
        'Clear Chat',
        'Are you sure you want to delete all messages?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          { text: 'OK', onPress: () => resolve(true) },
        ],
        { cancelable: true }
      );
    });
    if (!confirm) return;

    await AsyncStorage.removeItem(STORAGE_KEY);
    setMessages([]);
    await playDeleteSound();
  };

  const exportChat = async () => {
    const chatText = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    const fileUri = FileSystem.cacheDirectory + 'chat_history.txt';
    await FileSystem.writeAsStringAsync(fileUri, chatText);
    await Sharing.shareAsync(fileUri);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const connection = await NetInfo.fetch();
    if (!connection.isConnected) {
      Alert.alert('No Internet', 'You are offline. Please connect to the internet to send messages.');
      return;
    }

    const userMessage = { role: 'user', content: input };
    const typingIndicator = { role: 'assistant', content: '...' };
    const updatedMessages = [...messages, userMessage, typingIndicator];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    await playSendSound();

    try {
      const res = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: MODEL_NAME,
          messages: [...messages, userMessage],
        },
        {
          headers: {
            Authorization: `Enter API KEY`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      );

      const content =
        res.data?.choices?.[0]?.message?.content ||
        '⚠️ No response received.';

      const botReply = {
        role: 'assistant',
        content,
      };

      setMessages(prev => [...prev.slice(0, -1), botReply]);
      await playReceiveSound();

      if (/\b(bye|goodbye|see you|farewell)\b/i.test(content)) {
        await playGoodbyeSound();
        await AsyncStorage.removeItem(STORAGE_KEY);
        Animated.timing(chatOpacity, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }).start();
      }

    } catch (err) {
      console.error('Error from API:', err?.response?.data || err.message);
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          role: 'assistant',
          content: `❌ Error: ${err?.response?.data?.error || err.message}`,
        },
      ]);
    }

    setLoading(false);
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.role === 'user' ? styles.user : styles.bot,
      ]}
    >
      <Card style={styles.card}>
        <Card.Content>
          <Text>{item.content}</Text>
        </Card.Content>
      </Card>
    </View>
  );

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <SafeAreaView style={styles.container}>
          <Appbar.Header>
            <Appbar.Action
              icon={muted ? 'volume-off' : 'volume-high'}
              onPress={toggleMute}
              accessibilityLabel="Toggle Sound"
            />
            <Appbar.Action icon="content-save" onPress={exportChat} accessibilityLabel="Save Chat" />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Animated.Image
                source={require('./assets/info_ai_logo.png')}
                style={{ width: 240, height: 60, resizeMode: 'contain', opacity: logoOpacity }}
              />
            </View>
            <Appbar.Action icon="delete" onPress={clearChat} accessibilityLabel="Clear Chat" />
          </Appbar.Header>

          <View style={styles.modelInfo}>
            <Text variant="labelMedium" style={styles.modelText}>
              Model: {MODEL_NAME}
            </Text>
          </View>

          <Animated.View style={{ flex: 1, opacity: chatOpacity }}>
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderItem}
              keyExtractor={(_, i) => i.toString()}
              contentContainerStyle={{ padding: 10 }}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
          </Animated.View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.inputRow}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Ask something..."
                style={styles.input}
                mode="outlined"
              />
              <Button
                mode="contained"
                onPress={sendMessage}
                disabled={loading}
                style={styles.sendButton}
              >
                Send
              </Button>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffffff',
  },
  input: {
    flex: 1,
    marginRight: 10,
  },
  sendButton: {
    height: 56,
    justifyContent: 'center',
  },
  messageContainer: {
    marginVertical: 5,
    maxWidth: '80%',
  },
  user: {
    alignSelf: 'flex-end',
    backgroundColor: '#d1e7dd',
    borderRadius: 8,
  },
  bot: {
    alignSelf: 'flex-start',
    backgroundColor: '#e2e3e5',
    borderRadius: 8,
  },
  card: {
    padding: 2,
  },
  modelInfo: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modelText: {
    color: '#333',
    fontWeight: '500',
  },
});
