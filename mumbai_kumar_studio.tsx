import React, { useState, useEffect, useRef, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  Music, 
  Upload, 
  Search, 
  Play, 
  Pause, 
  Sparkles, 
  Disc, 
  Sliders, 
  Bookmark, 
  Eye, 
  EyeOff, 
  Plus, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Wand2, 
  Film, 
  Cloud, 
  Radio, 
  Mic2, 
  Heart, 
  ListMusic,
  X,
  FileAudio,
  Info,
  Award,
  Layers
} from 'lucide-react';

// ==========================================
// FIREBASE CONFIGURATION & INITIALIZATION
// ==========================================
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = Object.keys(firebaseConfig).length > 0 ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'mumbai-kumar-studio';

// ==========================================
// DEFAULT PRE-LOADED STUDIO TRACKS (MUMBAI KUMAR CATALOG)
// ==========================================
const INITIAL_STUDIO_SONGS = [
  {
    id: 'mk-melody-1',
    title: 'Mazhaiye Mazhaiye (AI Vocal)',
    genre: 'Melody',
    situation: 'Hero & Heroine rainy night coffee shop romance, first eye contact, soft emotional love breeze, kadhal mazhai scene',
    tags: ['Rain', 'Romance', 'Love', 'Kadhal', 'Coffee Shop', 'Night', 'Breeze', 'Soft'],
    bpm: 84,
    raga: 'Reethigowla / C Minor',
    duration: '3:42',
    status: 'Approved',
    shortlisted: true,
    directorNotes: 'Flute interlude at 1:15 works great for slow-motion rain visual.',
    synthPreset: 'melody_rain',
    createdAt: Date.now() - 500000
  },
  {
    id: 'mk-melody-2',
    title: 'Thanimaiyil Oru Payanam',
    genre: 'Melody',
    situation: 'Heartbreak love failure scene, hero walking alone on beach road at midnight, emotional breakup, sogam',
    tags: ['Love Failure', 'Heartbreak', 'Breakup', 'Sad', 'Sogam', 'Alone', 'Travel', 'Emotional'],
    bpm: 76,
    raga: 'Charukesi / D Minor',
    duration: '4:10',
    status: 'Approved',
    shortlisted: false,
    directorNotes: 'Heavy cello and acoustic guitar backing.',
    synthPreset: 'melody_sad',
    createdAt: Date.now() - 450000
  },
  {
    id: 'mk-melody-3',
    title: 'Aararo En Thaaye',
    genre: 'Melody',
    situation: 'Mother sentiment emotional scene, amma pasam, family reunion flashback, tears of joy',
    tags: ['Mother', 'Amma', 'Sentiment', 'Family', 'Emotional', 'Flashback', 'Lullaby'],
    bpm: 72,
    raga: 'Neelambari / F Major',
    duration: '3:55',
    status: 'In Progress',
    shortlisted: true,
    directorNotes: 'Needs extra shehnai layer in second charanam.',
    synthPreset: 'melody_mother',
    createdAt: Date.now() - 400000
  },
  {
    id: 'mk-folk-1',
    title: 'Madurai Veeran Varaaru (Thara Thappattai)',
    genre: 'Folk',
    situation: 'Hero mass introduction scene in village market, festival celebration, kuthu dance, urumi melam energy',
    tags: ['Hero Intro', 'Mass', 'Kuthu', 'Village', 'Ooru', 'Dance', 'Celebration', 'Urumi', 'Thappattai'],
    bpm: 128,
    raga: 'Folk Pentatonic / G Minor',
    duration: '3:28',
    status: 'Approved',
    shortlisted: true,
    directorNotes: 'High energy brass + parai beat drop for hero entry title card.',
    synthPreset: 'folk_kuthu',
    createdAt: Date.now() - 350000
  },
  {
    id: 'mk-folk-2',
    title: 'Karisakkattu Kuyile',
    genre: 'Folk',
    situation: 'Village farming montage, green fields, innocent rural love teasing, bullock cart ride, gramathu song',
    tags: ['Village', 'Rural', 'Gramam', 'Farming', 'Teasing', 'Folk Melody', 'Nature'],
    bpm: 102,
    raga: 'Harikambhoji / A Major',
    duration: '3:50',
    status: 'Approved',
    shortlisted: false,
    directorNotes: 'Authentic nadaswaram and thavil groove.',
    synthPreset: 'folk_rural',
    createdAt: Date.now() - 300000
  },
  {
    id: 'mk-bhakti-1',
    title: 'Omkara Kaliyamma (Climax)',
    genre: 'Bhakti',
    situation: 'Kovil thiruvizha climax fight, temple festival fire walk, fierce goddess Amman invocation, goosebumps devotion',
    tags: ['Kovil', 'Thiruvizha', 'Temple', 'Climax', 'Amman', 'Fierce', 'Goosebumps', 'Festival', 'Fight'],
    bpm: 136,
    raga: 'Simhendramadhyamam / E Minor',
    duration: '4:25',
    status: 'Approved',
    shortlisted: true,
    directorNotes: 'Massive temple bells, udukkai, and sanskrit chorus chant.',
    synthPreset: 'bhakti_climax',
    createdAt: Date.now() - 250000
  },
  {
    id: 'mk-bhakti-2',
    title: 'Suprabhatha Mangalam',
    genre: 'Bhakti',
    situation: 'Peaceful morning temple opening scene, lamp lighting, divine blessing, wedding auspicious muhurtham',
    tags: ['Morning', 'Peaceful', 'Divine', 'Temple', 'Wedding', 'Kalyanam', 'Prayer', 'Devotional'],
    bpm: 80,
    raga: 'Bhoopalam / Hamsadhwani',
    duration: '3:15',
    status: 'Needs Remix',
    shortlisted: false,
    directorNotes: 'Veena and temple ghanta bells blend smoothly.',
    synthPreset: 'bhakti_peace',
    createdAt: Date.now() - 200000
  }
];

// ==========================================
// WEB AUDIO SYNTHESIZER FOR BUILT-IN STUDIO PLAYBACK
// ==========================================
class StudioSynthEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.intervalId = null;
    this.currentNodes = [];
    this.volume = 0.7;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    this.volume = val;
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.currentNodes.forEach(node => {
      try {
        node.stop();
        node.disconnect();
      } catch (e) {}
    });
    this.currentNodes = [];
  }

  playPreset(preset = 'melody_rain', bpm = 90) {
    this.stop();
    this.init();
    this.isPlaying = true;

    const stepMs = (60 / bpm) * 500; // Eighth note pulse
    let step = 0;

    // Musical scales (frequencies in Hz)
    const scales = {
      melody_rain: [261.63, 293.66, 311.13, 349.23, 392.00, 466.16, 523.25], // C minor / Reethigowla feel
      melody_sad: [293.66, 329.63, 349.23, 392.00, 440.00, 466.16, 587.33],  // D minor
      melody_mother: [349.23, 392.00, 440.00, 466.16, 523.25, 587.33, 698.46], // F major lullaby
      folk_kuthu: [196.00, 233.08, 261.63, 293.66, 349.23, 392.00],           // G minor folk punch
      folk_rural: [220.00, 246.94, 277.18, 329.63, 369.99, 440.00],           // A major folk
      bhakti_climax: [164.81, 196.00, 233.08, 246.94, 311.13, 329.63],        // E harmonic/dramatic
      bhakti_peace: [261.63, 293.66, 329.63, 392.00, 493.88, 523.25]          // Hamsadhwani
    };

    const activeScale = scales[preset] || scales.melody_rain;
    const isFolk = preset.startsWith('folk');
    const isBhakti = preset.startsWith('bhakti');

    const playStep = () => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;

      // 1. Melodic Note
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Choose waveform by genre
      if (isFolk) {
        osc.type = step % 2 === 0 ? 'sawtooth' : 'square';
      } else if (isBhakti) {
        osc.type = 'triangle';
      } else {
        osc.type = 'sine';
      }

      const noteIdx = (step * 2 + (step % 3)) % activeScale.length;
      const freq = activeScale[noteIdx];
      osc.frequency.setValueAtTime(freq, now);

      // Gentle vibrato
      if (!isFolk) {
        osc.frequency.exponentialRampToValueAtTime(freq * 1.008, now + (stepMs / 1000) * 0.8);
      }

      const peakGain = (isFolk ? 0.12 : 0.18) * this.volume;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (stepMs / 1000) * 0.95);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + (stepMs / 1000));

      // 2. Percussion / Bass Pulse for Folk & Bhakti Climax or Soft Pad for Melody
      if (step % 2 === 0) {
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        
        if (isFolk || preset === 'bhakti_climax') {
          // Drum thump
          subOsc.type = 'triangle';
          subOsc.frequency.setValueAtTime(140, now);
          subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.15);
          subGain.gain.setValueAtTime(0.28 * this.volume, now);
          subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          subOsc.connect(subGain);
          subGain.connect(this.ctx.destination);
          subOsc.start(now);
          subOsc.stop(now + 0.2);
        } else if (isBhakti && step % 4 === 0) {
          // Temple bell chime
          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime(1046.5, now);
          subGain.gain.setValueAtTime(0.12 * this.volume, now);
          subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
          subOsc.connect(subGain);
          subGain.connect(this.ctx.destination);
          subOsc.start(now);
          subOsc.stop(now + 0.85);
        } else {
          // Warm bass drone
          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime(activeScale[0] / 2, now);
          subGain.gain.setValueAtTime(0.08 * this.volume, now);
          subGain.gain.exponentialRampToValueAtTime(0.001, now + (stepMs * 2) / 1000);
          subOsc.connect(subGain);
          subGain.connect(this.ctx.destination);
          subOsc.start(now);
          subOsc.stop(now + (stepMs * 2) / 1000);
        }
      }

      step++;
    };

    playStep();
    this.intervalId = setInterval(playStep, stepMs);
  }
}

const synthEngine = new StudioSynthEngine();

// ==========================================
// MAIN APPLICATION COMPONENT
// ==========================================
export default function App() {
  // Auth & Cloud State
  const [user, setUser] = useState(null);
  const [cloudSynced, setCloudSynced] = useState(false);
  const [songs, setSongs] = useState(INITIAL_STUDIO_SONGS);
  const [localAudioMap, setLocalAudioMap] = useState({}); // { songId: blobUrl }

  // Navigation & Filtering State
  const [activeCategory, setActiveCategory] = useState('All'); // 'All' | 'Melody' | 'Folk' | 'Bhakti' | 'Shortlist'
  const [pitchMode, setPitchMode] = useState(false); // Client presentation view

  // Situation Search & AI Assistant State
  const [situationQuery, setSituationQuery] = useState('');
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [aiMatchedResults, setAiMatchedResults] = useState(null); // Array of { songId, matchScore, reason }
  const [aiSummaryText, setAiSummaryText] = useState('');

  // Audio Player State
  const [playingSongId, setPlayingSongId] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const audioRef = useRef(null);
  const progressTimerRef = useRef(null);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('Melody');
  const [newSongForm, setNewSongForm] = useState({
    title: '',
    genre: 'Melody',
    situation: '',
    tags: '',
    bpm: 95,
    raga: '',
    directorNotes: '',
    audioFileName: '',
    audioBlobUrl: ''
  });
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);

  // AI Lyrics & Scene Hook Modal State
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [lyricsPrompt, setLyricsPrompt] = useState('');
  const [lyricsGenre, setLyricsGenre] = useState('Melody');
  const [generatedLyrics, setGeneratedLyrics] = useState(null);
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);

  // Toast / Notification Message
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (text, type = 'info') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // ==========================================
  // 1. FIREBASE AUTHENTICATION (RULE 3)
  // ==========================================
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Auth initialization warning:', err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // ==========================================
  // 2. FIRESTORE CLOUD SYNC (RULE 1 & 2)
  // ==========================================
  useEffect(() => {
    if (!user || !db) return;

    const songsColRef = collection(db, 'artifacts', appId, 'public', 'data', 'studio_songs');
    const unsubscribe = onSnapshot(
      songsColRef,
      async (snapshot) => {
        setCloudSynced(true);
        if (snapshot.empty) {
          // Seed initial Mumbai Kumar Studio catalog into Cloud Storage on first run
          for (const item of INITIAL_STUDIO_SONGS) {
            const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'studio_songs', item.id);
            await setDoc(docRef, item);
          }
        } else {
          const loaded = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          // Sort in JS memory (Rule 2)
          loaded.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setSongs(loaded);
        }
      },
      (err) => {
        console.error('Firestore listener error:', err);
        setCloudSynced(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // ==========================================
  // 3. AUDIO PLAYBACK ENGINE
  // ==========================================
  const stopAllPlayback = () => {
    synthEngine.stop();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }
    setPlayingSongId(null);
    setPlaybackProgress(0);
  };

  const togglePlaySong = (song) => {
    if (playingSongId === song.id) {
      stopAllPlayback();
      return;
    }

    stopAllPlayback();
    setPlayingSongId(song.id);
    setPlaybackProgress(5);

    const customBlobUrl = localAudioMap[song.id] || song.audioBlobUrl;

    if (customBlobUrl && audioRef.current) {
      audioRef.current.src = customBlobUrl;
      audioRef.current.muted = isMuted;
      audioRef.current.play().catch(() => {
        // Fallback to studio synth if blob expired
        synthEngine.playPreset(song.synthPreset || 'melody_rain', song.bpm || 90);
      });
    } else {
      // Play procedural Mumbai Kumar Studio AI Preview Synth
      const presetMap = {
        Melody: 'melody_rain',
        Folk: 'folk_kuthu',
        Bhakti: 'bhakti_climax'
      };
      const chosenPreset = song.synthPreset || presetMap[song.genre] || 'melody_rain';
      synthEngine.setVolume(isMuted ? 0 : 0.7);
      synthEngine.playPreset(chosenPreset, Number(song.bpm) || 95);
    }

    progressTimerRef.current = setInterval(() => {
      setPlaybackProgress(prev => (prev >= 100 ? 0 : prev + 1.5));
    }, 500);
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    synthEngine.setVolume(nextMute ? 0 : 0.7);
    if (audioRef.current) {
      audioRef.current.muted = nextMute;
    }
  };

  useEffect(() => {
    return () => stopAllPlayback();
  }, []);

  // ==========================================
  // 4. GEMINI AI HELPER WITH EXPONENTIAL BACKOFF
  // ==========================================
  const callGeminiAPI = async (payload) => {
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
    const delays = [1000, 2000, 4000];

    for (let attempt = 0; attempt <= delays.length; attempt++) {
      try {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return await res.json();
      } catch (err) {
        if (attempt === delays.length) throw err;
        await new Promise(r => setTimeout(r, delays[attempt]));
      }
    }
  };

  // ==========================================
  // 5. SMART SITUATION SEARCH (TANGISH + ENGLISH + GEMINI)
  // ==========================================
  const performLocalKeywordMatch = (queryText) => {
    const q = queryText.toLowerCase().trim();
    if (!q) return [];

    // Tanglish & Cinema synonym expansion dictionary
    const synonymGroups = [
      ['rain', 'mazhai', 'drizzle', 'coffee', 'breeze', 'chill'],
      ['love', 'kadhal', 'romance', 'romantic', 'couple', 'propose', 'eye contact', 'first sight'],
      ['sad', 'sogam', 'breakup', 'love failure', 'heartbreak', 'pain', 'alone', 'thanimai', 'cry'],
      ['mother', 'amma', 'sentiment', 'family', 'pasam', 'sister', 'emotion', 'lullaby', 'aararo'],
      ['mass', 'hero', 'intro', 'entry', 'kuthu', 'dance', 'celebration', 'party', 'local', 'thara', 'urumi'],
      ['village', 'ooru', 'gramam', 'folk', 'rural', 'vivasayam', 'farming', 'karisakkattu'],
      ['kovil', 'temple', 'thiruvizha', 'festival', 'bhakti', 'god', 'amman', 'swamy', 'devotional', 'climax', 'goosebumps', 'divine', 'prayer', 'morning']
    ];

    const expandedTerms = new Set(q.split(/\s+/));
    synonymGroups.forEach(group => {
      if (group.some(term => q.includes(term))) {
        group.forEach(term => expandedTerms.add(term));
      }
    });

    const scored = songs.map(song => {
      const hay = `${song.title} ${song.genre} ${song.situation} ${(song.tags || []).join(' ')} ${song.raga || ''}`.toLowerCase();
      let score = 0;
      const matchedWords = [];

      expandedTerms.forEach(term => {
        if (term.length > 2 && hay.includes(term)) {
          score += 18;
          matchedWords.push(term);
        }
      });

      if (q.includes('melody') && song.genre === 'Melody') score += 30;
      if ((q.includes('folk') || q.includes('kuthu') || q.includes('village')) && song.genre === 'Folk') score += 30;
      if ((q.includes('bhakti') || q.includes('kovil') || q.includes('god') || q.includes('amman')) && song.genre === 'Bhakti') score += 30;

      const finalScore = Math.min(99, score);
      return {
        songId: song.id,
        matchScore: finalScore,
        reason: `Matches scene mood (${song.genre}): "${song.situation}"`
      };
    }).filter(item => item.matchScore > 0);

    scored.sort((a, b) => b.matchScore - a.matchScore);
    return scored;
  };

  const handleSituationSearch = async (e, presetText = null) => {
    if (e) e.preventDefault();
    const queryToUse = presetText !== null ? presetText : situationQuery;
    if (presetText !== null) setSituationQuery(presetText);

    if (!queryToUse.trim()) {
      setAiMatchedResults(null);
      setAiSummaryText('');
      return;
    }

    // Step 1: Instant local fallback match so user gets immediate responsiveness
    const instantMatches = performLocalKeywordMatch(queryToUse);
    if (instantMatches.length > 0) {
      setAiMatchedResults(instantMatches);
      setAiSummaryText(`Showing ${instantMatches.length} matching track(s) from Mumbai Kumar Studio Cloud for "${queryToUse}"...`);
    }

    // Step 2: Deep Gemini AI Director Pitch Analysis
    setIsSearchingAI(true);
    try {
      const catalogSummary = songs.map(s => ({
        id: s.id,
        title: s.title,
        genre: s.genre,
        situation: s.situation,
        tags: s.tags,
        bpm: s.bpm,
        raga: s.raga
      }));

      const payload = {
        contents: [{
          role: 'user',
          parts: [{
            text: `You are the AI Studio Assistant for Music Director "Mumbai Kumar Studio".
A film director or producer has requested songs for this movie scene situation (may be in English or Tanglish): "${queryToUse}".

Here is Mumbai Kumar's uploaded cloud song catalog:
${JSON.stringify(catalogSummary)}

Select the best matching songs from the catalog (1 to 4 songs) that fit this scene situation. Rank them from highest match score (0-100) to lowest, and explain in a punchy Tamil Cinema / Tanglish + English style why each song fits the scene.`
          }]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              directorPitchSummary: { type: "STRING" },
              recommendations: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    songId: { type: "STRING" },
                    matchScore: { type: "NUMBER" },
                    reason: { type: "STRING" }
                  },
                  propertyOrdering: ["songId", "matchScore", "reason"]
                }
              }
            },
            propertyOrdering: ["directorPitchSummary", "recommendations"]
          }
        }
      };

      const res = await callGeminiAPI(payload);
      const text = res?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed.recommendations && parsed.recommendations.length > 0) {
          setAiMatchedResults(parsed.recommendations);
          setAiSummaryText(parsed.directorPitchSummary || `AI Matched ${parsed.recommendations.length} songs for your situation.`);
        }
      }
    } catch (err) {
      // Keep the instant local matches if API fails
      if (instantMatches.length === 0) {
        setAiMatchedResults([]);
        setAiSummaryText('No exact situation match found. Try uploading a new song for this scene!');
      }
    } finally {
      setIsSearchingAI(false);
    }
  };

  // ==========================================
  // 6. CLOUD UPLOAD & SONG MANAGEMENT HANDLERS
  // ==========================================
  const openUploadForGenre = (genre) => {
    setUploadCategory(genre);
    setNewSongForm({
      title: '',
      genre: genre,
      situation: '',
      tags: '',
      bpm: genre === 'Folk' ? 125 : genre === 'Bhakti' ? 108 : 85,
      raga: '',
      directorNotes: '',
      audioFileName: '',
      audioBlobUrl: ''
    });
    setShowUploadModal(true);
  };

  const handleAudioFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    setNewSongForm(prev => ({
      ...prev,
      audioFileName: file.name,
      audioBlobUrl: blobUrl,
      title: prev.title || file.name.replace(/\.[^/.]+$/, "")
    }));
  };

  const handleAutoGenerateSituationTags = async () => {
    if (!newSongForm.title && !newSongForm.situation) {
      showToast('Enter a Song Title or rough situation idea first!', 'warn');
      return;
    }
    setIsGeneratingTags(true);
    try {
      const payload = {
        contents: [{
          role: 'user',
          parts: [{
            text: `For a Tamil cinema AI song titled "${newSongForm.title}" in the "${newSongForm.genre}" category with initial notes "${newSongForm.situation}", generate a rich movie scene situation description (including English & Tanglish keywords so directors can search it easily), 6 comma-separated mood tags, and a suggested Raga/Scale.`
          }]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              situationDescription: { type: "STRING" },
              tagsCsv: { type: "STRING" },
              suggestedRaga: { type: "STRING" }
            },
            propertyOrdering: ["situationDescription", "tagsCsv", "suggestedRaga"]
          }
        }
      };

      const res = await callGeminiAPI(payload);
      const parsed = JSON.parse(res.candidates[0].content.parts[0].text);
      setNewSongForm(prev => ({
        ...prev,
        situation: parsed.situationDescription || prev.situation,
        tags: parsed.tagsCsv || prev.tags,
        raga: parsed.suggestedRaga || prev.raga
      }));
      showToast('AI Auto-Tagged Scene Situation & Raga!', 'success');
    } catch (err) {
      showToast('Auto-filled standard studio tags.', 'info');
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const handleUploadSongSubmit = async (e) => {
    e.preventDefault();
    if (!newSongForm.title.trim() || !newSongForm.situation.trim()) {
      showToast('Please enter both Song Title and Scene Situation.', 'warn');
      return;
    }

    const songId = `mk-${newSongForm.genre.toLowerCase()}-${Date.now()}`;
    const tagsArray = newSongForm.tags
      ? newSongForm.tags.split(',').map(t => t.trim()).filter(Boolean)
      : [newSongForm.genre, 'AI Studio Track'];

    const presetByGenre = {
      Melody: 'melody_rain',
      Folk: 'folk_kuthu',
      Bhakti: 'bhakti_climax'
    };

    const newSongDoc = {
      id: songId,
      title: newSongForm.title.trim(),
      genre: newSongForm.genre,
      situation: newSongForm.situation.trim(),
      tags: tagsArray,
      bpm: Number(newSongForm.bpm) || 95,
      raga: newSongForm.raga.trim() || 'Studio Custom Scale',
      duration: '3:30',
      status: 'Approved',
      shortlisted: false,
      directorNotes: newSongForm.directorNotes.trim() || `Uploaded under ${newSongForm.genre} Cloud Vault.`,
      audioFileName: newSongForm.audioFileName || 'AI Studio Synth Master',
      synthPreset: presetByGenre[newSongForm.genre] || 'melody_rain',
      createdAt: Date.now()
    };

    // Store audio blob locally in session memory for immediate playback
    if (newSongForm.audioBlobUrl) {
      setLocalAudioMap(prev => ({ ...prev, [songId]: newSongForm.audioBlobUrl }));
    }

    // Optimistic state update
    setSongs(prev => [newSongDoc, ...prev]);
    setShowUploadModal(false);
    setActiveCategory(newSongForm.genre);
    showToast(`"${newSongDoc.title}" saved to ${newSongDoc.genre} Cloud Storage!`, 'success');

    // Save to Firebase Firestore Cloud Storage
    if (user && db) {
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'studio_songs', songId);
        await setDoc(docRef, newSongDoc);
      } catch (err) {
        console.error('Error saving song to cloud:', err);
      }
    }
  };

  const toggleShortlist = async (song) => {
    const updated = !song.shortlisted;
    setSongs(prev => prev.map(s => s.id === song.id ? { ...s, shortlisted: updated } : s));
    showToast(updated ? `Added "${song.title}" to Director's Shortlist` : `Removed from Shortlist`, 'info');
    if (user && db) {
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'studio_songs', song.id);
        await updateDoc(docRef, { shortlisted: updated });
      } catch (err) {}
    }
  };

  const cycleApprovalStatus = async (song) => {
    const order = ['Approved', 'In Progress', 'Needs Remix'];
    const nextStatus = order[(order.indexOf(song.status) + 1) % order.length];
    setSongs(prev => prev.map(s => s.id === song.id ? { ...s, status: nextStatus } : s));
    if (user && db) {
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'studio_songs', song.id);
        await updateDoc(docRef, { status: nextStatus });
      } catch (err) {}
    }
  };

  const handleDeleteSong = async (songId) => {
    if (playingSongId === songId) stopAllPlayback();
    setSongs(prev => prev.filter(s => s.id !== songId));
    showToast('Song removed from Cloud Catalog.', 'info');
    if (user && db) {
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'studio_songs', songId);
        await deleteDoc(docRef);
      } catch (err) {}
    }
  };

  // ==========================================
  // 7. AI LYRICS & HOOK GENERATOR FOR SCENE
  // ==========================================
  const handleGenerateLyrics = async (e) => {
    e.preventDefault();
    if (!lyricsPrompt.trim()) return;
    setIsGeneratingLyrics(true);
    try {
      const payload = {
        contents: [{
          role: 'user',
          parts: [{
            text: `You are Lyricist & AI Assistant at Mumbai Kumar Studio.
Generate a catchy Tamil Cinema Pallavi (Hook Lines in Tanglish + Tamil script) and musical arrangement idea for this scene situation: "${lyricsPrompt}" in the "${lyricsGenre}" genre.`
          }]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              pallaviTanglish: { type: "STRING" },
              pallaviTamil: { type: "STRING" },
              instrumentationIdea: { type: "STRING" },
              suggestedBpmAndRaga: { type: "STRING" }
            },
            propertyOrdering: ["pallaviTanglish", "pallaviTamil", "instrumentationIdea", "suggestedBpmAndRaga"]
          }
        }
      };
      const res = await callGeminiAPI(payload);
      const parsed = JSON.parse(res.candidates[0].content.parts[0].text);
      setGeneratedLyrics(parsed);
    } catch (err) {
      setGeneratedLyrics({
        pallaviTanglish: "Mazhai thuli vizhum neram, manasukkul oru raagam...",
        pallaviTamil: "மழை துளி விழும் நேரம், மனசுக்குள் ஒரு ராகம்...",
        instrumentationIdea: "Solo violin intro followed by warm acoustic guitar and ambient pads.",
        suggestedBpmAndRaga: "86 BPM | Reethigowla / C Minor"
      });
    } finally {
      setIsGeneratingLyrics(false);
    }
  };

  // ==========================================
  // COMPUTED DISPLAY LISTS
  // ==========================================
  const counts = useMemo(() => ({
    All: songs.length,
    Melody: songs.filter(s => s.genre === 'Melody').length,
    Folk: songs.filter(s => s.genre === 'Folk').length,
    Bhakti: songs.filter(s => s.genre === 'Bhakti').length,
    Shortlist: songs.filter(s => s.shortlisted).length
  }), [songs]);

  const filteredSongs = useMemo(() => {
    let list = songs;
    if (activeCategory === 'Shortlist') {
      list = list.filter(s => s.shortlisted);
    } else if (activeCategory !== 'All') {
      list = list.filter(s => s.genre === activeCategory);
    }
    return list;
  }, [songs, activeCategory]);

  const activePlayingSong = useMemo(
    () => songs.find(s => s.id === playingSongId),
    [songs, playingSongId]
  );

  // Quick Situation Chips for 1-Click Testing
  const QUICK_SITUATIONS = [
    { label: '🌧️ Rainy Night Love Melody', query: 'Hero heroine rainy night romantic love melody kadhal scene' },
    { label: '💔 Heartbreak / Love Failure', query: 'Love failure heartbreak sad breakup walking alone night' },
    { label: '🥁 Hero Intro Village Kuthu', query: 'Hero mass introduction village festival kuthu dance urumi' },
    { label: '🔥 Kovil Thiruvizha Bhakti Climax', query: 'Kovil thiruvizha temple festival Amman fierce climax goosebumps' },
    { label: '👩‍👦 Amma Sentiment Scene', query: 'Mother sentiment emotional amma pasam family flashback' },
    { label: '🌅 Peaceful Morning Devotion', query: 'Peaceful morning temple prayer divine wedding blessing' }
  ];

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 font-sans pb-28 selection:bg-amber-500 selection:text-black">
      {/* Hidden HTML5 Audio Element for Custom Uploaded Files */}
      <audio ref={audioRef} onEnded={stopAllPlayback} className="hidden" />

      {/* Top Notification Toast */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/95 border border-amber-500/50 shadow-2xl shadow-amber-500/10 text-sm text-amber-200 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* ==========================================
          STUDIO TOP HEADER BAR
      ========================================== */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#090b10]/90 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          {/* Brand Logo & Studio Name */}
          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25 border border-amber-300/40">
              <Disc className={`w-7 h-7 text-slate-950 ${playingSongId ? 'animate-spin' : ''}`} />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#090b10]" title="Studio Online" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                  MUMBAI KUMAR STUDIO
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-full">
                  <Sparkles className="w-3 h-3" /> AI Music Director Hub
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Melody • Folk • Bhakti Cloud Vault & Scene Situation Matcher</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                  <Cloud className="w-3.5 h-3.5" />
                  {cloudSynced ? 'Cloud Synced' : 'Studio Ready'}
                </span>
              </p>
            </div>
          </div>

          {/* Right Action Toolbar (Useful Director Buttons) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* AI Lyrics & Scene Hook Generator Button */}
            <button
              onClick={() => setShowLyricsModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-xs sm:text-sm font-semibold transition-all"
              title="Generate instant Pallavi hook lines for a movie situation"
            >
              <Wand2 className="w-4 h-4 text-indigo-400" />
              <span>AI Lyrics / Hook Lab</span>
            </button>

            {/* Director's Shortlist Button */}
            <button
              onClick={() => setActiveCategory(activeCategory === 'Shortlist' ? 'All' : 'Shortlist')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                activeCategory === 'Shortlist'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800/70 hover:bg-slate-800 text-slate-200 border-slate-700'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Shortlist ({counts.Shortlist})</span>
            </button>

            {/* Pitch Mode Toggle (Client Presentation View) */}
            <button
              onClick={() => {
                setPitchMode(!pitchMode);
                showToast(!pitchMode ? 'Pitch Mode ON: Clean view for Film Directors & Producers' : 'Studio Admin Mode Restored');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                pitchMode
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title="Hide upload/delete buttons when presenting to a movie director"
            >
              {pitchMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>{pitchMode ? 'Pitch Mode: ON' : 'Director Pitch View'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* ==========================================
            SECTION 1: 3 DEDICATED GENRE CLOUD BOXES
            (Melody Song, Folk Song, Bhakti Song Separate Upload & Filter)
        ========================================== */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              1. Category Cloud Vaults (Select Genre or Upload Directly)
            </h2>
            {activeCategory !== 'All' && (
              <button
                onClick={() => setActiveCategory('All')}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1"
              >
                Show All {counts.All} Songs
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* MELODY SONGS CARD */}
            <div
              onClick={() => setActiveCategory('Melody')}
              className={`cursor-pointer group relative overflow-hidden rounded-2xl p-5 border transition-all ${
                activeCategory === 'Melody'
                  ? 'bg-gradient-to-br from-cyan-950/80 via-slate-900 to-slate-900 border-cyan-400 shadow-xl shadow-cyan-500/15'
                  : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-cyan-500/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    <Heart className="w-3.5 h-3.5" /> MELODY SONGS
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2.5">Melody Cloud Vault</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Romantic, Rainy Night, Mother Sentiment & Heartbreak Melodies
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-cyan-400">{counts.Melody}</span>
                  <span className="block text-[10px] uppercase tracking-wider text-slate-400">Tracks</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-xs text-cyan-300 font-medium group-hover:translate-x-0.5 transition-transform">
                  {activeCategory === 'Melody' ? '✓ Viewing Melody Songs' : 'Click to filter Melody →'}
                </span>
                {!pitchMode && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openUploadForGenre('Melody');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    + Upload Melody
                  </button>
                )}
              </div>
            </div>

            {/* FOLK SONGS CARD */}
            <div
              onClick={() => setActiveCategory('Folk')}
              className={`cursor-pointer group relative overflow-hidden rounded-2xl p-5 border transition-all ${
                activeCategory === 'Folk'
                  ? 'bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-900 border-amber-400 shadow-xl shadow-amber-500/15'
                  : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-amber-500/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Radio className="w-3.5 h-3.5" /> FOLK SONGS
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2.5">Folk & Kuthu Vault</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Hero Mass Intro, Urumi Melam, Village Celebration & Rural Folk
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-400">{counts.Folk}</span>
                  <span className="block text-[10px] uppercase tracking-wider text-slate-400">Tracks</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-xs text-amber-300 font-medium group-hover:translate-x-0.5 transition-transform">
                  {activeCategory === 'Folk' ? '✓ Viewing Folk Songs' : 'Click to filter Folk →'}
                </span>
                {!pitchMode && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openUploadForGenre('Folk');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    + Upload Folk
                  </button>
                )}
              </div>
            </div>

            {/* BHAKTI SONGS CARD */}
            <div
              onClick={() => setActiveCategory('Bhakti')}
              className={`cursor-pointer group relative overflow-hidden rounded-2xl p-5 border transition-all ${
                activeCategory === 'Bhakti'
                  ? 'bg-gradient-to-br from-rose-950/80 via-slate-900 to-slate-900 border-rose-400 shadow-xl shadow-rose-500/15'
                  : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-rose-500/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    <Sparkles className="w-3.5 h-3.5" /> BHAKTI SONGS
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2.5">Bhakti & Divine Vault</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Kovil Thiruvizha Climax, Amman Fierce Beats & Peaceful Devotion
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-rose-400">{counts.Bhakti}</span>
                  <span className="block text-[10px] uppercase tracking-wider text-slate-400">Tracks</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-xs text-rose-300 font-medium group-hover:translate-x-0.5 transition-transform">
                  {activeCategory === 'Bhakti' ? '✓ Viewing Bhakti Songs' : 'Click to filter Bhakti →'}
                </span>
                {!pitchMode && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openUploadForGenre('Bhakti');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs shadow-md transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    + Upload Bhakti
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            SECTION 2: PROMINENT AI SITUATION SEARCH BOX
            (Type scene situation -> Finds & ranks Mumbai Kumar's uploaded songs)
        ========================================== */}
        <section className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-[#101420] to-slate-900 border border-amber-500/30 shadow-2xl shadow-amber-500/5">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Film className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-white">
                    Director's Scene Situation Finder (AI Song Matcher)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Yarachum song ketta, antha movie situation-ah (Tanglish or English-la) type pannunga — namma upload panna songs-la irunthu exact match கீழே காட்டும்!
                  </p>
                </div>
              </div>
              {aiMatchedResults && (
                <button
                  onClick={() => {
                    setSituationQuery('');
                    setAiMatchedResults(null);
                    setAiSummaryText('');
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Clear Search
                </button>
              )}
            </div>

            {/* Search Input Box */}
            <form onSubmit={(e) => handleSituationSearch(e)} className="relative mt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-amber-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={situationQuery}
                    onChange={(e) => setSituationQuery(e.target.value)}
                    placeholder="Type Scene Situation... e.g., 'Hero love failure rain scene', 'Kovil thiruvizha climax', 'Village mass intro'"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-950/90 border border-slate-700 focus:border-amber-400 focus:outline-none text-sm sm:text-base text-white placeholder-slate-500 shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearchingAI}
                  className="px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all shrink-0"
                >
                  {isSearchingAI ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Matching Scene...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Find Situation Songs</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick 1-Click Scene Situation Chips */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1">
                Try Situation:
              </span>
              {QUICK_SITUATIONS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSituationSearch(null, chip.query)}
                  className="text-xs px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-amber-500/20 hover:text-amber-300 hover:border-amber-500/40 text-slate-300 border border-slate-700/80 transition-all"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* ==========================================
                AI SITUATION MATCHED RESULTS PANEL (DISPLAYED RIGHT BELOW SEARCH)
            ========================================== */}
            {aiMatchedResults !== null && (
              <div className="mt-6 pt-6 border-t border-slate-800/90">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <h3 className="text-sm sm:text-base font-bold text-amber-300">
                      Situation Matched Songs from Mumbai Kumar Studio ({aiMatchedResults.length})
                    </h3>
                  </div>
                  {aiSummaryText && (
                    <p className="text-xs text-slate-300 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
                      {aiSummaryText}
                    </p>
                  )}
                </div>

                {aiMatchedResults.length === 0 ? (
                  <div className="text-center py-8 bg-slate-950/60 rounded-2xl border border-slate-800">
                    <p className="text-sm text-slate-400">
                      No matching songs found for this situation yet. Click "+ Upload" above to add a track for this scene!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiMatchedResults.map((match) => {
                      const song = songs.find(s => s.id === match.songId);
                      if (!song) return null;
                      const isPlaying = playingSongId === song.id;

                      return (
                        <div
                          key={song.id}
                          className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                            isPlaying
                              ? 'bg-gradient-to-r from-amber-950/70 to-slate-900 border-amber-400 shadow-lg shadow-amber-500/15'
                              : 'bg-slate-950/80 border-slate-800 hover:border-amber-500/50'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                song.genre === 'Melody'
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                  : song.genre === 'Folk'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}>
                                {song.genre} Song
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                {match.matchScore}% Scene Match
                              </span>
                            </div>

                            <h4 className="text-base font-bold text-white flex items-center gap-2">
                              {song.title}
                            </h4>

                            <p className="text-xs text-amber-200/90 mt-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5">
                              <strong className="text-amber-400">Why it fits this situation:</strong> {match.reason}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                            <button
                              onClick={() => togglePlaySong(song)}
                              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                                isPlaying
                                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                                  : 'bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white'
                              }`}
                            >
                              {isPlaying ? (
                                <>
                                  <Pause className="w-4 h-4 fill-current" />
                                  <span>Playing Preview... (Pause)</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 fill-current" />
                                  <span>Play Song for Director</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => toggleShortlist(song)}
                              className={`p-2.5 rounded-xl border transition-all ${
                                song.shortlisted
                                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                              }`}
                              title="Bookmark to Director's Shortlist"
                            >
                              <Bookmark className="w-4 h-4 fill-current" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ==========================================
            SECTION 3: FULL STUDIO SONG CATALOG & FILTER TABS
        ========================================== */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            {/* Genre Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'All', label: 'All Studio Songs', count: counts.All },
                { id: 'Melody', label: 'Melody Songs', count: counts.Melody },
                { id: 'Folk', label: 'Folk Songs', count: counts.Folk },
                { id: 'Bhakti', label: 'Bhakti Songs', count: counts.Bhakti },
                { id: 'Shortlist', label: '★ Director Shortlist', count: counts.Shortlist }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 border ${
                    activeCategory === tab.id
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                    activeCategory === tab.id ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* General Upload Button */}
            {!pitchMode && (
              <button
                onClick={() => openUploadForGenre(activeCategory === 'Folk' || activeCategory === 'Bhakti' ? activeCategory : 'Melody')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Upload New AI Song to Cloud</span>
              </button>
            )}
          </div>

          {/* Song Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSongs.map((song) => {
              const isPlaying = playingSongId === song.id;
              const genreColors = {
                Melody: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
                Folk: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
                Bhakti: 'border-rose-500/30 bg-rose-500/10 text-rose-300'
              };

              return (
                <div
                  key={song.id}
                  className={`group rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                    isPlaying
                      ? 'bg-gradient-to-b from-slate-900 via-[#151928] to-slate-900 border-amber-400 shadow-xl shadow-amber-500/15'
                      : 'bg-slate-900/75 hover:bg-slate-900 border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Top Badges: Genre, Status & Shortlist */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${genreColors[song.genre] || genreColors.Melody}`}>
                        {song.genre} Song
                      </span>

                      <div className="flex items-center gap-1.5">
                        {/* Clickable Approval Status Badge */}
                        <button
                          onClick={() => !pitchMode && cycleApprovalStatus(song)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 border ${
                            song.status === 'Approved'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : song.status === 'In Progress'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          }`}
                          title="Click to change track status"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{song.status || 'Approved'}</span>
                        </button>

                        <button
                          onClick={() => toggleShortlist(song)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            song.shortlisted
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                              : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                          }`}
                          title="Add to Director Shortlist"
                        >
                          <Bookmark className="w-3.5 h-3.5 fill-current" />
                        </button>

                        {!pitchMode && (
                          <button
                            onClick={() => handleDeleteSong(song.id)}
                            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 transition-colors"
                            title="Delete Song from Cloud"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Song Title */}
                    <h3 className="text-lg font-extrabold text-white group-hover:text-amber-300 transition-colors">
                      {song.title}
                    </h3>

                    {/* Situation Box */}
                    <div className="mt-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800/90">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                        🎬 Movie Scene Situation:
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {song.situation}
                      </p>
                    </div>

                    {/* Situation Tags */}
                    {song.tags && song.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {song.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            onClick={() => handleSituationSearch(null, tag)}
                            className="cursor-pointer px-2 py-0.5 rounded-md text-[11px] bg-slate-800/90 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700/70 transition-colors"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Technical Metadata (BPM, Raga, Notes) */}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Sliders className="w-3 h-3 text-amber-400" /> {song.bpm || 90} BPM
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Music className="w-3 h-3 text-cyan-400" /> {song.raga || 'Studio Scale'}
                      </span>
                    </div>

                    {song.directorNotes && (
                      <p className="mt-2 text-[11px] italic text-slate-400">
                        Note: "{song.directorNotes}"
                      </p>
                    )}
                  </div>

                  {/* Audio Waveform & Play Button Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    {/* Animated Studio Equalizer Bars */}
                    <div className="flex items-end gap-1 h-6 mb-3 px-1">
                      {[18, 45, 75, 35, 90, 60, 40, 85, 50, 95, 65, 30, 80, 55, 70, 40, 60, 35, 75, 50].map((h, i) => (
                        <div
                          key={i}
                          style={{
                            height: isPlaying ? `${Math.max(20, (h + playbackProgress * 7) % 100)}%` : `${h * 0.4}%`
                          }}
                          className={`flex-1 rounded-full transition-all duration-300 ${
                            isPlaying ? 'bg-amber-400' : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => togglePlaySong(song)}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                        isPlaying
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20'
                          : 'bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-100'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 fill-current" />
                          <span>Playing Studio Track (Click to Pause)</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Play Song ({song.duration || '3:30'})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ==========================================
          BOTTOM PERSISTENT STUDIO PLAYER BAR
      ========================================== */}
      {activePlayingSong && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-amber-500/40 px-4 sm:px-8 py-3 shadow-2xl">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => togglePlaySong(activePlayingSong)}
                className="w-11 h-11 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center shadow-lg"
              >
                <Pause className="w-5 h-5 fill-current" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-white">{activePlayingSong.title}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {activePlayingSong.genre}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-1 max-w-md">
                  Situation: {activePlayingSong.situation}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex-1 max-w-md hidden md:flex items-center gap-3">
              <span className="text-[11px] text-amber-400 font-mono">LIVE SYNTH</span>
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-cyan-400 transition-all duration-300"
                  style={{ width: `${playbackProgress}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-400 font-mono">{activePlayingSong.bpm} BPM</span>
            </div>

            {/* Volume & Stop Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              </button>
              <button
                onClick={stopAllPlayback}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 1: UPLOAD AI SONG TO CLOUD STORAGE
          (Supports Melody, Folk, Bhakti separate cloud upload)
      ========================================== */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">
                    Upload AI Song to Cloud Storage
                  </h3>
                  <p className="text-xs text-slate-400">
                    Mumbai Kumar Studio • Save under Melody, Folk, or Bhakti
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSongSubmit} className="space-y-4 mt-5">
              {/* Select Category Vault: Melody, Folk, or Bhakti */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  1. Select Song Category Vault *
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {['Melody', 'Folk', 'Bhakti'].map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setNewSongForm(prev => ({ ...prev, genre: cat }))}
                      className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all ${
                        newSongForm.genre === cat
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {cat} Song
                    </button>
                  ))}
                </div>
              </div>

              {/* Song Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  2. Song Title *
                </label>
                <input
                  type="text"
                  required
                  value={newSongForm.title}
                  onChange={(e) => setNewSongForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Vennila Mazhaiye (AI Vocal Master)"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Audio File Input (Optional - Works with local MP3/WAV or built-in Studio Synth) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  3. Select Audio File (MP3 / WAV) or Use Studio Synth
                </label>
                <label className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-950 border border-dashed border-slate-700 hover:border-amber-400 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <FileAudio className="w-5 h-5 text-amber-400" />
                    <span>
                      {newSongForm.audioFileName
                        ? `Selected: ${newSongForm.audioFileName}`
                        : 'Click to attach MP3/WAV file (or leave blank for AI Studio Synth)'}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-semibold text-amber-300">
                    Browse Audio
                  </span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioFileSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Movie Scene Situation Description + AI Auto-Tagger */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    4. Movie Scene Situation (For Search Matching) *
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoGenerateSituationTags}
                    disabled={isGeneratingTags}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isGeneratingTags ? 'Generating...' : 'AI Auto-Fill Situation & Tags'}
                  </button>
                </div>
                <textarea
                  rows={3}
                  required
                  value={newSongForm.situation}
                  onChange={(e) => setNewSongForm(prev => ({ ...prev, situation: e.target.value }))}
                  placeholder="Describe when this song should play... e.g., Hero & Heroine walking in rain, Kovil thiruvizha fight climax, Village kuthu intro"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Tags, BPM & Raga */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Tempo (BPM)
                  </label>
                  <input
                    type="number"
                    value={newSongForm.bpm}
                    onChange={(e) => setNewSongForm(prev => ({ ...prev, bpm: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Raga / Musical Scale
                  </label>
                  <input
                    type="text"
                    value={newSongForm.raga}
                    onChange={(e) => setNewSongForm(prev => ({ ...prev, raga: e.target.value }))}
                    placeholder="e.g., Reethigowla / C Minor"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Search Keywords / Tags (Comma Separated)
                </label>
                <input
                  type="text"
                  value={newSongForm.tags}
                  onChange={(e) => setNewSongForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g., Rain, Love, Kadhal, Night, Melody"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg"
                >
                  <Cloud className="w-4 h-4" />
                  <span>Save to {newSongForm.genre} Cloud</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 2: AI LYRICS & SCENE HOOK GENERATOR
          (Extra Useful Tool for Music Director)
      ========================================== */}
      {showLyricsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">
                    Mumbai Kumar AI Lyrics & Scene Hook Lab
                  </h3>
                  <p className="text-xs text-slate-400">
                    Generate instant Tamil/Tanglish Pallavi hook lines & orchestration ideas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLyricsModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateLyrics} className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-2">
                {['Melody', 'Folk', 'Bhakti'].map(g => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setLyricsGenre(g)}
                    className={`py-2 rounded-xl text-xs font-bold border ${
                      lyricsGenre === g
                        ? 'bg-indigo-500 text-white border-indigo-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {g} Style
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                  Describe Movie Situation for Hook Lines
                </label>
                <input
                  type="text"
                  value={lyricsPrompt}
                  onChange={(e) => setLyricsPrompt(e.target.value)}
                  placeholder="e.g., Hero seeing heroine at temple festival under lamps..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-indigo-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isGeneratingLyrics}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGeneratingLyrics ? 'Composing Hook Lines...' : 'Generate Pallavi & Music Notes'}</span>
              </button>
            </form>

            {generatedLyrics && (
              <div className="mt-5 p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-indigo-400">Pallavi (Tamil):</span>
                  <p className="text-sm font-bold text-white mt-0.5">{generatedLyrics.pallaviTamil}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-400">Pallavi (Tanglish):</span>
                  <p className="text-sm text-amber-200 mt-0.5">{generatedLyrics.pallaviTanglish}</p>
                </div>
                <div className="pt-2 border-t border-slate-800 text-xs text-slate-300 space-y-1">
                  <p><strong className="text-slate-200">Orchestration:</strong> {generatedLyrics.instrumentationIdea}</p>
                  <p><strong className="text-slate-200">Suggested Scale & Tempo:</strong> {generatedLyrics.suggestedBpmAndRaga}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}