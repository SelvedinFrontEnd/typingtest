const mode = document.getElementById("mode")
let text = document.getElementById("text")
const timeMode = document.getElementById("time-mode")
let overlay = document.querySelector(".overlay")
let center = document.getElementById("center")
let restartButton = document.getElementById("restart-button")
let timer = parseInt(document.getElementById("timer").innerHTML)
const startTest = document.getElementById("start-test")
let runOutOfTime = document.getElementById("out-of-time")
let data;
let textTest;
let correct;
let testSection = document.getElementById("test-section")
let testCompleted = document.getElementById("results")
let goAgain = document.getElementById("go-again")
let hiddenInput = document.getElementById("hidden-input")
let best = localStorage.getItem("bestWPM");
let desktopDifficultyBtns = document.getElementById("difficulty-btns")
let desktopTimeModeBtns = document.getElementById("time-btns")
let gameTimeMode = "timed"
let title = document.querySelector(".header-title h1")
let description = document.querySelector(".header-title p")
let againBtnText = document.querySelector(".again-btn-text")

if (best) {
    document.getElementById("best-wpm").innerText = best;
}

function removeActiveDifficultyBtns() {
    let difficultyButtons = document.querySelectorAll("#difficulty-btns button");
    difficultyButtons.forEach(button => {
        button.classList.remove("active")
    })
}

const difficultyBtns = document.querySelectorAll("#difficulty-btns button");
difficultyBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        removeActiveDifficultyBtns()
        btn.classList.add('active');
    })
})


function removeActiveTimeBtns() {
    let timeButtons = document.querySelectorAll("#time-btns button");
    timeButtons.forEach(button =>{
        button.classList.remove("active")
    })
}

const timeBtns = document.querySelectorAll("#time-btns button");
timeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        removeActiveTimeBtns()
        updateTimerUi(btn.value)
        gameTimeMode = btn.value
        timeMode.value = btn.value
        btn.classList.add('active');
    })
})

function renderText(passageText) {
    let lettersArray = passageText.split("")
    const spanArray = lettersArray.map(letter => {
        return `<span>${letter}</span>`
    })
    const finalHtmlString = spanArray.join("")
    text.innerHTML = finalHtmlString
}

function updateActiveButton(selectedValue) {
    difficultyBtns.forEach(btn => {
        btn.classList.remove("active");
        if (btn.value === selectedValue) {
            btn.classList.add("active");
        }
    });
}

function updateActiveTimeButton(selectedValue){
    timeBtns.forEach(btn => {
        btn.classList.remove("active");
        if (btn.value === selectedValue) {
            btn.classList.add("active");
        }
    });
}

difficultyBtns.forEach(btn => {
    btn.addEventListener("click", () => {    
        mode.value = btn.value
        modeFetchData(btn.value)
    })
})

mode.addEventListener("change", () => {
    modeFetchData(mode.value);
    updateActiveButton(mode.value);
})

timeMode.addEventListener("change", () => {
    updateTimerUi(timeMode.value)
    updateActiveTimeButton(timeMode.value)
    gameTimeMode = timeMode.value;
    
})

function modeFetchData(modeValue) {
    if(data){
        let selectedValue = modeValue
        const randomNumber = getRandomNumber(data[selectedValue].length)
        textTest = data[selectedValue][randomNumber].text
        renderText(textTest)
    }
}

function getRandomNumber(max) {
    return Math.floor(Math.random() * max) 
}

async function getData() {
    try { 
        const response = await fetch("./data.json")
        data = await response.json()
        let value = mode.value
        const randomNumber = getRandomNumber(data[value].length)
        textTest = data[value][randomNumber].text
        renderText(textTest)
    } catch (err) {
        console.log(err)
    }
}

getData()

function updateTimerUi(modeValue) {
    if(modeValue === "passage") {
        timer = 0
        document.getElementById("timer").innerHTML = timer
    } else {
        timer = 60
        document.getElementById("timer").innerHTML = timer 
    }
}



let accuracy;

function updateTimer() {
    if(!isTestActive) return;

    if(gameTimeMode === "timed") {
        timer--;
        document.getElementById("timer").innerHTML = timer;
        correct = currentIndex - incorrectLetters
        if(currentIndex > 0) {
            accuracy = Math.round(correct / currentIndex * 100)
            document.getElementById("accuracy").innerText = `${accuracy}%`
        } 
        calculateWpm()
        if(timer <= 0) {
            testSection.style.display = "none"
            runOutOfTime.style.display = "block"
            isTestActive = false;
            clearInterval(intervalId)
        }
    } else {
        timer++;
        document.getElementById("timer").innerHTML = timer;
        correct = currentIndex - incorrectLetters
        if(currentIndex > 0) {
            accuracy = Math.round(correct / currentIndex * 100)
            document.getElementById("accuracy").innerText = `${accuracy}%` 
        }
        calculateWpm()
    }
}

let intervalId;
let isTestActive = false;

startTest.addEventListener("click", () => {
    difficultyBtns.forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = "default"
    })
    timeBtns.forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = "default"
    })
    intervalId = setInterval(updateTimer, 1000)
    overlay.style.display = "none"
    center.style.display = "none"
    restartButton.style.display = "flex"
    isTestActive = true;
    const spans = text.querySelectorAll("span")
    spans[0].classList.add("current") 
    currentIndex = 0
    mode.disabled = true;
    timeMode.disabled = true;
})

goAgain.addEventListener("click", () => {
    clearInterval(intervalId)
    difficultyBtns.forEach(btn => {
        btn.disabled = false;
        btn.style.cursor = "pointer"
    })
    timeBtns.forEach(btn => {
        btn.disabled = false;
        btn.style.cursor = "pointer"
    })
    testSection.style.display = "flex"
    overlay.style.display = "flex"
    center.style.display = "flex"
    restartButton.style.display = "none"
    testCompleted.style.display = "none"
    wpmPassage = 0;
    wpmTimed = 0;
    accuracy = 0;
    document.getElementById("accuracy").innerText = `${accuracy}%`
    currentIndex = 0;
    incorrectLetters = 0;
    correct = 0;
    mode.disabled = false;
    timeMode.disabled = false;
    if(timeMode.value === "timed") {
        timer = 60;
        document.getElementById("timer").innerHTML = timer
        document.getElementById("wpm").innerText = wpmTimed
    } else {
        timer = 0;
        document.getElementById("timer").innerHTML = timer
        document.getElementById("wpm").innerText = wpmPassage
    }

    getData()
    
})

restartButton.addEventListener("click", () => {
    wpmPassage = 0;
    wpmTimed = 0;
    accuracy = 0;
    document.getElementById("accuracy").innerText = `${accuracy}%`
    currentIndex = 0;
    incorrectLetters = 0;
    correct = 0;
    if(gameTimeMode === "timed") {
        timer = 60;
        document.getElementById("timer").innerHTML = timer
        document.getElementById("wpm").innerText = wpmTimed
    } else {
        timer = 0;
        document.getElementById("timer").innerHTML = timer
        document.getElementById("wpm").innerText = wpmPassage
    }
    getData()
    let spans = text.querySelectorAll("span");
    spans[currentIndex].classList.add("current")
})

let currentIndex = 0;
let incorrectLetters = 0;

const ignoredKeys = [
  "Shift",
  "CapsLock",
  "Tab",
  "Control",
  "Alt",
  "Meta",      
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Escape",
  "Backspace"
]



function calculateWpm() {
    if(gameTimeMode === "timed") {
        let currentTimeTimed = 60 - timer
        let minutesTimed = currentTimeTimed / 60
        wpmTimed = correct / 5 / minutesTimed
        document.getElementById("wpm").innerText = Math.round(wpmTimed) 
    } else if(gameTimeMode === "passage") {
        let currentTimePassage = timer / 60
        wpmPassage = correct / 5 / currentTimePassage
        document.getElementById("wpm").innerText = Math.round(wpmPassage)
    }
    
}

let wpmTimed;
let wpmPassage;

function test(character){
    if(!isTestActive) return;
    
    if(ignoredKeys.includes(character)) return;
    
    let spans = text.querySelectorAll("span");
    if(currentIndex >= spans.length - 1) {
        isTestActive = false;
        
        clearInterval(intervalId)
        testSection.style.display = "none"
        testCompleted.style.display = "block"
        spans[currentIndex].classList.remove("current")
        spans[currentIndex].classList.remove("correct")
        spans[currentIndex].classList.remove("incorrect")
        correct = currentIndex - incorrectLetters
        let accuracy = correct / currentIndex * 100
        let accurate = Math.round(accuracy)
        document.getElementById("accuracy-final").innerText = `${accurate}%`
        if(gameTimeMode === "timed") {
            let currentTimeTimed = 60 - timer
            let minutesTimed = currentTimeTimed / 60
            wpmTimed = correct / 5 / minutesTimed
            document.getElementById("wpm-final").innerText = Math.round(wpmTimed) 
        } else {
            let currentTimePassage = timer / 60
            wpmPassage = correct / 5 / currentTimePassage
            document.getElementById("wpm-final").innerText = Math.round(wpmPassage)
        }

        let safeTimed = wpmTimed || 0
        let safePassage = wpmPassage || 0
        let finalWPM = Math.max(Math.round(safePassage), Math.round(safeTimed))
        let best = Number(localStorage.getItem("bestWPM")) || 0;
        if(finalWPM > best) {
            localStorage.setItem("bestWPM", finalWPM);
            document.getElementById("best-wpm").innerText = finalWPM;
            title.innerText = "High Score Smashed!"
            description.innerText = "You're getting faster. That was incredible typing."
            againBtnText.innerText = "Beath This Score"
        }
        document.getElementById("all-char").textContent = spans.length
        document.getElementById("incorrect-char").textContent = incorrectLetters
         if(best === 0) {
            title.innerText = "Baseline Established!"
            description.innerText = "You've set the bar. Now the real challenge begins-time to beat it."
            againBtnText.innerText = `Beat This Score`
        } 
        return;
    }
    let expected = spans[currentIndex].innerText

    spans.forEach(span => span.classList.remove("current"))

    if (character === expected) {  
        spans[currentIndex].classList.add("correct")
    } else {
        spans[currentIndex].classList.add("incorrect")
        incorrectLetters++;
    }
    
    currentIndex++;

    if(currentIndex < spans.length) {
        spans[currentIndex].classList.add("current")
    } 
}

document.addEventListener("keydown", (e) => {
    test(e.key)
})


window.addEventListener("keydown", (e) =>  {
    if(e.key === " " || e.keyCode == 32) {
        if(e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
            e.preventDefault();
        }
    }
})




