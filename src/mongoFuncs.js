const axios = require('axios');
const { getArtistAlbums, getArtistInfos, getMostRecentItem } = require('./spotifyFuncs');

const DB_PORT = 5001;
const DB_URL = `http://localhost:${DB_PORT}`;

export const addSubscriptions = async (userEmail, artistSelections) => {
    const artistList = Object.keys(artistSelections).filter(key => artistSelections[key]);

    console.log(`Called addSubscriptions for email: ${userEmail} and subs:`);
    console.log(artistList);

    getArtists(artistList).then(responseDocs => {
        console.log(`Found many docs:`);
        console.log(responseDocs);

        const foundSet = responseDocs.map(doc => doc.artistID);
        const unfoundSet = artistList.filter(id => !foundSet.includes(id));

        console.log(`found docs for:`);
        console.log(foundSet);
        console.log(`DID NOT find docs for:`);
        console.log(unfoundSet);

        // Add emails to existing artists
        foundSet.forEach(artistID => {
            addEmail(artistID, userEmail);
        })


        // Build docs for new artists
        console.log(`Working with unfound artists`);
        const token = window.localStorage.getItem("token");
        getArtistInfos(token, unfoundSet).then(infoResults => {
            var infos = {};
            console.log(`infoResults:`);
            console.log(infoResults);
            infoResults.forEach(info => {
                infos[info.id] = info
            })

            unfoundSet.forEach(artistID => {
                buildGenericDoc(artistID, userEmail, infos[artistID]).then(doc => {
                    // Push doc to db
                    if (doc) {
                        console.log(`Built doc:`);
                        console.log(doc);
                        addArtist(doc);
                        // const docAdded = addArtist(doc);
                        // if (docAdded) {
                        //     console.log(`Added successfully`);
                        // } else {
                        //     console.log(`FAILED TO ADD`);
                        // }
                    }
                })
            })
        })
    })
}

const buildGenericDoc = async (artistID, starterEmail, artistInfo) => {
    console.log(`Making generic doc for artist: ${artistID}`);

    const result = await getArtistAlbums(window.localStorage.getItem("token"), artistID).then(albums => {
        const mostRecent = getMostRecentItem(albums);

        const doc = {
            artistID: artistID,
            subscribers: [starterEmail],
            lastEntry: mostRecent,
            lastSent: mostRecent ? mostRecent.id : null,
            artistInfo: artistInfo
        };

        return doc;
    })

    return result;
}

/**
 * Add user's email to artist entry in db
 * 
 * @param artistID: the Spotify id for the artist to track
 * @param email: the artists email
 * @return the response/err from the mongo interface express api
 */
const addEmail = async (artistID, email) => {
    const url = `${DB_URL}/update/${artistID}/email/${email}`;
    axios.post(url, {
        headers: {},
    }).then(response => {
        return response;
    }).catch(err => {
        console.log(`ERROR WHILE UPDATING:`);
        console.log(err);

        return err;
    })
}

/**
 * Get multiple artists from db if they exist in collection: artistSubscribers
 * 
 * @param ids (array[string]): the Spotify ids for the artists
 * @return entries (array[object]): the array of docs that correspond to existing ids in db
 */
const getArtists = async (ids) => {
    const dbGetUrl = `${DB_URL}/artistdocs`;
    const fetchBody = {
        headers: {},
        params: {
            artistIDs: ids
        }
    };

    const queryPromise = await axios.get(dbGetUrl, fetchBody).then(response => {
        return response.data;
    }).catch(err => {
        console.log(`FETCH MANY DOCS FAILED. ERR:`);
        console.log(err);
        return null;
    })

    return queryPromise;
}

/**
 * Add artist document to db collection: artistSubscribers
 * 
 * @param docBody (object): the artistID, subscriberEmails, artistContent
 * @return true/false: true if added successfully.
 */
export const addArtist = async (docBody) => {
    const dbAddUrl = `${DB_URL}/artist/add`;
    axios.post(dbAddUrl, docBody).then(response => {
        return true;
    }).catch(err => {
        console.log(`PUSH FAILED. ERR:`);
        console.log(err);
        return false;
    });
}