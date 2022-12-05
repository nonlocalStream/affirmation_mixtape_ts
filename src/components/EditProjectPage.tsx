import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

const MicRecorder = require("mic-recorder-to-mp3");
const recorder = new MicRecorder({ bitRate: 128 });
const entityTypes = ["Subject", "Situation", "Encouragement"];
const recordings: { [entityType: string]: string[] } = {
  Subject: ["Recording1", "Recording2"],
  Situation: ["Recording1", "Recording2", "Recording3"],
  Encouragement: ["Recording1"],
};

function EditProjectPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [blobUrl, setBlobUrl] = useState("");
  const [isBlocked, setIsBlocked] = useState(true);
  const [selectedEntityType, setSelectedEntityType] = useState(entityTypes[0]);

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

  const stopRecording = () => {
    recorder
      .stop()
      .getMp3()
      .then(([buffer, blob]: any) => {
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        setIsRecording(false);
      })
      .catch((e: Error) => console.log(e));
  };

  return (
    <div className="App">
      {/* <header className="App-header">Project Name</header> */}
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand href="#home">Project Name</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#home">Test</Nav.Link>
              <Nav.Link href="#link">Share</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <div>
        <Button variant="primary">Preview</Button>
        <Button variant="primary">Share</Button>
      </div>

      <div>{selectedEntityType}</div>
      {entityTypes.map((type) => {
        return (
          <div>
            <Button
              variant="primary"
              value={type}
              onClick={() => console.log("click")}
            >
              {type}
            </Button>
            {recordings[type].map((record) => {
              return (
                <Button
                  variant="light"
                  onClick={startRecording}
                  disabled={isRecording}
                >
                  {record}
                </Button>
              );
            })}
          </div>
        );
      })}

      {/* <Button variant="primary" onClick={startRecording} disabled={isRecording}>
        Record
      </Button>
      <Button variant="primary" onClick={stopRecording} disabled={!isRecording}>
        Stop
      </Button> */}
      {/* <audio src={blobUrl} controls="controls" /> */}
    </div>
  );
}

export default EditProjectPage;
