import { useState, useEffect, useRef } from 'react'
import { createDraggable, animate } from 'animejs'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import './App.css'
import './index.css'

// Fixes Leaflet's marker icon not loading correctly under Vite's bundler.
// One-time setup, not something you need to edit.
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Metro Manila cities with approximate center coordinates.
// This is just a plain array of objects — same shape as your
// original candidates list from the voting dashboard practice.
const metroManilaCities = [
  { name: 'Manila', lat: 14.5995, lng: 120.9842 },
  { name: 'Quezon City', lat: 14.6760, lng: 121.0437 },
  { name: 'Makati', lat: 14.5547, lng: 121.0244 },
  { name: 'Pasig', lat: 14.5764, lng: 121.0851 },
  { name: 'Taguig', lat: 14.5176, lng: 121.0509 },
  { name: 'Mandaluyong', lat: 14.5794, lng: 121.0359 },
  { name: 'San Juan', lat: 14.6019, lng: 121.0355 },
  { name: 'Marikina', lat: 14.6507, lng: 121.1029 },
  { name: 'Muntinlupa', lat: 14.4081, lng: 121.0415 },
  { name: 'Parañaque', lat: 14.4793, lng: 121.0198 },
  { name: 'Las Piñas', lat: 14.4499, lng: 120.9829 },
  { name: 'Pasay', lat: 14.5378, lng: 121.0014 },
  { name: 'Caloocan', lat: 14.6488, lng: 120.9838 },
  { name: 'Malabon', lat: 14.6681, lng: 120.9569 },
  { name: 'Navotas', lat: 14.6667, lng: 120.9437 },
  { name: 'Valenzuela', lat: 14.7011, lng: 120.9830 },
  { name: 'Pateros', lat: 14.5432, lng: 121.0687 },
]

// One blue temperature bubble for ONE city.
// This component fetches its own data, independently of every other city.
function CityTempMarker({ city }) {
  const [temp, setTemp] = useState(null)

  useEffect(() => {
    async function fetchCityTemp() {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lng}&current_weather=true`
        )
        const data = await response.json()
        if (data?.current_weather?.temperature !== undefined) {
          setTemp(data.current_weather.temperature)
        }
      } catch (error) {
        console.error(`Failed to fetch temp for ${city.name}:`, error)
      }
    }

    fetchCityTemp()
    const interval = setInterval(fetchCityTemp, 60000) // refresh every minute
    return () => clearInterval(interval)
  }, [city])

  // divIcon = your own HTML/CSS used as the marker, instead of Leaflet's default pin.
  const icon = L.divIcon({
    className: 'city-temp-bubble', // kept mostly empty in CSS - see .city-temp-inner below
    html: `<div class="city-temp-inner">
             <span class="city-name">${city.name}</span>
             <span class="city-temp">${temp !== null ? temp + '°C' : '...'}</span>
           </div>`,
    iconSize: [90, 40],
    iconAnchor: [45, 40], // point of the icon that lines up with the actual coordinates
  })

  return <Marker position={[city.lat, city.lng]} icon={icon} />
}

// Moves the map to a new position whenever `position` changes.
// Must be rendered INSIDE <MapContainer> - useMap() only works in that context.
// Renders nothing itself (returns null) - it only exists to run this effect.
function FlyToLocation({ position }) {
  const map = useMap()

  useEffect(() => {
    if (position) {
      map.flyTo(position, 13)
    }
  }, [position, map])

  return null
}

function App() {
  const squareRef = useRef(null)
  const [makatitemp, setMakatiTemp] = useState('Loading...')

  const [searchQuery, setSearchQuery] = useState('')
  const [searchedPosition, setSearchedPosition] = useState(null)
  const [searchError, setSearchError] = useState(null)

  const makati = [14.5547, 121.0244]

  async function fetchtemp() {
    try {
      const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=14.5503&longitude=121.0327&current_weather=true'
      )
      const data = await response.json()
      if (data?.current_weather?.temperature !== undefined) {
        setMakatiTemp(data.current_weather.temperature)
      }
    } catch (error) {
      console.error('Failed to fetch temperature:', error)
    }
  }

  useEffect(() => {
    fetchtemp()
    const interval = setInterval(fetchtemp, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!squareRef.current) return
    const draggable = createDraggable(squareRef.current)
    return () => {
      draggable.revert()
    }
  }, [])

  async function handleSearch(e) {
    e.preventDefault() // stops the form from doing a full page reload
    if (!searchQuery.trim()) return

    try {
      setSearchError(null)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=ph&limit=1`
      )
      const results = await response.json()

      if (results.length === 0) {
        setSearchError('Location not found')
        return
      }

      const { lat, lon } = results[0]
      setSearchedPosition([parseFloat(lat), parseFloat(lon)])
    } catch (error) {
      console.error('Search failed:', error)
      setSearchError('Search failed, try again')
    }
  }

  return (
    <div className="app">
      <div className="andrews">andrew's design play ground</div>

      <div className="square liquid-glass draggable"  ref={squareRef}>

        
        <div>{makatitemp}°C 
          <br> 
          </br>
          in makati
        </div>

      </div>

      
      <form className="search-bar liquid-glass draggable" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search "
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        {searchError && <div className="search-error">{searchError}</div>}



      <div className="map-wrapper ">
        
        <MapContainer
          center={makati}
          zoom={11}
          zoomControl={false}
          attributionControl={false}
          style={{ height: '100%' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          />

          {metroManilaCities.map((city) => (
            <CityTempMarker key={city.name} city={city} />
          ))}

          {searchedPosition && (
            <Marker position={searchedPosition}>
              <Popup>{searchQuery}</Popup>
            </Marker>
          )}

          <FlyToLocation position={searchedPosition} />
        </MapContainer>
      </div>
    </div>
  )
}

export default App