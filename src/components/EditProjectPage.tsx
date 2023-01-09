import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";

const MicRecorder = require("mic-recorder-to-mp3");
const recorder = new MicRecorder({ bitRate: 128 });
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
  }, []);

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
      })
      .catch((e: Error) => console.log(e));
  };

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
        <Button variant="primary">Play</Button>
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
