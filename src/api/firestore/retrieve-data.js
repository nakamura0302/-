import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase.config';

export async function retrieveDocs(props) {
    const { collectionName, userId, startDate, endDate } = props; // Add startDate and endDate to props
    try {
        const queriedCollection = (startDate || endDate) ? query(
            collection(db, collectionName),
            where('start', '>=', startDate),
            where('start', '<=', endDate),
            where('userId', '==', userId),
        ) 
        : query(
            collection(db, collectionName),
            where('userId', '==', userId),
        );
        const querySnapshot = await getDocs(queriedCollection);
        if (querySnapshot.empty) {
            return [];
        } else {
            const dataArray = querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}));
            return dataArray;
        }
    } catch (error) {
        console.error('Error retrieving data:', error);
    }
}
