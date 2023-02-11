
import Button from "react-bootstrap/Button";
import { useEffect, useState } from "react";


export default function ShareUrl() {
    const [sharableUrl, setSharableUrl] = useState<string>("");

    function getRandomString() {
        return Math.random().toString(36).substring(2, 15);
    }

    function generateSharableUrl() {
        if (!sharableUrl) {
        setSharableUrl(`/projects/${getRandomString()}/view`);
        }
    }
    return <>
    <Button variant="primary" onClick={() => generateSharableUrl()}>Share</Button>
    {sharableUrl && <a href={sharableUrl}>Sharable Url: {sharableUrl}</a>}
    </>;
}
