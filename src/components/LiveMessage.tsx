import { useState, useEffect } from "react";
import { Role } from "../ChatUI";
import Message from "./Message";

const LiveMessage = (props: {
  role: Role;
  stream: ReadableStream;
  id: number;
  updateMessage: any;
}) => {
  const { role, stream, id, updateMessage } = props;
  const [message, setMessage] = useState<string>("");
  const [done, setDone] = useState<boolean>(false);

  useEffect(() => {
    const reader = stream.getReader();

    reader.read().then(function processText({ done, value }) {
      if (done) {
        setDone(true);
        return null;
      }
      setMessage(value);
      updateMessage(id, value);
      return reader.read().then(processText);
    });
  });

  return <Message role={role} message={message} working={!done}></Message>;
};

export default LiveMessage;
