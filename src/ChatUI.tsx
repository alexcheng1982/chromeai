import {
  Button,
  Checkbox,
  CssBaseline,
  GeistProvider,
  Grid,
  Input,
  Link,
  Modal,
  Page,
  Tooltip,
} from "@geist-ui/core";

import { useEffect, useRef, useState } from "react";
import LiveMessage from "./components/LiveMessage";
import Message from "./components/Message";

declare global {
  interface Window {
    ai: any;
  }
}

const checkAI = async () => {
  if ("ai" in window) {
    if ((await window.ai.canCreateTextSession()) === "readily") {
      return true;
    }
  }
  return false;
};

export type Role = "user" | "assistant";

const ChatUI = () => {
  const rawChatHistory = useRef<any[]>([]);
  const [hasAI, setHasAI] = useState<null | boolean>(null);
  const [historyEnabled, setHistoryEnabled] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState(rawChatHistory.current);
  const [inputValue, setInputValue] = useState("");
  const [inferring, setInferring] = useState(false);

  const [model, setModel] = useState({
    promptStreaming: (inputValue?: string) => {},
  });

  const updateHasAI = async () => {
    const checkAIStatus = await checkAI();

    if (checkAIStatus) {
      const thisModel = await window.ai.createTextSession();
      setModel(thisModel);
    }

    setHasAI(checkAIStatus);
  };

  const updateMessage = (id: number, message: string) => {
    if (id <= rawChatHistory.current.length) {
      rawChatHistory.current[id - 1].message = message;
    }
  };

  useEffect(() => {
    updateHasAI();
  }, []);

  const sendPrompt = async () => {
    if (inputValue === "") {
      return;
    }
    setInferring(true);

    rawChatHistory.current.push({
      id: rawChatHistory.current.length + 1,
      role: "user",
      message: inputValue,
    });
    setChatHistory(rawChatHistory.current);
    setInputValue("");

    const prompt = `${rawChatHistory.current.map((chat) => {
      return `${chat.role}: ${chat.message}\n`;
    })}\nassistant:`;

    const modelInput = historyEnabled ? prompt : inputValue;
    const stream = model.promptStreaming(
      modelInput
    ) as unknown as ReadableStream;

    rawChatHistory.current.push({
      id: rawChatHistory.current.length + 1,
      role: "assistant",
      message: "",
      stream: stream,
    });
    setChatHistory(rawChatHistory.current);

    setInferring(false);
  };

  const reset = () => {
    rawChatHistory.current = [];
    setChatHistory([]);
    setInputValue("");
  };

  return (
    <Page>
      <Page.Header>
        <h2>Chrome AI Test Page</h2>
      </Page.Header>
      <Page.Content>
        <GeistProvider>
          <CssBaseline />
          <Modal visible={!hasAI} disableBackdropClick={true}>
            <Modal.Title>Chrome AI Not Supported</Modal.Title>
            <Modal.Subtitle>
              Your browser doesn't support Chrome AI
            </Modal.Subtitle>
            <Modal.Content>
              <p>
                Please use Chrome Canary and enable Chrome AI, see{" "}
                <Link
                  href="https://github.com/alexcheng1982/chromeai?tab=readme-ov-file#use-chrome-ai"
                  target="_blank"
                  color
                  placeholder={undefined}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                >
                  this guide
                </Link>
                .
              </p>
            </Modal.Content>
          </Modal>
          <div style={{ margin: "10px" }}>
            <div
              style={{
                height: "500px",
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
              {chatHistory.map((chat) => {
                return (
                  <div key={chat.id}>
                    {chat.role === "user" ? (
                      <Message
                        role={chat.role}
                        message={chat.message}
                        working={false}
                      ></Message>
                    ) : (
                      <LiveMessage
                        role={chat.role}
                        stream={chat.stream}
                        id={chat.id}
                        updateMessage={updateMessage}
                      ></LiveMessage>
                    )}
                  </div>
                );
              })}
            </div>
            <Grid.Container gap={1} justify="center">
              <Grid xs={1}>
                <Tooltip text={"Enable message history"} type="dark">
                  <Checkbox
                    checked={historyEnabled}
                    type="default"
                    onChange={(e) => setHistoryEnabled(e.target.checked)}
                  ></Checkbox>
                </Tooltip>
              </Grid>
              <Grid xs={4}>
                <Tooltip text={"Clear message history"} type="dark">
                  <Button
                    disabled={!historyEnabled || !hasAI || inferring}
                    onClick={reset}
                    placeholder={undefined}
                    onPointerEnterCapture={undefined}
                    onPointerLeaveCapture={undefined}
                  >
                    Reset
                  </Button>
                </Tooltip>
              </Grid>
              <Grid xs={15}>
                <Input
                  width={"100%"}
                  scale={4 / 3}
                  placeholder="Please input"
                  value={inputValue}
                  onInput={(e) => {
                    if ("value" in e.target) {
                      setInputValue(e.target.value as string);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendPrompt();
                    }
                  }}
                  disabled={!hasAI}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  crossOrigin={undefined}
                />
              </Grid>
              <Grid xs={4}>
                <Button
                  type="secondary"
                  onClick={sendPrompt}
                  disabled={!hasAI || inferring}
                  placeholder={undefined}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                >
                  Send
                </Button>
              </Grid>
            </Grid.Container>
          </div>
        </GeistProvider>
      </Page.Content>
    </Page>
  );
};

export default ChatUI;
