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
const saveVideo = async function(auctionId, mimeType, content, name) {
    try {
        const [result] = await db.query(
            `INSERT INTO hypermedia_files (mime_type, name, content, id_auction) VALUES (?, ?, ?, ?)`,
            [mimeType, name, content, auctionId]
        );
        return result.insertId;
    } catch (error) {
        throw error;
    }
};

const checkAuctionExists = async function(auctionId) {
    try {
        const [rows, fields] = await db.query(`SELECT id_auction FROM auctions WHERE id_auction = ?`, [auctionId]);
        return rows.length > 0;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getVideoById,
    saveVideo,
    checkAuctionExists
};
