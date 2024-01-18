// I followed this tutorial and attempted to add some error handling myself
//Building a Spotify API Searcher in React: https://www.youtube.com/watch?v=1PWDxgqLmDA

//get albums from Spotify
//Importing our dependencies and styles
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'spotify-web-api-js';

/* Importing...
"Container" to contain everything on screen, 
"InputGroup" to store text input and buttons for searching, 
"FormControl" is for text input, and we're also importing a "Button" component
*/
import {Container, InputGroup, FormControl, Button, Card, Row} from 'react-bootstrap'
//React hooks for useState and useEffect
import { useState, useEffect } from 'react';

//these are the ID and Secret from Spotify API
const CLIENT_ID = "68c7035815eb4196b8a4ca0855e0fafd";
const CLIENT_SECRET = "2cc2ab9ecab249728da572581c8b8206"; 


//main function of App
function App() {
  //creating a state variable for searchInput as an empty String.
  //Note: searchInput is a const, but when you use setSearchInput, you can change the value of searchInput
  const [searchInput , setSearchInput] = useState("");
  //state for accessToken pulled from app
  const [accessToken , setAccessToken] = useState(" ");
  //state for albums, empty array to store albums fetched
  const [albums , setAlbums] = useState ([]);
  //state for tracks, empty array to store tracks
  //const [tracks, setTracks] = useState([]);
  
  useEffect(() => {
    // GETTING AN API ACCESS TOKEN
    var authenticateParams = {
      // In order to fetch the access token, Spotify requires this POST operation
      method: 'POST',
      // Spotify specifically asks for this unique header in the Spotify documentation
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      // Body of the request to pass in parameters required by Spotify
      body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
    };
  
    // Fetch the access token and pass in the authenticateParams
    fetch('https://accounts.spotify.com/api/token', authenticateParams)
      // Then statement to do something with the result of fetch
      .then((result) => result.json())
      //storing the accessToken from Spotify
      .then((data) => setAccessToken(data.access_token));
  }, []);
  
  //SEARCH
  //Search function needs to be asynchronous because inside the function there will be many fetch statements that need to be called in turn and need async if you use await
  async function search(){
    try{
    //console.log("Search for " + searchInput);

    //Artist ID - Get request with search to get the Artist ID
    var searchParams = {
      method: 'GET',
      headers: {
        'Content-Type' : 'application/json',
        'Authorization' : 'Bearer ' + accessToken
      }
    }
    
    var artistID = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=artist' , searchParams)
      .then(response => response.json())
      //.then(data => console.log(data)) <--- to check info in the console to see what to call
      //go to artist, items, and call the first name at position 0 as it's the likeliest match and get their ID
      //console.log("Artist ID = " + artistID); //<---check to see if it's fetching the artist ID
      .then(data => {
        // Check to see if artist exists and has something to return
        if (data.artists && data.artists.items && data.artists.items.length > 0) {
          return data.artists.items[0].id;
        } else {
          // If nothing found, return an error message
          throw new Error('Artist not found');
        }
      });
      
 

    //Display the albums for the artist to the user
    //Get request to find all albums by that artist
    var returnAlbums = await fetch('https://api.spotify.com/v1/artists/' + artistID + '/albums' + '?include_groups=album&market=IE&limit=50', searchParams)
      .then(response => response.json())
      //.then(data => console.log(data)); <---check to see if fetching albums successfully
      .then(data => {
        setAlbums(data.items);
      // Get tracks for the first album at position 0 in array
      /**if (data.items.length > 0) {
        setTracks(data.items[0].id);
      }**/
      })

    }catch (error) {
      console.error('Error found:', error.message);
  }
  }

  
  
  //main part of app that you see on screen

  return (
    <div className="App">
      
      <Container>
        <InputGroup  className='mb-3' size = 'lg'> 
          <FormControl
            placeholder='Search for Artist'
            type='input'
            onKeyPress={event => {
              if(event.key === "Enter"){
                //console.log("Pressed enter");
                search();
              }
            }}
            onChange={event => setSearchInput(event.target.value)}
          />
          <Button onClick={search}>
            Search
          </Button>
        </InputGroup>
      </Container>
      
      <Button>Login with Spotify</Button>
      
      <Container>
      <Row className='mx-2 row-cols-4'>
        {albums.map((album, i) => {
          return (
            <Card key={album.id}> 
              <Card.Img src={album.images[0].url} />
              <Card.Body>
                <Card.Title>
                  {album.name}
                </Card.Title>
              </Card.Body>
            </Card>
          );
        })}
    </Row>
    </Container>
      
    </div>
  );
}

export default App;
