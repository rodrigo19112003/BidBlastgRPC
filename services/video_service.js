const db = require('../data/data_context');

const getVideoById = async function(videoId) {
    try {
        console.log("Si entre");
        const [rows, fields] = await db.query(`SELECT content FROM hypermedia_files WHERE id_hypermedia_file = 1`);
        return rows;
    } catch (error) {
        console.error(`Unable to recover video, error occurred:`, error);
        throw error;
    }
}

module.exports = {
    getVideoById
};
