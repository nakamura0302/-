import {
	FirestoreError,
	deleteDoc,
	doc,
	getDoc,
} from 'firebase/firestore';
import { db } from '../../../firebase.config';

export async function removeDocument(props) {
	const { collectionName, docId, userId } = props;
	try {
		const stringifiedDocId = typeof docId === 'number'
			? docId.toString()
			: docId;
		const docRef = doc(db, collectionName, stringifiedDocId);
		await deleteDoc(docRef);
	} catch (e) {
		const error = e;
		throw new Error(`Error removing a document in the collection '${collectionName}: ${error.message}`);
	}
}

export async function removeMultipleDocuments(props) {
	const { collectionName, ids, userId } = props;
	try {
		for (const docId of ids) {
			const stringifiedDocId = typeof docId === 'number'
				? docId.toString()
				: docId;
			const docRef = doc(db, collectionName, stringifiedDocId);

			const docSnapshot = await getDoc(docRef);
			const areUserIdsMatched = docSnapshot.exists()
				&& docSnapshot.data().userId === userId;
			if (areUserIdsMatched) {
				await deleteDoc(docRef);
			}
		}
	} catch (e) {
		const error = e;
		throw new Error(
			`Error removing multiple documents in the collection '${collectionName}: ${error.message}`,
		);
	}
}