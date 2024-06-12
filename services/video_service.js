const db = require('../data/data_context');

const getVideoById = async function(videoId) {
    try {
        const [rows, fields] = await db.query(`SELECT content FROM hypermedia_files WHERE id_hypermedia_file = ?`, [videoId]);
        return rows[0];
    } catch (error) {
        console.error(`Unable to recover video, error occurred:`, error);
        throw error;
    }
}
const saveVideo = async function(auctionId, mimeType, content, name) {
    try {
        const [result] = await db.query(
            `INSERT INTO hypermedia_files (mime_type, name, content, id_auction) VALUES (?, ?, ?, ?)`,
            [mimeType, name, content, auctionId]
        );
        return result.insertId;
    } catch (error) {
        console.error('Unable to save video, error occurred:', error);
        throw error;
    }
};

module.exports = {
    getVideoById,
    saveVideo
};
