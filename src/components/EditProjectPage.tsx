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
  getDownloadURL,
} from "firebase/storage";

const MicRecorder = require("mic-recorder-to-mp3");
const recorder = new MicRecorder({ bitRate: 128 });
const projectToken = getProjectToken();
const serverProjectRepo = `testAudios/${projectToken}`;
export const hardcodedOrder = ["Start", "Subject", "Message", "Future"];

export function getProjectToken() {
  const parts = window.location.pathname.split('/');
  for (let i=0; i<parts.length; i++) {
    if (parts[i] === 'projects') {
      return parts[i+1]
    }
  }
  return "invalid"
}

export function ordered(entities: string[], hardcodedOrder: string[]){
  var ans: string[] = [] 
  hardcodedOrder.forEach(e => {
    if (entities.includes(e) && !(ans.includes(e))) {
      ans.push(e)
    }
  })

  entities.forEach(e => {
    if (!(ans.includes(e))) {
      ans.push(e)
    }
  })
  return ans
}


// TODO: use production firebase setting (need OATH)

function printRecordings(map: {[entityType: string]: any}){
  var result = "Map(";
  for (const k in map) {
    result += ` ${k} => ${map[k]},`
  }
  return result+")";
}


function EditProjectPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isBlocked, setIsBlocked] = useState(true);
  const [entityTypes, setEntityTypes] = useState(["Start", "Subject", "Message", "Future"]);
  const [selectedEntityType, setSelectedEntityType] = useState(entityTypes[0]);
  const [newEntityType, setNewEntityType] = useState("");
  const [recordings, setRecordings] = useState<{
    [entityType: string]: string[];
  }>({});

  const [loadingDone, setLoadingDone] = useState(false);


  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(
      () => {
        console.log("Permission Granted");
        setIsBlocked(false);
      },
      () => {
        console.log("Permission Denied");
        setIsBlocked(true);
      }
    );

    syncServerData().then(() => {
      // TODO: Investigate why is this necessary to get UI to re-render
      setLoadingDone(true);
      console.log(`finished downloading the data ${printRecordings(recordings)}`)
    });
  // eslint-disable-next-line
  }, []);

  async function syncServerData() {
    console.log("Syncing server data...");

    const entityTypesRef = ref(storage, `${serverProjectRepo}`);
    var serverEntityTypes: string[] = [];
    await listAll(entityTypesRef)
    .then((res) => {
      serverEntityTypes = res.prefixes.map(ref => ref.name);
      setEntityTypes(ordered(serverEntityTypes, hardcodedOrder));
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

      // return listAll(listRef)
      //   .then((result) => {
      //     Promise.all(result.items.map(fileRef => getDownloadURL(fileRef))).then(
      //       (urls: string[]) => {
      //         const existingUrlsForEntity =
      //         entityType in recordings ? recordings[entityType] : [];
      //         console.log(
      //           `Adding urls=${urls} to state where existing urls for ${entityType} is ${existingUrlsForEntity}`
      //         );

      //         var newState = recordings;
      //         newState[entityType] = Array.from(new Set(existingUrlsForEntity.concat(urls)));
      //         setRecordings(newState);
      //         console.log(`newState[${entityType}] = ${newState[entityType]}`);  
  
      //       }
      //     )
        // })
        // .catch((e) => {
        //   console.error(
        //     `Error listing all the audios the project repo subjectType=${entityType}`,
        //     e
        //   );
        // });
  // });
  }
  const startRecording = () => {
    if (isBlocked) {
      console.log("Permission Denied");
    } else {
      recorder
        .start()
        .then(() => {
          setIsRecording(true);
        })
        .catch((e: Error) => console.error(e));
    }
  };

  const onClickNewRecording = (entityType: string) => {
    if (isRecording) {
      stopRecording(entityType);
    } else {
      setSelectedEntityType(entityType);
      startRecording();
    }
  };

  const stopRecording = (entityType: string) => {
    recorder
      .stop()
      .getMp3()
      .then(([buffer, blob]: any) => {
        const url = URL.createObjectURL(blob);
        setIsRecording(false);
        addRecording(entityType, url);
        uploadAudio(entityType, url)
      })
      .catch((e: Error) => console.log(e));
  };


  async function uploadAudio(entityType:string , url:string) {
    console.log(`uploading audio url=${url}`);
    try {
      const audioBlob: Blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
          console.log(`successfullly read the audioBlob ${xhr.response}`);
          resolve(xhr.response);
        };
        xhr.onerror = (e) => {
          console.log(e);
          reject("fail to read the audioBlob to upload");
        };
        xhr.responseType = "blob";
        xhr.open("GET", url, true);
        xhr.send(null);
      });
      if (audioBlob != null) {
        const uriParts = url.split("/");
        // const fileNameAndType = uriParts[uriParts.length - 1].split(".");
        // const fileName = fileNameAndType[0];
        // const fileType = fileNameAndType[1];

        const fileName = uriParts[uriParts.length - 1];
        const fileType = "mp3";
        console.log(
          `uploading recording ${fileName}.${fileType} to cloud storage`
        );
        // const fileName = uri.substring(0, fileType.length - 1);
        const storageRef = ref(
          storage,
          `${serverProjectRepo}/${entityType}/${fileName}.${fileType}`
        );
        const metadata = {
          contentType: `audio/${fileType}`,
        };
        uploadBytes(storageRef, audioBlob, metadata)
          .then((snapshot) => {
            console.log(
              `uploaded recording ${fileName}.${fileType} to cloud storage`
            );
          })
          .catch((e) => {
            console.log(
              `error uploading recording ${fileName}.${fileType} to cloud storage`,
              e
            );
          });
      } else {
        console.log("The audioBlob to upload is empty");
      }
    } catch (e) {
      console.log(`error with uploadAudio`, e);
    }
  }

  const addRecording = (entityType: string, url: string) => {
    var newRecordings = recordings;
    if (entityType in newRecordings) {
      newRecordings[entityType].push(url);
    } else {
      newRecordings[entityType] = [url];
    }
    setRecordings(newRecordings);
  };

  const playRecording = (url: string) => {
    new Audio(url).play();
  };

  // TODO: move this to an AudioPlayer class
  // TODO: BUG if there's one entity type with no recordings, then random player will
  // not play anything
  const playRecordings = (urls: string[]) => {
    console.log("playing: "+ urls);
    if (urls.length === 0) {
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

  const onAddNewEntityType = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Adding new entity type: " + newEntityType);
    setEntityTypes([...entityTypes, newEntityType])
    // entityTypes.push(newEntityType);
    // setNewEntityType("");
};
  
console.log("Rendering...");
  return (
    <div className="App">
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand href="#home">{getProjectToken()}</Navbar.Brand>
        </Container>
      </Navbar>
      <div>
        <Button variant="primary" onClick={() => playRandomRecordings(recordings)}>Play</Button>
        <ShareUrl projectToken={projectToken}/>
      </div>

      {/* <div>selected: {selectedEntityType}</div> */}
      {(!loadingDone) && (<div className="loading"> Loading... </div>) }
      {entityTypes.map((type) => {
        return (
          <div key={`row-${type}`}>
            <h5>
              {type}
            </h5>
            {type in recordings &&
              recordings[type].map((record) => {
                return (
                  <Button
                    key={`${type}-${record}`}
                    variant="light"
                    onClick={() => playRecording(record)}
                    disabled={isRecording}
                  >
                    {record.substr(-11)}
                  </Button>
                );
              })}
            <Button
              id="{type}-{record}"
              onClick={() => onClickNewRecording(type)}
              disabled={isRecording && type !== selectedEntityType}
            >
              {isRecording && type === selectedEntityType ? "Stop" : "+"}
            </Button>
          </div>
        );
      })}

      <h5> Add New Entity Type </h5>

      {/* <Button variant="btn btn-outline-dark" onClick={() => onClickAddNewEntity(type)}> Add entity type</Button> */}
      <form className="new-entity-form" onSubmit={onAddNewEntityType}>
        <input type="text" 
          className="form-input" id="new-entity-form-input" placeholder="Add new entity"
          onChange={(e) => setNewEntityType(e.target.value)}
          />
        {/* <label className="form-label" htmlFor="new-entity-form-input">Add Entity Type</label> */}
        <button type="submit" className="btn"> Add </button>
      </form>
      {/* <Button variant="primary" onClick={startRecording} disabled={isRecording}>
        Record
      </Button>
      <Button variant="primary" onClick={stopRecording} disabled={!isRecording}>
        Stop
      </Button> */}
      {/* <audio src={blobUrl} controls /> */}
    </div>
  );
}

export default EditProjectPage;
