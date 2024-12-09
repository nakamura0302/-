import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
    {
        name: 'mydb.db',
        location: 'default',
    },
    () => { },
    error => {
        console.error(error);
    }
);

const tableName = 'alarm';

export class AlarmDatabase {

    static createTable = () => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `CREATE TABLE IF NOT EXISTS ${tableName} (
                        id INTEGER PRIMARY KEY AUTOINCREMENT, 
                        time TEXT, 
                        summary TEXT,
                        sound TEXT, 
                        vibrate INTEGER,
                        autoDelete INTEGER,
                        frequence TEXT,
                        active INTEGER,
                        uuids TEXT
                    )`,
                    [],
                    () => {
                        console.log('Table created successfully');
                        resolve();
                    },
                    error => {
                        console.error('Error creating table: ', error);
                        reject(error);
                    }
                );
            });
        });
    };

    static insert = (time, summary, sound, vibrate, autoDelete, frequence, active, uuids) => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `INSERT INTO ${tableName} (time, summary, sound, vibrate, autoDelete, frequence, active, uuids) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [time, summary, sound, vibrate, autoDelete, frequence, active, uuids],
                    (tx, results) => {
                        console.log('Alarm added into Database successfully');
                        resolve(results);
                    },
                    error => {
                        console.error('Error inserting alarm: ', error);
                        reject(error);
                    }
                );
            });
        });
    };

    static fetch = () => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `SELECT * FROM ${tableName}`,
                    [],
                    (tx, results) => {
                        const alarms = [];
                        for (let i = 0; i < results.rows.length; i++) {
                            alarms.push(results.rows.item(i));
                        }
                        // console.log('Fetched alarms: ', alarms);
                        resolve(alarms); // Return fetched alarms through resolve
                    },
                    error => {
                        console.error('Error fetching alarms: ', error);
                        reject(error);
                    }
                );
            });
        });
    };

    static update = (id, time, summary, sound, vibrate, autoDelete, frequence, active, uuids) => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `UPDATE ${tableName} SET time = ?, summary = ?, sound = ?, vibrate = ?, autoDelete = ?, frequence = ?, active = ?, uuids = ? WHERE id = ?`,
                    [time, summary, sound, vibrate, autoDelete, frequence, active, uuids, id],
                    (tx, results) => {
                        console.log('Alarm updated successfully');
                        resolve(results);
                    },
                    error => {
                        console.error('Error updating alarm: ', error);
                        reject(error);
                    }
                );
            });
        });
    };

    static delete = (id) => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `DELETE FROM ${tableName} WHERE id = ?`,
                    [id],
                    (tx, results) => {
                        console.log('Alarm deleted successfully');
                        resolve(results);
                    },
                    error => {
                        console.error('Error deleting alarm: ', error);
                        reject(error);
                    }
                );
            });
        });
    };

    static deleteAll = () => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `DELETE FROM ${tableName}`,
                    [],
                    (tx, results) => {
                        console.log('All alarms deleted successfully');
                        resolve(results);
                    },
                    error => {
                        console.error('Error deleting all alarms: ', error);
                        reject(error);
                    }
                );
            });
        });
    };
}
