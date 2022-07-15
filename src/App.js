import {useEffect, useState} from 'react';
import './App.css';
import { getFollowedArtists } from './spotifyFuncs.js';
import ArtistList from './ArtistList'
import ArtistInfo from './ArtistInfo'

import { SPOTIFY_CLIENT_ID, REDIRECT_URI } from "./config.js";

const querystring = require('querystring');
export var globalToken = "";

function App() {
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const API_PARAMS = {
    client_id: SPOTIFY_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "token",
    scope: "user-follow-read user-read-email"
  }
  const FULL_AUTH_URL = `${AUTH_ENDPOINT}?${querystring.stringify(API_PARAMS)}`;

  const [token, setToken] = useState("");
  const [artistList, setArtistList] = useState([]);
  const [artistSelections, setSelections] = useState({});
  const [artistResponse, setArtistResponse] = useState([]);

  // Pull token from local storage (if available)
  useEffect(() => {
    const hash = window.location.hash;
    var foundToken = window.localStorage.getItem("token");

    if (!foundToken && hash) {
      foundToken = hash.substring(1).split("&")
        .find(e => e.startsWith("access_token")).split("=")[1];

      window.location.hash = "";
      window.localStorage.setItem("token", foundToken);
    }

    setToken(foundToken);
  }, []);

  // Delete token from local storage
  const logout = () => {
    // token = "";
    setToken("");
    window.localStorage.removeItem("token");
  }

  // TODO: Add section to refresh token


  // Get artists
  useEffect(() => {
    if (token) {
      console.log(`Working with token: ${token}`);
      // globalToken = token;
      process.env.globalToken = token;
      getFollowedArtists(token).then((response) => {
        // Handle response
        response.sort((a, b) => {
          var textA = a.name.toUpperCase();
          var textB = b.name.toUpperCase();
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
        setArtistResponse(response);

        // Build selections dict
        var defaultSelections = {};
        response.forEach(a => {
          defaultSelections[a.id] = false;
        });
        setSelections(defaultSelections);
      })
    }
  }, [token]);

  // Make all the objects access
  useEffect(() => {
    var artistSet = artistResponse.map(a => {
      a.existingSelections = artistSelections;
      a.setSelections = setSelections;
      return <ArtistInfo params={a} key={a.id} />
    });

    setArtistList(artistSet);
  }, [artistSelections, artistResponse]);


  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify React</h1>
        {!token ?
            <a href={FULL_AUTH_URL}>
              Login to Spotify
            </a>
          :
            <div>
              <ArtistList artists={artistList} token={token} />
              <button onClick={logout}>Logout</button>
            </div>
        }
      </header>
    </div>
  );
}

export default App;
