// Global variables
const AFF_ADAPTIVE = 3 
const CLS_ADAPTIVE = 4 

const EMOTXT = ["HAPPINESS", "SADNESS" , "SURPRISE" , "FEAR" , "ANGER" , "DISGUST"] 
const HAPPINESS = 0 
const SADNESS = 1 
const SURPRISE = 2 
const FEAR = 3 
const ANGER = 4 
const DISGUST = 5 

const MAX_DELTA = 15

const UPLOAD_INTERVAL = 300
const DIFF_INTERVAL = 500

var sendImageTimer = undefined
var ddaTimer = undefined

var emo_baseline = []
var au_baseline = [] 
var au_current = undefined

var all_emotions = []
var all_difficulty = []
var cur_difficulty = 0
var delta = [45, 55]

$(document).keypress(function(e){
	if(e.keyCode == 32){
		delta = [math.max([cur_difficulty - MAX_DELTA, 0]), math.min([cur_difficulty + MAX_DELTA, 100])]
	}
});

function toggleVideo(enabled){
	video = document.querySelector("#videoElement")

	if (navigator.mediaDevices.getUserMedia && enabled) {       
			navigator.mediaDevices.getUserMedia({video: true})
			.then(function(stream) {
				$("#webcamToggle").get(0).checked = true
			  video.srcObject = stream
				sendImageTimer = setInterval(sendImage, UPLOAD_INTERVAL)
				ddaTimer = setInterval(dynamicDifficulty, DIFF_INTERVAL)
			  console.log("Webcam enabled")
			})
			.catch(function(err0r) {
				$("#webcamToggle").get(0).checked = false
			  console.log("Something went wrong!")
			  console.log(err0r)
			  alert("Error occured when initializing webcam!")
			})
	} else {
	  $("#webcamToggle").get(0).checked = false
		video.srcObject.getTracks().forEach(track => track.stop())
		$("#capturedImage").attr('src', 'images/defaultuser.png') 
		clearInterval(sendImageTimer)
		clearInterval(ddaTimer)
	}
}

function sendImage(override){
	if ($("#webcamToggle").get(0).checked || override) {
		var image = $("#capturedimage")
		var video = $("#videoElement").get(0)
		
		var canvas = document.createElement("canvas")
		canvas.height = video.videoHeight * 0.30
		canvas.width = video.videoWidth * 0.30
		canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
		
		var img = document.createElement("img")
		img.src = canvas.toDataURL()
		
		$.ajax({
		   type: "POST",
		   url: "post.php",
		   data: { img: img.src, id: encodeURI(subjectName)}
		}).done(handleMsg)
	}
}

function handleMsg(msg){
	if ($("#webcamToggle").get(0).checked) {
		var myObj = JSON.parse(msg)
		if (myObj.img) {
			$("#capturedImage").attr('src', myObj.img) 
			au_current = myObj.fau
			if (gameVariant === 1){
				au_baseline.push(au_current)
			} else if(gameVariant === 3){
			}
		}
	}
}

function dynamicDifficulty(){
	if (gameVariant === AFF_ADAPTIVE) {
		auInc = facialAdjust()
		hrInc = physioAdjust()
		baseInc = baseAdjust()

		cur_difficulty = clip(cur_difficulty + auInc + hrInc + baseInc)
		console.log([cur_difficulty, auInc, baseInc])
	  all_difficulty.push(cur_difficulty)

    gameInstance.SendMessage('Difficulty', 'SetDifficulty', cur_difficulty)
	} else if (gameVariant === CLS_ADAPTIVE) {
			diff_increase = math.randomInt(6) - 3
			if (cur_difficulty + diff_increase <= delta[1] && cur_difficulty + diff_increase >= delta[0]){
				cur_difficulty = cur_difficulty + diff_increase
			}
	  all_difficulty.push(cur_difficulty)
    gameInstance.SendMessage('Difficulty', 'SetDifficulty', cur_difficulty)
	}
}

function baseAdjust() {
	if (cur_difficulty >= 85) return -4
	if (cur_difficulty >= 60) return -2
	if (cur_difficulty <= 15) return 4
	if (cur_difficulty <= 40) return 2
	return 1
}

function facialAdjust() {
	var au = math.subtract(math.matrix(au_current), au_baseline)
	var emotions = auMapping(au)
	var	emotion = argMax(emotions)
	console.log(EMOTXT[emotion])

	switch(emotion) {
	case HAPPINESS :
			return math.floor((100-cur_difficulty) / 10 )
	case SADNESS :
			return math.floor((100-cur_difficulty) / 10 * 0.5)
	case SURPRISE :
			return math.floor((100-cur_difficulty) / 10 * 0.75)
	case FEAR :
			return math.floor(cur_difficulty / -10 * 0.5)
	case ANGER :
			return math.floor(cur_difficulty / -10 * 0.75)
	case DISGUST :
			return math.floor(cur_difficulty / -10 * 0.8)
	default:
			return 0
	}
}

function physioAdjust() {
	return 0 
}

function auMapping(arr) {
	// AU01_r => 0, AU02_r => 1, AU04_r => 2, AU05_r => 3, AU06_r => 4, AU07_r => 5, AU09_r => 6, AU10_r => 7
	// AU12_r => 8, AU14_r => 9, AU15_r => 10, AU17_r => 11, AU20_r => 12, AU23_r => 13, AU25_r => 14, AU26_r => 15
	// AU45_r => 16
	// Happiness 6 + 12
	// Sadness	1 + 4 + 15
	// Surprise	1 + 2 + 5 + 26
	// Fear	1 + 2 + 4 + 5 + 7 + 20 + 26
	// Anger	4 + 5 + 7 + 23
	// Disgust	9 + 15 + 16

	happiness = ( arr._data[4] + arr._data[8] ) / 2 
	sadness = ( arr._data[0] + arr._data[2] + arr._data[10]) / 3 
	surprise = (  arr._data[0] + arr._data[1] + arr._data[3] + arr._data[15] ) / 4
	fear = ( arr._data[0] + arr._data[1] + arr._data[2] + arr._data[3] + arr._data[5] + arr._data[12] + arr._data[15]) / 7 
	anger = (  arr._data[2] + arr._data[3] + arr._data[5] + arr._data[13] ) / 4
	disgust = (  arr._data[6] + arr._data[10] ) / 2

	emotions = [happiness, sadness, surprise, fear, anger, disgust]
	// console.log(emotions)
	all_emotions.push(emotions)

	return emotions
}

function argMax(array) {
  return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1]
}

function clip(x) {
	return math.max( math.min(x, delta[1]), delta[0])
}
