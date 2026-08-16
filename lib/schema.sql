-- Tabel artists
CREATE TABLE IF NOT EXISTS artists (
  id     INT PRIMARY KEY AUTO_INCREMENT,
  name   VARCHAR(255) NOT NULL UNIQUE,
  avatar VARCHAR(255) NULL,                       -- foto profil artis dari Deezer/external
  bio    TEXT NULL,                               -- biografi/deskripsi artis dari Wikipedia
  FULLTEXT KEY idx_fts_artist (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel albums
CREATE TABLE IF NOT EXISTS albums (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  artist_id   INT NOT NULL,
  name        VARCHAR(255) NOT NULL,
  year        INT NULL,
  artwork     VARCHAR(255) NULL,                    -- nama file di data/artworks/, NULL = placeholder
  description TEXT NULL,                            -- deskripsi album
  UNIQUE KEY uniq_artist_album (artist_id, name),
  FULLTEXT KEY idx_fts_album (name),
  CONSTRAINT fk_albums_artist FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel songs
CREATE TABLE IF NOT EXISTS songs (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  album_id    INT NOT NULL,
  title       VARCHAR(255) NOT NULL,
  track_no    INT NULL,
  disc_no     INT NULL,
  duration_ms INT NULL,
  filepath    VARCHAR(512) NOT NULL UNIQUE,       -- path absolut ke file audio
  format      VARCHAR(16) NULL,                   -- 'mp3'|'flac'|'m4a'|'ogg'|'opus'|'wav'|'aac'|'wma'
  bitrate     INT NULL,
  sample_rate INT NULL,
  size        BIGINT NULL,
  mtime       BIGINT NULL,                        -- file mtime, untuk rescan idempotent
  KEY idx_songs_album (album_id),
  KEY idx_songs_title (title),
  FULLTEXT KEY idx_fts_song (title),
  CONSTRAINT fk_songs_album FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel lyrics
CREATE TABLE IF NOT EXISTS lyrics (
  id       INT PRIMARY KEY AUTO_INCREMENT,
  song_id  INT NOT NULL,
  filename VARCHAR(512) NOT NULL,
  CONSTRAINT fk_lyrics_song FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fase 5 (opsional)
CREATE TABLE IF NOT EXISTS favorites (
  song_id INT PRIMARY KEY,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_fav_song FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS playlists (
  id   INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS playlist_songs (
  playlist_id INT NOT NULL,
  song_id     INT NOT NULL,
  position    INT NOT NULL,
  PRIMARY KEY (playlist_id, song_id),
  CONSTRAINT fk_ps_pl FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
  CONSTRAINT fk_ps_sg FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengaturan runtime
CREATE TABLE IF NOT EXISTS settings (
  key_   VARCHAR(64) PRIMARY KEY,                 -- 'key' reserved word di MySQL 8+; pakai key_
  value_ TEXT NOT NULL                            -- 'last_scan_at' → ISO string
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
