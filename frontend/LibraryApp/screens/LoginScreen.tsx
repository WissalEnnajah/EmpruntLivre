import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome, Feather } from '@expo/vector-icons';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      const response = await api.post('auth/login/', { username, password });
      await AsyncStorage.setItem('access_token', response.data.access);
      await AsyncStorage.setItem('refresh_token', response.data.refresh);
      navigation.replace('Main');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Nom d’utilisateur ou mot de passe incorrect.';
      Alert.alert('Erreur de connexion', msg);
    }
  };

  return (
    <View style={styles.container}>
      {/* Icône livre */}
      <View style={styles.iconContainer}>
        <FontAwesome name="book" size={70} color="#1e90ff" />
      </View>

      <Text style={styles.welcome}>Bienvenue</Text>

      <TextInput
        placeholder="Nom d'utilisateur"
        style={styles.input}
        onChangeText={setUsername}
      />

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Mot de passe"
          style={styles.inputField}
          secureTextEntry={!showPassword}
          onChangeText={setPassword}
        />
        <Feather
          name={showPassword ? 'eye-off' : 'eye'}
          size={20}
          color="#999"
          onPress={() => setShowPassword(!showPassword)}
        />
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>CONNEXION</Text>
      </TouchableOpacity>

      <Text style={styles.registerText}>
        Pas encore de compte ?{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
          S’inscrire
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#fff',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcome: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 20,
    color: '#1e90ff',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  inputField: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  forgot: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: '#1e90ff',
  },
  loginButton: {
    backgroundColor: '#1e90ff',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 30,
    marginBottom: 25,
  },
  loginText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  registerText: {
    textAlign: 'center',
    color: '#555',
  },
  link: {
    color: '#1e90ff',
    fontWeight: 'bold',
  },
});
