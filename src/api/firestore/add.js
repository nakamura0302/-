import {
	doc,
	setDoc,
	addDoc,
	writeBatch,
	collection,
} from 'firebase/firestore';
import { db } from '../../../firebase.config';

export async function addDocument(props) {
	const { collectionName, item, userId } = props;
	try {
		addDoc(collection(db, collectionName), {...item, userId});
	} catch (e) {
		const error = e;
		throw new Error(`Error adding a document to collection '${collectionName}': ${error.message}`);
	}
}

export async function addMultipleDocuments(props) {
	const { collectionName, items, userId } = props;
	try {
		const batch = writeBatch(db);

		items.forEach(async (item) => {
			const docRef = doc(db, collectionName, item.sid.toString());
			batch.set(docRef, {
				...item,
				userId,
			});
		});

		await batch.commit();
	} catch (e) {
		const error = e;
		throw new Error(`Error adding multiple documents to collection '${collectionName}': ${error.message}`);
	}
}