import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import { storage } from "../firebaseConfig.js";
import ShareUrl from "./ShareUrl"
import {
  uploadBytes,
  ref,
  listAll,
  getMetadata,
  getDownloadURL,
} from "firebase/storage";
import firebase from "firebase/app";

const MicRecorder = require("mic-recorder-to-mp3");
const recorder = new MicRecorder({ bitRate: 128 });
const projectToken = "projectToken";
const serverProjectRepo = `testAudios/${projectToken}`;

// TODO: use production firebase setting (need OATH)

function printRecordings(map: {[entityType: string]: any}){
  var result = "Map(";
  for (const k in map) {
    result += ` ${k} => ${map[k]},`
  }
  return result+")";
}

function ViewProject() {
  const [entityTypes, setEntityTypes] = useState(["Subject", "Situation", "Encouragement"]);
  const [recordings, setRecordings] = useState<{
    [entityType: string]: string[];
  }>({});
  const [loadingDone, setLoadingDone] = useState(false);

  // TODO: refactor
  useEffect(() => {

    syncServerData().then(() => {
      setLoadingDone(true);
      console.log(`finished downloading the data ${printRecordings(recordings)}`)
    });
  }, []);

  async function syncServerData() {
    console.log("Syncing server data...");

    const entityTypesRef = ref(storage, `${serverProjectRepo}`);
    var serverEntityTypes: string[] = [];
    await listAll(entityTypesRef)
    .then((res) => {
      serverEntityTypes = res.prefixes.map(ref => ref.name);
      setEntityTypes(serverEntityTypes);
    });

    // await syncServerAudiosForEntity("Situation");
    return Promise.all(serverEntityTypes.map(entityType => syncServerAudiosForEntity(entityType)));
    
  }

  async function syncServerAudiosForEntity(entityType: string) {
      const listRef = ref(storage, `${serverProjectRepo}/${entityType}`);
      var result = await listAll(listRef);
      
      return Promise.all(result.items.map(fileRef => getDownloadURL(fileRef))).then(
        (urls: string[]) => {
          const existingUrlsForEntity =
          entityType in recordings ? recordings[entityType] : [];
          console.log(
            `Adding urls=${urls} to state where existing urls for ${entityType} is ${existingUrlsForEntity}`
          );

          var newState = recordings;
          newState[entityType] = Array.from(new Set(existingUrlsForEntity.concat(urls)));
          setRecordings(newState);
          console.log(`newState[${entityType}] = ${newState[entityType]}`);  

        }
      )

  }

  const playRecording = (url: string) => {
    new Audio(url).play();
  };

  const playRecordings = (urls: string[]) => {
    console.log("playing: "+ urls);
    if (urls.length == 0) {
      return;
    } else {
      var audio = new Audio(urls[0]);
      audio.play();
      audio.onended = () => playRecordings(urls.slice(1));
      // new Audio(urls[0]).play().then(() => playRecordings(urls.slice(1)));
    }
  };

  const playRandomRecordings = (recordings: {[entityType: string]: string[]}) => {
    var recordingsToPlay = []
    for (let entityType in recordings) {
      let urls = recordings[entityType];
      recordingsToPlay.push(pickRandom(urls));
    }
    playRecordings(recordingsToPlay);
  }
  
  function pickRandom<Type>(arr:Type[]): Type {
    const r = Math.random();
    const l = arr.length;
    const i = Math.floor(r * l);
    console.log(`Pick random index: ${i} r:${r} l: ${l}`);
    return arr[i];
  }

  return (
    <div className="App">
      {/* <header className="App-header">Project Name</header> */}
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand href="#home">Project Name</Navbar.Brand>
        </Container>
      </Navbar>
      <div>
        <Button variant="primary" onClick={() => playRandomRecordings(recordings)}>Play</Button>
      </div>

    </div>
  );
}

export default ViewProject;
