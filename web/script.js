let sessionId = undefined
let subjectName = undefined
let gameVariant = 0
let gameReplay = undefined

const DATABASE = firebase.database()

const GAME_REPLAYS = [2, 2, 3, 3] // how many times each variant will be played
const INITIAL_DIFFICULTY = [30, 80, 55, 65]
// TODO press X to exit early out of the last one


$(() => {
    $('.rating').rating({
        onRate: enableSubmitAfterRating
    })

    $('#intro-form').form({
        fields: {
            name: 'empty' // validation
        }
    })

    $('#outro-form').form({
        fields: {
            variant: 'checked' // validation
        }
    })
    $('#outro-form .radio input').change(() => $('form button').addClass('primary'))
})

let areRatingsFilled = () => {
    const ratings = $.map(
        $('form:visible .rating'),
        r => $(r).rating('get rating')
    )
    return ratings.every(r => r !== 0)
}

let enableSubmitAfterRating = () => {
    if (areRatingsFilled())
        $('form button').addClass('primary')
}

let forceHide = (selector) => {
    // $::hide(), setting display:none gets overwritten by semantic style
    $(selector)[0].style.setProperty('display', 'none', 'important')
}

let advance = () => {
    if (!areRatingsFilled())
        return

    if (gameVariant === 0) {
        saveIntroInfo()
        forceHide('#intro-form')

        gameInstance = UnityLoader.instantiate('game', 'Stack/web-build/Build/web-build.json')
        $('#game').show(0)
    }
    else {
        saveRatings()
        forceHide('#ratings-form')
        gameInstance.SendMessage('Moving platform', 'RestartGame')
    }


    if (gameVariant !== GAME_REPLAYS.length) { // show next game
        gameReplay = 1
        $('#game').show()
    }
    else // done, show outro
        $('#outro-form').show()

    gameVariant++

    // update steps at the top
    const steps = $('.step')
    steps.removeClass('active')
    steps.eq(gameVariant).removeClass('disabled').addClass('active')
}

let saveIntroInfo = () => {
    subjectName = document.getElementById('name-input').value;
    sessionId = `${subjectName}, ${new Date}`

    DATABASE.ref(`${sessionId}/subjectInfo`).set({
        name: subjectName,
        skill:       $('#skill-rating')      .rating('get rating'),
        competitive: $('#competitive-rating').rating('get rating'),
    })
}

let showRatings = () => {
    forceHide('#game')

    $('#ratings-form .rating').each((_, r) => $(r).rating('clear rating'))
    $('form button').removeClass('primary')


    $('#ratings-form').show()
}

let saveRatings = () => {
    DATABASE.ref(`${sessionId}/variant-${gameVariant}/ratings`).update({
        difficulty: $('#difficulty-rating').rating('get rating'),
        valence:    $('#valence-rating')   .rating('get rating'),
        enjoyment:  $('#enjoyment-rating') .rating('get rating'),
    })
}

let submitFinal = () => {
    let bestVariant = 1
    for (let elem of $('#outro-form input[name="variant"]')) {
        if (elem.checked)
            break
        bestVariant++
    }
    if (bestVariant > GAME_REPLAYS.length) // didn't chose any
        return

    let toStore = {bestVariant}

    const comments = document.getElementById('comments').value
    if (comments)
        toStore = {...toStore, comments}

    DATABASE.ref(`${sessionId}/subjectInfo`).update(toStore)
}

// external
function gameLoaded() {
    // TODO replace with non-dummy difficulty setting
    gameInstance.SendMessage('Difficulty', 'SetDifficulty', INITIAL_DIFFICULTY[gameVariant - 1])
}

function gameOver(time, x, width, difficulty) {
    DATABASE.ref(`${sessionId}/variant-${gameVariant}/replay-${gameReplay}`).update({
        time,
        x,
        width,
        difficulty,
    })

    if (gameReplay === GAME_REPLAYS[gameVariant - 1]) {// reached number of replays
        showRatings()
    }
    gameReplay++
}