import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { FaMicrophone } from 'react-icons/fa';

const VoiceSearch = ({ onSearch }) => {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) return;
    if (transcript) {
      onSearch(transcript);
      setStatus(`Heard: "${transcript}"`);
    }else if (!listening) {
      // If the mic turns off and there's no transcript, reset the search
      onSearch('');
    }
  }, [transcript, listening, onSearch, browserSupportsSpeechRecognition]);

  const toggleListen = () => {
    if (!browserSupportsSpeechRecognition) {
      setStatus('Voice search is not supported by your browser.');
      return;
    }

    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      setStatus('Listening...');
      SpeechRecognition.startListening({ continuous: false, language: 'en-US' });
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser not supported.</span>;
  }

  return (
    <>
      <button
        onClick={toggleListen}
        className={`mic-button ${listening ? 'listening' : ''}`}
        title="Tap to speak"
      >
        <FaMicrophone />
      </button>
      <div style={{ minHeight: '30px', marginTop: '15px', fontSize: '1.1rem', fontWeight: '500', color: '#444' }}>
        {listening ? 'Listening...' : status}
      </div>
    </>
  );
};

export default VoiceSearch;