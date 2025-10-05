import { useRef, useState } from "react";

export default function ChatBox() {
  const textareaRef = useRef(null);
  const [message, setMessage] = useState("");

  const handleInput = (e) => {
    const textarea = textareaRef.current;
    textarea.style.height = "auto"; 
    textarea.style.height = textarea.scrollHeight + "px"; 
    setMessage(e.target.value);
  };

  const handleSubmit = () => {
    if (message.trim() === "") return;
    console.log("Message submitted:", message);
    setMessage("");
    textareaRef.current.style.height = "auto"; 
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "0 0 40px",
        zIndex: 1000,
        margin: "0 auto",
      }}
    >
      <textarea
        ref={textareaRef}
        placeholder="Type your question here..."
        value={message}
        onInput={handleInput}
        style={{
          width: "60%",              // narrower width
          maxWidth: "700px",         // optional max width
          fontSize: "1.5em",
          borderRadius: "20px",
          border: "1px solid grey",
          padding: "20px",
          marginRight: "10px",
          resize: "none",
          overflow: "hidden",
          lineHeight: "1.5em",
          color: "black",
          backgroundColor: "white",
        }}
      />
      <button
        onClick={handleSubmit}
        style={{
          padding: "0 20px",
          borderRadius: "20px",
          fontSize: "1.2em",
          backgroundColor: "#1a1a1a",
          color: "white",
          cursor: "pointer",
          border: "none",
          fontWeight: "500",
          transition: "background-color 0.25s",
        }}
      >
        Send
      </button>
    </div>
  );
}
