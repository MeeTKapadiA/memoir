'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setIsSupported(!!SR)
    if (!SR) return
    const r = new SR()
    r.continuous = true
    r.interimResults = true
    r.onresult = (e: any) => {
      const text = Array.from(e.results).map((res: any) => res[0].transcript).join('')
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
