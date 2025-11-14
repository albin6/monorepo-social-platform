import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import '../../styles/index.css';

const VideoCallRoomPage = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useWebSocket();
  const [callStatus, setCallStatus] = useState('idle'); // idle, connecting, ringing, in-call, ended
  const [callType, setCallType] = useState('video'); // video, audio
  const [participants, setParticipants] = useState([
    { 
      id: user.id, 
      name: user.username || 'You', 
      isLocal: true, 
      isVideoOn: true, 
      isAudioOn: true,
      stream: null
    },
    { 
      id: 'partner_101', 
      name: 'John Doe', 
      isLocal: false, 
      isVideoOn: true, 
      isAudioOn: true,
      stream: null
    }
  ]);
  const [callTimer, setCallTimer] = useState(0);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState('00:00');
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const timerRef = useRef(null);

  // Mock WebRTC functionality
  useEffect(() => {
    // In a real app, this would initialize WebRTC
    console.log('Initializing WebRTC...');
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Start call timer when call begins
  useEffect(() => {
    if (callStatus === 'in-call') {
      timerRef.current = setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setCallTimer(0);
      setCallDuration('00:00');
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [callStatus]);

  // Update call duration display
  useEffect(() => {
    if (callTimer > 0) {
      const minutes = Math.floor(callTimer / 60);
      const seconds = callTimer % 60;
      setCallDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }
  }, [callTimer]);

  // Handle starting a call
  const startCall = () => {
    setCallStatus('connecting');
    
    // Simulate call setup
    setTimeout(() => {
      setCallStatus('ringing');
      
      // Simulate partner answering after 3 seconds
      setTimeout(() => {
        setCallStatus('in-call');
      }, 3000);
    }, 1000);
  };

  // Handle answering an incoming call
  const answerCall = () => {
    setCallStatus('in-call');
  };

  // Handle ending a call
  const endCall = () => {
    setCallStatus('ended');
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // In a real app, this would close WebRTC connections
    if (socket) {
      socket.emit('video_call_end', {
        callId: 'call_123',
        userId: user.id
      });
    }
    
    // Reset after delay
    setTimeout(() => {
      setCallStatus('idle');
      setParticipants(prev => prev.map(p => ({
        ...p,
        isVideoOn: true,
        isAudioOn: true
      })));
    }, 2000);
  };

  // Toggle camera
  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
    
    // In a real app, this would enable/disable the video track
    setParticipants(prev => 
      prev.map(p => p.isLocal ? { ...p, isVideoOn: !isCameraOn } : p)
    );
  };

  // Toggle microphone
  const toggleMic = () => {
    setIsMicOn(!isMicOn);
    
    // In a real app, this would enable/disable the audio track
    setParticipants(prev => 
      prev.map(p => p.isLocal ? { ...p, isAudioOn: !isMicOn } : p)
    );
  };

  // Toggle screen sharing
  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    
    // In a real app, this would start/stop screen sharing
    if (!isScreenSharing) {
      // Enable screen sharing
      setParticipants(prev => 
        prev.map(p => p.isLocal ? { ...p, isVideoOn: false } : p)
      );
    } else {
      // Disable screen sharing, go back to camera
      setParticipants(prev => 
        prev.map(p => p.isLocal ? { ...p, isVideoOn: true } : p)
      );
    }
  };

  // Setup WebSocket event listeners for video calls
  useEffect(() => {
    if (socket) {
      socket.on('video_call_incoming', (data) => {
        console.log('Incoming call:', data);
        setCallStatus('ringing');
      });
      
      socket.on('video_call_accepted', (data) => {
        console.log('Call accepted:', data);
        setCallStatus('in-call');
      });
      
      socket.on('video_call_rejected', (data) => {
        console.log('Call rejected:', data);
        setCallStatus('idle');
      });
      
      socket.on('video_call_ended', (data) => {
        console.log('Call ended:', data);
        setCallStatus('ended');
        
        setTimeout(() => {
          setCallStatus('idle');
        }, 2000);
      });
      
      socket.on('sdp_offer_received', (data) => {
        console.log('SDP offer received:', data);
        // Handle WebRTC offer
      });
      
      socket.on('sdp_answer_received', (data) => {
        console.log('SDP answer received:', data);
        // Handle WebRTC answer
      });
      
      socket.on('ice_candidate_received', (data) => {
        console.log('ICE candidate received:', data);
        // Handle ICE candidate
      });
    }
    
    return () => {
      if (socket) {
        socket.off('video_call_incoming');
        socket.off('video_call_accepted');
        socket.off('video_call_rejected');
        socket.off('video_call_ended');
        socket.off('sdp_offer_received');
        socket.off('sdp_answer_received');
        socket.off('ice_candidate_received');
      }
    };
  }, [socket]);

  return (
    <div className="video-call-container" style={{ 
      height: '100vh', 
      backgroundColor: '#000', 
      color: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Video Grid */}
      <div className="video-grid" style={{ 
        flex: 1, 
        display: 'grid',
        gridTemplateColumns: callType === 'video' ? '1fr 300px' : '1fr',
        gap: '10px',
        padding: '10px'
      }}>
        {/* Main Video - Remote Participant */}
        <div className="main-video" style={{ 
          position: 'relative', 
          backgroundColor: '#333', 
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            position: 'absolute', 
            top: '10px', 
            left: '10px', 
            zIndex: 1,
            background: 'rgba(0,0,0,0.5)',
            padding: '5px 10px',
            borderRadius: '15px',
            fontSize: '0.9em'
          }}>
            {participants.find(p => !p.isLocal)?.name || 'Partner'}
            {!participants.find(p => !p.isLocal)?.isVideoOn && (
              <span style={{ color: '#ff9800', marginLeft: '5px' }}>Video Off</span>
            )}
          </div>
          
          {/* In a real app, this would be a video element */}
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#222'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                backgroundColor: '#555',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px'
              }}>
                <span style={{ fontSize: '4em' }}>👤</span>
              </div>
              <div>{participants.find(p => !p.isLocal)?.name}</div>
            </div>
          </div>
        </div>
        
        {/* Side Panel - Local Video + Participants */}
        {callType === 'video' && (
          <div className="side-panel" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px' 
          }}>
            {/* Local Video */}
            <div className="local-video" style={{ 
              flex: 1, 
              backgroundColor: '#333', 
              borderRadius: '8px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ 
                position: 'absolute', 
                top: '10px', 
                right: '10px', 
                zIndex: 1,
                background: 'rgba(0,0,0,0.5)',
                padding: '5px 10px',
                borderRadius: '15px',
                fontSize: '0.9em'
              }}>
                You
                {!isCameraOn && <span style={{ color: '#ff9800', marginLeft: '5px' }}>Video Off</span>}
              </div>
              
              {/* In a real app, this would be a video element */}
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#222'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundColor: '#555',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 10px'
                  }}>
                    <span style={{ fontSize: '2em' }}>👤</span>
                  </div>
                  <div>You</div>
                </div>
              </div>
            </div>
            
            {/* Participants List */}
            <div className="participants-list" style={{ 
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '10px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '1em' }}>Participants ({participants.length})</h4>
              {participants.map((participant, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '8px',
                  padding: '5px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '4px'
                }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#555',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '10px',
                    fontSize: '0.8em'
                  }}>
                    👤
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9em' }}>{participant.name}</div>
                    <div style={{ fontSize: '0.7em', color: '#aaa' }}>
                      {participant.isLocal ? 'You' : 'Remote'}
                    </div>
                  </div>
                  <div>
                    {participant.isAudioOn ? '🎤' : '🔇'}
                    {participant.isVideoOn ? '🎥' : '📷'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Call Info Bar */}
      <div className="call-info-bar" style={{ 
        padding: '10px', 
        backgroundColor: '#333',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
          {callStatus === 'idle' && 'Ready for a call'}
          {callStatus === 'connecting' && 'Setting up call...'}
          {callStatus === 'ringing' && `Ringing ${participants.find(p => !p.isLocal)?.name}...`}
          {callStatus === 'in-call' && `In call - ${callDuration}`}
          {callStatus === 'ended' && 'Call ended'}
        </div>
        
        {callStatus === 'in-call' && (
          <div style={{ 
            position: 'absolute', 
            top: '10px', 
            right: '10px',
            backgroundColor: '#ff5722',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '15px',
            fontSize: '0.8em'
          }}>
            LIVE
          </div>
        )}
      </div>
      
      {/* Call Controls */}
      <div className="call-controls" style={{ 
        padding: '20px', 
        backgroundColor: '#222',
        display: 'flex',
        justifyContent: 'center',
        gap: '15px'
      }}>
        {/* Call Status Specific Controls */}
        {callStatus === 'idle' && (
          <>
            <button 
              className="call-button video-call"
              onClick={() => {
                setCallType('video');
                startCall();
              }}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#4caf50',
                color: 'white',
                fontSize: '1.5em',
                cursor: 'pointer'
              }}
              title="Video Call"
            >
              ✅
            </button>
            <button 
              className="call-button audio-call"
              onClick={() => {
                setCallType('audio');
                startCall();
              }}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#2196f3',
                color: 'white',
                fontSize: '1.5em',
                cursor: 'pointer'
              }}
              title="Audio Call"
            >
              ☎️
            </button>
          </>
        )}
        
        {callStatus === 'ringing' && (
          <>
            <button 
              className="call-button answer"
              onClick={answerCall}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#4caf50',
                color: 'white',
                fontSize: '1.5em',
                cursor: 'pointer'
              }}
              title="Answer"
            >
              ✅
            </button>
            <button 
              className="call-button decline"
              onClick={endCall}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#f44336',
                color: 'white',
                fontSize: '1.5em',
                cursor: 'pointer'
              }}
              title="Decline"
            >
              ❌
            </button>
          </>
        )}
        
        {callStatus === 'in-call' && (
          <>
            <button 
              className={`call-button mic ${isMicOn ? 'on' : 'off'}`}
              onClick={toggleMic}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: isMicOn ? '#9e9e9e' : '#f44336',
                color: 'white',
                fontSize: '1.5em',
                cursor: 'pointer'
              }}
              title={isMicOn ? 'Mute' : 'Unmute'}
            >
              {isMicOn ? '🎤' : '🔇'}
            </button>
            
            <button 
              className={`call-button camera ${isCameraOn ? 'on' : 'off'}`}
              onClick={toggleCamera}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: isCameraOn ? '#9e9e9e' : '#f44336',
                color: 'white',
                fontSize: '1.5em',
                cursor: 'pointer'
              }}
              title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {isCameraOn ? '📷' : '📷'}
            </button>
            
            {callType === 'video' && (
              <button 
                className={`call-button screen-share ${isScreenSharing ? 'active' : ''}`}
                onClick={toggleScreenShare}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: isScreenSharing ? '#ff9800' : '#9e9e9e',
                  color: 'white',
                  fontSize: '1.5em',
                  cursor: 'pointer'
                }}
                title={isScreenSharing ? 'Stop screen share' : 'Share screen'}
            >
              🖥️
            </button>
            )}
            
            <button 
              className="call-button end-call"
              onClick={endCall}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#f44336',
                color: 'white',
                fontSize: '1.5em',
                cursor: 'pointer'
              }}
              title="End call"
            >
              📵
            </button>
          </>
        )}
        
        {(callStatus === 'connecting' || callStatus === 'ended') && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: '#9e9e9e',
            fontSize: '1.2em'
          }}>
            {callStatus === 'connecting' ? 'Connecting...' : 'Call ended'}
          </div>
        )}
      </div>
      
      {/* Connection Status */}
      <div style={{ 
        padding: '5px', 
        fontSize: '0.8em',
        backgroundColor: isConnected ? '#4caf50' : '#f44336',
        color: 'white',
        textAlign: 'center'
      }}>
        Signaling: {isConnected ? 'Connected' : 'Disconnected'} {isConnected ? '🟢' : '🔴'}
      </div>
    </div>
  );
};

export default VideoCallRoomPage;