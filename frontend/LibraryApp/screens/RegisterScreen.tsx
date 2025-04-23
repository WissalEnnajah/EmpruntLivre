import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome, Feather } from '@expo/vector-icons';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!username || !email || !password || !password2) {
      return Alert.alert('Champs requis', 'Veuillez remplir tous les champs.');
    }

    if (password !== password2) {
      return Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
    }

    try {
      const response = await api.post('auth/register/', {
        username,
        email,
        password,
        password2,
      });

      const { access, refresh } = response.data;

      await AsyncStorage.setItem('access_token', access);
      await AsyncStorage.setItem('refresh_token', refresh);

      navigation.replace('Main');
    } catch (err: any) {
      const errors = err.response?.data || { erreur: 'Une erreur est survenue.' };
      const msg = typeof errors === 'string' ? errors : Object.values(errors).flat().join('\n');
      Alert.alert('Erreur', msg);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <FontAwesome name="book" size={70} color="#1e90ff" />
      </View>

      <Text style={styles.welcome}>Créer un compte</Text>

      <TextInput
        placeholder="Nom d'utilisateur"
        style={styles.input}
        onChangeText={setUsername}
      />

      <TextInput
        placeholder="Adresse email"
        style={styles.input}
        onChangeText={setEmail}
        keyboardType="email-address"
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

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Confirmer le mot de passe"
          style={styles.inputField}
          secureTextEntry={!showPassword2}
          onChangeText={setPassword2}
        />
        <Feather
          name={showPassword2 ? 'eye-off' : 'eye'}
          size={20}
          color="#999"
          onPress={() => setShowPassword2(!showPassword2)}
        />
      </View>

      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerText}>S’INSCRIRE</Text>
      </TouchableOpacity>

      <Text style={styles.loginText}>
        Vous avez déjà un compte ?{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
          Se connecter
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
  registerButton: {
    backgroundColor: '#1e90ff',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 25,
  },
  registerText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginText: {
    textAlign: 'center',
    color: '#555',
  },
  link: {
    color: '#1e90ff',
    fontWeight: 'bold',
  },
});
