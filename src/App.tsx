import { useEffect, useMemo, useRef, useState } from "react";
import { Icon, type LatLngExpression } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "./mapConfig";
import {
  buildDisplayDescription,
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsViewUrl,
  classifyBroadCategory,
  friendlyCategoryTag,
} from "./placeDisplay";
import type { DataStatus, PublicPlace } from "./types";

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

const TILE_LAYERS = {
  voyager: {
    label: "Voyager",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  positron: {
    label: "Positron",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  osm: {
    label: "OSM",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
} as const;

type TileLayerKey = keyof typeof TILE_LAYERS;

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

function normalizeForSearch(value: string) {
  return value.trim().toLowerCase();
}

function locationLabel(place: PublicPlace) {
  return [place.city, place.area].filter(Boolean).join(" / ");
}

export function App() {
  const [places, setPlaces] = useState<PublicPlace[]>([]);
  const [status, setStatus] = useState<DataStatus>(DEFAULT_STATUS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const [category, setCategory] = useState("all");
  const [tileLayer, setTileLayer] = useState<TileLayerKey>("voyager");
  const [loadError, setLoadError] = useState<string | null>(null);
  const cardRefs = useRef(new Map<string, HTMLElement>());

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

  const categoryOptions = ["밥", "디저트", "술"] as const;

  const filteredPlaces = useMemo(() => {
    const query = normalizeForSearch(search);
    return places.filter((place) => {
      const cityMatches = city === "all" || place.city === city;
      const categoryMatches =
        category === "all" || classifyBroadCategory(place) === category;
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
    () => (selectedId ? filteredPlaces.find((place) => place.id === selectedId) : undefined),
    [filteredPlaces, selectedId],
  );

  useEffect(() => {
    if (!selectedPlace) return;
    const card = cardRefs.current.get(selectedPlace.id);
    card?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [selectedPlace?.id]);

  const center = selectedPlace
    ? ([selectedPlace.lat, selectedPlace.lng] as LatLngExpression)
    : DEFAULT_CENTER;
  const activeTileLayer = TILE_LAYERS[tileLayer];

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>탐닉 일본 맛집 지도</h1>
          <p>공간탐닉 Shorts에서 소개된 일본 맛집을 한눈에 보는 비공식 지도</p>
        </div>
        <div className="status-pill">
          <span>{status.published}</span>
          places
        </div>
      </header>

      <section className="notice">
        영상과 공개 위치 근거를 바탕으로 만든 비공식 지도입니다. 방문 전 영업시간과 휴무는 한 번 더 확인해 주세요.
      </section>

      <section className="workspace">
        <aside className="panel" aria-label="place list and filters">
          <div className="panel-top">
            <div className="filters">
              <label>
                <span>검색</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="가게명, 도시, 메뉴"
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
                  <span>장르</span>
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

            <div className="data-status" aria-label="map summary">
              <div>
                <strong>{status.published}</strong>
                <span>지도 표시</span>
              </div>
              <div>
                <strong>{filteredPlaces.length}</strong>
                <span>현재 목록</span>
              </div>
              <div>
                <strong>{cityOptions.length}</strong>
                <span>도시</span>
              </div>
            </div>
          </div>

          {loadError ? (
            <div className="empty-state">
              <h2>데이터를 불러오지 못했습니다</h2>
              <p>{loadError}</p>
            </div>
          ) : filteredPlaces.length === 0 ? (
            <div className="empty-state">
              <h2>조건에 맞는 장소가 없습니다</h2>
              <p>검색어 또는 필터를 바꿔서 다시 확인해 주세요.</p>
            </div>
          ) : (
            <div className="cards" aria-label="places">
              {filteredPlaces.map((place) => (
                <article
                  className={`place-card ${selectedPlace?.id === place.id ? "selected" : ""}`}
                  data-place-id={place.id}
                  key={place.id}
                  ref={(element) => {
                    if (element) cardRefs.current.set(place.id, element);
                    else cardRefs.current.delete(place.id);
                  }}
                  onClick={() => setSelectedId(place.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedId(place.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <img src={place.thumbnailUrl} alt="" loading="lazy" />
                  <div className="card-main">
                    <div>
                      <strong>{place.nameLocal ?? place.nameKoOrOriginal}</strong>
                      <span className="muted">{locationLabel(place)}</span>
                    </div>
                    <span className="tags">
                      {place.categoryTags.slice(0, 4).map((tag) => (
                        <span key={tag}>{friendlyCategoryTag(tag)}</span>
                      ))}
                      <span className="verified">위치 확인됨</span>
                    </span>
                    <p className="description">{buildDisplayDescription(place)}</p>
                    <dl className="quick-facts">
                      {place.placeTypeKo ? (
                        <div>
                          <dt>종류</dt>
                          <dd>{place.placeTypeKo}</dd>
                        </div>
                      ) : null}
                      {place.signatureKo ? (
                        <div>
                          <dt>대표</dt>
                          <dd>{place.signatureKo}</dd>
                        </div>
                      ) : null}
                    </dl>
                    <span className="links">
                      <a
                        href={place.sourceVideoUrl}
                        onClick={(event) => event.stopPropagation()}
                        rel="noreferrer"
                        target="_blank"
                      >
                        영상 보기
                      </a>
                      <a
                        href={buildGoogleMapsViewUrl(place)}
                        onClick={(event) => event.stopPropagation()}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Google Maps에서 보기
                      </a>
                      <a
                        href={buildGoogleMapsDirectionsUrl(place)}
                        onClick={(event) => event.stopPropagation()}
                        rel="noreferrer"
                        target="_blank"
                      >
                        길찾기
                      </a>
                    </span>
                    <details className="provenance" onClick={(event) => event.stopPropagation()}>
                      <summary>데이터 출처 보기</summary>
                      <p>영상과 공개 위치 근거를 바탕으로 지도에 표시했습니다.</p>
                      <a href={place.sourceVideoUrl} rel="noreferrer" target="_blank">
                        원본 영상 열기
                      </a>
                    </details>
                  </div>
                </article>
              ))}
            </div>
          )}
        </aside>

        <section className="map-wrap" aria-label="Japan restaurant map">
          <div className="map-toolbar" aria-label="map style selector">
            <span>지도 스타일</span>
            <div>
              {(Object.entries(TILE_LAYERS) as [TileLayerKey, (typeof TILE_LAYERS)[TileLayerKey]][]).map(
                ([key, layer]) => (
                  <button
                    className={tileLayer === key ? "active" : ""}
                    key={key}
                    onClick={() => setTileLayer(key)}
                    type="button"
                  >
                    {layer.label}
                  </button>
                ),
              )}
            </div>
          </div>
          <MapContainer center={center} zoom={selectedPlace ? 13 : DEFAULT_ZOOM} className="map">
            <TileLayer
              attribution={activeTileLayer.attribution}
              key={tileLayer}
              url={activeTileLayer.url}
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
                  {locationLabel(place)}
                  <br />
                  <a href={buildGoogleMapsViewUrl(place)} rel="noreferrer" target="_blank">
                    Google Maps에서 보기
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
