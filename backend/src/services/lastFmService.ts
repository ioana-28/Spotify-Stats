import axios from "axios";

export const getArtistGenres = async (artist: string): Promise<string[]> => {
    try {
        const response = await axios.get("https://ws.audioscrobbler.com/2.0/", {
            params: {
                method: "artist.gettoptags",
                artist: artist,
                api_key: process.env.LASTFM_API_KEY,
                format: "json",
                autocorrect: 1,
            },
            headers: {
                "User-Agent": "StatsApp/1.0.0",
            },
            timeout: 5000,
        });

        const tags = response.data?.toptags?.tag;
        if (!Array.isArray(tags)) {
            return [];
        }
        return tags.slice(0, 3).map((tag: any) => tag.name);
    } catch (error) {
        return [];
    }
};