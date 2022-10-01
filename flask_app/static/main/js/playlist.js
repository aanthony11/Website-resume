var clientId = "4b6ef204d51b41b98b02595b5b5ef145";
var clientSecret = "2b247d1497b640119debf10f7fced4c4";
var token_url = "https://accounts.spotify.com/token"

var redirect = "google.com";
var scopes = 'user-read-private user-read-email';

const AUTH = "https://accounts.spotify.com/authorize";

selectedGenres = {};

function submitGenres() {
	console.log("Collected all genres");
}

function generateRandomString(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }

   return result;
}

function generateRandomInt(max) {
  return Math.floor(Math.random() * (max - 1) + 1);
}

function toggleCard(e) {
  document.body.onclick = function(evt) {
      var evt = window.event || evt; //window.event for IE
      if (!evt.target) {
          evt.target = evt.srcElement; //extend target property for IE
      } 

      var parent = evt.target.parentNode;

      while (parent.id != "music-card") {
          parent = parent.parentNode;
      }

      console.log(parent.childNodes);

      genreTag = parent.childNodes[1];
      genreTag.classList.add("check");

      // add genre to dictionary of selected genres
      text = parent.childNodes[1].outerText;
      if (selectedGenres.hasOwnProperty(text)) {
      	// remove key from dict
      	delete selectedGenres[text]
      } else {
      	// add genre to dictonary
      	selectedGenres[text] = true;

      	// add checkmark
      	parent.childNodes[2].display = "inline-block";

      }
      console.log(selectedGenres);
  }
}

const APIController = ( function() {

	const _getToken = async () => {

    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/x-www-form-urlencoded', 
            'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    });

		const data = await result.json();
		return data.access_token;
	}

	const _implicit = async (token) => {
		// Get the hash of the url
		const hash = window.location.hash
		.substring(1)
		.split('&')
		.reduce(function (initial, item) {
		  if (item) {
		    var parts = item.split('=');
		    initial[parts[0]] = decodeURIComponent(parts[1]);
		  }
		  return initial;
		}, {});
		window.location.hash = '';

		// Set token
		let _token = hash.access_token;

		const authEndpoint = 'https://accounts.spotify.com/authorize';

		// Replace with your app's client ID, redirect URI and desired scopes
		const redirectUri = 'http://0.0.0.0:8080/playlist';
		var scope = 'user-read-private user-read-email user-library-read playlist-modify-public';

		// If there is no token, redirect to Spotify authorization
		if (!_token) {
		  window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=token`;
		}

		return _token;
	}

	const _getCategories = async (token) => {
    const result = await fetch(`https://api.spotify.com/v1/browse/categories?locale=sv_US`, {
        method: 'GET',
        headers: {'Authorization' : 'Bearer ' + token}
    });

		const data = await result.json();
		return data.categories.items;
	}

	const _getGenres = async (token) => {

    const result = await fetch(`https://api.spotify.com/v1/recommendations/available-genre-seeds`, {
	    method: 'GET',
	    headers: {'Authorization' : 'Bearer ' + token}
    });

    const data = await result.json();
		return data.genres;
	}

	const _searchPlaylists = async(token, playlist) => {

		const result = await fetch(`https://api.spotify.com/v1/search?q=${playlist}&type=playlist&limit=5`, {
			method: "GET",
	    headers: {'Authorization' : 'Bearer ' + token}
		});

		const data = await result.json();
		console.log(data);
		return data
	}

	const _search = async(token, text) => {
			const result = await fetch(`https://api.spotify.com/v1/search?q=${playlist}&type=playlist&limit=5`, {
			method: "GET",
	    headers: {'Authorization' : 'Bearer ' + token}
		});

		const data = await result.json();
		console.log(data);
		return data
	}

	const _getPlaylists = async(token) => {
		playlists = {};

		for(var genre in selectedGenres) {
			playlists[genre] = [];
			const result = await fetch(`https://api.spotify.com/v1/search?q=${genre}&type=playlist&limit=5`, {
			method: "GET",
	    headers: {'Authorization' : 'Bearer ' + token}
			});

			const playlist = await result.json();

			playlists[genre] = playlist.playlists.items;
		}


		return playlists;
	}

	const _getTracks = async(token, playlists) => {
		genre_playlists = {}
		playlists_wrapped = await playlists;
		console.log(playlists_wrapped);
		for (var p in playlists_wrapped) {
			var val = playlists_wrapped[p];
			// get tracks from playlist

			console.log(val[0].href);
			// limit songs fetched
			const result = await fetch(`${val[0].href}`, {
			method: "GET",
	    headers: {'Authorization' : 'Bearer ' + token},
			});

			const data = await result.json();
			console.log(data);

			genre_playlists[p] = data.tracks.items.splice(0,20);
		}

		return genre_playlists;
	}

	const _getUserID = async(token) => {

    const result = await fetch(`https://api.spotify.com/v1/me`, {
	    method: 'GET',
	    headers: {'Authorization' : 'Bearer ' + token}
    });

    const data = await result.json();
    console.log(data);

		return data.id;
	}

	const _createPlaylist = async(token, userId) => {
		console.log("Creating playlist");
		var scope = 'user-library-read <etc>';
		var url = `https://api.spotify.com/v1/users/${userId}/playlists`;
		const name = Object.keys(selectedGenres).join('');
		const result = await fetch(url, {
			method: 'POST',
      body: JSON.stringify({'name': name,'public': true}),
			json: true,
			headers: {
				'Authorization': 'Bearer ' + token,
				'Content-Type': 'application/json'
			}
    });

		const data = await result.json();
    console.log(data);

    return data.id;
	}

	const _addTracks = async(token, playlistID, tracks) => {
		uri_list = Object.keys(tracks)
			.map(function(key, index) { return tracks[key]; })
			.flat()
			.map(function(track) { return track.track.uri; })

		var url = `https://api.spotify.com/v1/playlists/${playlistID}/tracks`;
		const result = await fetch(url, {
			method: 'POST',
			body: JSON.stringify({'uris': uri_list}),
			json: true,
			headers: {
				'Authorization': 'Bearer ' + token,
				'Content-Type': 'application/json'
			}
		});
	}


	return {
		getToken() {
			return _getToken();
		},
		getUserID(token) {
			return _getUserID(token);
		},
		getCategories(token) {
			return _getCategories(token);
		},
		getGenres(token) {
			return _getGenres(token);
		},
		getPlaylists(token) {
			return _getPlaylists(token);
		},
		getTracks(token, playlists) {
			return _getTracks(token, playlists);
		},
		getUserID(token) {
			return _getUserID(token);
		},
		implicit(token) {
			return _implicit(token);
		},
		createPlaylist(token, userId) {
			return _createPlaylist(token, userId);
		},
		addTracks(token, playlistID, tracks) {
			return _addTracks(token, playlistID, tracks);
		},


		searchPlaylists(token, playlist) {
			return _searchPlaylists(token, playlist);
		}
	}


})();

const UIController = ( function() {
	const DOMElements = {
		hfToken: "#hidden_token",
		buttonSubmit: ".submit-button"
	}

	return {
		inputField() {
			return {
				submit: document.querySelector(DOMElements.buttonSubmit)
			}
		},

		storeToken(val) {
			console.log(DOMElements.hfToken);
			document.querySelector(DOMElements.hfToken).value = val;
		},

		getStoredToken() {
			return {
				token: document.querySelector(DOMElements.hfToken).value
			}
		},

		createGenre(genre, index) {
			let musicCard = document.createElement("div");
			musicCard.classList.add(index);
			musicCard.setAttribute("id", `music-card`);
			musicCard.setAttribute("onClick", "toggleCard(event)")
			// add picture
			let musicPicture = document.createElement("img");
			musicPicture.src = "../static/main/images/dog-music.jpeg";

			// add caption
			let tag = document.createElement("p");
			let text = document.createTextNode(genre);
			tag.appendChild(text);

			let span = document.createElement("span");
			span.setAttribute("id", "checkmark");

			// add child nodes to card
			musicCard.appendChild(musicPicture);
			musicCard.appendChild(tag);
			musicCard.appendChild(span);


			// add everything to genre contatiner tag
			let container = document.getElementById("genre-container");
			container.appendChild(musicCard);

		},

	}
})();

const APPController = (function(UICtrl, APICtrl) {

	const DOMInputs = UICtrl.inputField();
	var impToken = '';

	const loadCategories = async () => {
		// get token
		const token = await APICtrl.getToken();
		impToken = await APICtrl.implicit(token);
		

		// store token
		UICtrl.storeToken(token);
		// get categories
		const categories = await APICtrl.getCategories(token);
		// get list of genres
		const genres = await APICtrl.getGenres(token);
		//console.log(genres);
		// UICtrl.setContainer(genres.length);
		genres.forEach((genre, index) => UICtrl.createGenre(genre, index));

	}

	DOMInputs.submit.addEventListener("click", async (e) => {
		console.log("creating your new playlist!");

		e.preventDefault();

		// get token
		const token = UICtrl.getStoredToken().token;
		// get playlists
		const playlists = await APICtrl.getPlaylists(token);
		console.log(playlists);
		// get songs
		const tracks = await APICtrl.getTracks(token, playlists);
		console.log(tracks);
		// get user id
		const userId = await APICtrl.getUserID(impToken);
		// create playlist
		const playlistID = await APICtrl.createPlaylist(impToken, userId);
		// add tracks to playlist
		APICtrl.addTracks(impToken, playlistID, tracks);
		
	})

	return {
		init() {
			console.log("App is starting");
			loadCategories();
		}
	}

})(UIController, APIController);


APPController.init();

