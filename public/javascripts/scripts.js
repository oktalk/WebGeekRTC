$(function () {

	var peerId = prompt("Enter an ID");
	var peer = new Peer(peerId, {key: "vpzfzavxowjc3di"});
	var myFeed;


	navigator.getUserMedia = navigator.getUserMedia ||
														navigator.webkitGetUserMedia ||
														navigator.mozGetUserMedia ||
														navigator.msGetUserMedia;


	// Getting the user feed (to be sent and self monitor)
	navigator.getUserMedia({
		audio: false,
		video: true
	}, function(stream) {
		var video = document.querySelector("#my-cam");
		myFeed = stream;
		video.src = URL.createObjectURL(stream);
	}, function(err) {
		console.log("Error", err);
	});


	$('#self .caption').html(peerId);

	// Caller functions
	$("#call").click(function() {
		var connectPeer = prompt("Enter ID to connect to");
		var call = peer.call(connectPeer, myFeed);
		var dataConn = peer.connect(connectPeer);

		displayCall(call);
		canHangup(call);

		dataConn.on("data", function(data) {
			console.log(data);
			$('#chat .messages').append('<p class="callerfn">'+data+'</p>');
		});

		$("#submit").click(function(e) {
			e.preventDefault();
			var msg = $('#textInput').val();
			$('#chat .messages').append('<p class="callerfn">'+msg+'</p>');
			sendMessage(dataConn, msg);
			console.log('caller');
		});
	});


	// Called functions
	peer.on("call", function(call) {
		console.log("Getting a call");
		call.answer(myFeed);

		displayCall(call);
		canHangup(call);

		peer.on("connection", function(dataConn) {
			dataConn.on("data", function(data) {
				console.log(data);
				$('#chat .messages').append('<p class="calledfn">'+data+'</p>');
			});

			$("#submit").click(function(e) {
				e.preventDefault();
				var msg = $('#textInput').val();
				$('#chat .messages').append('<p class="calledfn">'+msg+'</p>');
				sendMessage(dataConn, msg);
				console.log('called');
			});

		});

	});


	function displayCall(call) {
		call.on("stream", function(stream) {
			var callCam = document.querySelector("#call-cam");
			callCam.src = URL.createObjectURL(stream);
		});
	}


	function canHangup(call) {
		$("#hangup").click(function() {
			call.close();
		});
	}


	function sendMessage(dataConn, msg) {
		dataConn.send(msg);
	}


	peer.on("error", function(err) {
		if (err.type === "unavailable-id") {
			peerId = prompt("ID being used, try again");
			peer = new Peer(peerId, {key: "vpzfzavxowjc3di"});
		}
	});
});
