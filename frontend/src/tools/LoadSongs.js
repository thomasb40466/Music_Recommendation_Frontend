// LoadSongs.js
import rawSongs from "./songs.json";

// helper — turns "['Dennis Day']" into ["Dennis Day"]
function parseArtists(str) {
  try {
    return str
      .replace(/^\[\s*'/, "")     // strip leading ['
      .replace(/'\s*\]$/, "")     // strip trailing ']
      .split(/',\s*'/);           // split on ','   '
  } catch {
    return [str];                 // fallback
  }
}

export const loadSongs = () => {
  const songs = rawSongs.map((s) => ({
    ...s,
    artists: parseArtists(s.artists),   // ← now an array!
  }));
  return Promise.resolve(songs);
};
