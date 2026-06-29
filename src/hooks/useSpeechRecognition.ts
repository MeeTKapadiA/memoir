'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

type SpeechRecognitionResultLike = {
  0: {
    transcript: string
  }
}

type SpeechRecognitionEventLike = {
  results: Iterable<SpeechRecognitionResultLike>
}

type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor
  webkitSpeechRecognition?: SpeechRecognitionConstructor
}

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const speechWindow = window as SpeechRecognitionWindow
    const SR = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition
    setIsSupported(!!SR)
    if (!SR) return
    const r = new SR()
    r.continuous = true
    r.interimResults = true
    r.onresult = (e) => {
      const text = Array.from(e.results).map((res) => res[0].transcript).join('')
      setTranscript(text)
    }
    r.onend = () => setIsListening(false)
    recognitionRef.current = r
  }, [])

  const start = useCallback(() => { recognitionRef.current?.start(); setIsListening(true) }, [])
  const stop = useCallback(() => { recognitionRef.current?.stop(); setIsListening(false) }, [])
  const reset = useCallback(() => setTranscript(''), [])

  return { transcript, isListening, isSupported, start, stop, reset, setTranscript }
}
