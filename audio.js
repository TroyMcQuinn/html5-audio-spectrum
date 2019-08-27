/**
* HTML5 Audio track gallery player
* 
* Folks, this was a tough one to get working just right.
* Feel free to snag this code and use it for your own site.
* If you do so, please give me credit, ok?
*
*/

var audioTrackData = new Array();
var spectrumAnimation = false;
var nowPlayingTrackId = false;

function audioTrackDataObject(){};

function startAudioSpectrum(track_id){
	
	stopAllOtherTracks(track_id);
	
	audioTrackData[track_id] = new audioTrackDataObject();
	
  audioTrackData[track_id].audio = document.getElementById('track_player_' + track_id);
	audioTrackData[track_id].audio.onended = function(){stopAudioSpectrum(track_id);};
	audioTrackData[track_id].audio.onpause = function(){stopAudioSpectrum(track_id);};
	audioTrackData[track_id].audio.onplay = function(){resumeAudioSpectrum(track_id);}; // Prevent pausing and replaying from re-running this function.
  try{
		
    audioTrackData[track_id].context = new AudioContext();
    audioTrackData[track_id].analyser = audioTrackData[track_id].context.createAnalyser();
    audioTrackData[track_id].analyser.fftSize = 64;
    audioTrackData[track_id].canvas = document.getElementById('track_analyzer_' + track_id);
    audioTrackData[track_id].ctx = audioTrackData[track_id].canvas.getContext('2d');
    audioTrackData[track_id].source = audioTrackData[track_id].context.createMediaElementSource(audioTrackData[track_id].audio);
    audioTrackData[track_id].source.connect(audioTrackData[track_id].analyser);
    audioTrackData[track_id].analyser.connect(audioTrackData[track_id].context.destination);
		
    var spectrumGradient = audioTrackData[track_id].ctx.createLinearGradient(0,0,8,audioTrackData[track_id].canvas.height);
    spectrumGradient.addColorStop(1,'#00FF00');
    spectrumGradient.addColorStop(0.9,'#00FF00');
    spectrumGradient.addColorStop(0.6,'#FFFF00');
    spectrumGradient.addColorStop(0.3,'#FF0000');
    spectrumGradient.addColorStop(0,'#FF0000');
		
    audioTrackData[track_id].ctx.fillStyle = spectrumGradient;
		
		nowPlayingTrackId = track_id;
		
    analyserRefresh();
		
  } catch (e) {
    
  }
}

function stopAudioSpectrum(track_id){
	try{
		audioTrackData[track_id].ctx.clearRect(0, 0, audioTrackData[track_id].canvas.width, audioTrackData[track_id].canvas.height);
		cancelAnimationFrame(spectrumAnimation);
	} catch (e) {
		
	}
}

function resumeAudioSpectrum(track_id){
	try{
		stopAllOtherTracks(track_id);
		nowPlayingTrackId = track_id;
		audioTrackData[track_id].ctx.clearRect(0, 0, audioTrackData[track_id].canvas.width, audioTrackData[track_id].canvas.height);
		analyserRefresh();
	} catch (e) {
		
	}
}

function stopAllOtherTracks(track_id){
	for(i in audioTrackData){
		if(i != track_id){
			audioTrackData[i].audio.pause();
		}		
	}	
}

function analyserRefresh(){
	spectrumAnimation = window.requestAnimationFrame(analyserRefresh);
	fbc_array = new Uint8Array(audioTrackData[nowPlayingTrackId].analyser.frequencyBinCount);
	audioTrackData[nowPlayingTrackId].analyser.getByteFrequencyData(fbc_array);
	audioTrackData[nowPlayingTrackId].ctx.clearRect(0, 0, audioTrackData[nowPlayingTrackId].canvas.width, audioTrackData[nowPlayingTrackId].canvas.height);
	bars = 32;
	for (var i = 0; i < bars; i++) {
		value = fbc_array[i];
		weight = 1 + (i/50); // This is to even out the spectrum display.  Without the weight, the bass is too heavily represented.
		bar_x = i * 10;
		bar_width = 8;
		bar_height = -((value * weight) / 2);
		audioTrackData[nowPlayingTrackId].ctx.fillRect(bar_x, audioTrackData[nowPlayingTrackId].canvas.height, bar_width, bar_height);
	}
}