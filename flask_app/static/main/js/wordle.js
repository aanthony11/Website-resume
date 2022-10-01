function toggleHelp() {
	const help_button = document.getElementById('help');
   	if (help_button.style.display === 'block') {
      help_button.style.display = 'none';
   	}
   	else {
      help_button.style.display = 'block';
   	}
}

function checkFirstTime(message) {
	help = document.getElementById("help");
	if (message === "YES") {
		// first time, show instructions
		console.log("First Time");
		help.style.display = "block";

		// send query to update first time value
		// SEND DATA TO SERVER VIA jQuery.ajax({})
	    jQuery.ajax({
	        url: "/updateFirstTime",
	        data: {"first-time":message},
	        type: "POST",
	        success:function(returned_data){
	                returned_data = JSON.parse(returned_data);
	                console.log(returned_data)
	                if (returned_data["success"] === 1) {
	                	console.log("success");
	                }
	            }
	    });
	} else {
		// ignore instructions on second time logged in
		help.style.display = "none";
		return
	}
}

function sendToLeaderboard(numGuesses) {
	// // SEND DATA TO SERVER VIA jQuery.ajax({})
	console.log("sending to leaderboard")
    jQuery.ajax({
        url: "/processLeaderboard",
        data: {"numGuesses":numGuesses},
        type: "POST",
        success:function(returned_data){
                returned_data = JSON.parse(returned_data);
                console.log(returned_data)
                if (returned_data["success"] === 1) {
                	console.log("success");
                	window.location.href = "/wordle";

                }
            }
    });
}

const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com',
		'X-RapidAPI-Key': '4a5f4cd4cemshb1fd311e2e821dbp1f3f2ejsnc146120eb75f'
	}
};

async function getWordOfDay() {
	try {
		const response = await fetch("/processWordle")
		const word = await response.json();
		return word;
	} catch (error) {
		console.error(error);
	}
}


async function caller() {
	console.log("caller")
	const wordOfDay = await getWordOfDay();
	checkFirstTime(document.getElementById("first").innerHTML);

	let word = wordOfDay["word"];
	let wordLength = word.length;

	let guessedWords = [[]];
	let availableSpace = 1;


	let guessedWordCount = 0;

	const keys = document.querySelectorAll(".keyboard-row button");

  	createBoard();
  	document.addEventListener("keydown", updateGuessedWords);

	function getCurrentWordArr() {
	  const numberOfGuessedWords = guessedWords.length;
	  return guessedWords[numberOfGuessedWords - 1];
    }

	function updateGuessedWords(letter) {
		console.log(letter);
		let inputLetter;
	  	if (typeof(letter) === "string") {
	  		// got from pressing on screen keyboard
	  		inputLetter = letter;

	  	} else if (typeof(letter) === "object" ) {
	  		// got from physical keyboard
	  		// handle event listener
	  		// if (letter["key"] === "Meta") {
	  		// 	return;
	  		// }
	  		if (letter["key"] === "Backspace") {
	  			removeLetter();
	  			return;
	  		}
	  		if (letter["key"] === "Enter") {
	        	submitWord();
	  		}
	  		let code = letter["keyCode"];
	  		console.log(code);
	  		if (code > 64) {
	  			console.log(true);
	  			if (code < 91) {
	  				console.log(true);
					// only handle alphabet characters
	  				inputLetter = letter["key"];
	  			} else {
	  				return;
	  			}
	  		} else {
	  			return;
	  		}
	  	}

	    const currentWordArr = getCurrentWordArr();

	    if (currentWordArr && currentWordArr.length < wordLength) {
	      currentWordArr.push(inputLetter);

	      const availableSpaceEl = document.getElementById(String(availableSpace));

	      availableSpace = availableSpace + 1;
	      availableSpaceEl.textContent = inputLetter;
	    }
	}

	function getTileColor(letter, index) {
	    const corrLetter = word.includes(letter);

	    if (!corrLetter) {
	    	// letter not in word
	    	// return gray hex color
	      	return "#737373";
	    }

	    const letterPos = word.charAt(index);
	    const corrPosition = letter === letterPos;

	    if (corrPosition) {
	    	// letter in correct position
	    	// return green hex color
	      	return "#6bbd64";
	    }

	    // word in wrong position
	   	// return yellow hex color
	    return "#bdb368";
	}

	function createBoard() {
	    const gameBoard = document.getElementById("board");
		gameBoard.style.setProperty('grid-template-columns', 'repeat(' + wordLength + ', 1fr)');
	    for (let index = 0; index < (wordLength * wordLength); index++) {
	      let square = document.createElement("div");
	      square.classList.add("square");
	      square.setAttribute("id", index + 1);
	      gameBoard.appendChild(square);
	    }
	}

	function updateBoard() {
		const firstLetterId = guessedWordCount * wordLength + 1;
	        currentWordArr.forEach((letter, index) => {
	        	const tileColor = getTileColor(letter, index);
	            const letterId = firstLetterId + index;
	            const letterEl = document.getElementById(letterId);
	            letterEl.style = `background-color:${tileColor};border-color:${tileColor}`;
	        });

	        guessedWordCount += 1;

	        if (currentWord === word) {
	        	// user got word correct
	          	window.alert(`Congrats the word was ${word}!`);

	          	// send to leaderboard
	          	sendToLeaderboard(guessedWords.length);

	        }

	        if (guessedWords.length === wordLength) {
	          window.alert(`No more guesses! Today's word is ${word}.`);
	          sendToLeaderboard(-1);

	        }

	        guessedWords.push([]);
	}

	function submitWord() {
	    const currentWordArr = getCurrentWordArr();
	    if (currentWordArr.length !== wordLength) {
	      window.alert(`Word must be ${wordLength} letters`);
	    }

	    const currentWord = currentWordArr.join("");

	    Promise.all([
	    	fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${currentWord}`),
	    	fetch(`https://wordsapiv1.p.rapidapi.com/words/${currentWord}`, options)
	    	]).then(([res1, res2]) => {
	    		console.log("multiple fetch")
	    		if (res1.status === 200) {
	    			const firstLetterId = guessedWordCount * wordLength + 1;
			        currentWordArr.forEach((letter, index) => {
			        	const tileColor = getTileColor(letter, index);
			            const letterId = firstLetterId + index;
			            const letterEl = document.getElementById(letterId);
			            letterEl.style = `background-color:${tileColor};border-color:${tileColor}`;
			        });

			        guessedWordCount += 1;

			        if (currentWord === word) {
			        	// user got word correct
			          	window.alert(`Congrats the word was ${word}!`);
			          	// send to leaderboard
			          	sendToLeaderboard(guessedWords.length);
			        }

			        if (guessedWords.length === wordLength) {
			          window.alert(`No more guesses! Today's word is ${word}.`);
			          sendToLeaderboard(-1);
			        }

			        guessedWords.push([]);

	    		} else if (res2.status === 200) {
	    			const firstLetterId = guessedWordCount * wordLength + 1;
			        currentWordArr.forEach((letter, index) => {
			        	const tileColor = getTileColor(letter, index);
			            const letterId = firstLetterId + index;
			            const letterEl = document.getElementById(letterId);
			            letterEl.style = `background-color:${tileColor};border-color:${tileColor}`;
			        });

			        guessedWordCount += 1;

			        if (currentWord === word) {
			        	// user got word correct
			          	window.alert(`Congrats the word was ${word}!`);
			          	// send to leaderboard
			          	sendToLeaderboard(guessedWords.length);
			        }

			        if (guessedWords.length === wordLength) {
			          window.alert(`No more guesses! Today's word is ${word}.`);
			          sendToLeaderboard(-1);

			        }

			        guessedWords.push([]);

	    		} else {
	    			window.alert("Word is not recognised!");
	    		}
	    		console.log(res1.status);
	    		console.log(res2.status);
	    	});

	    // fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${currentWord}`)

	    //   .then((res) => {
	    //     if (!res.ok) {
	    //       throw Error();
	    //     }

	    //     const firstLetterId = guessedWordCount * wordLength + 1;
	    //     currentWordArr.forEach((letter, index) => {
	    //     	const tileColor = getTileColor(letter, index);
	    //         const letterId = firstLetterId + index;
	    //         const letterEl = document.getElementById(letterId);
	    //         letterEl.style = `background-color:${tileColor};border-color:${tileColor}`;
	    //     });

	    //     guessedWordCount += 1;

	    //     if (currentWord === word) {
	    //     	// user got word correct
	    //       	window.alert(`Congrats the word was ${word}!`);

	    //       	// send to leaderboard
	    //       	sendToLeaderboard(guessedWords.length);

	    //     }

	    //     if (guessedWords.length === wordLength) {
	    //       window.alert(`No more guesses! Today's word is ${word}.`);
	    //       sendToLeaderboard(-1);

	    //     }

	    //     guessedWords.push([]);
	    //   })
	    //   .catch(() => {
	      	
	    //     window.alert("Word is not recognised!");
	    //   });
	  }

	  function removeLetter() {
	    const currentWordArr = getCurrentWordArr();

	    if (currentWordArr.length === 0) {
	  		console.log("its empty");
	  		return;
	  	}

	    const removedLetter = currentWordArr.pop();
	    console.log(currentWordArr);


	    guessedWords[guessedWords.length - 1] = currentWordArr;

	    const lastLetterEl = document.getElementById(String(availableSpace - 1));

	    lastLetterEl.textContent = "";
	    availableSpace = availableSpace - 1;
	  }

	for (let i = 0; i < keys.length; i++) {
	    keys[i].onclick = ({ target }) => {
	      const letter = target.getAttribute("data-key");

	      if (letter === "enter") {
	        submitWord();
	        return;
	      }

	      if (letter === "del") {
	        removeLetter();
	        return;
	      }

	      updateGuessedWords(letter);
	    };
	}
}

caller()






