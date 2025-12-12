import { useEffect, useState } from 'react'

const useSoundEffect = url => {
    const [audio] = useState(new Audio(url))
    const [playing, setPlaying] = useState(false)

    const play = () => setPlaying(true)

    useEffect(() => {
        if (playing) {
            audio.play()
        } else {
            audio.pause()
        }
    }, [audio, playing])

    useEffect(() => {
        audio.addEventListener('ended', () => setPlaying(false))
        return () => {
            audio.removeEventListener('ended', () => setPlaying(false))
        }
    }, [audio])

    return [play]
}

export default useSoundEffect
