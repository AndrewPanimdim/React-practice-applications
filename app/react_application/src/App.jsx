import { useState, useEffect } from 'react'
import { animate, random } from 'animejs'
import './App.css'

function App() {
  const [fact, setFact] = useState('cat facts')
  const [makatitemp, setMakatiTemp] = useState('current temperature in makati')
  
  async function fetchfact() {
    const response = await fetch('https://catfact.ninja/fact')
    const data = await response.json()
    setFact(data.fact)
  }

  async function fetchMakatiTemp() {
    const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m&current=is_day,apparent_temperature,wind_direction_10m,wind_speed_10m,temperature_2m')
    const data = await response.json()
    setMakatiTemp(data.current_weather.temperature)
  }

  useEffect(() => {
    fetchfact()
    const interval = setInterval(fetchfact, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchMakatiTemp()
    const interval = setInterval(fetchMakatiTemp, 10000)
    return () => clearInterval(interval)
  }, [])


  useEffect(() => {
  animate('.shape', {
    x: random(-100, 100),
    y: random(-100, 100),
    rotate: random(-180, 180),
    duration: random(500, 1000),
    composition: 'blend',
  })
}, [])

  return (
    <div className="app">
      
      
      <div className="fact">{fact}</div>
      
      <div className="makati-info">


        <div>{makatitemp}°C</div>

      </div>
    </div>
  )
}

export default App


