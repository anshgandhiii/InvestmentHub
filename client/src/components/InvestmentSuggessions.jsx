"use client"

import { useState, useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"
import axios from "axios"
import remarkGfm from "remark-gfm"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, Send, Sparkles, X, Volume2, VolumeX } from "lucide-react"

const InvestmentSuggestions = () => {
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("")
  const [displayResponse, setDisplayResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [showExamples, setShowExamples] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const responseContainerRef = useRef(null)
  const speechSynthesisRef = useRef(null)
  const currentSentenceRef = useRef("")
  const sentencesQueueRef = useRef([])

  const examplePrompts = [
    "My age is 19 and I want an investment plan for 3 years from now to plan my masters in the United States.",
    "Past stock trends/analysis of Microsoft stocks.",
    "Compare the market performance of Amazon and Snapdeal stocks.",
    "Which is better: SIP or bonds?",
  ]

  // Function to split text into sentences
  const splitIntoSentences = (text) => {
    // Split by common sentence terminators but keep the terminators
    return text.split(/(?<=[.!?])\s+/).filter((sentence) => sentence.trim().length > 0)
  }

  // Function to speak text
  const speakText = (text) => {
    if (isMuted || !text || text.trim() === "") return

    // Cancel any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    // Get available voices and set a good one if available
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(
      (voice) => voice.name.includes("Google") || voice.name.includes("English") || voice.name.includes("US"),
    )

    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => {
      setIsSpeaking(false)
      // Speak the next sentence in queue if available
      if (sentencesQueueRef.current.length > 0) {
        const nextSentence = sentencesQueueRef.current.shift()
        speakText(nextSentence)
      }
    }

    speechSynthesisRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  // Toggle mute function
  const toggleMute = () => {
    if (isSpeaking && !isMuted) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
    setIsMuted(!isMuted)
  }

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      setResponse("Please enter a prompt.")
      return
    }
    setLoading(true)
    setResponse("")
    setDisplayResponse("")

    // Clear any previous speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    sentencesQueueRef.current = []
    currentSentenceRef.current = ""

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/finance-agent/", { prompt })
      setResponse(res.data.content)
      setIsTyping(true)

      // Prepare sentences for speech
      sentencesQueueRef.current = splitIntoSentences(res.data.content)
    } catch (error) {
      console.error("Error:", error)
      setResponse("An error occurred while fetching the response.")
      setIsTyping(true)

      // Prepare error message for speech
      sentencesQueueRef.current = ["An error occurred while fetching the response."]
    }
    setLoading(false)
  }

  useEffect(() => {
    // Initialize speech synthesis voices
    if (window.speechSynthesis) {
      // Some browsers need this to load voices
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices()
      }
    }

    return () => {
      // Cleanup speech synthesis on component unmount
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  useEffect(() => {
    if (isTyping && response) {
      let i = 0
      let currentSentenceIndex = 0
      const currentSentenceText = ""
      const sentences = splitIntoSentences(response)

      const typingInterval = setInterval(() => {
        if (i <= response.length) {
          const newDisplayText = response.substring(0, i)
          setDisplayResponse(newDisplayText)

          // Check if we've completed a sentence
          if (
            i > 0 &&
            (response[i - 1] === "." || response[i - 1] === "!" || response[i - 1] === "?") &&
            (i === response.length || response[i] === " ")
          ) {
            if (currentSentenceIndex < sentences.length) {
              const sentenceToSpeak = sentences[currentSentenceIndex]

              // If not muted and not already speaking, speak the first sentence
              if (!isMuted && currentSentenceIndex === 0) {
                speakText(sentenceToSpeak)
              }
              // Otherwise add to queue
              else if (!isMuted && currentSentenceIndex > 0) {
                sentencesQueueRef.current.push(sentenceToSpeak)
              }

              currentSentenceIndex++
            }
          }

          i++

          // Auto-scroll as text is being typed
          if (responseContainerRef.current) {
            responseContainerRef.current.scrollTop = responseContainerRef.current.scrollHeight
          }
        } else {
          clearInterval(typingInterval)
          setIsTyping(false)
        }
      }, 10) // Adjust typing speed here

      return () => clearInterval(typingInterval)
    }
  }, [response, isTyping, isMuted])

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-white to-blue-50">
      <div className="max-w-4xl mx-auto w-full px-4 pt-6 flex-1 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 text-center"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
            Financial Intelligence Assistant
          </h1>
          <p className="text-blue-600 mt-2">Get AI-powered insights for your investment decisions</p>
        </motion.div>

        <div className="relative">
          <div
            ref={responseContainerRef}
            className="h-[calc(100vh-320px)] overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent rounded-xl shadow-lg bg-white p-6 border border-blue-100"
          >
            <AnimatePresence>
              {displayResponse ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-blue-900">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-4 rounded-lg border border-blue-200 bg-blue-50">
                          <table className="min-w-full border-collapse" {...props} />
                        </div>
                      ),
                      thead: ({ node, ...props }) => <thead className="bg-blue-100" {...props} />,
                      tr: ({ node, ...props }) => <tr className="border-b border-blue-200" {...props} />,
                      th: ({ node, ...props }) => (
                        <th className="p-3 text-left font-semibold text-blue-800" {...props} />
                      ),
                      td: ({ node, ...props }) => (
                        <td className="p-3 border-r border-blue-200 text-blue-700" {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc pl-6 my-4 space-y-2 text-blue-700" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className="list-decimal pl-6 my-4 space-y-2 text-blue-700" {...props} />
                      ),
                      li: ({ node, ...props }) => <li className="my-1" {...props} />,
                      h1: ({ node, ...props }) => <h1 className="text-2xl font-bold my-4 text-blue-800" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-xl font-bold my-3 text-blue-800" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-lg font-bold my-2 text-blue-800" {...props} />,
                      p: ({ node, ...props }) => <p className="my-3 text-blue-700 leading-relaxed" {...props} />,
                      code: ({ node, inline, ...props }) =>
                        inline ? (
                          <code className="bg-blue-50 px-1 py-0.5 rounded text-blue-800" {...props} />
                        ) : (
                          <code
                            className="block bg-blue-50 p-3 rounded-lg my-3 text-blue-800 overflow-x-auto"
                            {...props}
                          />
                        ),
                    }}
                  >
                    {displayResponse}
                  </ReactMarkdown>
                  {isTyping && (
                    <div className="flex space-x-2 mt-4 text-blue-500">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-75"></div>
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-150"></div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center"
                >
                  <Sparkles className="w-12 h-12 text-blue-500 mb-4 opacity-50" />
                  <p className="text-blue-600 italic">Your AI-generated financial insights will appear here...</p>
                  <p className="text-blue-500/60 text-sm mt-2 max-w-md">
                    Ask about investment strategies, stock analysis, financial planning, or market comparisons
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Audio control button */}
          <button
            onClick={toggleMute}
            className="absolute top-4 right-4 p-2 rounded-full bg-white border border-blue-200 shadow-md hover:bg-blue-50 transition-colors"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-blue-600" /> : <Volume2 className="w-5 h-5 text-blue-600" />}
          </button>
        </div>

        <div className="sticky bottom-0 bg-gradient-to-t from-white to-transparent pt-8 pb-4">
          <div className="relative">
            {showExamples && (
              <div className="absolute bottom-full w-full mb-2 z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                  {examplePrompts.map((example, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      onClick={() => {
                        setPrompt(example)
                        setShowExamples(false)
                      }}
                      className="p-3 rounded-lg border border-blue-300 bg-white hover:bg-blue-50 hover:border-blue-400 transition-all text-sm text-blue-700 text-left shadow-md hover:shadow-lg"
                    >
                      {example}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowExamples(!showExamples)}
              className="w-full mb-4 px-4 py-2 text-sm text-blue-600 font-medium bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-all shadow-md flex items-center justify-center"
            >
              {showExamples ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" /> Hide Examples
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" /> Show Example Queries
                </>
              )}
            </motion.button>

            <div className="flex gap-4">
              <div className="relative flex-1">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about investments, stocks, or financial planning..."
                  className="w-full p-4 rounded-xl border-2 border-blue-300 bg-white text-blue-800 shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none transition-all placeholder:text-blue-400"
                  rows="2"
                />
                {prompt && (
                  <button
                    onClick={() => setPrompt("")}
                    className="absolute right-3 top-3 text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={loading}
                className={`self-end h-[56px] px-6 rounded-xl text-white font-medium transition-all ${
                  loading
                    ? "bg-blue-400"
                    : "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
                } shadow-lg hover:shadow-blue-300/50`}
              >
                {loading ? (
                  <div className="flex items-center justify-center w-6 h-6">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvestmentSuggestions

