import React, { useEffect, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    Modal,
    TextInput,
    Button,
    Platform
} from 'react-native';
import api from '../services/api';
import { useNavigation } from '@react-navigation/native';

interface Livre {
    id: number;
    titre: string;
    auteur: string;
    disponible: boolean;
    date_publication: string;
    emprunte_par?: string;
}

export default function BooksScreen() {
    const [livres, setLivres] = useState<Livre[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [titre, setTitre] = useState('');
    const [auteur, setAuteur] = useState('');
    const [datePublication, setDatePublication] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editedLivreId, setEditedLivreId] = useState<number | null>(null);
    const [borrowModalVisible, setBorrowModalVisible] = useState(false);
    const [selectedLivreId, setSelectedLivreId] = useState<number | null>(null);
    const [borrowDate, setBorrowDate] = useState(new Date());
    const [showBorrowDatePicker, setShowBorrowDatePicker] = useState(false);
    const navigation = useNavigation();

    const fetchUser = async () => {
        try {
            const response = await api.get('auth/me/');
            setIsAdmin(response.data.is_staff || response.data.is_superuser);
        } catch (err) {
            console.log('Erreur utilisateur:', err.message);
        }
    };

    const fetchLivres = async () => {
        try {
            const response = await api.get('livres/');
            setLivres(response.data);
        } catch (error) {
            console.log('Erreur chargement livres:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        Alert.alert('Confirmation', 'Supprimer ce livre ?', [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Supprimer',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.delete(`livres/${id}/`);
                        fetchLivres();
                        Alert.alert('Succès', 'Le livre a été supprimé avec succès.');
                    } catch (err: any) {
                        console.log('Erreur suppression :', err.response?.data || err.message);
                        Alert.alert('Erreur', "Impossible de supprimer le livre.");
                    }
                },
            },
        ]);
    };

    const handleSubmitBook = async () => {
        if (!titre || !auteur || !datePublication) {
            Alert.alert('Champs requis', 'Merci de remplir tous les champs.');
            return;
        }

        try {
            if (editMode && editedLivreId !== null) {
                await api.put(`livres/${editedLivreId}/`, {
                    titre,
                    auteur,
                    date_publication: datePublication,
                });
                Alert.alert('Succès', 'Livre modifié.');
            } else {
                await api.post('livres/', {
                    titre,
                    auteur,
                    date_publication: datePublication,
                });
                Alert.alert('Succès', 'Livre ajouté.');
            }

            setShowModal(false);
            fetchLivres();
            setTitre('');
            setAuteur('');
            setDatePublication('');
            setEditMode(false);
            setEditedLivreId(null);
        } catch (err: any) {
            console.log('Erreur :', err.response?.data || err.message);
            Alert.alert('Erreur', "Impossible d'enregistrer le livre.");
        }
    };

    const handleConfirmBorrow = async () => {
        if (!selectedLivreId) return;

        try {
            await api.post('emprunts/', {
                livre_id: selectedLivreId,
                date_retour_prevue: borrowDate.toISOString().split('T')[0],
            });
            Alert.alert('Succès', 'Le livre a été emprunté avec succès.');
            setBorrowModalVisible(false);
            fetchLivres();
        } catch (err: any) {
            console.log('Erreur emprunt :', err.response?.data || err.message);
            Alert.alert('Erreur', "Impossible d'emprunter ce livre.");
        }
    };

    
    useEffect(() => {
        fetchUser();
        fetchLivres();
    }, []);
    
    useFocusEffect(
        React.useCallback(() => {
            fetchLivres();
        }, [])
    );
    
    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#1e90ff" />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.header}>
                <Text style={styles.pageTitle}>Livres</Text>
                {isAdmin && (
                    <TouchableOpacity onPress={() => setShowModal(true)} style={styles.addIcon}>
                        <Ionicons name="add-circle-outline" size={28} color="#28a745" />
                    </TouchableOpacity>
                )}
            </View>
            <View style={styles.container}>
                <FlatList
                    data={livres}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            {/* Titre + Statut */}
                            <View style={styles.headerRow}>
                                <Text style={styles.title}>{item.titre}</Text>
                                <Text
                                    style={[
                                        styles.statusText,
                                        { color: item.disponible ? '#0f9d58' : '#d93025' },
                                    ]}
                                >
                                    {item.disponible ? 'Disponible' : 'Emprunté'}
                                </Text>
                            </View>

                            {/* Auteur + Nom d'emprunteur */}
                            <View style={styles.headerRow}>
                                <Text style={styles.text}>{item.auteur} | {item.date_publication}</Text>
                                {!item.disponible && item.emprunte_par && (
                                    <Text style={styles.username}>par {item.emprunte_par}</Text>
                                )}
                            </View>

                            {/* Bouton pour utilisateur */}
                            {!isAdmin && item.disponible && (
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => {
                                        setSelectedLivreId(item.id);
                                        setBorrowModalVisible(true);
                                    }}
                                >
                                    <Text style={styles.buttonText}>Emprunter</Text>
                                </TouchableOpacity>
                            )}

                            {/* Boutons admin */}
                            {isAdmin && (
                                <View style={styles.adminActions}>
                                    <TouchableOpacity
                                        style={styles.editButton}
                                        onPress={() => {
                                            setEditMode(true);
                                            setEditedLivreId(item.id);
                                            setTitre(item.titre);
                                            setAuteur(item.auteur);
                                            setDatePublication(item.date_publication);
                                            setShowModal(true);
                                        }}
                                    >
                                        <Text style={styles.buttonLabel}>Modifier</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={() => handleDelete(item.id)}
                                    >
                                        <Text style={styles.buttonLabel}>Supprimer</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}

                />

                {/* Modal d'ajout/modification */}
                <Modal visible={showModal} transparent animationType="fade">
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalCard}>
                            <TextInput placeholder="Titre" value={titre} onChangeText={setTitre} style={styles.input} />
                            <TextInput placeholder="Auteur" value={auteur} onChangeText={setAuteur} style={styles.input} />
                            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                                <View pointerEvents="none">
                                    <TextInput
                                        placeholder="Date de publication (AAAA-MM-JJ)"
                                        value={datePublication}
                                        editable={false}
                                        style={styles.input}
                                    />
                                </View>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={datePublication ? new Date(datePublication) : new Date()}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, selectedDate) => {
                                        setShowDatePicker(false);
                                        if (selectedDate) setDatePublication(selectedDate.toISOString().split('T')[0]);
                                    }}
                                />
                            )}
                            <View style={styles.modalButtons}>
                                <Button title="Annuler" color="red" onPress={() => setShowModal(false)} />
                                <Button title={editMode ? 'Modifier' : 'Créer'} onPress={handleSubmitBook} />
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Modal emprunt */}
                <Modal visible={borrowModalVisible} transparent animationType="fade">
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalCard}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
                                📅 Choisir une date de retour prévue
                            </Text>
                            <TouchableOpacity onPress={() => setShowBorrowDatePicker(true)}>
                                <View pointerEvents="none">
                                    <TextInput
                                        value={borrowDate.toISOString().split('T')[0]}
                                        editable={false}
                                        style={styles.input}
                                    />
                                </View>
                            </TouchableOpacity>
                            {showBorrowDatePicker && (
                                <DateTimePicker
                                    value={borrowDate}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, selectedDate) => {
                                        setShowBorrowDatePicker(false);
                                        if (selectedDate) setBorrowDate(selectedDate);
                                    }}
                                />
                            )}
                            <View style={styles.modalButtons}>
                                <Button title="Annuler" color="red" onPress={() => setBorrowModalVisible(false)} />
                                <Button title="Confirmer" onPress={handleConfirmBorrow} />
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 10 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    title: { fontSize: 18, fontWeight: 'bold', flexShrink: 1, color: '#333' },
    text: { fontSize: 14, color: '#333', flex: 1 },
    statusText: { fontWeight: '600', fontSize: 14 },
    username: { fontSize: 13, color: '#555', fontStyle: 'italic', marginLeft: 10 },
    button: {
        backgroundColor: '#1e90ff',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginTop: 10,
        alignSelf: 'flex-start',
    },
    buttonText: { color: '#fff', fontWeight: '600' },
    addButton: {
        backgroundColor: '#28a745',
        padding: 12,
        borderRadius: 10,
        marginBottom: 15,
    },
    addButtonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
    editButton: {
        backgroundColor: '#ffc107',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginRight: 10,
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    buttonLabel: { color: '#fff', fontWeight: 'bold' },
    adminActions: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 10,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCard: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        elevation: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
        paddingTop: 20,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    addIcon: {
        marginLeft: 10,
        paddingHorizontal: 20,
    }
});
