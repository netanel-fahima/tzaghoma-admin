import React, { useState, useEffect, useMemo } from "react";
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import ResponsiveText from "./ResponsiveText/ResponsiveText";
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

const HodatHerum = ({ city = "נתיבות", container, messages: firestoreMessages = [], synagogueId }) => {
    const [messages, setMessages] = useState([]);
    const [lastCategory, setLastCategory] = useState(null);
    const [allMessages, setAllMessages] = useState([]);
    const [readMessages, setReadMessages] = useState(new Set());

    // האזנה להודעות מ-Firestore
    useEffect(() => {
        if (!city) return;

        const q = query(
            collection(db, 'emergencyMessages'),
            where('city', '==', city)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const firestoreAlerts = [];
            snapshot.forEach((doc) => {
                firestoreAlerts.push({
                    id: doc.id,
                    ...doc.data(),
                    category: 'firestore',
                    timestamp: doc.data().createdAt
                });
            });
            
            // עדכון רשימת ההודעות שנקראו
            firestoreAlerts.forEach(alert => {
                if (alert.readBy?.includes(synagogueId)) {
                    setReadMessages(prev => new Set([...prev, alert.id]));
                }
            });
            
            setAllMessages(prev => {
                // שמירה רק על התראות פיקוד העורף ועדכון התראות Firestore
                const pikudAlerts = prev.filter(msg => msg.category !== 'firestore');
                return [...pikudAlerts, ...firestoreAlerts];
            });
        });

        return () => unsubscribe();
    }, [city, synagogueId]);

    // עדכון קריאת הודעה
    useEffect(() => {
        if (!synagogueId) return;
        
        allMessages.forEach(async message => {
            if (message.category === 'firestore' && !readMessages.has(message.id)) {
                try {
                    const messageRef = doc(db, 'emergencyMessages', message.id);
                    await updateDoc(messageRef, {
                        readBy: arrayUnion(synagogueId)
                    });
                    setReadMessages(prev => new Set([...prev, message.id]));
                } catch (error) {
                    console.error('Error updating message read status:', error);
                }
            }
        });
    }, [allMessages, synagogueId, readMessages]);

    useEffect(() => {
        const fetchAlerts = async () => {
           return
            try {
                const response = await fetch('http://localhost:8080/alerts');
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                
                // בדיקה אם יש התראות חדשות
                if (data && Array.isArray(data) && data.length > 0) {
                    // מסנן רק התראות לעיר הספציפית
                    const cityAlerts = data.filter(alert => alert.data.includes(city));
                    
                    if (cityAlerts.length > 0) {
                        const latestAlert = cityAlerts[0];
                        
                        // אם זו התראה חדשה או מקטגוריה שונה
                        if (lastCategory !== latestAlert.category) {
                            const pikudAlerts = cityAlerts.map(alert => ({
                                id: alert.alertDate,
                                content: `${alert.title} - ${new Date(alert.alertDate).toLocaleTimeString('he-IL')} - ${alert.data}`,
                                category: 'pikud',
                                timestamp: alert.alertDate
                            }));
                            setAllMessages(prev => {
                                // שמירה רק על התראות Firestore ועדכון התראות פיקוד העורף
                                const firestoreAlerts = prev.filter(msg => msg.category === 'firestore');
                                return [...firestoreAlerts, ...pikudAlerts];
                            });
                            setLastCategory(latestAlert.category);
                        }
                    } else {
                        // אם אין התראות לעיר, נקה רק את התראות פיקוד העורף
                        setAllMessages(prev => prev.filter(msg => msg.category === 'firestore'));
                        setLastCategory(null);
                    }
                } else {
                    // אם אין התראות בכלל, נקה רק את התראות פיקוד העורף
                    setAllMessages(prev => prev.filter(msg => msg.category === 'firestore'));
                    setLastCategory(null);
                }
            } catch (error) {
                console.error('Error fetching alerts:', error);
            }
        };

        // דגימה כל שנייה
        const intervalId = setInterval(fetchAlerts, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, [city, lastCategory]);

    // מיון ההודעות לפי זמן
    const sortedMessages = useMemo(() => {
        return allMessages
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [allMessages]);

    // אם אין הודעות בכלל, לא מציגים כלום
    if (sortedMessages.length === 0) {
        return null;
    }

    const cityLogo = lastCategory  ?  
    new URL('../img/pikud-haoref.png', import.meta.url).href :
    new URL(`../img/${city}.png`, import.meta.url).href ;

    return (
        <div
            style={{
                backgroundImage: `url(${cityLogo})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "110px",
                backgroundPosition: "10px center",
                backgroundColor: "#ff0000",
                width: "100%",
                position: "fixed",
                height: "22%",
                left: "0",
                bottom: "0",
                zIndex: "1000",
                overflow: "hidden"
            }}
        >
            <span
                className="emergency-title"
                style={{
                    color: "#ff8c00",
                    fontSize: "28px",
                    fontWeight: "bolder",
                    position: "absolute",
                    top: "11%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    padding: "5px 20px",
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
                    whiteSpace: "nowrap",
                    zIndex: 2
                }}
            >
                {lastCategory ? 'התראת פיקוד העורף' : `הודעת חירום של עירית ${city}`}
            </span>
            <marquee width="90%" direction="left" style={{ 
                fontWeight: "bolder", 
                position: "absolute", 
                top: "50%", 
                left: "55%", 
                transform: "translate(-50%, -50%)" 
            }}>
                <ResponsiveText
                    id="Hodaterum"
                    className="Hodaterum"
                    title={
                        <div className="Columns" >
                            {sortedMessages.map((message, index) => (
                                <div key={message.id}>{message.content}</div>
                            ))}
                        </div>
                    }
                    containerRef={container}
                />
            </marquee>
        </div>
    );
};

export default HodatHerum;