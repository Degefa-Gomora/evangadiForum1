// import React, { useState, useEffect, useRef, useContext } from "react";
// import { io } from "socket.io-client";
// import styles from "./PublicChat.module.css"; // Import the CSS module
// import { UserState } from "../../App.jsx"; // Assuming UserState is defined here
// import {
//   FiSend,
//   FiSmile,
//   FiX,
//   FiEdit,
//   FiTrash2,
//   FiDownload,
//   FiUsers,
//   FiMessageCircle,
//   FiPaperclip, // Using FiPaperclip for attachment button
//   FiMic, // Added for microphone icon
//   FiStopCircle, // Added for stop recording icon
//   FiPlayCircle, // Added for play audio icon
//   FiPauseCircle, // Added for pause audio icon
// } from "react-icons/fi"; // Added more icons
// import EmojiPicker from "emoji-picker-react";
// import Loader from "../../components/Loader/Loader"; // Assuming you have a loader component
// import Swal from "sweetalert2"; // For confirmations

// const SOCKET_SERVER_URL = "https://server.evangadiforum.com"; // IMPORTANT: Ensure your Socket.IO server is running on this URL
// const PUBLIC_CHAT_ROOM_ID = "stackoverflow_lobby"; // Unique ID for the public chat room

// // Define common reaction emojis
// const COMMON_REACTIONS = ["👍", "❤️", "😂", "🔥", "🎉"];

// // Helper function to generate a consistent private chat room ID
// // This must match the logic on your backend (app.js: getPrivateChatRoomId)
// const getPrivateChatRoomId = (user1Id, user2Id) => {
//   if (!user1Id || !user2Id) return null;
//   const sortedIds = [user1Id, user2Id].sort();
//   return `${sortedIds[0]}-${sortedIds[1]}`;
// };

// const PublicChat = () => {
//   // Access user information from context
//   const { user } = useContext(UserState);

//   // State variables for chat functionality
//   const [socket, setSocket] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [loadingHistory, setLoadingHistory] = useState(true);
//   const [isTyping, setIsTyping] = useState(false);
//   const [onlineUsers, setOnlineUsers] = useState([]); // State to hold list of online users
//   const [registeredUsers, setRegisteredUsers] = useState([]); // State for all registered users
//   const [showRegisteredUsersModal, setShowRegisteredUsersModal] =
//     useState(false); // State for controlling modal visibility

//   const [showReactionMenuForMessageId, setShowReactionMenuForMessageId] =
//     useState(null); // Stores message_id if mini palette is open
//   const [showFullReactionEmojiPicker, setShowFullReactionEmojiPicker] =
//     useState(null); // Stores message_id if full picker is open

//   // File/Image attachment states
//   const [selectedFile, setSelectedFile] = useState(null); // State for general file data {data: Base64, name: string, type: string}
//   const fileInputRef = useRef(null); // Ref for the hidden file input (for images and general files)

//   // Image modal states (for viewing full-size images sent in chat)
//   const [showImageModal, setShowImageModal] = useState(false);
//   const [modalImageData, setModalImageData] = useState(null);
//   const [modalImageName, setModalImageName] = useState(null);

//   const [chatMode, setChatMode] = useState("public"); // 'public' or 'private'
//   const [currentDmRecipient, setCurrentDmRecipient] = useState(null); // {userid, username, avatar_url}

//   // Message editing states
//   const [editingMessageId, setEditingMessageId] = useState(null); // ID of the message being edited
//   const [editingMessageText, setEditingMessageText] = useState(""); // Text of the message being edited

//   // Voice message states
//   const [isRecording, setIsRecording] = useState(false);
//   const [mediaRecorder, setMediaRecorder] = useState(null);
//   const [audioChunks, setAudioChunks] = useState([]);
//   const [recordedAudioBlob, setRecordedAudioBlob] = useState(null); // Stores the final recorded audio blob, ready to send
//   const [recordingDuration, setRecordingDuration] = useState(0); // For display
//   const recordingIntervalRef = useRef(null);

//   // Audio playback states
//   const [currentPlayingAudio, setCurrentPlayingAudio] = useState(null); // {messageId, audioInstance}
//   const audioRefs = useRef({}); // Store Audio objects for playback control

//   // Refs for managing DOM elements and timeouts
//   const typingTimeoutRef = useRef(null);
//   const messagesEndRef = useRef(null); // Ref to scroll to the latest message
//   const [showInputEmojiPicker, setShowInputEmojiPicker] = useState(false);
//   const inputEmojiPickerRef = useRef(null);
//   const inputEmojiButtonRef = useRef(null);
//   const messageBubbleRefs = useRef({}); // To store refs for each message bubble

//   // Utility function to get user initial for avatar placeholder
//   const getUserInitial = (username) => {
//     return username ? username.charAt(0).toUpperCase() : "?";
//   };

//   // Utility function to format timestamp
//   const formatTimestamp = (timestamp) => {
//     const date = new Date(timestamp);
//     if (isNaN(date.getTime())) {
//       return "Invalid Date";
//     }
//     const now = new Date();
//     const isToday =
//       date.getDate() === now.getDate() &&
//       date.getMonth() === now.getMonth() &&
//       date.getFullYear() === now.getFullYear();

//     if (isToday) {
//       return date.toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     } else {
//       return date.toLocaleDateString([], {
//         month: "short",
//         day: "numeric",
//       });
//     }
//   };

//   // Effect hook for connecting to Socket.IO and setting up event listeners
//   useEffect(() => {
//     const newSocket = io(SOCKET_SERVER_URL, {
//       transports: ["websocket", "polling"],
//       query: { userid: user?.userid, username: user?.username }, // Send user info on connect
//     });
//     setSocket(newSocket);

//     newSocket.on("connect", () => {
//       console.log("Connected to Socket.IO server.");

//       // Determine the room ID based on current chat mode
//       let roomToJoin;
//       let fetchHistoryData = { userid: user?.userid };

//       if (chatMode === "public") {
//         roomToJoin = PUBLIC_CHAT_ROOM_ID;
//         fetchHistoryData.roomId = PUBLIC_CHAT_ROOM_ID;
//       } else if (chatMode === "private" && currentDmRecipient) {
//         roomToJoin = getPrivateChatRoomId(
//           user?.userid,
//           currentDmRecipient.userid
//         );
//         fetchHistoryData.roomId = roomToJoin;
//         fetchHistoryData.targetuserid = currentDmRecipient.userid; // Pass targetuserid for private history
//       } else {
//         // Fallback or initial state if no recipient for private chat is set
//         roomToJoin = PUBLIC_CHAT_ROOM_ID;
//         fetchHistoryData.roomId = PUBLIC_CHAT_ROOM_ID;
//       }

//       console.log(`Attempting to join room: ${roomToJoin}`);
//       newSocket.emit("joinRoom", {
//         roomId: roomToJoin,
//         userid: user?.userid,
//         username: user?.username,
//       });

//       // Fetch chat history for the joined room
//       setLoadingHistory(true);
//       newSocket.emit("fetchChatHistory", fetchHistoryData);
//     });

//     // Handle incoming messages
//     newSocket.on("message", (message) => {
//       console.log("Received message:", message);
//       setMessages((prevMessages) => {
//         // Check if message already exists (to prevent duplicates on re-render/reconnect)
//         if (prevMessages.some((msg) => msg.message_id === message.message_id)) {
//           return prevMessages;
//         }
//         return [...prevMessages, message];
//       });
//     });

//     // Handle chat history
//     newSocket.on("chatHistory", (history) => {
//       console.log("Received chat history:", history);
//       setMessages(history);
//       setLoadingHistory(false);
//       scrollToBottom();
//     });

//     // Handle updated messages (for edits, deletions, reactions)
//     newSocket.on("messageUpdated", (updatedMessage) => {
//       setMessages((prevMessages) =>
//         prevMessages.map((msg) =>
//           msg.message_id === updatedMessage.message_id ? updatedMessage : msg
//         )
//       );
//     });

//     // Handle typing events
//     newSocket.on("typing", ({ username, roomId }) => {
//       // Only show typing if it's in the current room and not from self
//       const currentRoomId =
//         chatMode === "public"
//           ? PUBLIC_CHAT_ROOM_ID
//           : currentDmRecipient
//           ? getPrivateChatRoomId(user?.userid, currentDmRecipient.userid)
//           : null;

//       if (username !== user?.username && roomId === currentRoomId) {
//         setIsTyping(true);
//         if (typingTimeoutRef.current) {
//           clearTimeout(typingTimeoutRef.current);
//         }
//         typingTimeoutRef.current = setTimeout(() => {
//           setIsTyping(false);
//         }, 3000); // Hide typing indicator after 3 seconds
//       }
//     });

//     // Handle online users list update
//     newSocket.on("onlineUsers", (users) => {
//       // Filter out the current user from the online list for display purposes if needed
//       setOnlineUsers(users.filter((u) => u.userid !== user?.userid));
//     });

//     // Handle registered users list (for DM selection)
//     newSocket.on("registeredUsers", (users) => {
//       // Exclude the current user from the list
//       setRegisteredUsers(users.filter((u) => u.userid !== user?.userid));
//     });

//     newSocket.on("disconnect", () => {
//       console.log("Disconnected from Socket.IO server.");
//       setIsTyping(false); // Clear typing indicator on disconnect
//     });

//     newSocket.on("connect_error", (err) => {
//       console.error("Socket.IO connection error:", err.message);
//       Swal.fire({
//         icon: "error",
//         title: "Connection Error",
//         text: "Could not connect to the chat server. Please try again later.",
//         timer: 2000,
//         timerProgressBar: true,
//         showConfirmButton: false,
//       });
//     });

//     // Cleanup on component unmount
//     return () => {
//       if (socket) {
//         // Leave the current room before disconnecting
//         let roomToLeave;
//         if (chatMode === "public") {
//           roomToLeave = PUBLIC_CHAT_ROOM_ID;
//         } else if (chatMode === "private" && currentDmRecipient) {
//           roomToLeave = getPrivateChatRoomId(
//             user?.userid,
//             currentDmRecipient.userid
//           );
//         }
//         if (roomToLeave) {
//           newSocket.emit("leaveRoom", {
//             roomId: roomToLeave,
//             userid: user?.userid,
//           });
//         }
//         newSocket.disconnect();
//         console.log("Socket disconnected on cleanup.");
//       }
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//       }
//       stopRecording(); // Ensure recording is stopped if component unmounts
//       stopAllAudioPlayback(); // Stop any playing audio
//     };
//   }, [user, chatMode, currentDmRecipient]); // Re-run effect if user, chatMode, or recipient changes

//   // Auto-scroll to bottom on new messages
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   // Handle click outside to close emoji pickers and reaction menus
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       // Close input emoji picker
//       if (
//         inputEmojiPickerRef.current &&
//         !inputEmojiPickerRef.current.contains(event.target) &&
//         inputEmojiButtonRef.current &&
//         !inputEmojiButtonRef.current.contains(event.target)
//       ) {
//         setShowInputEmojiPicker(false);
//       }

//       // Close reaction mini menu and full picker if click outside any message bubble
//       if (showReactionMenuForMessageId || showFullReactionEmojiPicker) {
//         let clickedInsideAnyMessageBubble = false;
//         for (const messageId in messageBubbleRefs.current) {
//           if (
//             messageBubbleRefs.current[messageId] &&
//             messageBubbleRefs.current[messageId].contains(event.target)
//           ) {
//             clickedInsideAnyMessageBubble = true;
//             break;
//           }
//         }
//         if (!clickedInsideAnyMessageBubble) {
//           setShowReactionMenuForMessageId(null);
//           setShowFullReactionEmojiPicker(null);
//         }
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [
//     showInputEmojiPicker,
//     showReactionMenuForMessageId,
//     showFullReactionEmojiPicker,
//   ]);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   const getCurrentRoomId = () => {
//     if (chatMode === "public") {
//       return PUBLIC_CHAT_ROOM_ID;
//     } else if (chatMode === "private" && currentDmRecipient) {
//       return getPrivateChatRoomId(user?.userid, currentDmRecipient.userid);
//     }
//     return null; // Should not happen if chatMode is properly set
//   };

//   const sendMessage = (e) => {
//     e.preventDefault();
//     if (!socket || !user?.userid) {
//       Swal.fire({
//         icon: "warning",
//         title: "Login Required",
//         text: "Please log in to send messages.",
//         timer: 2000,
//         timerProgressBar: true,
//         showConfirmButton: false,
//       });
//       return;
//     }

//     const currentRoom = getCurrentRoomId();
//     if (!currentRoom) {
//       console.error("No active chat room to send message to.");
//       return;
//     }

//     // If editing a message
//     if (editingMessageId) {
//       if (editingMessageText.trim()) {
//         socket.emit("editMessage", {
//           message_id: editingMessageId,
//           new_text: editingMessageText.trim(),
//           userid: user.userid,
//           roomId: currentRoom,
//         });
//         setEditingMessageId(null);
//         setEditingMessageText("");
//       }
//       return; // Exit after handling edit
//     }

//     // If sending a new message (text, file, or audio)
//     if (input.trim() || selectedFile || recordedAudioBlob) {
//       const messageData = {
//         userid: user.userid,
//         username: user.username,
//         avatar_url: user.avatar_url,
//         room_id: currentRoom,
//         message_type: chatMode, // 'public' or 'private'
//         recipient_id:
//           chatMode === "private" ? currentDmRecipient?.userid : null,
//       };

//       if (recordedAudioBlob) {
//         // Handle recorded audio
//         const reader = new FileReader();
//         reader.readAsDataURL(recordedAudioBlob);
//         reader.onloadend = () => {
//           socket.emit("voiceMessage", {
//             ...messageData,
//             audio_data: reader.result, // Base64 audio
//             audio_type: recordedAudioBlob.type,
//             audio_duration: recordingDuration, // Send duration
//           });
//           setRecordedAudioBlob(null); // Clear the recorded audio
//           setRecordingDuration(0);
//         };
//       } else if (selectedFile) {
//         // Handle file attachment
//         socket.emit("fileMessage", {
//           ...messageData,
//           message_text: input.trim(), // Include text with file
//           file_data: selectedFile.data,
//           file_name: selectedFile.name,
//           file_type: selectedFile.type,
//         });
//         setSelectedFile(null); // Clear selected file
//       } else if (input.trim()) {
//         // Handle regular text message
//         socket.emit("sendMessage", {
//           ...messageData,
//           message_text: input.trim(),
//         });
//       }

//       setInput(""); // Clear message input
//       setShowInputEmojiPicker(false); // Close emoji picker
//     }
//   };

//   const handleInputChange = (e) => {
//     setInput(e.target.value);
//     if (e.target.value.length > 0) {
//       socket.emit("typing", {
//         roomId: getCurrentRoomId(),
//         username: user?.username,
//       });
//     }
//   };

//   const onInputEmojiClick = (emojiObject) => {
//     setInput((prevInput) => prevInput + emojiObject.emoji);
//   };

//   const handleFileSelect = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       if (file.size > 5 * 1024 * 1024) {
//         // 5MB limit
//         Swal.fire({
//           icon: "error",
//           title: "File Too Large",
//           text: "Please select a file smaller than 5MB.",
//           timer: 2000,
//           timerProgressBar: true,
//           showConfirmButton: false,
//         });
//         setSelectedFile(null);
//         event.target.value = null; // Clear the input
//         return;
//       }

//       const reader = new FileReader();
//       reader.onload = (e) => {
//         setSelectedFile({
//           data: e.target.result, // Base64 string
//           name: file.name,
//           type: file.type,
//         });
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const triggerFileInput = () => {
//     fileInputRef.current.click();
//   };

//   const downloadFile = (base64Data, filename, fileType) => {
//     try {
//       // Decode Base64 string (remove the data:mime/type;base64, prefix if present)
//       const byteCharacters = atob(base64Data.split(",")[1] || base64Data);
//       const byteNumbers = new Array(byteCharacters.length);
//       for (let i = 0; i < byteCharacters.length; i++) {
//         byteNumbers[i] = byteCharacters.charCodeAt(i);
//       }
//       const byteArray = new Uint8Array(byteNumbers);

//       const blob = new Blob([byteArray], {
//         type: fileType || "application/octet-stream",
//       }); // Default to octet-stream if type not provided
//       const url = URL.createObjectURL(blob);

//       const link = document.createElement("a");
//       link.href = url;
//       link.download = filename;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       URL.revokeObjectURL(url); // Clean up the URL object
//     } catch (error) {
//       console.error("Error downloading file:", error);
//       Swal.fire({
//         icon: "error",
//         title: "Download Error",
//         text: "Could not download the file.",
//         timer: 2000,
//         timerProgressBar: true,
//         showConfirmButton: false,
//       });
//     }
//   };

//   const openImageInModal = (imageData, imageName) => {
//     setModalImageData(imageData);
//     setModalImageName(imageName);
//     setShowImageModal(true);
//   };

//   const startEditingMessage = (message) => {
//     setEditingMessageId(message.message_id);
//     setEditingMessageText(message.message_text);
//     setInput(""); // Clear main input if it had something
//     setSelectedFile(null); // Cannot edit message with file attached
//     stopRecording(); // Stop recording if ongoing
//     setRecordedAudioBlob(null); // Clear recorded audio if any
//     stopAllAudioPlayback(); // Stop any playing audio
//   };

//   const cancelEditing = () => {
//     setEditingMessageId(null);
//     setEditingMessageText("");
//   };

//   const handleDeleteMessage = (messageId) => {
//     Swal.fire({
//       title: "Are you sure?",
//       text: "You won't be able to revert this!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#3085d6",
//       cancelButtonColor: "#d33",
//       confirmButtonText: "Yes, delete it!",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         if (socket && user?.userid) {
//           socket.emit("deleteMessage", {
//             message_id: messageId,
//             userid: user.userid,
//             roomId: getCurrentRoomId(),
//           });
//           Swal.fire("Deleted!", "Your message has been deleted.", "success");
//         }
//       }
//     });
//   };

//   const handleReaction = (messageId, emoji) => {
//     if (socket && user?.userid) {
//       socket.emit("reactToMessage", {
//         message_id: messageId,
//         emoji: emoji,
//         userid: user.userid,
//         username: user.username,
//         roomId: getCurrentRoomId(),
//       });
//       setShowReactionMenuForMessageId(null); // Close mini menu
//       setShowFullReactionEmojiPicker(null); // Close full picker
//     }
//   };

//   const openFullReactionPicker = (messageId, event) => {
//     // Positioning logic might be needed here based on event.target,
//     // but for simplicity, we just set the message ID.
//     // CSS will handle absolute positioning relative to message container.
//     setShowFullReactionEmojiPicker(messageId);
//     setShowReactionMenuForMessageId(null); // Close mini menu
//   };

//   const switchChatMode = (mode, recipient = null) => {
//     // If switching to private mode without a specific recipient,
//     // default to the first user in the list.
//     if (mode === "private" && recipient === null) {
//       const sortedUsers = getSortedUsers();
//       if (sortedUsers.length > 0) {
//         recipient = sortedUsers[0];
//       }
//     }

//     if (mode === chatMode && recipient?.userid === currentDmRecipient?.userid) {
//       return; // Avoid unnecessary re-renders if mode and user are the same
//     }

//     // Prevent switching if recording or editing
//     if (isRecording) {
//       Swal.fire({
//         icon: "warning",
//         title: "Recording in Progress",
//         text: "Please stop the current recording before switching chat modes.",
//         timer: 2000,
//         timerProgressBar: true,
//         showConfirmButton: false,
//       });
//       return;
//     }
//     if (editingMessageId) {
//       Swal.fire({
//         icon: "warning",
//         title: "Editing in Progress",
//         text: "Please finish or cancel editing before switching chat modes.",
//         timer: 2000,
//         timerProgressBar: true,
//         showConfirmButton: false,
//       });
//       return;
//     }

//     // Leave the current room before joining a new one
//     const prevRoomId = getCurrentRoomId();
//     if (prevRoomId && socket) {
//       socket.emit("leaveRoom", {
//         roomId: prevRoomId,
//         userid: user?.userid,
//       });
//     }

//     setChatMode(mode);
//     setCurrentDmRecipient(recipient);
//     setMessages([]); // Clear messages for new room
//     setLoadingHistory(true);
//     setInput(""); // Clear input
//     setSelectedFile(null); // Clear any selected file
//     setRecordedAudioBlob(null); // Clear any recorded audio
//     stopAllAudioPlayback(); // Stop any playing audio

//     // Join the new room and fetch its history
//     const newRoomId =
//       mode === "public"
//         ? PUBLIC_CHAT_ROOM_ID
//         : getPrivateChatRoomId(user?.userid, recipient?.userid);

//     if (newRoomId && socket) {
//       socket.emit("joinRoom", {
//         roomId: newRoomId,
//         userid: user?.userid,
//         username: user?.username,
//       });

//       const fetchHistoryData = { userid: user?.userid, roomId: newRoomId };
//       if (mode === "private" && recipient) {
//         fetchHistoryData.targetuserid = recipient.userid;
//       }
//       socket.emit("fetchChatHistory", fetchHistoryData);
//     }

//     if (mode === "private") {
//       setShowRegisteredUsersModal(false); // Close modal after selection
//     }
//   };

//   // --- Voice Recording Functions ---

//   const startRecording = async () => {
//     if (!user?.userid) {
//       Swal.fire({
//         icon: "warning",
//         title: "Login Required",
//         text: "Please log in to send voice messages.",
//         timer: 2000,
//         timerProgressBar: true,
//         showConfirmButton: false,
//       });
//       return;
//     }
//     if (selectedFile) {
//       Swal.fire({
//         icon: "warning",
//         title: "File Attached",
//         text: "Please clear the attached file before recording a voice message.",
//         timer: 2000,
//         timerProgressBar: true,
//         showConfirmButton: false,
//       });
//       return;
//     }
//     if (editingMessageId) {
//       Swal.fire({
//         icon: "warning",
//         title: "Editing in Progress",
//         text: "Please finish or cancel editing before recording a voice message.",
//         timer: 2000,
//         timerProgressBar: true,
//         showConfirmButton: false,
//       });
//       return;
//     }

//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const recorder = new MediaRecorder(stream);
//       setMediaRecorder(recorder);
//       setIsRecording(true);
//       setAudioChunks([]); // Clear previous chunks
//       setRecordedAudioBlob(null); // Clear previous blob
//       setRecordingDuration(0);

//       recorder.ondataavailable = (event) => {
//         setAudioChunks((prev) => [...prev, event.data]);
//       };

//       recorder.onstop = () => {
//         const audioBlob = new Blob(audioChunks, { type: "audio/webm" }); // Or audio/mp3, audio/ogg etc. based on browser support
//         setRecordedAudioBlob(audioBlob);
//         setIsRecording(false);
//         stream.getTracks().forEach((track) => track.stop()); // Stop microphone access
//         clearInterval(recordingIntervalRef.current); // Stop duration timer
//         setRecordingDuration(0); // Reset for next recording
//       };

//       recorder.start();
//       console.log("Recording started...");

//       // Start duration timer
//       recordingIntervalRef.current = setInterval(() => {
//         setRecordingDuration((prev) => prev + 1);
//       }, 1000);
//     } catch (err) {
//       console.error("Error accessing microphone:", err);
//       Swal.fire({
//         icon: "error",
//         title: "Microphone Access Denied",
//         text: "Please allow microphone access to send voice messages.",
//         timer: 2000,
//         timerProgressBar: true,
//         showConfirmButton: false,
//       });
//       setIsRecording(false);
//       clearInterval(recordingIntervalRef.current);
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorder && isRecording) {
//       mediaRecorder.stop();
//       console.log("Recording stopped.");
//       // The onstop event handler will set isRecording to false and finalize the blob
//     }
//   };

//   const cancelRecording = () => {
//     if (mediaRecorder) {
//       mediaRecorder.stop(); // This will trigger onstop, which cleans up
//     }
//     setIsRecording(false);
//     setAudioChunks([]);
//     setRecordedAudioBlob(null);
//     setRecordingDuration(0);
//     clearInterval(recordingIntervalRef.current);
//     console.log("Recording cancelled.");
//   };

//   const formatRecordingDuration = (seconds) => {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
//       .toString()
//       .padStart(2, "0")}`;
//   };

//   // --- Audio Playback Functions ---

//   const playAudio = (messageId, audioData) => {
//     stopAllAudioPlayback(); // Stop any currently playing audio

//     if (!audioData) {
//       console.error("No audio data to play.");
//       return;
//     }

//     // Ensure audioData is a valid data URI
//     let audioSrc = audioData;
//     if (!audioSrc.startsWith("data:audio/")) {
//       // If your backend sends only base64, you may need to know the type (e.g., webm, ogg, mp3)
//       // Here, we default to webm. Adjust if your backend uses a different type.
//       audioSrc = `data:audio/webm;base64,${audioSrc}`;
//     }

//     const audio = new Audio(audioSrc);
//     audioRefs.current[messageId] = audio; // Store instance

//     audio.onplay = () => {
//       setCurrentPlayingAudio({ messageId, audioInstance: audio });
//     };

//     audio.onended = () => {
//       setCurrentPlayingAudio(null);
//       delete audioRefs.current[messageId]; // Clean up
//     };

//     audio.onerror = (e) => {
//       console.error("Audio playback error:", e);
//       Swal.fire({
//         icon: "error",
//         title: "Audio Playback Error",
//         text: "Could not play this audio message.",
//         timer: 2000,
//         timerProgressBar: true,
//         showConfirmButton: false,
//       });
//       setCurrentPlayingAudio(null);
//       delete audioRefs.current[messageId];
//     };

//     audio.load(); // Ensure the audio is loaded before playing
//     audio.play();
//   };
//   const pauseAudio = (messageId) => {
//     const audio = audioRefs.current[messageId];
//     if (audio) {
//       audio.pause();
//       setCurrentPlayingAudio(null);
//     }
//   };

//   const stopAllAudioPlayback = () => {
//     for (const messageId in audioRefs.current) {
//       if (audioRefs.current[messageId]) {
//         audioRefs.current[messageId].pause();
//         audioRefs.current[messageId].currentTime = 0; // Rewind
//         delete audioRefs.current[messageId];
//       }
//     }
//     setCurrentPlayingAudio(null);
//   };

//   return (
//     <div className={styles.publicChatContainer}>
//       <header className={styles.chatHeader}>
//         <h2 className={styles.chatTitle}>
//           {chatMode === "public"
//             ? "Evangadi Public Chat"
//             : `DM with ${currentDmRecipient?.username || "Unknown User"}`}
//         </h2>
//         <div className={styles.headerControls}>
//           <button
//             className={`${styles.chatModeButton} ${
//               chatMode === "public" ? styles.activeMode : ""
//             }`}
//             onClick={() => switchChatMode("public")}
//             title="Switch to Public Chat"
//           >
//             <FiUsers className={styles.chatModeIcon} /> Public
//           </button>
//           <button
//             className={`${styles.chatModeButton} ${
//               chatMode === "private" ? styles.activeMode : ""
//             }`}
//             onClick={() => {
//               setShowRegisteredUsersModal(true);
//               if (socket) {
//                 socket.emit("getRegisteredUsers"); // <-- Add this line
//               }
//             }}
//             disabled={!user?.userid}
//             title="Start a Private Chat"
//           >
//             <FiMessageCircle className={styles.chatModeIcon} /> Private
//           </button>

//           <div className={styles.onlineUsersButtonWrapper}>
//             <button
//               className={styles.onlineUsersButton}
//               onClick={() => {
//                 /* You can add a modal here to show detailed online user list */
//               }}
//               title="View Online Users"
//             >
//               Online ({onlineUsers.length})
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Display of online users */}
//       <div className={styles.onlineUsersDisplay}>
//         <strong>Online: </strong>
//         {onlineUsers.length > 0 ? (
//           onlineUsers.map((u) => (
//             <span key={u.userid} className={styles.onlineUserTag}>
//               <span className={styles.onlineIndicator}></span>
//               {u.username}
//               {u.userid !== user?.userid && (
//                 // Don't allow DMing self
//                 <button
//                   className={styles.dmButton}
//                   onClick={() => switchChatMode("private", u)}
//                   title={`Start private chat with ${u.username}`}
//                 >
//                   DM
//                 </button>
//               )}
//             </span>
//           ))
//         ) : (
//           <span className={styles.noOnlineUsers}>No one else is online.</span>
//         )}
//       </div>

//       {/* Main message display area */}
//       <section
//         className={styles.messagesContainer}
//         aria-live="polite"
//         role="log"
//       >
//         {loadingHistory ? (
//           <div className={styles.loadingMessage}>
//             <Loader type="ThreeDots" color="#007bff" height={30} width={30} />
//             <p className={styles.loadingText}>Loading chat history...</p>
//           </div>
//         ) : messages.length === 0 ? (
//           <div className={styles.emptyChat}>
//             {chatMode === "public"
//               ? "No public messages yet. Be the first to start a conversation!"
//               : `No private messages with ${
//                   currentDmRecipient?.username || "this user"
//                 } yet.`}
//           </div>
//         ) : (
//           messages.map((msg, index) => {
//             const isMyMessage = msg.userid === user?.userid;
//             const isFileMessage = msg.file_data && msg.file_name;
//             const isAudioMessage = msg.audio_data && msg.audio_type; // New check for audio
//             const isImage =
//               isFileMessage &&
//               msg.file_type &&
//               msg.file_type.startsWith("image/");
//             const isDeleted = msg.is_deleted;
//             const isBeingEdited = editingMessageId === msg.message_id;
//             const isCurrentlyPlaying =
//               currentPlayingAudio?.messageId === msg.message_id;

//             return (
//               <article
//                 key={msg.message_id || index}
//                 className={`${styles.messageArticle} ${
//                   isMyMessage ? styles.myMessageAlign : styles.otherMessageAlign
//                 }`}
//               >
//                 {msg.avatar_url ? (
//                   <img
//                     src={msg.avatar_url}
//                     alt={`${msg.username}'s avatar`}
//                     className={styles.messageAvatar}
//                     onError={(e) => {
//                       e.target.onerror = null;
//                       e.target.src =
//                         "https://placehold.co/32x32/ff6600/white?text=?"; // Fallback
//                     }}
//                   />
//                 ) : (
//                   <div className={styles.messageAvatarPlaceholder}>
//                     {getUserInitial(msg.username)}
//                   </div>
//                 )}

//                 <div
//                   className={`${styles.messageBubble} ${
//                     isMyMessage
//                       ? styles.myMessageBubble
//                       : styles.otherMessageBubble
//                   } ${isDeleted ? styles.deletedMessage : ""}`}
//                   ref={(el) => (messageBubbleRefs.current[msg.message_id] = el)}
//                 >
//                   <span className={styles.messageUsername}>
//                     {msg.username || "Anonymous"}
//                     {msg.message_type === "private" && (
//                       <span className={styles.privateTag}> (Private)</span>
//                     )}
//                   </span>
//                   {isDeleted ? (
//                     <p className={styles.messageText}>
//                       <FiTrash2 /> {msg.message_text}
//                     </p>
//                   ) : (
//                     <>
//                       {isImage && (
//                         <img
//                           src={msg.file_data}
//                           alt={msg.file_name || "Sent image"}
//                           className={styles.messageImage}
//                           onClick={() =>
//                             openImageInModal(msg.file_data, msg.file_name)
//                           } // Open image in modal on click
//                           onError={(e) => {
//                             e.target.onerror = null;
//                             e.target.src =
//                               "https://placehold.co/150x100/eeeeee/gray?text=Image+Error";
//                           }}
//                         />
//                       )}
//                       {!isImage &&
//                         isFileMessage && ( // Generic file display
//                           <div className={styles.messageFile}>
//                             <button
//                               onClick={() =>
//                                 downloadFile(
//                                   msg.file_data,
//                                   msg.file_name,
//                                   msg.file_type
//                                 )
//                               }
//                               className={styles.fileDownloadButton} // Use the new button style
//                               title={`Download ${msg.file_name}`}
//                             >
//                               <FiDownload className={styles.fileIcon} />
//                               <span>{msg.file_name}</span>
//                             </button>
//                           </div>
//                         )}

//                       {isAudioMessage && (
//                         <div className={styles.messageAudio}>
//                           <button
//                             onClick={() =>
//                               isCurrentlyPlaying
//                                 ? pauseAudio(msg.message_id)
//                                 : playAudio(msg.message_id, msg.audio_data)
//                             }
//                             className={styles.audioControlButton}
//                             title={
//                               isCurrentlyPlaying ? "Pause Audio" : "Play Audio"
//                             }
//                           >
//                             {isCurrentlyPlaying ? (
//                               <FiPauseCircle className={styles.audioIcon} />
//                             ) : (
//                               <FiPlayCircle className={styles.audioIcon} />
//                             )}
//                           </button>
//                           <span className={styles.audioDuration}>
//                             {msg.audio_duration
//                               ? formatRecordingDuration(msg.audio_duration)
//                               : "Audio Message"}
//                           </span>
//                         </div>
//                       )}

//                       {msg.message_text && (
//                         <p className={styles.messageText}>{msg.message_text}</p>
//                       )}

//                       {/* Reactions here, after text/files/audio */}
//                       {console.log("msg.reactions", msg.reactions)}
//                       {Array.isArray(msg.reactions) &&
//                         msg.reactions.length > 0 && (
//                           <div className={styles.reactionsContainer}>
//                             {msg.reactions.map((reaction) => (
//                               <span
//                                 key={reaction.emoji}
//                                 className={`${styles.reactionBubble} ${
//                                   Array.isArray(reaction.userids) &&
//                                   reaction.userids.includes(user?.userid)
//                                     ? styles.userReacted
//                                     : ""
//                                 }`}
//                                 onClick={() =>
//                                   handleReaction(msg.message_id, reaction.emoji)
//                                 }
//                                 title={
//                                   Array.isArray(reaction.usernames) &&
//                                   reaction.usernames.length > 0
//                                     ? `Reacted by: ${reaction.usernames.join(
//                                         ", "
//                                       )}`
//                                     : "React"
//                                 }
//                               >
//                                 <span className={styles.emoji}>
//                                   {reaction.emoji}
//                                 </span>
//                                 <span className={styles.count}>
//                                   {Array.isArray(reaction.userids)
//                                     ? reaction.userids.length
//                                     : 0}
//                                 </span>
//                               </span>
//                             ))}
//                           </div>
//                         )}
//                       {console.log("msg.reactions", msg.reactions)}
//                     </>
//                   )}

//                   <time
//                     className={styles.messageTimestamp}
//                     dateTime={msg.created_at}
//                   >
//                     {formatTimestamp(msg.created_at)}
//                     {msg.edited_at && (
//                       <span className={styles.editedTag}> (edited)</span>
//                     )}
//                   </time>

//                   {/* Reaction, Edit, Delete Buttons at the bottom */}
//                   {!isDeleted && (
//                     <div className={styles.messageActions}>
//                       {msg.message_id && (
//                         <button
//                           className={styles.reactButton}
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             setShowReactionMenuForMessageId(
//                               showReactionMenuForMessageId === msg.message_id
//                                 ? null
//                                 : msg.message_id
//                             );
//                             setShowFullReactionEmojiPicker(null);
//                           }}
//                           title="React to message"
//                         >
//                           +
//                         </button>
//                       )}

//                       {isMyMessage &&
//                         !isFileMessage &&
//                         !isAudioMessage && ( // Only allow editing own text messages
//                           <button
//                             className={styles.editButton}
//                             onClick={() => startEditingMessage(msg)}
//                             title="Edit message"
//                             disabled={isBeingEdited}
//                           >
//                             <FiEdit />
//                           </button>
//                         )}

//                       {isMyMessage && ( // Allow deleting own messages
//                         <button
//                           className={styles.deleteButton}
//                           onClick={() => handleDeleteMessage(msg.message_id)}
//                           title="Delete message"
//                         >
//                           <FiTrash2 />
//                         </button>
//                       )}
//                     </div>
//                   )}

//                   {/* Reaction Mini Menu (position relative to messageBubble) */}
//                   {showReactionMenuForMessageId === msg.message_id && (
//                     <div className={styles.reactionMenu}>
//                       {COMMON_REACTIONS.map((emoji) => (
//                         <button
//                           key={emoji}
//                           className={styles.reactionMenuItem}
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleReaction(msg.message_id, emoji);
//                           }}
//                         >
//                           {emoji}
//                         </button>
//                       ))}
//                       <button
//                         className={`${styles.reactionMenuItem} ${styles.moreEmojisButton}`}
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           openFullReactionPicker(msg.message_id, e);
//                         }}
//                       >
//                         +
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </article>
//             );
//           })
//         )}
//         {isTyping && (
//           <div className={styles.typingIndicator}>Someone is typing...</div>
//         )}
//         <div ref={messagesEndRef} />
//       </section>

//       {/* Full Reaction Emoji Picker (conditionally rendered) */}
//       {showFullReactionEmojiPicker && (
//         <>
//           <div
//             className={styles.reactionEmojiPickerOverlay}
//             onClick={() => setShowFullReactionEmojiPicker(null)}
//           ></div>
//           <div className={styles.reactionEmojiPicker}>
//             <EmojiPicker
//               onEmojiClick={(emojiObject) =>
//                 handleReaction(showFullReactionEmojiPicker, emojiObject.emoji)
//               }
//               theme="light"
//               emojiStyle="native"
//               width="100%"
//               height="100%"
//               searchDisabled={false}
//               skinTonesDisabled={false}
//             />
//           </div>
//         </>
//       )}

//       {/* NEW: Registered Users Modal */}
//       {showRegisteredUsersModal && (
//         <div
//           className={styles.modalOverlay}
//           onClick={() => setShowRegisteredUsersModal(false)}
//         >
//           <div
//             className={styles.registeredUsersModal}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className={styles.modalHeader}>
//               <h3>Start a Conversation ({registeredUsers.length} Users)</h3>
//               <button
//                 className={styles.closeModalButton}
//                 onClick={() => setShowRegisteredUsersModal(false)}
//               >
//                 <FiX />
//               </button>
//             </div>
//             <div className={styles.modalBody}>
//               {registeredUsers.length === 0 ? (
//                 <p>No other registered users found.</p>
//               ) : (
//                 <ul className={styles.userList}>
//                   {registeredUsers
//                     .slice()
//                     .sort((a, b) => {
//                       const aOnline = onlineUsers.some((o) => String(o.userid) === String(a.userid));
//                       const bOnline = onlineUsers.some((o) => String(o.userid) === String(b.userid));
//                       if (aOnline && !bOnline) return -1;
//                       if (!aOnline && bOnline) return 1;
//                       return 0;
//                     })
//                     .map((u) => {
//                       console.log("Registered:", u.userid, "Online:", onlineUsers.map(o => o.userid));
//                       return (
//                         <li key={u.userid} className={styles.userListItem}>
//                           <div className={styles.userInfo}>
//                             {u.avatar_url ? (
//                               <img
//                                 src={u.avatar_url}
//                                 alt={`${u.username}'s avatar`}
//                                 className={styles.userListAvatar}
//                               />
//                             ) : (
//                               <div className={styles.userListAvatarPlaceholder}>
//                                 {getUserInitial(u.username)}
//                               </div>
//                             )}
//                             <span>{u.username}</span>
//                             {onlineUsers.some(
//                               (onlineUser) => String(onlineUser.userid) === String(u.userid)
//                             ) ? (
//                               <span
//                                 className={styles.onlineIndicatorSmall}
//                                 title="Online"
//                               ></span>
//                             ) : (
//                               <span
//                                 className={styles.offlineIndicatorSmall}
//                                 title="Offline"
//                               ></span>
//                             )}
//                           </div>
//                           <button
//                             className={styles.selectUserButton}
//                             onClick={() => {
//                               switchChatMode("private", {
//                                 userid: u.userid,
//                                 username: u.username,
//                                 avatar_url: u.avatar_url,
//                               });
//                               setShowRegisteredUsersModal(false); // Close modal
//                             }}
//                           >
//                             Chat <FiMessageCircle />
//                           </button>
//                         </li>
//                       );
//                     })}
//                 </ul>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* NEW: Full-size Image View Modal */}
//       {showImageModal && modalImageData && (
//         <div
//           className={styles.imageModalOverlay}
//           onClick={() => setShowImageModal(false)}
//         >
//           <div
//             className={styles.imageModalContent}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <button
//               className={styles.closeModalButton}
//               onClick={() => setShowImageModal(false)}
//             >
//               <FiX />
//             </button>
//             <img
//               src={modalImageData}
//               alt={modalImageName || "Full size image"}
//               className={styles.fullSizeImage}
//             />
//             <div className={styles.modalActions}>
//               <span className={styles.modalImageName}>{modalImageName}</span>
//               <button
//                 onClick={() =>
//                   downloadFile(modalImageData, modalImageName, null)
//                 } // Pass null for fileType as it's an image
//                 className={styles.downloadModalButton}
//               >
//                 <FiDownload /> Download
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Message input form */}
//       <form
//         onSubmit={sendMessage}
//         className={styles.inputForm}
//         aria-label="Send a message"
//       >
//         {recordedAudioBlob && (
//           <div className={styles.recordedAudioPreview}>
//             <span className={styles.audioFileName}>
//               Voice Message ({formatRecordingDuration(recordingDuration)})
//             </span>
//             <button
//               type="button"
//               onClick={() => setRecordedAudioBlob(null)}
//               className={styles.clearFileButton}
//               title="Clear recorded audio"
//             >
//               <FiX />
//             </button>
//           </div>
//         )}

//         {isRecording && (
//           <div className={styles.recordingIndicator}>
//             <FiMic className={styles.recordingIcon} /> Recording{" "}
//             <span className={styles.recordingTimer}>
//               {formatRecordingDuration(recordingDuration)}
//             </span>
//             <button
//               type="button"
//               onClick={stopRecording}
//               className={styles.stopRecordingButton}
//               title="Stop Recording"
//             >
//               <FiStopCircle /> Stop
//             </button>
//             <button
//               type="button"
//               onClick={cancelRecording}
//               className={styles.cancelRecordingButton}
//               title="Cancel Recording"
//             >
//               <FiX /> Cancel
//             </button>
//           </div>
//         )}

//         {selectedFile && (
//           <div className={styles.selectedFilePreview}>
//             <div className={styles.fileIconWrapper}>
//               {selectedFile.type.startsWith("image/") ? (
//                 <img
//                   src={selectedFile.data}
//                   alt="Selected file preview"
//                   className={styles.previewThumbnail}
//                 />
//               ) : (
//                 <FiDownload className={styles.fileTypeIcon} />
//               )}
//             </div>
//             <span className={styles.fileNamePreview}>{selectedFile.name}</span>
//             <button
//               type="button"
//               onClick={() => setSelectedFile(null)}
//               className={styles.clearFileButton}
//               title="Clear selected file"
//             >
//               <FiX />
//             </button>
//           </div>
//         )}

//         {editingMessageId && (
//           <div className={styles.editingIndicator}>
//             Editing message:{" "}
//             <span className={styles.editingMessageTextPreview}>
//               {editingMessageText.substring(0, 50)}
//               {editingMessageText.length > 50 ? "..." : ""}
//             </span>
//             <button
//               type="button"
//               onClick={cancelEditing}
//               className={styles.cancelEditButton}
//             >
//               <FiX /> Cancel
//             </button>
//           </div>
//         )}

//         <div className={styles.inputFieldWrapper}>
//           <input
//             type="file"
//             accept="image/*, audio/*, video/*, application/pdf, .doc, .docx, .xls, .xlsx, .txt" // Accept audio and video too
//             ref={fileInputRef}
//             onChange={handleFileSelect}
//             style={{ display: "none" }} // Hidden input
//             aria-label="Select file to send"
//             disabled={isRecording || recordedAudioBlob !== null} // Disable file if recording or audio exists
//           />
//           <button
//             type="button"
//             onClick={triggerFileInput}
//             className={styles.attachButton}
//             title="Attach File"
//             disabled={
//               editingMessageId !== null || isRecording || recordedAudioBlob
//             } // Disable if editing, recording, or audio exists
//           >
//             <FiPaperclip className={styles.attachIcon} />
//           </button>

//           {isRecording || recordedAudioBlob ? (
//             // Hide mic button if recording or recorded audio is present
//             // but keep the space for layout consistency if needed, or remove it.
//             <div className={styles.emptyButtonPlaceholder}></div>
//           ) : (
//             <button
//               type="button"
//               onClick={startRecording}
//               className={styles.micButton}
//               title="Record Voice Message"
//               disabled={
//                 editingMessageId !== null ||
//                 selectedFile !== null ||
//                 !user?.userid
//               } // Disable if editing, file attached, or not logged in
//             >
//               <FiMic className={styles.micIcon} />
//             </button>
//           )}

//           <button
//             type="button"
//             onClick={() => setShowInputEmojiPicker((prev) => !prev)}
//             className={styles.emojiButton}
//             title="Choose Emoji"
//             aria-expanded={showInputEmojiPicker}
//             aria-haspopup="dialog"
//             ref={inputEmojiButtonRef}
//           >
//             <FiSmile className={styles.emojiIcon} />
//           </button>

//           <input
//             type="text"
//             value={editingMessageId ? editingMessageText : input}
//             onChange={(e) =>
//               editingMessageId
//                 ? setEditingMessageText(e.target.value)
//                 : handleInputChange(e)
//             }
//             placeholder={
//               editingMessageId
//                 ? "Edit your message..."
//                 : isRecording
//                 ? "Recording voice message..."
//                 : recordedAudioBlob
//                 ? "Add text to your voice message..."
//                 : "Type your message..."
//             }
//             className={styles.messageInput}
//             disabled={!socket || isRecording} // Disable input if recording
//             aria-label="Message input"
//             autoComplete="off"
//             spellCheck="false"
//           />
//           <button
//             type="submit"
//             className={styles.sendButton}
//             disabled={
//               (!input.trim() &&
//                 !selectedFile &&
//                 !recordedAudioBlob &&
//                 !editingMessageId) || // Disable if no content AND not editing
//               !socket ||
//               !user?.userid ||
//               isRecording // Disable send while recording
//             }
//             aria-label={
//               editingMessageId ? "Save edited message" : "Send message"
//             }
//           >
//             {editingMessageId ? (
//               <FiEdit className={styles.sendIcon} />
//             ) : (
//               <FiSend className={styles.sendIcon} />
//             )}
//           </button>
//         </div>

//         {showInputEmojiPicker && (
//           <div
//             className={styles.inputEmojiPickerContainer}
//             ref={inputEmojiPickerRef}
//             role="dialog"
//             aria-modal="true"
//             aria-label="Emoji picker"
//           >
//             <EmojiPicker
//               onEmojiClick={onInputEmojiClick}
//               theme="light"
//               emojiStyle="native"
//               width="100%"
//               height={300}
//               searchDisabled={false}
//               skinTonesDisabled={false}
//             />
//           </div>
//         )}
//       </form>
//     </div>
//   );
// };

// export default PublicChat;


import React, { useState, useEffect, useRef, useContext } from "react";
import { io } from "socket.io-client";
import styles from "./PublicChat.module.css";
import { UserState } from "../../App.jsx";
import {
  FiSend,
  FiSmile,
  FiX,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiUsers,
  FiMessageCircle,
  FiPaperclip,
  FiMic,
  FiStopCircle,
  FiPlayCircle,
  FiPauseCircle,
} from "react-icons/fi";
import EmojiPicker from "emoji-picker-react";
import Loader from "../../components/Loader/Loader";
import Swal from "sweetalert2";

const SOCKET_SERVER_URL = "https://server.evangadiforum.com";
const PUBLIC_CHAT_ROOM_ID = "stackoverflow_lobby";

const COMMON_REACTIONS = ["👍", "❤️", "😂", "🔥", "🎉"];

const getPrivateChatRoomId = (user1Id, user2Id) => {
  if (!user1Id || !user2Id) return null;
  const sortedIds = [user1Id, user2Id].sort();
  return `${sortedIds[0]}-${sortedIds[1]}`;
};

const PublicChat = () => {
  // Access user information and loading state from context
  const { user, loadingUser } = useContext(UserState); // <-- Add loadingUser

  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [showRegisteredUsersModal, setShowRegisteredUsersModal] =
    useState(false);

  const [showReactionMenuForMessageId, setShowReactionMenuForMessageId] =
    useState(null);
  const [showFullReactionEmojiPicker, setShowFullReactionEmojiPicker] =
    useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageData, setModalImageData] = useState(null);
  const [modalImageName, setModalImageName] = useState(null);

  const [chatMode, setChatMode] = useState("public");
  const [currentDmRecipient, setCurrentDmRecipient] = useState(null);

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingMessageText, setEditingMessageText] = useState("");

  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingIntervalRef = useRef(null);

  const [currentPlayingAudio, setCurrentPlayingAudio] = useState(null);
  const audioRefs = useRef({});

  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [showInputEmojiPicker, setShowInputEmojiPicker] = useState(false);
  const inputEmojiPickerRef = useRef(null);
  const inputEmojiButtonRef = useRef(null);
  const messageBubbleRefs = useRef({});

  const getUserInitial = (username) => {
    return username ? username.charAt(0).toUpperCase() : "?";
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
  };

  // --- IMPORTANT FIX START ---
  // Effect hook for connecting to Socket.IO and setting up event listeners
  // This useEffect should only run once the user data is loaded (i.e., !loadingUser)
  useEffect(() => {
    // Only proceed if user data has been loaded and is not null (i.e. user is logged in)
    // or if the user is null but loadingUser is false (meaning user is definitively not logged in)
    if (loadingUser) {
      console.log("Waiting for user data to load...");
      return; // Do nothing until user data is loaded
    }

    // If user is null after loading, prevent socket connection for unauthenticated operations
    if (!user) {
      console.log("User not logged in. Socket features disabled.");
      // Ensure any existing socket connection is closed if user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setMessages([]); // Clear messages if user logs out
      setOnlineUsers([]); // Clear online users
      setRegisteredUsers([]); // Clear registered users
      setLoadingHistory(false); // No history to load if not authenticated
      return;
    }

    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ["websocket", "polling"],
      query: { userid: user.userid, username: user.username }, // Use user directly as we've checked for its existence
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to Socket.IO server.");

      let roomToJoin;
      let fetchHistoryData = { userid: user.userid }; // Use user.userid directly

      if (chatMode === "public") {
        roomToJoin = PUBLIC_CHAT_ROOM_ID;
        fetchHistoryData.roomId = PUBLIC_CHAT_ROOM_ID;
      } else if (chatMode === "private" && currentDmRecipient) {
        roomToJoin = getPrivateChatRoomId(
          user.userid,
          currentDmRecipient.userid
        );
        fetchHistoryData.roomId = roomToJoin;
        fetchHistoryData.targetuserid = currentDmRecipient.userid;
      } else {
        roomToJoin = PUBLIC_CHAT_ROOM_ID;
        fetchHistoryData.roomId = PUBLIC_CHAT_ROOM_ID;
      }

      console.log(`Attempting to join room: ${roomToJoin}`);
      newSocket.emit("joinRoom", {
        roomId: roomToJoin,
        userid: user.userid,
        username: user.username,
      });

      setLoadingHistory(true);
      newSocket.emit("fetchChatHistory", fetchHistoryData);
    });

    newSocket.on("message", (message) => {
      console.log("Received message:", message);
      setMessages((prevMessages) => {
        if (prevMessages.some((msg) => msg.message_id === message.message_id)) {
          return prevMessages;
        }
        return [...prevMessages, message];
      });
    });

    newSocket.on("chatHistory", (history) => {
      console.log("Received chat history:", history);
      setMessages(history);
      setLoadingHistory(false);
      scrollToBottom();
    });

    newSocket.on("messageUpdated", (updatedMessage) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.message_id === updatedMessage.message_id ? updatedMessage : msg
        )
      );
    });

    newSocket.on("typing", ({ username, roomId }) => {
      const currentRoomId =
        chatMode === "public"
          ? PUBLIC_CHAT_ROOM_ID
          : currentDmRecipient
          ? getPrivateChatRoomId(user.userid, currentDmRecipient.userid)
          : null;

      if (username !== user.username && roomId === currentRoomId) {
        // Use user.username directly
        setIsTyping(true);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    });

    newSocket.on("onlineUsers", (users) => {
      setOnlineUsers(users.filter((u) => u.userid !== user.userid)); // Use user.userid directly
    });

    newSocket.on("registeredUsers", (users) => {
      setRegisteredUsers(users.filter((u) => u.userid !== user.userid)); // Use user.userid directly
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server.");
      setIsTyping(false);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket.IO connection error:", err.message);
      Swal.fire({
        icon: "error",
        title: "Connection Error",
        text: "Could not connect to the chat server. Please try again later.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    });

    return () => {
      if (newSocket) {
        // Use newSocket, not socket from state closure
        let roomToLeave;
        if (chatMode === "public") {
          roomToLeave = PUBLIC_CHAT_ROOM_ID;
        } else if (chatMode === "private" && currentDmRecipient) {
          roomToLeave = getPrivateChatRoomId(
            user.userid,
            currentDmRecipient.userid
          );
        }
        if (roomToLeave) {
          newSocket.emit("leaveRoom", {
            roomId: roomToLeave,
            userid: user.userid,
          });
        }
        newSocket.disconnect();
        console.log("Socket disconnected on cleanup.");
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      stopRecording();
      stopAllAudioPlayback();
    };
  }, [user, loadingUser, chatMode, currentDmRecipient]); // Add loadingUser to dependencies
  // --- IMPORTANT FIX END ---

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputEmojiPickerRef.current &&
        !inputEmojiPickerRef.current.contains(event.target) &&
        inputEmojiButtonRef.current &&
        !inputEmojiButtonRef.current.contains(event.target)
      ) {
        setShowInputEmojiPicker(false);
      }

      if (showReactionMenuForMessageId || showFullReactionEmojiPicker) {
        let clickedInsideAnyMessageBubble = false;
        for (const messageId in messageBubbleRefs.current) {
          if (
            messageBubbleRefs.current[messageId] &&
            messageBubbleRefs.current[messageId].contains(event.target)
          ) {
            clickedInsideAnyMessageBubble = true;
            break;
          }
        }
        if (!clickedInsideAnyMessageBubble) {
          setShowReactionMenuForMessageId(null);
          setShowFullReactionEmojiPicker(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    showInputEmojiPicker,
    showReactionMenuForMessageId,
    showFullReactionEmojiPicker,
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getCurrentRoomId = () => {
    if (chatMode === "public") {
      return PUBLIC_CHAT_ROOM_ID;
    } else if (chatMode === "private" && currentDmRecipient) {
      // Access user.userid directly here as the `useEffect` ensures `user` is present
      return getPrivateChatRoomId(user.userid, currentDmRecipient.userid);
    }
    return null;
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!socket || !user?.userid) {
      // Good check here
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please log in to send messages.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    const currentRoom = getCurrentRoomId();
    if (!currentRoom) {
      console.error("No active chat room to send message to.");
      return;
    }

    // If editing a message
    if (editingMessageId) {
      if (editingMessageText.trim()) {
        socket.emit("editMessage", {
          message_id: editingMessageId,
          new_text: editingMessageText.trim(),
          userid: user.userid, // user is guaranteed here by the initial check
          roomId: currentRoom,
        });
        setEditingMessageId(null);
        setEditingMessageText("");
      }
      return;
    }

    // If sending a new message (text, file, or audio)
    if (input.trim() || selectedFile || recordedAudioBlob) {
      const messageData = {
        userid: user.userid, // user is guaranteed here
        username: user.username, // user is guaranteed here
        avatar_url: user.avatar_url, // user is guaranteed here
        room_id: currentRoom,
        message_type: chatMode,
        recipient_id:
          chatMode === "private" ? currentDmRecipient?.userid : null,
      };

      if (recordedAudioBlob) {
        const reader = new FileReader();
        reader.readAsDataURL(recordedAudioBlob);
        reader.onloadend = () => {
          socket.emit("voiceMessage", {
            ...messageData,
            audio_data: reader.result,
            audio_type: recordedAudioBlob.type,
            audio_duration: recordingDuration,
          });
          setRecordedAudioBlob(null);
          setRecordingDuration(0);
        };
      } else if (selectedFile) {
        socket.emit("fileMessage", {
          ...messageData,
          message_text: input.trim(),
          file_data: selectedFile.data,
          file_name: selectedFile.name,
          file_type: selectedFile.type,
        });
        setSelectedFile(null);
      } else if (input.trim()) {
        socket.emit("sendMessage", {
          ...messageData,
          message_text: input.trim(),
        });
      }

      setInput("");
      setShowInputEmojiPicker(false);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (e.target.value.length > 0) {
      // Ensure socket and user exist before emitting typing event
      if (socket && user?.username) {
        socket.emit("typing", {
          roomId: getCurrentRoomId(),
          username: user.username,
        });
      }
    }
  };

  const onInputEmojiClick = (emojiObject) => {
    setInput((prevInput) => prevInput + emojiObject.emoji);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File Too Large",
          text: "Please select a file smaller than 5MB.",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        setSelectedFile(null);
        event.target.value = null;
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedFile({
          data: e.target.result,
          name: file.name,
          type: file.type,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    // Only allow if user is logged in
    if (!user?.userid) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please log in to attach files.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }
    fileInputRef.current.click();
  };

  const downloadFile = (base64Data, filename, fileType) => {
    try {
      const byteCharacters = atob(base64Data.split(",")[1] || base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      const blob = new Blob([byteArray], {
        type: fileType || "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      Swal.fire({
        icon: "error",
        title: "Download Error",
        text: "Could not download the file.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  const openImageInModal = (imageData, imageName) => {
    setModalImageData(imageData);
    setModalImageName(imageName);
    setShowImageModal(true);
  };

  const startEditingMessage = (message) => {
    // Ensure user is logged in and it's their message
    if (!user?.userid || message.userid !== user.userid) {
      Swal.fire({
        icon: "error",
        title: "Permission Denied",
        text: "You can only edit your own messages.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }
    setEditingMessageId(message.message_id);
    setEditingMessageText(message.message_text);
    setInput("");
    setSelectedFile(null);
    stopRecording();
    setRecordedAudioBlob(null);
    stopAllAudioPlayback();
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingMessageText("");
  };

  const handleDeleteMessage = (messageId, messageUserId) => {
    // Pass messageUserId
    // Ensure user is logged in and it's their message
    if (!user?.userid || messageUserId !== user.userid) {
      Swal.fire({
        icon: "error",
        title: "Permission Denied",
        text: "You can only delete your own messages.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        if (socket && user?.userid) {
          socket.emit("deleteMessage", {
            message_id: messageId,
            userid: user.userid, // user is guaranteed here
            roomId: getCurrentRoomId(),
          });
          Swal.fire("Deleted!", "Your message has been deleted.", "success");
        }
      }
    });
  };

  const handleReaction = (messageId, emoji) => {
    if (!user?.userid) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please log in to add reactions.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }
    if (socket && user.userid) {
      // user is guaranteed here
      socket.emit("reactToMessage", {
        message_id: messageId,
        emoji: emoji,
        userid: user.userid,
        username: user.username,
        roomId: getCurrentRoomId(),
      });
      setShowReactionMenuForMessageId(null);
      setShowFullReactionEmojiPicker(null);
    }
  };

  const openFullReactionPicker = (messageId, event) => {
    setShowFullReactionEmojiPicker(messageId);
    setShowReactionMenuForMessageId(null);
  };

  const switchChatMode = (mode, recipient = null) => {
    if (!user?.userid && mode !== "public") {
      // Prevent switching to private if not logged in
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please log in to access private chat features.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    if (mode === "private" && recipient === null) {
      const sortedUsers = getSortedUsers();
      if (sortedUsers.length > 0) {
        recipient = sortedUsers[0];
      } else {
        Swal.fire({
          icon: "info",
          title: "No Users Available",
          text: "No other registered users are available for private chat.",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        return; // Don't switch if no users for DM
      }
    }

    if (mode === chatMode && recipient?.userid === currentDmRecipient?.userid) {
      return;
    }

    if (isRecording) {
      Swal.fire({
        icon: "warning",
        title: "Recording in Progress",
        text: "Please stop the current recording before switching chat modes.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }
    if (editingMessageId) {
      Swal.fire({
        icon: "warning",
        title: "Editing in Progress",
        text: "Please finish or cancel editing before switching chat modes.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    const prevRoomId = getCurrentRoomId();
    if (prevRoomId && socket) {
      socket.emit("leaveRoom", {
        roomId: prevRoomId,
        userid: user.userid, // user is guaranteed here by initial check in function
      });
    }

    setChatMode(mode);
    setCurrentDmRecipient(recipient);
    setMessages([]);
    setLoadingHistory(true);
    setInput("");
    setSelectedFile(null);
    setRecordedAudioBlob(null);
    stopAllAudioPlayback();

    const newRoomId =
      mode === "public"
        ? PUBLIC_CHAT_ROOM_ID
        : getPrivateChatRoomId(user.userid, recipient?.userid); // user is guaranteed here

    if (newRoomId && socket) {
      socket.emit("joinRoom", {
        roomId: newRoomId,
        userid: user.userid, // user is guaranteed here
        username: user.username, // user is guaranteed here
      });

      const fetchHistoryData = { userid: user.userid, roomId: newRoomId }; // user is guaranteed here
      if (mode === "private" && recipient) {
        fetchHistoryData.targetuserid = recipient.userid;
      }
      socket.emit("fetchChatHistory", fetchHistoryData);
    }

    if (mode === "private") {
      setShowRegisteredUsersModal(false);
    }
  };

  const getSortedUsers = () => {
    // Sort registered users by username for consistent display
    return [...registeredUsers].sort((a, b) =>
      a.username.localeCompare(b.username)
    );
  };

  // --- Voice Recording Functions ---

  const startRecording = async () => {
    if (!user?.userid) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please log in to send voice messages.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }
    if (selectedFile) {
      Swal.fire({
        icon: "warning",
        title: "File Attached",
        text: "Please clear the attached file before recording a voice message.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }
    if (editingMessageId) {
      Swal.fire({
        icon: "warning",
        title: "Editing in Progress",
        text: "Please finish or cancel editing before recording a voice message.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      setIsRecording(true);
      setAudioChunks([]);
      setRecordedAudioBlob(null);
      setRecordingDuration(0);

      recorder.ondataavailable = (event) => {
        setAudioChunks((prev) => [...prev, event.data]);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        setRecordedAudioBlob(audioBlob);
        setIsRecording(false);
        stream.getTracks().forEach((track) => track.stop());
        clearInterval(recordingIntervalRef.current);
        setRecordingDuration(0);
      };

      recorder.start();
      console.log("Recording started...");

      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      Swal.fire({
        icon: "error",
        title: "Microphone Access Denied",
        text: "Please allow microphone access to send voice messages.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
    setIsRecording(false);
    setAudioChunks([]);
    setRecordedAudioBlob(null);
    setRecordingDuration(0);
    clearInterval(recordingIntervalRef.current);
    console.log("Recording cancelled.");
  };

  const formatRecordingDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // --- Audio Playback Functions ---

  const playAudio = (messageId, audioData) => {
    stopAllAudioPlayback();

    if (!audioData) {
      console.error("No audio data to play.");
      return;
    }

    let audioSrc = audioData;
    if (!audioSrc.startsWith("data:audio/")) {
      audioSrc = `data:audio/webm;base64,${audioSrc}`;
    }

    const audio = new Audio(audioSrc);
    audioRefs.current[messageId] = audio;

    audio.onplay = () => {
      setCurrentPlayingAudio({ messageId, audioInstance: audio });
    };

    audio.onended = () => {
      setCurrentPlayingAudio(null);
      delete audioRefs.current[messageId];
    };

    audio.onerror = (e) => {
      console.error("Audio playback error:", e);
      Swal.fire({
        icon: "error",
        title: "Audio Playback Error",
        text: "Could not play this audio message.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      setCurrentPlayingAudio(null);
      delete audioRefs.current[messageId];
    };

    audio.load();
    audio.play();
  };
  const pauseAudio = (messageId) => {
    const audio = audioRefs.current[messageId];
    if (audio) {
      audio.pause();
      setCurrentPlayingAudio(null);
    }
  };

  const stopAllAudioPlayback = () => {
    for (const messageId in audioRefs.current) {
      if (audioRefs.current[messageId]) {
        audioRefs.current[messageId].pause();
        audioRefs.current[messageId].currentTime = 0;
        delete audioRefs.current[messageId];
      }
    }
    setCurrentPlayingAudio(null);
  };

  // --- Render logic for authenticated vs unauthenticated ---
  if (loadingUser) {
    return (
      <div className={styles.loadingContainer}>
        <Loader type="ThreeDots" color="#007bff" height={50} width={50} />
        <p>Loading chat...</p>
      </div>
    );
  }

  // If user is not logged in after loading, show a message
  if (!user) {
    return (
      <div className={styles.publicChatContainer}>
        <div className={styles.notLoggedInMessage}>
          <h2>Chat Features Unavailable</h2>
          <p>Please log in to participate in the chat.</p>
          <Link to="/auth" className={styles.loginLink}>
            Login or Sign Up
          </Link>
          <p className={styles.guestInfo}>
            (Public chat history will be displayed, but you won't be able to
            send messages or start DMs.)
          </p>
          {/* Still display public messages if any, even if not logged in */}
          <section
            className={styles.messagesContainer}
            aria-live="polite"
            role="log"
          >
            {loadingHistory ? (
              <div className={styles.loadingMessage}>
                <Loader
                  type="ThreeDots"
                  color="#007bff"
                  height={30}
                  width={30}
                />
                <p className={styles.loadingText}>
                  Loading public chat history...
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className={styles.emptyChat}>No public messages yet.</div>
            ) : (
              messages.map((msg, index) => {
                const isMyMessage = msg.userid === user?.userid; // Will always be false for unlogged user
                const isFileMessage = msg.file_data && msg.file_name;
                const isAudioMessage = msg.audio_data && msg.audio_type;
                const isImage =
                  isFileMessage &&
                  msg.file_type &&
                  msg.file_type.startsWith("image/");
                const isDeleted = msg.is_deleted;

                // For unauthenticated users, disable interactive elements on messages
                return (
                  <article
                    key={msg.message_id || index}
                    className={`${styles.messageArticle} ${
                      isMyMessage
                        ? styles.myMessageAlign
                        : styles.otherMessageAlign
                    }`}
                  >
                    {msg.avatar_url ? (
                      <img
                        src={msg.avatar_url}
                        alt={`${msg.username}'s avatar`}
                        className={styles.messageAvatar}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://placehold.co/32x32/ff6600/white?text=?";
                        }}
                      />
                    ) : (
                      <div className={styles.messageAvatarPlaceholder}>
                        {getUserInitial(msg.username)}
                      </div>
                    )}
                    <div
                      ref={(el) =>
                        (messageBubbleRefs.current[msg.message_id] = el)
                      }
                      className={`${styles.messageBubble} ${
                        isMyMessage ? styles.myMessage : styles.otherMessage
                      } ${isDeleted ? styles.deletedMessage : ""}`}
                    >
                      <div className={styles.messageHeader}>
                        <span className={styles.messageSender}>
                          {msg.username || "Anonymous"}
                        </span>
                        <span className={styles.messageTimestamp}>
                          {formatTimestamp(msg.timestamp)}
                        </span>
                      </div>

                      {isDeleted ? (
                        <p className={styles.deletedText}>
                          <em>This message was deleted.</em>
                        </p>
                      ) : isFileMessage ? (
                        <div className={styles.fileMessageContent}>
                          {isImage && (
                            <img
                              src={msg.file_data}
                              alt={msg.file_name}
                              className={styles.chatImage}
                              onClick={() =>
                                openImageInModal(msg.file_data, msg.file_name)
                              }
                            />
                          )}
                          <p>{msg.message_text}</p>
                          <div className={styles.fileAttachmentInfo}>
                            <span>
                              {isImage ? "Image" : "File"}: {msg.file_name}
                            </span>
                            <button
                              className={styles.downloadButton}
                              onClick={() =>
                                downloadFile(
                                  msg.file_data,
                                  msg.file_name,
                                  msg.file_type
                                )
                              }
                              title="Download File"
                            >
                              <FiDownload />
                            </button>
                          </div>
                        </div>
                      ) : isAudioMessage ? (
                        <div className={styles.audioMessageContent}>
                          <button
                            className={styles.audioPlayButton}
                            onClick={() => {
                              if (isCurrentlyPlaying) {
                                pauseAudio(msg.message_id);
                              } else {
                                playAudio(msg.message_id, msg.audio_data);
                              }
                            }}
                            title={
                              isCurrentlyPlaying ? "Pause Audio" : "Play Audio"
                            }
                          >
                            {isCurrentlyPlaying ? (
                              <FiPauseCircle />
                            ) : (
                              <FiPlayCircle />
                            )}
                          </button>
                          <span className={styles.audioDuration}>
                            {formatRecordingDuration(msg.audio_duration || 0)}
                          </span>
                        </div>
                      ) : (
                        <p className={styles.messageText}>{msg.message_text}</p>
                      )}

                      {msg.reactions &&
                        Object.keys(msg.reactions).length > 0 && (
                          <div className={styles.reactionsContainer}>
                            {Object.entries(msg.reactions).map(
                              ([emoji, usersReacted]) => (
                                <span
                                  key={emoji}
                                  className={styles.reactionPill}
                                >
                                  {emoji} {usersReacted.length}
                                </span>
                              )
                            )}
                          </div>
                        )}
                    </div>
                  </article>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </section>
        </div>
      </div>
    );
  }

  // --- Main Render (Authenticated User) ---
  return (
    <div className={styles.publicChatContainer}>
      <header className={styles.chatHeader}>
        <h2 className={styles.chatTitle}>
          {chatMode === "public"
            ? "Evangadi Public Chat"
            : `DM with ${currentDmRecipient?.username || "Unknown User"}`}
        </h2>
        <div className={styles.headerControls}>
          <button
            className={`${styles.chatModeButton} ${
              chatMode === "public" ? styles.activeMode : ""
            }`}
            onClick={() => switchChatMode("public")}
            title="Switch to Public Chat"
          >
            <FiUsers className={styles.chatModeIcon} /> Public
          </button>
          <button
            className={`${styles.chatModeButton} ${
              chatMode === "private" ? styles.activeMode : ""
            }`}
            onClick={() => {
              setShowRegisteredUsersModal(true);
              if (socket) {
                socket.emit("getRegisteredUsers");
              }
            }}
            disabled={!user?.userid} // Disable if not logged in
            title="Start a Private Chat"
          >
            <FiMessageCircle className={styles.chatModeIcon} /> Private
          </button>

          <div className={styles.onlineUsersButtonWrapper}>
            <button
              className={styles.onlineUsersButton}
              onClick={() => {
                /* You can add a modal here to show detailed online user list */
              }}
              title="View Online Users"
            >
              Online ({onlineUsers.length})
            </button>
          </div>
        </div>
      </header>

      <div className={styles.onlineUsersDisplay}>
        <strong>Online: </strong>
        {onlineUsers.length > 0 ? (
          onlineUsers.map((u) => (
            <span key={u.userid} className={styles.onlineUserTag}>
              <span className={styles.onlineIndicator}></span>
              {u.username}
              {u.userid !== user.userid && ( // Use user.userid directly here
                <button
                  className={styles.dmButton}
                  onClick={() => switchChatMode("private", u)}
                  title={`Start private chat with ${u.username}`}
                >
                  DM
                </button>
              )}
            </span>
          ))
        ) : (
          <span className={styles.noOnlineUsers}>No one else is online.</span>
        )}
      </div>

      <section
        className={styles.messagesContainer}
        aria-live="polite"
        role="log"
      >
        {loadingHistory ? (
          <div className={styles.loadingMessage}>
            <Loader type="ThreeDots" color="#007bff" height={30} width={30} />
            <p className={styles.loadingText}>Loading chat history...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className={styles.emptyChat}>
            {chatMode === "public"
              ? "No public messages yet. Be the first to start a conversation!"
              : `No private messages with ${
                  currentDmRecipient?.username || "this user"
                } yet.`}
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMyMessage = msg.userid === user.userid; // Use user.userid directly
            const isFileMessage = msg.file_data && msg.file_name;
            const isAudioMessage = msg.audio_data && msg.audio_type;
            const isImage =
              isFileMessage &&
              msg.file_type &&
              msg.file_type.startsWith("image/");
            const isDeleted = msg.is_deleted;
            const isBeingEdited = editingMessageId === msg.message_id;
            const isCurrentlyPlaying =
              currentPlayingAudio?.messageId === msg.message_id;

            return (
              <article
                key={msg.message_id || index}
                className={`${styles.messageArticle} ${
                  isMyMessage ? styles.myMessageAlign : styles.otherMessageAlign
                }`}
              >
                {msg.avatar_url ? (
                  <img
                    src={msg.avatar_url}
                    alt={`${msg.username}'s avatar`}
                    className={styles.messageAvatar}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://placehold.co/32x32/ff6600/white?text=?";
                    }}
                  />
                ) : (
                  <div className={styles.messageAvatarPlaceholder}>
                    {getUserInitial(msg.username)}
                  </div>
                )}
                <div
                  ref={(el) => (messageBubbleRefs.current[msg.message_id] = el)}
                  className={`${styles.messageBubble} ${
                    isMyMessage ? styles.myMessage : styles.otherMessage
                  } ${isDeleted ? styles.deletedMessage : ""}`}
                >
                  <div className={styles.messageHeader}>
                    <span className={styles.messageSender}>
                      {msg.username || "Anonymous"}
                    </span>
                    <span className={styles.messageTimestamp}>
                      {formatTimestamp(msg.timestamp)}
                    </span>
                    {!isDeleted && (
                      <div className={styles.messageActions}>
                        {/* Reaction button */}
                        <button
                          className={styles.actionButton}
                          onClick={() =>
                            setShowReactionMenuForMessageId(
                              showReactionMenuForMessageId === msg.message_id
                                ? null
                                : msg.message_id
                            )
                          }
                          title="React to message"
                        >
                          <FiSmile />
                        </button>
                        {showReactionMenuForMessageId === msg.message_id && (
                          <div className={styles.reactionMenu}>
                            {COMMON_REACTIONS.map((emoji) => (
                              <span
                                key={emoji}
                                onClick={() =>
                                  handleReaction(msg.message_id, emoji)
                                }
                                className={styles.reactionEmoji}
                              >
                                {emoji}
                              </span>
                            ))}
                            <span
                              onClick={() =>
                                openFullReactionPicker(msg.message_id)
                              }
                              className={
                                styles.reactionEmoji +
                                " " +
                                styles.moreReactions
                              }
                              title="More reactions"
                            >
                              +
                            </span>
                          </div>
                        )}
                        {showFullReactionEmojiPicker === msg.message_id && (
                          <div
                            ref={inputEmojiPickerRef} // Reuse the ref for consistency
                            className={styles.fullReactionEmojiPicker}
                            style={{
                              position: "absolute",
                              zIndex: 100,
                              top: "100%", // Position below the message bubble
                              left: "50%",
                              transform: "translateX(-50%)",
                            }}
                          >
                            <EmojiPicker
                              onEmojiClick={(emojiObject) =>
                                handleReaction(
                                  msg.message_id,
                                  emojiObject.emoji
                                )
                              }
                              width={300}
                              height={400}
                              theme="dark"
                            />
                          </div>
                        )}

                        {isMyMessage && ( // Only show edit/delete for my own messages
                          <>
                            <button
                              className={styles.actionButton}
                              onClick={() => startEditingMessage(msg)}
                              title="Edit Message"
                            >
                              <FiEdit />
                            </button>
                            <button
                              className={styles.actionButton}
                              onClick={() =>
                                handleDeleteMessage(msg.message_id, msg.userid)
                              }
                              title="Delete Message"
                            >
                              <FiTrash2 />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {isDeleted ? (
                    <p className={styles.deletedText}>
                      <em>This message was deleted.</em>
                    </p>
                  ) : isBeingEdited ? (
                    <input
                      type="text"
                      value={editingMessageText}
                      onChange={(e) => setEditingMessageText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") sendMessage(e);
                      }}
                      className={styles.editingInput}
                      autoFocus
                    />
                  ) : isFileMessage ? (
                    <div className={styles.fileMessageContent}>
                      {isImage && (
                        <img
                          src={msg.file_data}
                          alt={msg.file_name}
                          className={styles.chatImage}
                          onClick={() =>
                            openImageInModal(msg.file_data, msg.file_name)
                          }
                        />
                      )}
                      <p>{msg.message_text}</p>
                      <div className={styles.fileAttachmentInfo}>
                        <span>
                          {isImage ? "Image" : "File"}: {msg.file_name}
                        </span>
                        <button
                          className={styles.downloadButton}
                          onClick={() =>
                            downloadFile(
                              msg.file_data,
                              msg.file_name,
                              msg.file_type
                            )
                          }
                          title="Download File"
                        >
                          <FiDownload />
                        </button>
                      </div>
                    </div>
                  ) : isAudioMessage ? (
                    <div className={styles.audioMessageContent}>
                      <button
                        className={styles.audioPlayButton}
                        onClick={() => {
                          if (isCurrentlyPlaying) {
                            pauseAudio(msg.message_id);
                          } else {
                            playAudio(msg.message_id, msg.audio_data);
                          }
                        }}
                        title={
                          isCurrentlyPlaying ? "Pause Audio" : "Play Audio"
                        }
                      >
                        {isCurrentlyPlaying ? (
                          <FiPauseCircle />
                        ) : (
                          <FiPlayCircle />
                        )}
                      </button>
                      <span className={styles.audioDuration}>
                        {formatRecordingDuration(msg.audio_duration || 0)}
                      </span>
                    </div>
                  ) : (
                    <p className={styles.messageText}>{msg.message_text}</p>
                  )}

                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className={styles.reactionsContainer}>
                      {Object.entries(msg.reactions).map(
                        ([emoji, usersReacted]) => (
                          <span key={emoji} className={styles.reactionPill}>
                            {emoji} {usersReacted.length}
                          </span>
                        )
                      )}
                    </div>
                  )}
                  {msg.is_edited && (
                    <span className={styles.editedIndicator}>(edited)</span>
                  )}
                </div>
              </article>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </section>

      {isTyping && (
        <div className={styles.typingIndicator}>
          <p>Someone is typing...</p>
        </div>
      )}

      {/* Input area */}
      <footer className={styles.chatFooter}>
        {selectedFile && (
          <div className={styles.selectedFilePreview}>
            <span>
              Attached: {selectedFile.name} (
              {(selectedFile.data.length / 1024).toFixed(2)} KB)
            </span>
            <button onClick={() => setSelectedFile(null)}>
              <FiX />
            </button>
          </div>
        )}
        {recordedAudioBlob && (
          <div className={styles.recordedAudioPreview}>
            <span>
              Recorded Audio: {formatRecordingDuration(recordingDuration)}
            </span>
            <button onClick={() => setRecordedAudioBlob(null)}>
              <FiX />
            </button>
          </div>
        )}

        <form onSubmit={sendMessage} className={styles.messageInputForm}>
          {editingMessageId && (
            <div className={styles.editingMessageStatus}>
              Editing message...
              <button type="button" onClick={cancelEditing}>
                Cancel
              </button>
            </div>
          )}

          <button
            type="button"
            className={styles.attachmentButton}
            onClick={triggerFileInput}
            title="Attach File"
            disabled={isRecording || editingMessageId} // Disable if recording or editing
          >
            <FiPaperclip />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: "none" }}
            accept="image/*, application/pdf, .doc,.docx,.txt" // Example accepted file types
          />

          {isRecording ? (
            <div className={styles.recordingControls}>
              <span className={styles.recordingTimer}>
                {formatRecordingDuration(recordingDuration)}
              </span>
              <button
                type="button"
                onClick={stopRecording}
                className={styles.stopRecordingButton}
                title="Stop Recording"
              >
                <FiStopCircle /> Stop
              </button>
              <button
                type="button"
                onClick={cancelRecording}
                className={styles.cancelRecordingButton}
                title="Cancel Recording"
              >
                <FiX /> Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                className={styles.microphoneButton}
                onClick={startRecording}
                title="Start Voice Recording"
                disabled={selectedFile || editingMessageId} // Disable if file attached or editing
              >
                <FiMic />
              </button>
              <input
                type="text"
                value={editingMessageId ? editingMessageText : input}
                onChange={
                  editingMessageId
                    ? (e) => setEditingMessageText(e.target.value)
                    : handleInputChange
                }
                placeholder={
                  editingMessageId
                    ? "Edit your message..."
                    : "Type your message..."
                }
                className={styles.messageInput}
                disabled={isRecording || selectedFile} // Disable if recording or file attached
              />
            </>
          )}

          <button
            type="button"
            className={styles.emojiButton}
            onClick={() => setShowInputEmojiPicker((prev) => !prev)}
            ref={inputEmojiButtonRef}
            title="Choose Emoji"
            disabled={isRecording || selectedFile} // Disable if recording or file attached
          >
            <FiSmile />
          </button>
          <button
            type="submit"
            className={styles.sendButton}
            title="Send Message"
            disabled={isRecording} // Disable send if recording (audio sent on stop)
          >
            <FiSend />
          </button>
        </form>

        {showInputEmojiPicker && (
          <div
            className={styles.emojiPickerContainer}
            ref={inputEmojiPickerRef}
          >
            <EmojiPicker
              onEmojiClick={onInputEmojiClick}
              width="100%"
              height={300}
              theme="dark"
            />
          </div>
        )}
      </footer>

      {/* Image Modal */}
      {showImageModal && (
        <div
          className={styles.imageModalOverlay}
          onClick={() => setShowImageModal(false)}
        >
          <div
            className={styles.imageModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeImageModal}
              onClick={() => setShowImageModal(false)}
            >
              <FiX />
            </button>
            <img
              src={modalImageData}
              alt={modalImageName}
              className={styles.fullImage}
            />
            <p className={styles.imageModalName}>{modalImageName}</p>
          </div>
        </div>
      )}

      {/* Registered Users Modal for DM selection */}
      {showRegisteredUsersModal && (
        <div
          className={styles.registeredUsersModalOverlay}
          onClick={() => setShowRegisteredUsersModal(false)}
        >
          <div
            className={styles.registeredUsersModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.modalTitle}>Start a Private Chat</h3>
            <button
              className={styles.closeModalButton}
              onClick={() => setShowRegisteredUsersModal(false)}
            >
              <FiX />
            </button>
            <ul className={styles.userList}>
              {getSortedUsers().length > 0 ? (
                getSortedUsers().map((u) => (
                  <li key={u.userid} className={styles.userItem}>
                    <div className={styles.userAvatarPlaceholder}>
                      {getUserInitial(u.username)}
                    </div>
                    <span>{u.username}</span>
                    <button
                      className={styles.startDmButton}
                      onClick={() => switchChatMode("private", u)}
                    >
                      Chat
                    </button>
                  </li>
                ))
              ) : (
                <p>No other registered users found.</p>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicChat;