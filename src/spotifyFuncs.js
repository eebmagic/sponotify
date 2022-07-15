import axios from 'axios';

// Get followed artists
export const getFollowedArtists = async (token) => {
    console.log(`RUNNING THE GETFOLLOWEDARTISTS() FUNC`)

    const size = 50;
    var all_artists = [];

    var result = await getFollowedHelper(token, size, null);
    all_artists = all_artists.concat(result.items);
    while (result.next != null) {
        result = await getFollowedHelper(token, size, result.cursors.after);
        all_artists = all_artists.concat(result.items);
    }

    return all_artists;
}

const getFollowedHelper = async (token, size, cursor) => {
    const params = {
        type: "artist",
        limit: `${size}`
    }
    if (cursor) {
        params.after = cursor
    }

    const response = await axios.get("https://api.spotify.com/v1/me/following?", {
        headers: { Authorization: `Bearer ${token}` },
        params: params
    });

    return response.data.artists;
}

// Get current artist items (should have a hash available)
export const getArtistAlbums = async (token, artistID) => {
    console.log(`Running the getArtistAlbums() func.`)

    var all_albums = [];

    var result = await getAlbumsHelper(token, artistID, null);
    all_albums = all_albums.concat(result.items);
    while (result.next != null) {
        result = await getAlbumsHelper(token, artistID, result.next);
        all_albums = all_albums.concat(result.items);
    }

    return all_albums;
}

const getAlbumsHelper = async (token, artistID, cursor) => {
    var url = `https://api.spotify.com/v1/artists/${artistID}/albums`;
    const response = await axios.get(cursor ? cursor : url, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        params: { limit: "50" }
    });

    return response.data;
}

export const getMostRecentItem = (albums) => {
    albums.sort((a, b) => {
        var textA = a.release_date;
        var textB = b.release_date;
        return (textA < textB) ? 1 : (textA > textB) ? -1 : 0;
    });

    return albums[0]
}

export const getArtistInfos = async (token, artistIDs) => {
    var out = [];
    const chunkSize = 50;
    const chunks = Math.ceil(artistIDs.length / chunkSize);
    for (var c = 0; c < chunks; c++) {
        var start = chunkSize * c;
        var stop = chunkSize * (c + 1);
        var subset = artistIDs.slice(start, stop);

        var params = {ids: subset.join(',')};

        var url = `https://api.spotify.com/v1/artists`;
        var response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
            params: params
        });
        out = out.concat(response.data.artists);
    }

    return out;
}


export const getUserInfo = async (token) => {
    const response = await axios.get("https://api.spotify.com/v1/me", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: {}
    });

    return response;
}
