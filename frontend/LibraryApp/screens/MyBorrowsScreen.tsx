import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { FontAwesome5 } from '@expo/vector-icons';
import dayjs from 'dayjs';

interface Emprunt {
    id: number;
    livre: {
        titre: string;
        auteur: string;
        date_publication: string;
    };
    date_emprunt: string;
    date_retour: string | null;
    date_retour_prevue: string | null;
}

export default function MyBorrowsScreen() {
    const [emprunts, setEmprunts] = useState<Emprunt[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEmprunts = async () => {
        try {
            const response = await api.get('emprunts/');
            const sorted = response.data.sort(
                (a: Emprunt, b: Emprunt) => (a.date_retour ? 1 : 0) - (b.date_retour ? 1 : 0)
            );
            setEmprunts(sorted);
        } catch (err) {
            console.log('Erreur fetch emprunts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReturn = async (id: number) => {
        Alert.alert('Confirmation', 'Voulez-vous rendre ce livre ?', [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Rendre',
                onPress: async () => {
                    try {
                        await api.post(`emprunts/${id}/rendre/`);
                        Alert.alert('Succès', 'Livre marqué comme retourné.');
                        fetchEmprunts();
                    } catch (err: any) {
                        console.log('Erreur return :', err.response?.data || err.message);
                        Alert.alert('Erreur', "Impossible de rendre ce livre.");
                    }
                },
            },
        ]);
    };

    const renderDaysLeft = (date: string | null) => {
        if (!date) return null;

        const today = dayjs();
        const due = dayjs(date);
        const diff = due.diff(today, 'day');

        let color = '#0f9d58';
        if (diff < 0) color = '#d93025';
        else if (diff === 0 || diff === 1) color = '#ffa500';

        return (
            <Text style={{ color, fontWeight: 'bold', marginTop: 3 }}>
                {diff >= 0
                    ? `📅 ${diff} jour${diff > 1 ? 's' : ''} restant${diff > 1 ? 's' : ''}`
                    : `⏰ ${Math.abs(diff)} jour${Math.abs(diff) > 1 ? 's' : ''} de retard`}
            </Text>
        );
    };

    useEffect(() => {
        fetchEmprunts();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            fetchEmprunts(); // recharge les emprunts à chaque retour
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
            <Text style={styles.pageTitle}>Mes Emprunts</Text>
            <View style={styles.container}>
                {emprunts.length === 0 ? (
                    <Text style={styles.empty}>Aucun emprunt pour le moment.</Text>
                ) : (
                    <FlatList
                        data={emprunts}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.card}>
                                <View style={styles.headerRow}>
                                    <Text style={styles.title}>{item.livre.titre}</Text>
                                    <Text
                                        style={[
                                            styles.statusText,
                                            { color: item.date_retour ? '#0f9d58' : '#d93025' },
                                        ]}
                                    >
                                        {item.date_retour ? 'Retourné' : 'Non retourné'}
                                    </Text>
                                </View>

                                <View style={styles.headerRow}>
                                    <Text style={styles.text}>
                                        {item.livre.auteur} | {item.livre.date_publication}
                                    </Text>
                                    {item.date_retour && (
                                        <Text style={[styles.detail, { color: '#0f9d58', marginLeft: 10 }]}>
                                            {item.date_retour}
                                        </Text>
                                    )}
                                </View>
                                <View style={styles.horizontalLine} />
                                <Text style={styles.detail}>Emprunté le : {item.date_emprunt}</Text>
                                {item.date_retour_prevue && (
                                    <Text style={styles.detail}>
                                        Retour prévu : {item.date_retour_prevue}
                                    </Text>
                                )}

                                {!item.date_retour && renderDaysLeft(item.date_retour_prevue)}

                                {!item.date_retour && (
                                    <TouchableOpacity
                                        style={styles.returnButton}
                                        onPress={() => handleReturn(item.id)}
                                    >
                                        <FontAwesome5 name="undo" size={16} color="#fff" />
                                        <Text style={styles.returnText}> Rendre le livre</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
        paddingTop: 20,
        paddingHorizontal: 20,
    },
    empty: { textAlign: 'center', marginTop: 20, fontStyle: 'italic', color: '#666' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 10,
        marginBottom: 12,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        flexShrink: 1,
    },
    text: {
        fontSize: 14,
        color: '#333',
    },
    statusText: {
        fontWeight: '600',
        fontSize: 14,
    },
    detail: {
        fontSize: 13,
        color: '#444',
        marginTop: 3,
    },
    returnButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffa500',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginTop: 10,
        alignSelf: 'flex-start',
    },
    returnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    horizontalLine: {
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: 6,
        width: '50%',
    },

});
