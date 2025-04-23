import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, Image, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, Modal, TextInput, Button
} from 'react-native';
import { Feather, AntDesign, FontAwesome5 } from '@expo/vector-icons';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editVisible, setEditVisible] = useState(false);

    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);



    // Champs modifiables
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const navigation = useNavigation();

    const handleLogout = async () => {
        try {
            const refresh = await AsyncStorage.getItem('refresh_token');
            if (refresh) await api.post('auth/logout/', { refresh });
        } catch (e) {
            console.log('Erreur de déconnexion :', e.message);
        } finally {
            await AsyncStorage.removeItem('access_token');
            await AsyncStorage.removeItem('refresh_token');
            Alert.alert("Déconnexion", "Vous avez été déconnecté.");
            navigation.replace('Login');
        }
    };

    const fetchProfile = async () => {
        try {
            const res = await api.get('auth/me/');
            setProfile(res.data);
            setFirstName(res.data.first_name || '');
            setLastName(res.data.last_name || '');
            setEmail(res.data.email || '');
        } catch (err: any) {
            Alert.alert('Erreur', "Impossible de charger les informations de l'utilisateur.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const res = await api.put('auth/me/', {
                first_name: firstName,
                last_name: lastName,
                email: email,
            });
            setProfile(res.data);
            setEditVisible(false);
            Alert.alert("Succès", "Profil mis à jour !");
        } catch (err: any) {
            Alert.alert('Erreur', "Impossible de mettre à jour le profil.");
        }
    };

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword) {
            Alert.alert("Champs requis", "Merci de remplir tous les champs.");
            return;
        }

        try {
            await api.post('auth/change-password/', {
                old_password: oldPassword,
                new_password: newPassword
            });
            Alert.alert("Succès", "Mot de passe changé avec succès.");
            setPasswordModalVisible(false);
            setOldPassword('');
            setNewPassword('');
        } catch (err: any) {
            console.log("Erreur changement mot de passe:", err.response?.data || err.message);
            Alert.alert("Erreur", "Impossible de changer le mot de passe.");
        }
    };


    useEffect(() => {
        fetchProfile();
    }, []);

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color="#1e90ff" /></View>;
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                    <Image source={{ uri: 'https://i.pravatar.cc/150?img=2' }} style={styles.avatar} />
                </View>

                {/* Infos personnelles */}
                <Text style={styles.sectionTitle}>Informations personnelles</Text>
                <View style={styles.card}>
                    <Item label="Nom d'utilisateur" value={`@${profile.username}`} />
                    <Item label="Prenom" value={`${profile.first_name}` || 'Non renseigné'} />
                    <Item label="Nom" value={`${profile.last_name}` || 'Non renseigné'} />
                    <TouchableOpacity style={styles.buttonRow} onPress={() => setEditVisible(true)}>
                        <Text style={styles.buttonText}>Modifier mes informations</Text>
                    </TouchableOpacity>
                </View>

                {/* Connexion */}
                <Text style={styles.sectionTitle}>Connexion</Text>
                <View style={styles.card}>
                    <Item label="Email" value={profile.email} />
                    <TouchableOpacity style={styles.buttonRow} onPress={() => setPasswordModalVisible(true)}>
                        <Text style={styles.buttonText}>Modifier le mot de passe</Text>
                    </TouchableOpacity>
                </View>

                {/* Role */}
                <Text style={styles.sectionTitle}>Plus d'informations</Text>
                <View style={styles.card}>
                    <View style={styles.rowItem}>
                        <Text style={styles.labelInline}>Role</Text>
                        <View style={styles.roleBadge}>
                            <FontAwesome5
                                name={profile.is_staff || profile.is_superuser ? 'user-shield' : 'user'}
                                size={14}
                                color={profile.is_staff || profile.is_superuser ? '#dc3545' : '#1e90ff'}
                                style={{ marginRight: 5 }}
                            />
                            <Text style={{
                                color: profile.is_staff || profile.is_superuser ? '#dc3545' : '#1e90ff',
                                fontWeight: '600'
                            }}>
                                {profile.is_staff || profile.is_superuser ? 'Administrateur' : 'Utilisateur'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Modal édition */}
                <Modal visible={editVisible} transparent animationType="fade">
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalCard}>
                            <TextInput placeholder="Prénom" value={firstName} onChangeText={setFirstName} style={styles.input} />
                            <TextInput placeholder="Nom" value={lastName} onChangeText={setLastName} style={styles.input} />
                            <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />

                            <View style={styles.modalButtons}>
                                <Button title="Annuler" color="red" onPress={() => setEditVisible(false)} />
                                <Button title="Enregistrer" onPress={handleSave} />
                            </View>
                        </View>
                    </View>
                </Modal>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Se déconnecter</Text>
                </TouchableOpacity>

                <Modal visible={passwordModalVisible} transparent animationType="fade">
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalCard}>
                            {/* Ancien mot de passe */}
                            <View style={styles.inputRow}>
                                <TextInput
                                    placeholder="Ancien mot de passe"
                                    secureTextEntry={!showOld}
                                    style={styles.inputFlex}
                                    value={oldPassword}
                                    onChangeText={setOldPassword}
                                />
                                <Feather
                                    name={showOld ? 'eye-off' : 'eye'}
                                    size={20}
                                    onPress={() => setShowOld(!showOld)}
                                />
                            </View>

                            {/* Nouveau mot de passe */}
                            <View style={styles.inputRow}>
                                <TextInput
                                    placeholder="Nouveau mot de passe"
                                    secureTextEntry={!showNew}
                                    style={styles.inputFlex}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                />
                                <Feather
                                    name={showNew ? 'eye-off' : 'eye'}
                                    size={20}
                                    onPress={() => setShowNew(!showNew)}
                                />
                            </View>

                            {/* Confirmation mot de passe */}
                            <View style={styles.inputRow}>
                                <TextInput
                                    placeholder="Confirmer mot de passe"
                                    secureTextEntry={!showConfirm}
                                    style={styles.inputFlex}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                                <Feather
                                    name={showConfirm ? 'eye-off' : 'eye'}
                                    size={20}
                                    onPress={() => setShowConfirm(!showConfirm)}
                                />
                            </View>

                            <View style={styles.modalButtons}>
                                <Button title="Annuler" color="red" onPress={() => setPasswordModalVisible(false)} />
                                <Button title="Modifier" onPress={handleChangePassword} />
                            </View>
                        </View>
                    </View>
                </Modal>


            </ScrollView>
        </SafeAreaView>
    );
}

function Item({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.rowItem}>
            <Text style={styles.labelInline}>{label}</Text>
            <Text style={styles.valueInline}>{value}</Text>
        </View>
    );
}

function SocialRow({ icon, name, status, warning = false }: { icon: React.ReactNode; name: string; status: string; warning?: boolean }) {
    return (
        <View style={styles.socialRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>{icon}<Text style={{ marginLeft: 10 }}>{name}</Text></View>
            <Text style={{ color: warning ? '#dc3545' : '#28a745', fontWeight: 'bold' }}>{status}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#f8f9fa' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    avatarContainer: { alignItems: 'center', marginBottom: 30, position: 'relative' },
    avatar: { width: 100, height: 100, borderRadius: 50 },
    editIcon: {
        position: 'absolute', bottom: 10, right: 140,
        backgroundColor: '#007bff', borderRadius: 12, padding: 5,
    },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, marginTop: 15, color: '#333' },
    card: {
        backgroundColor: '#fff', padding: 15, borderRadius: 12,
        marginBottom: 15, elevation: 1,
    },
    item: { marginBottom: 10 },
    label: { fontSize: 13, color: '#888' },
    value: { fontSize: 16, fontWeight: '600', color: '#333' },
    buttonRow: { paddingVertical: 10 },
    buttonText: { color: '#007bff', fontWeight: '600', fontSize: 15 },
    socialRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingVertical: 10, alignItems: 'center',
        borderBottomColor: '#eee', borderBottomWidth: 1,
    },
    modalBackdrop: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center', alignItems: 'center',
    },
    modalCard: {
        width: '90%', backgroundColor: '#fff',
        borderRadius: 12, padding: 20, elevation: 5,
    },
    input: {
        borderWidth: 1, borderColor: '#ccc',
        padding: 12, borderRadius: 8, marginBottom: 15,
    },
    modalButtons: {
        flexDirection: 'row', justifyContent: 'space-between', marginTop: 20,
    },
    rowItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },

    labelInline: {
        fontWeight: 'bold',
        color: '#555',
        fontSize: 15,
    },

    valueInline: {
        fontSize: 15,
        color: '#333',
        marginLeft: 10,
        flexShrink: 1,
        textAlign: 'right',
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoutBtn: {
        backgroundColor: '#ff4d4d',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginTop: 15,
        alignItems: 'center',
    },

    logoutText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    inputField: {
        flex: 1,
        paddingVertical: 10,
    },
    icon: {
        marginLeft: 5,
        color: '#888',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 10,
    },

    inputFlex: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 15,
    },

});
