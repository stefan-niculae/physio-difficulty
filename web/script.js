let sessionId = undefined  // will be assigned
let subjectName = undefined
let gameVariant = 0  // starts from 1
let gameReplay = undefined  // starts from 1

const DATABASE = firebase.database()

const GAME_REPLAYS = [1, 1, 20, 20] // how many times each variant will be played
const INITIAL_DIFFICULTY = [30, 80, 55, 65]
const EARLY_EXIT_REPLAY_ALLOWED = 4

gameInstance = UnityLoader.instantiate('game', 'Stack/web-build/Build/web-build.json')
gameInstance.sendMessage = function() {
    print('sending', arguments)
    gameInstance.sendMessage(arguments)
}


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
    }
    else {
        saveRatings()
        forceHide('#ratings-form')
    }
    gameInstance.SendMessage('Moving platform', 'RestartGame')

    if (gameVariant !== GAME_REPLAYS.length) { // show next game
        gameReplay = 1
        $('#game').show()
        gameInstance.SendMessage('Main Camera', 'SetKeyboardCapture', 1)
    }
    else // done, show outro
        $('#outro-form').show()

    gameVariant++
	 switch(gameVariant) {
	 	case 1 : 
			game_type = 'Easy'
			break;
	 	case 2 : 
			game_type = 'Hard'
			break;
	 	case CLS_ADAPTIVE : 
			game_type = 'Classical'
			break;
	 	case AFF_ADAPTIVE : 
			game_type = 'Affective'
			break;
		default :
			game_type = "Undefined"
			break;
	 }


    // update steps at the top
    const steps = $('.step')
    steps.removeClass('active')
    steps.eq(gameVariant).removeClass('disabled').addClass('active')
}

let saveIntroInfo = () => {
    subjectName = document.getElementById('name-input').value
    sessionId = `${subjectName}, ${new Date}`

    DATABASE.ref(`${sessionId}/subjectInfo`).set({
        name: subjectName,
        skill:       $('#skill-rating')      .rating('get rating'),
        competitive: $('#competitive-rating').rating('get rating'),
    })
}

let showRatings = () => {
    forceHide('#game')
    $('#early-exit-instruction').css({opacity: 0})  // reset previous instruction

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

    const consented = $('#consent-checkbox')[0].checked

    let toStore = {bestVariant, consented}

    const comments = document.getElementById('comments').value
    if (comments)
        toStore = {...toStore, comments}

    DATABASE.ref(`${sessionId}/subjectInfo`).update(toStore)
}

// external
function gameLoaded() {
    if (gameVariant === 0) {// still on the intro form, game not ready to accept input
        gameInstance.SendMessage('Main Camera', 'SetKeyboardCapture', 0)
        return
    }

    // TODO replace with non-dummy difficulty setting
    gameInstance.SendMessage('Difficulty', 'SetDifficulty', INITIAL_DIFFICULTY[gameVariant - 1])
    cur_difficulty = INITIAL_DIFFICULTY[gameVariant - 1]
    start_difficulty = INITIAL_DIFFICULTY[gameVariant - 1]
	 delta = [start_difficulty - 10, start_difficulty+10, start_difficulty]
	 game_running = true
	 prev_width = 1

    if (gameVariant >= 3 && gameReplay === EARLY_EXIT_REPLAY_ALLOWED)  // last two play allow early exit
        $('#early-exit-instruction').animate({opacity: 1}, 400)
}

function gameOver(time, x, width, difficulty, earlyExit) {
    earlyExit = (earlyExit === "True")  // convert str to bool

    DATABASE.ref(`${sessionId}/variant-${gameVariant}/replay-${gameReplay}`).update({
        time,
        x,
        width,
        difficulty,
		  all_emotions,
		  all_physio,
		  all_difficulty,
        earlyExit,
		  game_type,
		  physio_active,
    })
	 all_emotions = []
	 all_physio = []
	 all_difficulty = []
	 game_running = false

    // reached number of replays or bored
    if (gameReplay === GAME_REPLAYS[gameVariant - 1] || earlyExit) {
        gameInstance.SendMessage('Main Camera', 'SetKeyboardCapture', 0)
        showRatings()

		  // toggleVideo(false)
		  if (gameVariant === 1) { // Calculate baseline
		  		console.log("Calculate baseline")
		  	 	au_baseline = math.mean(math.matrix(au_baseline), 0)
				emo_baseline = auMapping(au_baseline)
				if (physio_active) {
					physio_baseline = math.mean(math.matrix(physio_baseline), 0)
				} else {
					physio_baseline = math.matrix([0,0,0,0])
				}
		  }
    }
    gameReplay++
}
