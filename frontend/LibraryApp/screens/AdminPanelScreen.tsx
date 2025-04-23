import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import api from '../services/api';
import dayjs from 'dayjs';

interface Emprunt {
    id: number;
    utilisateur: { username: string };
    livre: {
        titre: string;
        auteur: string;
        date_publication: string;
    };
    date_emprunt: string;
    date_retour: string | null;
    date_retour_prevue: string | null;
}

export default function AdminPanelScreen() {
    const [emprunts, setEmprunts] = useState<Emprunt[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEmprunts = async () => {
        try {
            const response = await api.get('emprunts/');
            setEmprunts(response.data);
        } catch (err) {
            Alert.alert('Erreur', "Impossible de charger les emprunts.");
        } finally {
            setLoading(false);
        }
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

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#1e90ff" />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Text style={styles.pageTitle}>Panneau Admin</Text>
            <View style={styles.container}>
                {emprunts.length === 0 ? (
                    <Text style={styles.empty}>Aucun emprunt trouvé.</Text>
                ) : (
                    <FlatList
                        data={emprunts}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.card}>
                                <View style={styles.headerRow}>
                                    <Text style={styles.title}>{item.livre.titre}</Text>
                                    <View style={styles.userRow}>
                                        <FontAwesome5 name="user" size={13} color="#555" style={{ marginRight: 5 }} />
                                        <Text style={styles.username}>{item.utilisateur.username}</Text>
                                    </View>
                                </View>

                                <View style={styles.headerRow}>
                                    <Text style={styles.text}>
                                        {item.livre.auteur} | {item.livre.date_publication}
                                    </Text>
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
                                    <View style={styles.horizontalLine} />
                                    {item.date_retour && (
                                        <View style={{ marginTop: 5 }}>
                                            <Text style={styles.retour_date}>{item.date_retour}</Text>
                                        </View>
                                    )}
                                </View>

                                <Text style={styles.detail}>Emprunté le : {item.date_emprunt}</Text>

                                {item.date_retour_prevue && (
                                    <Text style={styles.detail}>Retour prévu : {item.date_retour_prevue}</Text>
                                )}

                                {!item.date_retour && renderDaysLeft(item.date_retour_prevue)}
                                {item.date_retour && (
                                    <>

                                        {item.date_retour_prevue && (() => {
                                            const retour = dayjs(item.date_retour);
                                            const prevue = dayjs(item.date_retour_prevue);
                                            const diff = retour.diff(prevue, 'day');

                                            if (diff < 0) {
                                                return (
                                                    <View style={styles.statusRow}>
                                                        <FontAwesome5 name="smile" size={14} color="#0f9d58" style={{ marginRight: 6 }} />
                                                        <Text style={{ color: '#0f9d58', fontWeight: 'bold' }}>
                                                            Avance de {Math.abs(diff)} jour{Math.abs(diff) > 1 ? 's' : ''}
                                                        </Text>
                                                    </View>
                                                );
                                            } else if (diff > 0) {
                                                return (
                                                    <View style={styles.statusRow}>
                                                        <FontAwesome5 name="exclamation-circle" size={14} color="#d93025" style={{ marginRight: 6 }} />
                                                        <Text style={{ color: '#d93025', fontWeight: 'bold' }}>
                                                            Retard de {diff} jour{diff > 1 ? 's' : ''}
                                                        </Text>
                                                    </View>
                                                );
                                            } else {
                                                return (
                                                    <View style={styles.statusRow}>
                                                        <FontAwesome5 name="check-circle" size={14} color="#ffa500" style={{ marginRight: 6 }} />
                                                        <Text style={{ color: '#ffa500', fontWeight: 'bold' }}>
                                                            Retourné à temps
                                                        </Text>
                                                    </View>
                                                );
                                            }
                                        })()}
                                    </>
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
    empty: {
        textAlign: 'center',
        marginTop: 20,
        fontStyle: 'italic',
        color: '#666',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
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
        flex: 1,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    username: {
        fontSize: 13,
        color: '#555',
        fontStyle: 'italic',
    },
    statusText: {
        fontWeight: '600',
        fontSize: 14,
    },
    detail: {
        fontSize: 13,
        color: '#444',
    },
    retour_date: {
        fontSize: 13,
        color: '#0f9d58',
    },
    horizontalLine: {
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: 6,
        width: '50%',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },

});
