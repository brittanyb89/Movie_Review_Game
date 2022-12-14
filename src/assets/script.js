// HTML stuff
const startBtn = document.querySelector("#begin");
const startPage = document.querySelector("#start");
const quiz = document.querySelector("#quiz");
const scorePage = document.querySelector("#score");
const select = document.querySelector("select");
const review1 = document.querySelector("#option-1");
const review2 = document.querySelector("#option-2");
const divBtns = document.querySelector("#questions");
const scoreDisplay = document.querySelector("#score-display");
const genreDisplay = document.querySelector("#genre-display");
const leaderBoard = document.querySelector("#leader-board");
const inGameScore = document.querySelector("#in-game-score");
const playAgain = document.querySelector("#play-again");

// points and question number
let pointTracker = 0;
let questionTracker = 0;

// movie API
const otherGenres = [
  "Romance",
  "Comedy",
  "Drama",
  "Horror",
  "Fantasy",
  "Thriller",
];
const randomGenre = otherGenres.sort((a, b) => 0.5 - Math.random());
//
let movieTitle = {};
let correctAnswer = {};
let wrongAnswer = {};
//
let genreList = [];
let movieList = [];
let reviewList = [];
let nameId = [];

const GENRES = [
  "Action",
  "Western",
  "Crime",
  "Science Fiction",
  "Mystery",
  "Family",
];

let selectedGenre = {};
const apiKey = "AIzaSyCmtN6JemTcM9BG7u-ZoTgEdKS1-m8ngOk";

//  Start game; added and removed "hidden" from certain sections of page

function startGame() {
  startBtn.classList.add("hidden");
  startPage.classList.add("hidden");
  quiz.classList.remove("hidden");
  if (selectedGenre === "Action") {
    genreDisplay.textContent = `an ${selectedGenre}`;
  } else {
    genreDisplay.textContent = `a ${selectedGenre}`;
  }
}

startBtn.addEventListener("click", function () {
  startGame();
  grabSelectedMovieId(genreList);
  console.log(genreList);
});

function renderGenres(genres) {
  genres.forEach((genre) => {
    const option = document.createElement("option");
    option.innerText = genre;
    select.appendChild(option);
  });
}

renderGenres(GENRES);

select.addEventListener("change", function (event) {
  selectedGenre = event.target.value;
  startBtn.classList.remove("hidden");
});

// movie API call
getMovieIdList();

async function getMovieIdList() {
  const request = await fetch(
    "https://api.themoviedb.org/3/genre/movie/list?api_key=d6a051201733ccdafa7109a2dba8cbc6&language=en-US"
  );
  genreList = await request.json();
}

function grabSelectedMovieId(data) {
  const genreId = data.genres.find((element) => element.name === selectedGenre);
  nameId = genreId;
  getMovieList(genreId);
}

function grabRandomMovieId(data) {
  const genreId = data.genres.find(
    (element) => element.name === randomGenre[0]
  );
  nameId = genreId;
  getMovieList(genreId);
}

async function getMovieList(data) {
  const request = await fetch(
    `https://api.themoviedb.org/3/discover/movie?api_key=d6a051201733ccdafa7109a2dba8cbc6&with_genres=${data.id}`
  );
  movieList = await request.json();
  getRandomMovie(movieList);
}

async function getRandomMovie(data) {
  const randomMovie = Math.floor(Math.random() * data.results.length);
  if (nameId.name === selectedGenre) {
    movieTitle = data.results[randomMovie].title;
  }
  const request = await fetch(
    `https://api.themoviedb.org/3/movie/${data.results[randomMovie].id}/reviews?api_key=d6a051201733ccdafa7109a2dba8cbc6&language=en-US&page=1`
  );
  const reviewList = await request.json();
  if (reviewList.results[0]?.content) {
    saveReviews(reviewList);
  } else {
    return getRandomMovie(data);
  }
}

function saveReviews(reviews) {
  if (nameId.name === selectedGenre) {
    const randomReview = Math.floor(Math.random() * reviews.results.length);
    correctAnswer = reviews.results[randomReview].content;
    grabRandomMovieId(genreList);
  } else {
    const randomReview = Math.floor(Math.random() * reviews.results.length);
    wrongAnswer = reviews.results[randomReview].content;
    displayOptions();
  }
}

function displayOptions() {
  getClip();
  let options = [correctAnswer, wrongAnswer];
  const randomOrder = options.sort((a, b) => 0.5 - Math.random());
  review1.textContent = randomOrder[0];
  review2.textContent = randomOrder[1];
}

// pick answer
divBtns.addEventListener("click", function (event) {
  if (!event.target.matches(".reviews")) {
    return;
  }
  if (event.target.textContent === correctAnswer) {
    pointTracker = pointTracker + 50;
    inGameScore.textContent = pointTracker;
    grabSelectedMovieId(genreList);
    playCorrectAudio();
  } else {
    playWrongAudio();
    grabSelectedMovieId(genreList);
  }

  if (questionTracker === 9) {
    quiz.classList.add("hidden");
    scorePage.classList.remove("hidden");
    scoreDisplay.textContent = pointTracker;
    saveScore(pointTracker);
  }
  questionTracker++;
});

function playCorrectAudio() {
  while (quiz.correct) {
    quiz.removeChild(quiz.correct);
  }
  const correct = document.createElement("audio");
  correct.setAttribute("src", "./src/assets/correct.mp3");
  correct.setAttribute("autoplay", "true");
  quiz.append(correct);
}

function playWrongAudio() {
  while (quiz.wrong) {
    quiz.removeChild(quiz.wrong);
  }
  const wrong = document.createElement("audio");
  wrong.setAttribute("src", "./src/assets/wrong.mp3");
  wrong.setAttribute("autoplay", "true");
  quiz.append(wrong);
}

// save points local storage
function saveScore(gameScore) {
  if (localStorage.getItem("topScores") === null) {
    localStorage.setItem("topScores", JSON.stringify([gameScore]));
    displayScore();
  } else {
    let SCORES = JSON.parse(localStorage.getItem("topScores"));
    SCORES.push(gameScore);
    sortScores(SCORES);
  }
}

function sortScores(scoreList) {
  scoreList = [...new Set(scoreList)];
  scoreList.sort((a, b) => b - a);
  if (scoreList.length === 4) {
    scoreList.pop();
  }
  localStorage.setItem("topScores", JSON.stringify(scoreList));
  displayScore();
}

function displayScore() {
  let SCORES = JSON.parse(localStorage.getItem("topScores"));
  for (let i = 0; SCORES.length > i; i++) {
    const li = document.createElement("li");
    li.textContent = SCORES[i];
    leaderBoard.append(li);
  }
}

// play again button
playAgain.addEventListener("click", function () {
  location.reload();
});

async function getClip() {
  const request = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${movieTitle}&type=video&key=${apiKey}`
  );
  const movieSearch = await request.json();
  console.log(movieSearch.items[0].id.videoId);
  displayClip(movieSearch);
}

function displayClip(data) {
  const youTube = document.getElementById("ytPlayer");
  while (youTube.firstChild) {
    youTube.removeChild(youTube.firstChild);
  }
  const clipEmbed = `https://www.youtube.com/embed/${data.items[0].id.videoId}`;
  const video = document.createElement("iframe");
  video.setAttribute("id", "player");
  video.setAttribute("title", "ytPlayer");
  video.setAttribute("type", "text/html");
  video.setAttribute("width", "640");
  video.setAttribute("height", "390");
  video.setAttribute("frameborder", "0");
  video.setAttribute("src", clipEmbed);
  youTube.append(video);
}
