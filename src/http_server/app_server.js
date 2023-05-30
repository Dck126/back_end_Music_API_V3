require("dotenv").config();

const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");
const path = require("path");
const Inert = require("@hapi/inert");

// Albums
const albums = require("../api/albums");
const AlbumService = require("../services/AlbumService");

// Songs
const songs = require("../api/songs");
const SongService = require("../services/SongService");

// Users
const users = require("../api/users");
const UserService = require("../services/UserService");

// Authentications
const authentications = require("../api/authentications");
const AuthenticationService = require("../services/AuthenticationService");

// Playlists
const playlists = require("../api/playlists");
const PlaylistService = require("../services/PlaylistService");

// Collaborations
const collaborations = require("../api/collaborations");
const CollaborationService = require("../services/CollaborationService");

// Activity
const ActivityService = require("../services/ActivityService");

// Exports
const _exports = require("../api/Exports");
const ProducerService = require("../services/rabbitmq/ProducerService");
const ExportsValidator = require("../validator/exports");

// Uploads
const uploads = require("../api/uploads");
const StorageService = require("../services/storage/StorageService");
const UploadsValidator = require("../validator/uploads");

// user album like
const userAlbumLikes = require("../api/userAlbumsLike");
const UserAlbumLikesService = require("../services/UserAlbumLikesService");
const CacheService = require("../services/redis/CacheService");

// Exceptions
const ClientError = require("../exceptions/ClientError");

// Token
const TokenManager = require("../tokenize/TokenManager");

async function createServer() {
  // create services that will be used by the plugin
  const albumsService = new AlbumService();
  const songsService = new SongService();
  const usersService = new UserService();
  const activityService = new ActivityService();
  const collaborationService = new CollaborationService(usersService);
  const authenticationsService = new AuthenticationService();
  const playlistsService = new PlaylistService(
    songsService,
    activityService,
    collaborationService
  );
  const storageService = new StorageService(
    path.resolve(__dirname, "../api/uploads/file/cover")
  );
  const cacheService = new CacheService();
  const userAlbumLikesService = new UserAlbumLikesService(cacheService);

  //create HTTP server using hapi
  const server = Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  server.auth.strategy("music_jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      Credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationService,
        playlistsService,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        validator: ExportsValidator,
        playlistsService,
      },
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        validator: UploadsValidator,
        albumsService,
      },
    },
    {
      plugin: userAlbumLikes,
      options: {
        userAlbumLikesService,
        albumsService,
      },
    },
  ]);

  //   Error Handling
  server.ext("onPreResponse", (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: "fail",
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      const newResponse = h.response({
        status: "error",
        message: "terjadi kegagalan pada server kami",
      });
      newResponse.code(500);
      console.error(response);
      return newResponse;
    }

    return h.continue;
  });

  return server;
}

module.exports = createServer;
