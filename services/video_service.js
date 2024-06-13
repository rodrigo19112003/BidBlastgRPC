const db = require('../data/data_context');

const getVideoById = async function(videoId) {
    try {
        const [rows, fields] = await db.query(`SELECT content FROM hypermedia_files WHERE 
            mime_type LIKE 'video%' AND id_hypermedia_file = ?`, [videoId]);
        return rows[0];
    } catch (error) {
        console.error(`Unable to recover video, error occurred:`, error);
        throw error;
    }
}

module.exports = {
    getVideoById
};
