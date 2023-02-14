
import Button from "react-bootstrap/Button";
import { useEffect, useState } from "react";

interface MyProps {
    projectToken: string
}
export default function ShareUrl({projectToken}: MyProps) {
    const [sharableUrl, setSharableUrl] = useState<string>("");

    // function getRandomString() {
    //     return Math.random().toString(36).substring(2, 15);
    // }

    function generateSharableUrl() {
        if (!sharableUrl) {
        setSharableUrl(`/projects/${projectToken}/view`);
        }
    }
    return <>
    <Button variant="primary" onClick={() => generateSharableUrl()}>Share</Button>
    {sharableUrl && <a href={sharableUrl}>Sharable Url: {sharableUrl}</a>}
    </>;
}
