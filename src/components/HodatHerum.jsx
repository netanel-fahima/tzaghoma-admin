import React, { useState, useEffect, useMemo,useRef } from "react";
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import ResponsiveText from "./ResponsiveText/ResponsiveText";
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

const HodatHerum = ({ city = "נתיבות", container, messages: firestoreMessages = [], synagogueId }) => {
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

    const seenAlertIdsRef = useRef(new Set());

    useEffect(() => {

        const clearMessages =  () => {
            setAllMessages(prev => {
                const now = Date.now();
                const filter =  prev.filter(msg => now - msg.timestamp < 10 * 60 * 1000 ||  msg.category === 'firestore');

                const needUpdate = [...seenAlertIdsRef.current].some(
                    id => !filter.some(msg => msg.id === id)
                  );
                  
                  if (needUpdate) {
                    // שמירה רק של ה-id-ים שקיימים גם ב-filter
                    const updatedSet = new Set([]);
                    filter.forEach(msg => {
                      if (seenAlertIdsRef.current.has(msg.id)) {
                        updatedSet.add(msg.id);
                      }
                    });
                    seenAlertIdsRef.current = updatedSet;
                  
                    console.log('seenAlertIdsRef.current', [...seenAlertIdsRef.current]);
                  }
                
                if(!filter.some(msg => msg.category === 'pikud')) {
                    setLastCategory(undefined);
                }
                return filter;
            });
        }

        const intervalId = setInterval(clearMessages, 1000);

        return () => clearInterval(intervalId); 

     }, [allMessages]);

     useEffect(() => {

        const fetchAlerts = async () => {
            try {
                const response = await fetch('https://www.kore.co.il/redAlert.json'.concat('?qc=', Date.now()), {
                    cache: 'no-store'
                });
    
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
    
                const alert = await response.json();
    
                // בדיקת רלוונטיות לפי העיר
                if (
                    alert?.id &&
                    Array.isArray(alert.data) &&
                    alert.data.some(location => location?.includes(city ) || location?.includes('רחבי הארץ'))
                ) {
                    if (!seenAlertIdsRef.current.has(alert.id)) {
    
                        const location = alert.data.find(location => location?.includes(city ) || location?.includes('רחבי הארץ'))

                        const newAlert = {
                            id: alert.id,
                            content: `${new Date().toLocaleTimeString('he-IL')} - ${location} - ${alert?.title || ''} - ${alert.desc || ''}`,
                            category: 'pikud',
                            timestamp: new Date().getTime(),
                        };
    
                        console.log('newAlert', newAlert);
    
                        setAllMessages(prev => [...prev, newAlert]);
                        seenAlertIdsRef.current.add(alert.id);
                        setLastCategory(alert.cat);
                    }
                }
    
            } catch (error) {
                console.error('Error fetching alerts:', error);
            }
        };
    
        const intervalId = setInterval(fetchAlerts, 2000);
    
        return () => clearInterval(intervalId);
    }, [city]);
    

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
            <marquee width="90%" direction="right" style={{ 
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