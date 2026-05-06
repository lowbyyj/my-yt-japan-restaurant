import { useEffect, useMemo, useState } from "react";
import { Icon, type LatLngExpression } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { DataStatus, PublicPlace } from "./types";

const DEFAULT_CENTER: LatLngExpression = [36.2048, 138.2529];
const DEFAULT_STATUS: DataStatus = {
  dataGenerated: false,
  reason: "YOUTUBE_API_KEY not provided",
  generatedAt: null,
  channelHandle: "@space_tamnik",
  videosScanned: 0,
  likelyShorts: 0,
  ownerCommentCandidates: 0,
  japanCandidates: 0,
  geocoded: 0,
  published: 0,
  excludedNegativeSignal: 0,
  needsGeocode: 0,
  heldBack: 0,
};

const markerIcon = new Icon({
  iconUrl:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 34 42"><path fill="#d94841" stroke="#842421" stroke-width="2" d="M17 1C8.2 1 1.5 7.7 1.5 16.4c0 10.6 13.4 23 15.5 24.9 2.1-1.9 15.5-14.3 15.5-24.9C32.5 7.7 25.8 1 17 1Z"/><circle cx="17" cy="16" r="6" fill="#fff7ed"/></svg>`,
    ),
  iconSize: [34, 42],
  iconAnchor: [17, 40],
  popupAnchor: [0, -36],
});

function SelectedMapFocus({ place }: { place?: PublicPlace }) {
  const map = useMap();

  useEffect(() => {
    if (!place) return;
    map.flyTo([place.lat, place.lng], Math.max(map.getZoom(), 14), {
      duration: 0.8,
    });
  }, [map, place]);

  return null;
}

function formatConfidence(confidence: number) {
  return `${Math.round(confidence * 100)}%`;
}

function normalizeForSearch(value: string) {
  return value.trim().toLowerCase();
}

function mapSearchUrl(place: PublicPlace) {
  if (place.googleMapsUrl) return place.googleMapsUrl;
  const query = [place.nameLocal, place.nameKoOrOriginal, place.city, "Japan"]
    .filter(Boolean)
    .join(" ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function App() {
  const [places, setPlaces] = useState<PublicPlace[]>([]);
  const [status, setStatus] = useState<DataStatus>(DEFAULT_STATUS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const [category, setCategory] = useState("all");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [placesResponse, statusResponse] = await Promise.all([
          fetch(`${import.meta.env.BASE_URL}data/places.json`),
          fetch(`${import.meta.env.BASE_URL}data/data_status.json`),
        ]);

        if (!placesResponse.ok) {
          throw new Error(`places.json ${placesResponse.status}`);
        }

        const loadedPlaces = (await placesResponse.json()) as PublicPlace[];
        setPlaces(loadedPlaces);

        if (statusResponse.ok) {
          setStatus((await statusResponse.json()) as DataStatus);
        }
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : String(error));
      }
    }

    void loadData();
  }, []);

  const cityOptions = useMemo(
    () =>
      Array.from(new Set(places.map((place) => place.city).filter(Boolean))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [places],
  );

  const categoryOptions = useMemo(
    () =>
      Array.from(new Set(places.flatMap((place) => place.categoryTags))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [places],
  );

  const filteredPlaces = useMemo(() => {
    const query = normalizeForSearch(search);
    return places.filter((place) => {
      const cityMatches = city === "all" || place.city === city;
      const categoryMatches =
        category === "all" || place.categoryTags.includes(category);
      const text = normalizeForSearch(
        [
          place.nameKoOrOriginal,
          place.nameLocal ?? "",
          place.city,
          place.area ?? "",
          place.sourceVideoTitle,
          place.categoryTags.join(" "),
        ].join(" "),
      );
      return cityMatches && categoryMatches && (!query || text.includes(query));
    });
  }, [category, city, places, search]);

  const selectedPlace = useMemo(
    () => filteredPlaces.find((place) => place.id === selectedId) ?? filteredPlaces[0],
    [filteredPlaces, selectedId],
  );

  const center = selectedPlace
    ? ([selectedPlace.lat, selectedPlace.lng] as LatLngExpression)
    : DEFAULT_CENTER;

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>탐닉 일본 맛집 지도</h1>
          <p>공간탐닉 Shorts 고정댓글 후보를 바탕으로 자동 생성한 비공식 일본 가게 지도</p>
        </div>
        <div className="status-pill">
          <span>{status.published}</span>
          published
        </div>
      </header>

      <section className="notice">
        Unofficial fan-curated/auto-generated map. Not affiliated with the channel.
        Data is generated from public YouTube metadata/comments and may need verification.
      </section>

      <section className="workspace">
        <aside className="panel" aria-label="place list and filters">
          <div className="filters">
            <label>
              <span>검색</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="가게명, 도시, 영상 제목"
              />
            </label>
            <div className="filter-grid">
              <label>
                <span>도시</span>
                <select value={city} onChange={(event) => setCity(event.target.value)}>
                  <option value="all">전체</option>
                  {cityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>카테고리</span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option value="all">전체</option>
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="data-status" aria-label="data generation status">
            <div>
              <strong>{status.generatedAt ?? "not generated"}</strong>
              <span>generatedAt</span>
            </div>
            <div>
              <strong>{status.excludedNegativeSignal}</strong>
              <span>negative excluded</span>
            </div>
            <div>
              <strong>{status.needsGeocode}</strong>
              <span>needs geocode</span>
            </div>
          </div>

          {loadError ? (
            <div className="empty-state">
              <h2>데이터를 불러오지 못했습니다</h2>
              <p>{loadError}</p>
            </div>
          ) : filteredPlaces.length === 0 ? (
            <div className="empty-state">
              <h2>아직 공개된 장소가 없습니다</h2>
              <p>
                수동 입력 없이 YouTube owner comment candidate 파이프라인으로 생성됩니다.
                개발 환경에서 <code>npm run data:all</code>을
                <code>YOUTUBE_API_KEY</code>와 함께 실행하세요.
              </p>
              {status.reason ? <small>{status.reason}</small> : null}
            </div>
          ) : (
            <div className="cards">
              {filteredPlaces.map((place) => (
                <button
                  className={`place-card ${selectedId === place.id ? "selected" : ""}`}
                  key={place.id}
                  onClick={() => setSelectedId(place.id)}
                  type="button"
                >
                  <img src={place.thumbnailUrl} alt="" loading="lazy" />
                  <span className="card-main">
                    <strong>{place.nameLocal ?? place.nameKoOrOriginal}</strong>
                    <span className="muted">
                      {[place.city, place.area].filter(Boolean).join(" / ")}
                    </span>
                    <span className="tags">
                      {place.categoryTags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </span>
                    <span>{place.commentKoAuto}</span>
                    <span className="links">
                      <a
                        href={place.sourceVideoUrl}
                        onClick={(event) => event.stopPropagation()}
                        rel="noreferrer"
                        target="_blank"
                      >
                        YouTube
                      </a>
                      <a
                        href={mapSearchUrl(place)}
                        onClick={(event) => event.stopPropagation()}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Google Maps
                      </a>
                      <span>{formatConfidence(place.confidence)}</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </aside>

        <section className="map-wrap" aria-label="Japan restaurant map">
          <MapContainer center={center} zoom={selectedPlace ? 13 : 5} className="map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <SelectedMapFocus place={selectedPlace} />
            {filteredPlaces.map((place) => (
              <Marker
                eventHandlers={{
                  click: () => setSelectedId(place.id),
                }}
                icon={markerIcon}
                key={place.id}
                position={[place.lat, place.lng]}
              >
                <Popup>
                  <strong>{place.nameLocal ?? place.nameKoOrOriginal}</strong>
                  <br />
                  {place.city}
                  <br />
                  <a href={place.sourceVideoUrl} rel="noreferrer" target="_blank">
                    source video
                  </a>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </section>
      </section>
    </main>
  );
}
