// apps/web/pages/video-call/VideoCallPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  createVideoCall, 
  setActiveCall, 
  setLocalStream, 
  setRemoteStream, 
  toggleAudio, 
  toggleVideo,
  setIsScreenSharing,
  endCall
} from '../../store/slices/videoCallSlice';
import { SOCKET_EVENTS } from '../../config/constants';
import io from 'socket.io-client';
import environmentConfig from '../../config/environment';

const VideoCallPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile: currentUser } = useSelector(state => state.user);
  const { 
    activeCall, 
    localStream, 
    remoteStream, 
    isAudioMuted, 
    isVideoMuted, 
    isScreenSharing 
  } = useSelector(state => state.videoCall);
  
  const [calleeId, setCalleeId] = useState('');
  const [socket, setSocket] = useState(null);
  const [callType, setCallType] = useState('video'); // 'video' or 'audio'
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Setup WebSocket connection
  useEffect(() => {
    const newSocket = io(environmentConfig.WEBSOCKET_URL, {
      auth: {
        token: localStorage.getItem(environmentConfig.JWT_TOKEN_KEY),
      },
    });

    setSocket(newSocket);

    // Handle incoming call events
    newSocket.on(SOCKET_EVENTS.CALL_INITIATED, (callData) => {
      console.log('Incoming call:', callData);
      dispatch(setActiveCall(callData));
      // Navigate to call room page
      navigate(`/video-call/${callData.id}`);
    });

    newSocket.on(SOCKET_EVENTS.CALL_ANSWERED, (callData) => {
      console.log('Call answered:', callData);
    });

    newSocket.on(SOCKET_EVENTS.CALL_ENDED, (callData) => {
      console.log('Call ended:', callData);
      dispatch(endCall());
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });

    newSocket.on(SOCKET_EVENTS.ICE_CANDIDATE, (candidate) => {
      console.log('ICE candidate received:', candidate);
      // Handle ICE candidate
    });

    return () => {
      newSocket.close();
    };
  }, [dispatch, navigate]);

  // Setup local stream
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Setup remote stream
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Start local video stream
  const startLocalStream = async () => {
    try {
      const constraints = {
        video: !isVideoMuted,
        audio: !isAudioMuted,
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      dispatch(setLocalStream(stream));
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      return null;
    }
  };

  // Start a new call
  const handleStartCall = async () => {
    if (!calleeId) {
      alert('Please enter a user ID to call');
      return;
    }

    try {
      // Start local stream
      const localStream = await startLocalStream();
      if (!localStream) {
        throw new Error('Could not access media devices');
      }

      // Create the call
      const callData = {
        calleeId,
        callType,
      };

      const result = await dispatch(createVideoCall(callData)).unwrap();
      
      // Set the active call in state
      dispatch(setActiveCall(result.call));
      
      // Navigate to the call room
      navigate(`/video-call/${result.call.id}`);
    } catch (error) {
      console.error('Error starting call:', error);
      alert('Error starting call: ' + (error.message || 'Unknown error'));
    }
  };

  // Toggle audio
  const handleToggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      dispatch(toggleAudio());
    }
  };

  // Toggle video
  const handleToggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      dispatch(toggleVideo());
    }
  };

  // Toggle screen sharing
  const handleToggleScreenShare = async () => {
    try {
      let stream;
      if (isScreenSharing) {
        // Stop screen sharing and return to camera
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        dispatch(setIsScreenSharing(false));
      } else {
        // Start screen sharing
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        dispatch(setIsScreenSharing(true));
      }
      
      dispatch(setLocalStream(stream));
      
      // Send new stream to remote participant
      if (socket && activeCall) {
        // Send stream update through signaling server
        socket.emit('stream-update', {
          callId: activeCall.id,
          stream: stream,
        });
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };

  return (
    <div className="container">
      <h1>Video Call</h1>
      
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h3>Start New Call</h3>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
          <input
            type="text"
            value={calleeId}
            onChange={(e) => setCalleeId(e.target.value)}
            placeholder="Enter user ID to call"
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', flex: 1 }}
          />
          
          <select
            value={callType}
            onChange={(e) => setCallType(e.target.value)}
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="video">Video Call</option>
            <option value="audio">Audio Call</option>
          </select>
          
          <button 
            className="button button-primary"
            onClick={handleStartCall}
          >
            Start Call
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className={`button ${isAudioMuted ? 'button-secondary' : 'button-primary'}`}
            onClick={handleToggleAudio}
          >
            {isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
          </button>
          
          <button 
            className={`button ${isVideoMuted ? 'button-secondary' : 'button-primary'}`}
            onClick={handleToggleVideo}
          >
            {isVideoMuted ? 'Unmute Video' : 'Mute Video'}
          </button>
          
          <button 
            className={`button ${isScreenSharing ? 'button-primary' : 'button-secondary'}`}
            onClick={handleToggleScreenShare}
          >
            {isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
          </button>
        </div>
      </div>

      {/* Preview video */}
      <div className="card" style={{ padding: '20px' }}>
        <h3>Preview</h3>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '300px', 
          backgroundColor: '#000',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {localStream ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover' 
              }}
            />
          ) : (
            <div style={{ 
              color: '#fff', 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>📷</div>
              <p>Camera is {isVideoMuted ? 'off' : 'on'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Active calls list */}
      {activeCall && (
        <div className="card" style={{ marginTop: '20px', padding: '20px' }}>
          <h3>Active Call</h3>
          <p>Call with: {activeCall.callee?.username || activeCall.calleeId}</p>
          <p>Status: {activeCall.status}</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button 
              className="button button-primary"
              onClick={() => navigate(`/video-call/${activeCall.id}`)}
            >
              Join Call
            </button>
            <button 
              className="button button-secondary"
              onClick={() => dispatch(endCall())}
            >
              End Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCallPage;