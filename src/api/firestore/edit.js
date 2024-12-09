import {
	doc,
	DocumentData,
	WithFieldValue,
	updateDoc,
	FirestoreError,
	getDoc,
} from 'firebase/firestore';
import { db } from '../../../firebase.config';


export async function editDocument(props) {
	const { collectionName, updatedItem, userId } = props;
	try {
		const docId = typeof updatedItem.id === 'number'
			? updatedItem.id.toString()
			: updatedItem.id;
		const docRef = doc(db, collectionName, docId);
		
		await updateDoc(docRef, updatedItem);
	} catch (e) {
		const error = e
		throw new Error(`Error editing document collection '${collectionName}: ${error.message}`);
	}
}