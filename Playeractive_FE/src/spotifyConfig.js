import SpotifyWebApi from 'spotify-web-api-node';

// Khởi tạo đối tượng Spotify API với clientId, clientSecret và redirectUri của bạn
const spotifyApi = new SpotifyWebApi({
  clientId: '1cc098e6dbf94a3584082f5046b947f2',
  clientSecret: '873020b0be3e400690e57903e8e02953',
  redirectUri: 'http://localhost:5173/callback'
});

// Hàm lấy access token từ Spotify API
export async function getSpotifyToken() {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
    return spotifyApi;
  } catch (error) {
    console.error('Error retrieving access token', error);
  }
}

export default spotifyApi;
