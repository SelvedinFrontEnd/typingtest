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

let hiddenInput = document.getElementById("hidden-input")

let best = localStorage.getItem("bestWPM");
if (best) {
    document.getElementById("best-wpm").innerText = best;
}

function renderText(passageText) {
    let lettersArray = passageText.split("")
    const spanArray = lettersArray.map(letter => {
        return `<span>${letter}</span>`
    })
    const finalHtmlString = spanArray.join("")
    text.innerHTML = finalHtmlString
}

mode.addEventListener("change", () => {
    if(data){
        let selectedValue = mode.value
        const randomNumber = getRandomNumber(data[selectedValue].length)
        textTest = data[selectedValue][randomNumber].text
        renderText(textTest)
    }
})

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



timeMode.addEventListener("change", () => {
    if(timeMode.value === "passage") {
        timer = 0
        document.getElementById("timer").innerHTML = timer
    } else {
        timer = 60
        document.getElementById("timer").innerHTML = timer 
    }

})








function updateTimer() {
    if(!isTestActive) return;

    if(timeMode.value === "timed") {
        timer--;
        document.getElementById("timer").innerHTML = timer;
        correct = currentIndex - incorrectLetters
        if(currentIndex > 0) {
            let accuracy = correct / currentIndex * 100
            let accurate = Math.round(accuracy)
            document.getElementById("accuracy").innerText = `${accurate}%`
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
           let accuracy = correct / currentIndex * 100
            let accurate = Math.round(accuracy)
            document.getElementById("accuracy").innerText = `${accurate}%` 
        }
        calculateWpm()
        if(timer >= 60) {
            clearInterval(intervalId);
        } 
    }
    
}

let intervalId;
let isTestActive = false;

startTest.addEventListener("click", () => {
    hiddenInput.focus()
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

let currentIndex = 0;

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

let incorrectLetters = 0;

function calculateWpm() {
    if(timeMode.value === "timed") {
        let currentTimeTimed = 60 - timer
        let minutesTimed = currentTimeTimed / 60
        let wpmTimed = correct / 5 / minutesTimed
        document.getElementById("wpm").innerText = Math.round(wpmTimed) 
    } else if(timeMode.value === "passage") {
        console.log(timeMode.value)
        let currentTimePassage = timer / 60
        let wpmPassage = correct / 5 / currentTimePassage
        console.log(wpmPassage, currentIndex, timer, correct, "test")
        document.getElementById("wpm").innerText = Math.round(wpmPassage)
    }
    
}

hiddenInput.addEventListener("input", (e) => {ž
    if(!isTestActive) return;

    const typedChar = hiddenInput.value;
    hiddenInput.value = "";
    document.getElementById("debug").innerText =
  "Typed: " + JSON.stringify(hiddenInput.value);
    if(ignoredKeys.includes(e.key)) return;
    
    spans = text.querySelectorAll("span");
    if(currentIndex === spans.length) {
        isTestActive = false;
        testSection.style.display = "none"
        testCompleted.style.display = "block"
        correct = currentIndex - incorrectLetters
        let accuracy = correct / currentIndex * 100
        let accurate = Math.round(accuracy)
        let wpmTimed;
        let wpmPassage;
        document.getElementById("accuracy-final").innerText = `${accurate}%`
        if(timeMode.value === "timed") {
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
        console.log(finalWPM, safePassage, Math.round(safeTimed))
        let best = Number(localStorage.getItem("bestWPM")) || 0;
        if(finalWPM > best) {
            localStorage.setItem("bestWPM", finalWPM);
            document.getElementById("best-wpm").innerText = finalWPM;
        }
        document.getElementById("all-char").textContent = spans.length
        document.getElementById("incorrect-char").textContent = incorrectLetters
        return;
    }

    let expected = text.querySelectorAll("span")[currentIndex].innerText

    spans.forEach(span => span.classList.remove("current"))

    if (typedChar === expected) {  
        spans[currentIndex].classList.add("correct")
    } else {
        spans[currentIndex].classList.add("incorrect")
        incorrectLetters++;
    }
    
    currentIndex++;

    if(currentIndex < spans.length) {
        spans[currentIndex].classList.add("current")
    } 
}) 


document.addEventListener("keydown", (e) => {
    if(!isTestActive) return;

    
    if(ignoredKeys.includes(e.key)) return;
    
    spans = text.querySelectorAll("span");
    if(currentIndex === spans.length) {
        isTestActive = false;
        testSection.style.display = "none"
        testCompleted.style.display = "block"
        correct = currentIndex - incorrectLetters
        let accuracy = correct / currentIndex * 100
        let accurate = Math.round(accuracy)
        let wpmTimed;
        let wpmPassage;
        document.getElementById("accuracy-final").innerText = `${accurate}%`
        if(timeMode.value === "timed") {
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
        console.log(finalWPM, safePassage, Math.round(safeTimed))
        let best = Number(localStorage.getItem("bestWPM")) || 0;
        if(finalWPM > best) {
            localStorage.setItem("bestWPM", finalWPM);
            document.getElementById("best-wpm").innerText = finalWPM;
        }
        document.getElementById("all-char").textContent = spans.length
        document.getElementById("incorrect-char").textContent = incorrectLetters
        return;
    }

    let expected = text.querySelectorAll("span")[currentIndex].innerText

    spans.forEach(span => span.classList.remove("current"))

    if (e.key === expected) {  
        spans[currentIndex].classList.add("correct")
    } else {
        spans[currentIndex].classList.add("incorrect")
        incorrectLetters++;
    }
    
    currentIndex++;

    if(currentIndex < spans.length) {
        spans[currentIndex].classList.add("current")
    } 
})    


window.addEventListener("keydown", (e) =>  {
    if(e.key === " " || e.keyCode == 32) {
        if(e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
            e.preventDefault();
        }
    }
})
