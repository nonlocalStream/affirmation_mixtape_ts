import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import { storage } from "../firebaseConfig.js";
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

// const recordings: { [entityType: string]: string[] } = {
//   Subject: ["Recording1", "Recording2"],
//   Situation: ["Recording1", "Recording2", "Recording3"],
//   Encouragement: ["Recording1"],
// };

function EditProjectPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [blobUrl, setBlobUrl] = useState("");
  const [isBlocked, setIsBlocked] = useState(true);
  const [entityTypes, setEntityTypes] = useState(["Subject", "Situation", "Encouragement"]);
  const [selectedEntityType, setSelectedEntityType] = useState(entityTypes[0]);
  const [newEntityType, setNewEntityType] = useState("");
  const [recordings, setRecordings] = useState<{
    [entityType: string]: string[];
  }>({});

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

    syncServerData().then(() => console.log("server data set"));
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
    serverEntityTypes.forEach((entityType) => {
      syncServerAudiosForEntity(entityType);
    });

    
  }

  async function syncServerAudiosForEntity(entityType: string) {
    // entityTypes.forEach((entityType) => {
      // List of audios under the project for a subjectType
      const listRef = ref(storage, `${serverProjectRepo}/${entityType}`);
      listAll(listRef)
        .then((res) => {
          res.items.forEach((fileRef) => {
            // TODO: add visibility & more concurrency management here
            getMetadata(fileRef)
              .then((metadata) => {
                console.log(`metadata=${metadata.name}`);
              })
              .catch((e) => {
                console.error("Error loading metadata", e);
              });
            getDownloadURL(fileRef).then((url) => {
              const existingUrlsForEntity =
                entityType in recordings ? recordings[entityType] : [];
              console.log(
                `Syncing url=${url} to state where existing urls for ${entityType} is ${existingUrlsForEntity}`
              );

              if (!existingUrlsForEntity.includes(url)) {
                var newState = recordings;
                newState[entityType] = [...existingUrlsForEntity, url];
                setRecordings(newState);

                console.log(`newState = ${recordings.toString()}`);
              }
            });
          });
        })
        .catch((e) => {
          console.error(
            `Error listing all the audios the project repo subjectType=${entityType}`,
            e
          );
        });
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
        setBlobUrl(url);
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

  const onAddNewEntityType = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Adding new entity type: " + newEntityType);
    setEntityTypes([...entityTypes, newEntityType])
    // entityTypes.push(newEntityType);
    // setNewEntityType("");
};
  
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
        <Button variant="primary">Share</Button>
      </div>

      {/* <div>selected: {selectedEntityType}</div> */}
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
