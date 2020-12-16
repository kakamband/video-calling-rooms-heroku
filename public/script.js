//connect socket to root path, localhost
const socket = io('/')

//get id of the element where we need to display the video
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})

let myVideoStream; //used in mute buttons down
//get my video
const myVideo = document.createElement('video')
myVideo.muted = true //this is to mute ourself, does not mute us to others - just blocks our audio only for us

//[created] when disconnecting people from call
const peers = {}

//use webcam to get video
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
//    add the video stream; see function written down
    addVideoStream(myVideo, stream)

//  when someone calls, answer their call
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })


//    allow other users to connect to our chat
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream) //send userId and our video stream to the new user
    })

    //Chats

//get input from ui
    let msg = $('input')

//using jquery to to see if send button is pressed
    $('html').keydown((e) => {
        //13 is the code for enter key, jquery uses this to see if the enter key is being pressed to send a message
        if(e.which == 13 && msg.val().length !== 0){
            // console.log(msg.val())
            socket.emit('message', msg.val());
            msg.val('')
        }
    });

//receive chat message
    socket.on('createMessage', message => {
        // send message to UI
        $('.messages').append(`<li class="message"><b>USER</b><br>${message}</li>`);
        scrollToBottom()
    })
})

//   when users disconnect
socket.on('user-disconnected', userId => {
    if(peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream){
    //call a user with 'userId' and send them our 'stream'
    const call = myPeer.call(userId, stream)

    //other user video
    const video = document.createElement('video')
    //when the other user sends their video, take in their 'stream'
    call.on('stream', userVideoStream => {
        //    when the user sends their videos, take it and add to the list of videos
        addVideoStream(video, userVideoStream)
    })
    //when someone leaves the class, remove their video
    call.on('close', () =>{
        video.remove()
    })

    peers[userId] = call

}

// //listening to an event, when a new user connects to a room
// socket.on('user-connected', userId => {
//     console.log('User Connected ' + userId)
// })

//send video stream from source user
function addVideoStream(video, stream){
    video.srcObject = stream //take our video and stream
    //once the video is loaded into srcObject from stream, play it
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })

//    append the video into the video-grid
    videoGrid.append(video)
}

//to scroll message area when filled
const scrollToBottom = () => {
    let d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}


//mute toggle function
const muteUnmute = () => {
    const enabled = myVideo.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const playStop = () => {
    console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
    document.querySelector('.main__mute__button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
    document.querySelector('.main__mute__button').innerHTML = html;
}

const setStopVideo = () => {
    const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
    document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
    document.querySelector('.main__video_button').innerHTML = html;
}

